#!/usr/bin/env node
/**
 * Build-time SEO prerender for Truficient.
 *
 * What this does
 * --------------
 *   1. Reads the freshly-built `dist/index.html` (the SPA shell).
 *   2. Pulls SEO metadata from four Supabase tables:
 *        - page_seo                (any path)
 *        - blog_posts              (/blog/:slug)
 *        - equipment_pages         (/equipment/:slug)
 *        - seo_location_pages      (/:url_slug)
 *      ...and merges them with the static-route config in
 *      `scripts/static-routes-seo.mjs`. Conflict rule: page_seo > static config.
 *   3. For every URL, writes `dist/<path>/index.html` with the same body as
 *      the SPA shell BUT with the <title>, meta description, canonical,
 *      og:*, and twitter:* tags rewritten to that page's specific values.
 *   4. Skips '/' so the homepage's existing tags are preserved verbatim.
 *
 * What this does NOT do (yet)
 * ---------------------------
 *   The body of every prerendered file is the SPA hydration shell — same as
 *   `index.html`. Body content (H1, hero copy, etc.) still hydrates client-
 *   side. That's fine for the verification checklist (curl, Facebook
 *   debugger, Twitter validator all read <head>). LCP and Googlebot's
 *   first-pass indexing of body copy will be addressed in the planned Vike
 *   migration — see `docs/seo-prerender-vike-followup.md`.
 *
 * Fallback chain (per spec)
 * -------------------------
 *   title:       REQUIRED — missing throws a build error.
 *   description: title.
 *   canonical:   built from `path` with non-www host.
 *   ogImage:     site default (https://truficient.com/og-image.png).
 *
 * Usage
 * -----
 *   Runs automatically after `vite build` via the npm `build` script.
 *   Standalone: `node scripts/prerender.mjs`.
 *
 * Env requirements
 * ----------------
 *   VITE_SUPABASE_URL                 (always present in CI / local .env)
 *   VITE_SUPABASE_PUBLISHABLE_KEY     (anon key, read-only access is enough)
 */

import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATIC_ROUTES_SEO } from './static-routes-seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');
const SHELL_PATH = join(DIST_DIR, 'index.html');

const SITE_HOST = 'https://truficient.com';
const DEFAULT_OG_IMAGE = `${SITE_HOST}/og-image.png`;
const SITE_NAME = 'Truficient Energy Solutions';

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '[prerender] Missing Supabase env vars. Static routes only will be prerendered.',
  );
}

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise any URL or path to https://truficient.com/<rest>.html (non-www).
 *
 * Lovable Hosting has SPA fallback but does NOT do directory-index resolution
 * or honour `_redirects` files. Extensionless URLs (e.g. `/foo`) always serve
 * the SPA shell. The literal prerendered files live at `dist/foo.html`, so
 * crawler-facing canonicals + sitemap entries must point to the `.html` form
 * so that bots fetch the prerendered HTML, not the empty SPA shell.
 *
 * Rules:
 *   - Root (`/`) stays as `https://truficient.com/`.
 *   - Anything already ending in a file extension (e.g. `.html`, `.xml`) is
 *     left alone — only its host is normalised.
 *   - Everything else gets `.html` appended.
 */
function toCanonical(input) {
  if (!input) return null;
  let s = String(input).trim();
  // Strip protocol+host if present
  s = s.replace(/^https?:\/\/(www\.)?truficient\.com/i, '');
  if (!s.startsWith('/')) s = `/${s}`;
  // Collapse repeated slashes
  s = s.replace(/\/{2,}/g, '/');
  // Drop trailing slash unless it's the root
  if (s.length > 1) s = s.replace(/\/+$/, '');
  // Root stays bare
  if (s === '/') return `${SITE_HOST}/`;
  // Already has a file extension? Leave the path as-is.
  if (/\.[a-z0-9]{2,5}$/i.test(s)) return `${SITE_HOST}${s}`;
  return `${SITE_HOST}${s}.html`;
}

/** Normalise any URL field that should be non-www (og_image, og_url, etc.). */
function normaliseHost(url) {
  if (!url) return null;
  return String(url).replace(/^https?:\/\/www\.truficient\.com/i, SITE_HOST);
}

/** Best-effort HTML-attribute escape. */
function esc(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Convert a path string to an output file as a flat `.html` file:
 *   /foo        -> dist/foo.html
 *   /foo/bar    -> dist/foo/bar.html
 *   /           -> dist/index.html
 *
 * Flat files are required because Lovable Hosting's SPA fallback does not
 * perform directory-index resolution (it will not auto-serve `foo/index.html`
 * for a request to `/foo`). Serving prerendered HTML at `dist/foo.html` lets
 * the host find the literal file before falling back to the SPA shell.
 */
function pathToOutFile(urlPath) {
  let p = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!p) return join(DIST_DIR, 'index.html');
  return join(DIST_DIR, `${p}.html`);
}

// ---------------------------------------------------------------------------
// Data sources
// ---------------------------------------------------------------------------

async function loadPageSEO() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('page_seo')
    .select('page_path, meta_title, meta_description, og_title, og_description, og_image, canonical_url');
  if (error) throw new Error(`page_seo fetch failed: ${error.message}`);
  return (data || []).map((r) => ({
    source: 'page_seo',
    path: r.page_path,
    title: r.meta_title,
    description: r.meta_description,
    ogTitle: r.og_title,
    ogDescription: r.og_description,
    ogImage: normaliseHost(r.og_image),
    canonical: toCanonical(r.canonical_url || r.page_path),
  }));
}

async function loadBlogPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, meta_title, meta_description, excerpt, og_title, og_description, og_image, featured_image, canonical_url')
    .eq('status', 'published');
  if (error) throw new Error(`blog_posts fetch failed: ${error.message}`);
  return (data || []).map((r) => ({
    source: 'blog_posts',
    path: `/blog/${r.slug}`,
    title: r.meta_title || r.title,
    description: r.meta_description || r.excerpt,
    ogTitle: r.og_title,
    ogDescription: r.og_description,
    ogImage: normaliseHost(r.og_image || r.featured_image),
    canonical: toCanonical(r.canonical_url || `/blog/${r.slug}`),
  }));
}

async function loadEquipmentPages() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('equipment_pages')
    .select('slug, brand, model_number, seo_title, seo_description')
    .eq('published', true);
  if (error) throw new Error(`equipment_pages fetch failed: ${error.message}`);
  return (data || []).map((r) => ({
    source: 'equipment_pages',
    path: `/equipment/${r.slug}`,
    title: r.seo_title || `${r.brand} ${r.model_number} | Truficient`,
    description: r.seo_description,
    canonical: toCanonical(`/equipment/${r.slug}`),
  }));
}

async function loadLocationPages() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('seo_location_pages')
    .select('url_slug, meta_title, meta_description, h1_title, neighborhood, city')
    .eq('published', true);
  if (error) throw new Error(`seo_location_pages fetch failed: ${error.message}`);
  return (data || []).map((r) => {
    // url_slug already includes leading slash + sometimes trailing slash
    let p = r.url_slug;
    if (!p.startsWith('/')) p = `/${p}`;
    return {
      source: 'seo_location_pages',
      path: p,
      title:
        r.meta_title ||
        r.h1_title ||
        `${[r.neighborhood, r.city].filter(Boolean).join(', ')} HVAC | Truficient`,
      description: r.meta_description,
      canonical: toCanonical(p),
    };
  });
}

// ---------------------------------------------------------------------------
// Merge: page_seo > static config > derived (blog/equipment/location)
// ---------------------------------------------------------------------------

function normalisePathKey(p) {
  if (!p) return '/';
  let s = p;
  if (!s.startsWith('/')) s = `/${s}`;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

function mergeSources(...sourceLists) {
  const map = new Map();
  // Fill in priority order: lowest first, highest overrides.
  // Order at call site: derived (blog/equip/location), static, page_seo
  for (const list of sourceLists) {
    for (const entry of list) {
      const key = normalisePathKey(entry.path);
      const prev = map.get(key) || {};
      map.set(key, {
        ...prev,
        ...Object.fromEntries(
          Object.entries(entry).filter(([, v]) => v != null && v !== ''),
        ),
        path: key,
      });
    }
  }
  return [...map.values()];
}

// ---------------------------------------------------------------------------
// HTML rewriting
// ---------------------------------------------------------------------------

function buildMetaBlock(seo) {
  const title = seo.title;
  if (!title) {
    throw new Error(
      `[prerender] Missing required title for ${seo.path}. Add a meta_title in page_seo or a title in static-routes-seo.mjs.`,
    );
  }
  const description = seo.description || title;
  const canonical = seo.canonical || toCanonical(seo.path);
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
  };
}

/**
 * Replace head tags in the SPA shell. We use targeted regex replacements
 * rather than a full HTML parser because (a) the shell is hand-authored and
 * stable, and (b) we only touch six tags.
 */
function rewriteShell(shell, meta) {
  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(meta.title)}</title>`);

  // <meta name="description">
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${esc(meta.description)}" />`,
  );

  // <link rel="canonical">
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${esc(meta.canonical)}" />\n  </head>`,
    );
  }

  // og:* — replace each by property name; insert if missing.
  const ogPairs = [
    ['og:title', meta.ogTitle],
    ['og:description', meta.ogDescription],
    ['og:url', meta.canonical],
    ['og:image', meta.ogImage],
    ['og:type', 'website'],
    ['og:site_name', SITE_NAME],
  ];
  for (const [prop, value] of ogPairs) {
    const re = new RegExp(`<meta\\s+property=["']${prop}["'][^>]*>`, 'i');
    const tag = `<meta property="${prop}" content="${esc(value)}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
    }
  }

  // twitter:* — same treatment
  const twPairs = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', meta.ogTitle],
    ['twitter:description', meta.ogDescription],
    ['twitter:image', meta.ogImage],
  ];
  for (const [name, value] of twPairs) {
    const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
    const tag = `<meta name="${name}" content="${esc(value)}" />`;
    if (re.test(html)) {
      html = html.replace(re, tag);
    } else {
      html = html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
    }
  }

  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const t0 = Date.now();
  console.log('[prerender] Starting…');

  let shell;
  try {
    shell = await readFile(SHELL_PATH, 'utf8');
  } catch (err) {
    console.error(`[prerender] Could not read ${SHELL_PATH}. Did vite build run?`);
    throw err;
  }

  // Pull all data sources in parallel
  const [pageSeoRows, blogRows, equipRows, locRows] = await Promise.all([
    loadPageSEO().catch((e) => {
      console.error('[prerender] page_seo failed:', e.message);
      return [];
    }),
    loadBlogPosts().catch((e) => {
      console.error('[prerender] blog_posts failed:', e.message);
      return [];
    }),
    loadEquipmentPages().catch((e) => {
      console.error('[prerender] equipment_pages failed:', e.message);
      return [];
    }),
    loadLocationPages().catch((e) => {
      console.error('[prerender] seo_location_pages failed:', e.message);
      return [];
    }),
  ]);

  console.log(
    `[prerender] Sources: page_seo=${pageSeoRows.length} blog=${blogRows.length} equipment=${equipRows.length} location=${locRows.length} static=${STATIC_ROUTES_SEO.length}`,
  );

  const sourceCounts = {
    page_seo: pageSeoRows.length,
    blog_posts: blogRows.length,
    equipment_pages: equipRows.length,
    seo_location_pages: locRows.length,
    static_routes: STATIC_ROUTES_SEO.length,
  };

  // Static routes wrapped in the same shape
  const staticRows = STATIC_ROUTES_SEO.map((r) => ({
    source: 'static',
    path: r.path,
    title: r.title,
    description: r.description,
    canonical: toCanonical(r.path),
    ogImage: r.ogImage ? normaliseHost(r.ogImage) : null,
  }));

  // Merge precedence: lower in the list wins
  const merged = mergeSources(blogRows, equipRows, locRows, staticRows, pageSeoRows);

  // Skip the homepage — its existing index.html is correct and must not change.
  const routes = merged.filter((r) => r.path !== '/');

  let written = 0;
  let failed = 0;
  const errors = [];

  for (const route of routes) {
    try {
      const meta = buildMetaBlock(route);
      const html = rewriteShell(shell, meta);
      const outFile = pathToOutFile(route.path);
      await mkdir(dirname(outFile), { recursive: true });
      await writeFile(outFile, html, 'utf8');
      written++;
    } catch (err) {
      failed++;
      errors.push({ path: route.path, source: route.source, error: err.message });
    }
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[prerender] Wrote ${written} routes in ${dt}s (skipped homepage).`);

  const manifest = {
    generated_at: new Date().toISOString(),
    duration_seconds: Number(dt),
    supabase_enabled: Boolean(supabase),
    source_counts: sourceCounts,
    routes_written: written,
    routes_failed: failed,
    skipped_paths: ['/'],
    route_paths: routes.map((route) => route.path),
    failed_routes: errors,
  };

  await writeFile(
    join(DIST_DIR, 'prerender-manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );
  console.log('[prerender] Wrote prerender-manifest.json');

  // ---------------------------------------------------------------------
  // Deploy validator — fail the build loudly if the prerender output looks
  // wrong in a context where DB-backed routes were *expected*. We treat the
  // presence of SUPABASE_URL in the env as the signal "this is a real build
  // that should hit the DB" (production / Lovable Publish). Local dev builds
  // (`build:dev`) and CI without secrets get a soft warning instead of a
  // hard fail so they don't block on missing creds.
  // ---------------------------------------------------------------------
  const MIN_ROUTES_THRESHOLD = 200;
  const dbExpected = Boolean(SUPABASE_URL);
  const validationErrors = [];

  if (dbExpected && !supabase) {
    validationErrors.push(
      'SUPABASE_URL is set but the Supabase client failed to initialize. Check SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (
    supabase &&
    pageSeoRows.length === 0 &&
    blogRows.length === 0 &&
    equipRows.length === 0 &&
    locRows.length === 0
  ) {
    validationErrors.push(
      'Supabase initialized but every DB source returned zero rows. Check anon-key RLS policies on page_seo, blog_posts, equipment_pages, seo_location_pages.',
    );
  }
  if (dbExpected && written < MIN_ROUTES_THRESHOLD) {
    validationErrors.push(
      `Only ${written} routes prerendered (threshold: ${MIN_ROUTES_THRESHOLD}). Expected ~300+ once DB sources load.`,
    );
  }

  if (failed > 0) {
    console.error(`[prerender] ${failed} routes failed:`);
    for (const e of errors.slice(0, 20)) {
      console.error(`  - [${e.source}] ${e.path}: ${e.error}`);
    }
    if (errors.length > 20) console.error(`  …and ${errors.length - 20} more.`);
  }

  if (validationErrors.length > 0) {
    if (dbExpected) {
      console.error('[prerender] Build validation FAILED:');
      for (const msg of validationErrors) console.error(`  - ${msg}`);
      process.exit(1);
    } else {
      console.warn(
        '[prerender] Skipping DB-backed validation — SUPABASE_URL not set (dev/preview build).',
      );
      for (const msg of validationErrors) console.warn(`  - ${msg}`);
    }
  }

  if (failed > 0 && written === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
