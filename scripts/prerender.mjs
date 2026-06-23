#!/usr/bin/env node
/**
 * Build-time SSG prerender for Truficient (Vercel target).
 *
 * What this does
 * --------------
 *   1. Reads the freshly-built `dist/index.html` (the clean SPA shell).
 *   2. Pulls the public route list + SEO metadata from four Supabase tables
 *      (page_seo, blog_posts, equipment_pages, seo_location_pages) merged with
 *      the static-route config in `scripts/static-routes-seo.mjs`.
 *   3. Classifies each route:
 *        - CONTENT     → full-body SSG snapshot. Serves dist/ locally, renders
 *                        the route in headless Chromium, captures the rendered
 *                        DOM, rewrites the <head> SEO tags, and writes
 *                        `dist/<path>/index.html` (directory-index so Vercel
 *                        serves it at the clean trailing-slash URL).
 *        - INTERACTIVE → estimators, scanner, landing pages, etc. Written as a
 *                        head-rewritten SPA shell (correct meta + canonical,
 *                        body renders client-side). NOT snapshotted.
 *        - EXCLUDE     → /admin/* , /estimate/preview/* , login. No file; these
 *                        rely on the vercel.json SPA fallback.
 *   4. Every written page gets a self-referencing canonical in the canonical
 *      form: https, non-www, clean path, TRAILING SLASH (e.g. /hvac-garland-tx/).
 *   5. Skips '/' so the homepage's existing index.html (the SPA-fallback shell)
 *      is preserved verbatim.
 *   6. Emits `dist/sitemap.xml` (canonical clean URLs only) and
 *      `dist/prerender-manifest.json`.
 *
 * Robustness
 * ----------
 *   - If Chromium is missing it is auto-installed once; if a browser still
 *     cannot launch, the build DEGRADES to head-only shells for content routes
 *     (no worse than the legacy behaviour) and flags it loudly + in the
 *     manifest, rather than failing the build.
 *   - Keeps the MIN_ROUTES_HARD_FAIL guard, and hard-fails if a browser WAS
 *     available yet a large share of content snapshots came back body-empty
 *     (systemic render failure).
 *
 * Usage: runs after `vite build` via the npm `build` script. Standalone:
 *   `node scripts/prerender.mjs`.
 */

import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { STATIC_ROUTES_SEO } from './static-routes-seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST_DIR = resolve(PROJECT_ROOT, 'dist');
const SHELL_PATH = join(DIST_DIR, 'index.html');

const SITE_HOST = 'https://truficient.com';
const DEFAULT_OG_IMAGE = `${SITE_HOST}/og-image.png`;
const SITE_NAME = 'Truficient Energy Solutions';

const PREVIEW_PORT = 4178;
// Serverless build hosts (Vercel) run a @sparticuz/chromium binary; keep
// concurrency modest there for stability/memory. Local builds use the bundled
// Playwright Chromium and can go wider.
const IS_SERVERLESS = !!(
  process.env.VERCEL ||
  process.env.AWS_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION
);
const SNAPSHOT_CONCURRENCY = IS_SERVERLESS ? 4 : 6;
const NAV_TIMEOUT_MS = 30000;
const H1_TIMEOUT_MS = 9000;

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

// Hardcoded fallbacks — PUBLISHABLE (anon) values, identical to client.ts and
// already shipped in the client bundle. Safe to commit; used when the standalone
// `node scripts/prerender.mjs` step runs without VITE_* present in process.env.
const FALLBACK_SUPABASE_URL = 'https://xvsgdzwadxbwpevdezbp.supabase.co';
const FALLBACK_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2c2dkendhZHhid3BldmRlemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDYwOTIsImV4cCI6MjA4MzkyMjA5Mn0.4mZeybSGCDJqQQDLLJdrJi0ZfTVXrMQkXn9rbEfERlM';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  FALLBACK_SUPABASE_KEY;

console.log(
  `[prerender] Supabase env: URL=${SUPABASE_URL ? 'set' : 'MISSING'} KEY=${SUPABASE_KEY ? 'set' : 'MISSING'} ` +
    `(VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL ? 'env' : 'fallback'})`,
);

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null;

// ---------------------------------------------------------------------------
// Path / canonical helpers
// ---------------------------------------------------------------------------

/**
 * Canonical URL: https, non-www, clean path, TRAILING SLASH.
 *   /foo            -> https://truficient.com/foo/
 *   /foo.html       -> https://truficient.com/foo/
 *   /               -> https://truficient.com/
 *   (full URL in)   -> host normalised to non-www truficient.com
 */
function toCleanCanonical(input) {
  if (!input) return null;
  let s = String(input).trim().replace(/^https?:\/\/[^/]+/i, '');
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\/{2,}/g, '/').replace(/\.html$/i, '');
  if (s === '/' || s === '') return `${SITE_HOST}/`;
  s = `${s.replace(/\/+$/, '')}/`;
  return `${SITE_HOST}${s}`;
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
 * Directory-index output file (Vercel serves it at the clean trailing-slash URL):
 *   /foo      -> dist/foo/index.html
 *   /foo/bar  -> dist/foo/bar/index.html
 *   /         -> dist/index.html
 */
function pathToOutFile(urlPath) {
  let p = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!p) return join(DIST_DIR, 'index.html');
  return join(DIST_DIR, p, 'index.html');
}

/** Local preview URL for a route, always trailing-slashed (matches Vercel). */
function previewUrl(base, urlPath) {
  let p = urlPath.replace(/\/+$/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  return `${base}${p === '/' ? '/' : `${p}/`}`;
}

function normalisePathKey(p) {
  if (!p) return '/';
  let s = p;
  if (!s.startsWith('/')) s = `/${s}`;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

// No static file written — pure SPA fallback (vercel.json).
const EXCLUDE_RE = /^\/admin(\/|$)|^\/estimate\/preview(\/|$)/i;

// Head-rewritten shell only (interactive; body hydrates client-side).
const INTERACTIVE_RE = new RegExp(
  [
    '^/scanner(/|$)',
    '^/estimators/',
    '^/hvac-estimate$',
    '^/central-ac-estimate$',
    '^/mini-split-estimate$',
    '^/multi-zone-estimate$',
    '^/heat-pump-advantage$',
    '^/estimate/smart-group-march$',
    '^/smart-group-march', // -g, -F-26, -F-26v2, -G-26
    '^/free-hvac-age-checker',
    '^/cookie-preferences$',
    // Gallery is a fully client-driven, interactive page (search/filter/lightbox)
    // whose body is images + client-side filter buttons (no crawlable links). Serve
    // a head-shell so it client-renders cleanly (createRoot, no hydration flash).
    '^/gallery$',
  ].join('|'),
  'i',
);

// Routes kept OUT of sitemap.xml (noindex-ish / non-canonical destinations).
const SITEMAP_EXCLUDE_RE = new RegExp(
  [
    '^/admin(/|$)',
    '^/estimate/preview(/|$)',
    '^/smart-group-march',
    '^/free-hvac-age-checker',
    '^/cookie-preferences$',
    '^/scanner/report$',
  ].join('|'),
  'i',
);

function classify(path) {
  if (EXCLUDE_RE.test(path)) return 'exclude';
  if (INTERACTIVE_RE.test(path)) return 'interactive';
  return 'content';
}

// Characters that must never reach a path on disk: filesystem-illegal on
// Windows (`:` `<` `>` `"` `|` `*` `?` `\`) and/or malformed for a clean URL
// slug. A handful of equipment rows carry junk slugs (e.g. a stray ":" or
// "<h>"); these are skipped rather than written.
const ILLEGAL_PATH_RE = /[<>:"|*?\\]/;

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
    canonical: toCleanCanonical(r.canonical_url || r.page_path),
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
    canonical: toCleanCanonical(r.canonical_url || `/blog/${r.slug}`),
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
    canonical: toCleanCanonical(`/equipment/${r.slug}`),
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
      canonical: toCleanCanonical(p),
    };
  });
}

// ---------------------------------------------------------------------------
// Merge: derived (blog/equip/location) < static config < page_seo
// ---------------------------------------------------------------------------

function mergeSources(...sourceLists) {
  const map = new Map();
  for (const list of sourceLists) {
    for (const entry of list) {
      const key = normalisePathKey(entry.path);
      const prev = map.get(key) || {};
      map.set(key, {
        ...prev,
        ...Object.fromEntries(Object.entries(entry).filter(([, v]) => v != null && v !== '')),
        path: key,
      });
    }
  }
  return [...map.values()];
}

// ---------------------------------------------------------------------------
// HTML head rewriting (applied to both shells and full-body snapshots)
// ---------------------------------------------------------------------------

function buildMetaBlock(seo) {
  const title = seo.title;
  if (!title) {
    throw new Error(
      `[prerender] Missing required title for ${seo.path}. Add a meta_title in page_seo or a title in static-routes-seo.mjs.`,
    );
  }
  const description = seo.description || title;
  const canonical = seo.canonical || toCleanCanonical(seo.path);
  return {
    title,
    description,
    canonical,
    ogTitle: seo.ogTitle || title,
    ogDescription: seo.ogDescription || description,
    ogImage: seo.ogImage || DEFAULT_OG_IMAGE,
  };
}

/**
 * Replace the SEO head tags in an HTML document (the shell OR a rendered
 * snapshot). Targeted regex replacements — only the SEO tags are touched; the
 * Vite asset <script>/<link> tags and JSON-LD are left intact for hydration.
 */
function rewriteHead(html, meta) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(meta.title)}</title>`);

  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${esc(meta.description)}" />`,
  );

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    );
  } else {
    html = html.replace(/<\/head>/i, `  <link rel="canonical" href="${esc(meta.canonical)}" />\n  </head>`);
  }

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
    html = re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
  }

  const twPairs = [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', meta.ogTitle],
    ['twitter:description', meta.ogDescription],
    ['twitter:image', meta.ogImage],
  ];
  for (const [name, value] of twPairs) {
    const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
    const tag = `<meta name="${name}" content="${esc(value)}" />`;
    html = re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
  }

  return html;
}

// ---------------------------------------------------------------------------
// Snapshot infrastructure (vite preview + Playwright)
// ---------------------------------------------------------------------------

async function startPreviewServer() {
  const { preview } = await import('vite');
  const server = await preview({
    root: PROJECT_ROOT,
    configFile: false,
    build: { outDir: 'dist' },
    preview: { port: PREVIEW_PORT, strictPort: true, host: '127.0.0.1' },
    logLevel: 'warn',
  });
  const base =
    server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') ||
    `http://127.0.0.1:${PREVIEW_PORT}`;
  return { server, base };
}

async function launchBrowser() {
  const { chromium } = await import('playwright');

  // Serverless build hosts (Vercel/Lambda) cannot run Playwright's bundled
  // Chromium — it needs system libraries that aren't present. Use the
  // @sparticuz/chromium binary (built for exactly these environments). It is
  // pinned to match Playwright's Chromium major (143) so the driver protocol
  // lines up.
  if (IS_SERVERLESS) {
    try {
      const sparticuz = (await import('@sparticuz/chromium')).default;
      // WebGL/graphics are irrelevant to DOM snapshots — disable for speed.
      if ('setGraphicsMode' in sparticuz) sparticuz.setGraphicsMode = false;
      const executablePath = await sparticuz.executablePath();
      // Drop single-process/no-zygote: the build container has ample memory and
      // multi-process is far more stable for hundreds of sequential page loads.
      const args = (sparticuz.args || []).filter(
        (a) => a !== '--single-process' && a !== '--no-zygote',
      );
      const browser = await chromium.launch({ executablePath, args, headless: true });
      console.log('[prerender] Launched @sparticuz/chromium (serverless build env).');
      return browser;
    } catch (err) {
      console.error('[prerender] @sparticuz/chromium launch failed:', err?.message || err);
      // fall through to the bundled attempt below
    }
  }

  try {
    return await chromium.launch({ headless: true });
  } catch (err) {
    console.warn('[prerender] Chromium launch failed, attempting one-time install…', err?.message || err);
    try {
      execSync('npx --yes playwright install chromium', { stdio: 'inherit' });
      return await chromium.launch({ headless: true });
    } catch (err2) {
      console.error('[prerender] Chromium still unavailable after install attempt:', err2?.message || err2);
      return null;
    }
  }
}

const BLOCK_RE =
  /googletagmanager|google-analytics|analytics\.google|connect\.facebook|facebook\.net|doubleclick|hotjar|clarity\.ms|fonts\.googleapis|fonts\.gstatic|gtag\/js/i;

async function newSnapshotPage(context) {
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT_MS);
  // Block third-party tracking/fonts: faster, avoids networkidle hangs.
  await page.route('**/*', (route) => {
    if (BLOCK_RE.test(route.request().url())) return route.abort();
    return route.continue();
  });
  return page;
}

/** Render one route and return its full rendered HTML, or null on failure. */
async function snapshotRoute(page, base, urlPath) {
  await page.goto(previewUrl(base, urlPath), { waitUntil: 'load', timeout: NAV_TIMEOUT_MS });
  // Wait for real body content; tolerate pages without an <h1>.
  await page.waitForSelector('h1', { timeout: H1_TIMEOUT_MS }).catch(() => {});
  // Small settle for late hydration/data paints.
  await page.waitForTimeout(250);
  const html = await page.evaluate(() => '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  const bodyTextLen = await page.evaluate(
    () => (document.querySelector('#root')?.innerText || '').trim().length,
  );
  return { html, bodyTextLen };
}

// Generic concurrency pool.
async function runPool(items, size, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

function buildSitemap(canonicalUrls) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [...new Set(canonicalUrls)].sort();
  const body = urls
    .map((u) => `  <url>\n    <loc>${esc(u)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
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

  const [pageSeoRows, blogRows, equipRows, locRows] = await Promise.all([
    loadPageSEO().catch((e) => { console.error('[prerender] page_seo failed:', e.message); return []; }),
    loadBlogPosts().catch((e) => { console.error('[prerender] blog_posts failed:', e.message); return []; }),
    loadEquipmentPages().catch((e) => { console.error('[prerender] equipment_pages failed:', e.message); return []; }),
    loadLocationPages().catch((e) => { console.error('[prerender] seo_location_pages failed:', e.message); return []; }),
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

  const staticRows = STATIC_ROUTES_SEO.map((r) => ({
    source: 'static',
    path: r.path,
    title: r.title,
    description: r.description,
    canonical: toCleanCanonical(r.path),
    ogImage: r.ogImage ? normaliseHost(r.ogImage) : null,
  }));

  const merged = mergeSources(blogRows, equipRows, locRows, staticRows, pageSeoRows);

  // Build the working route set: drop homepage, drop legacy .html redirect
  // sources, drop illegal paths, drop pure-SPA (admin/preview) routes.
  const skipped = { homepage: 0, html_source: 0, illegal: 0, excluded: 0 };
  const routes = [];
  for (const r of merged) {
    if (r.path === '/') { skipped.homepage++; continue; }
    if (/\.html$/i.test(r.path)) { skipped.html_source++; continue; }
    if (ILLEGAL_PATH_RE.test(r.path)) { skipped.illegal++; continue; }
    const tier = classify(r.path);
    if (tier === 'exclude') { skipped.excluded++; continue; }
    routes.push({ ...r, tier });
  }

  const contentRoutes = routes.filter((r) => r.tier === 'content');
  const interactiveRoutes = routes.filter((r) => r.tier === 'interactive');
  console.log(
    `[prerender] Routes: content=${contentRoutes.length} interactive=${interactiveRoutes.length} ` +
      `(skipped: homepage=${skipped.homepage} .html=${skipped.html_source} illegal=${skipped.illegal} admin/preview=${skipped.excluded})`,
  );

  // --- Snapshot the content routes ---------------------------------------
  const snapshots = new Map(); // path -> { html, bodyTextLen }
  let degraded = false;
  let previewServer = null;
  let browser = null;

  if (contentRoutes.length > 0) {
    try {
      const started = await startPreviewServer();
      previewServer = started.server;
      browser = await launchBrowser();
      if (!browser) {
        degraded = true;
        console.error(
          '[prerender] DEGRADED: no headless browser available — content routes ' +
            'will be written as head-only shells (bodies render client-side).',
        );
      } else {
        const context = await browser.newContext();
        const pages = await Promise.all(
          Array.from({ length: Math.min(SNAPSHOT_CONCURRENCY, contentRoutes.length) }, () =>
            newSnapshotPage(context),
          ),
        );
        let done = 0;
        let cursor = 0;
        const workers = pages.map((page) => (async () => {
          while (cursor < contentRoutes.length) {
            const route = contentRoutes[cursor++];
            try {
              const snap = await snapshotRoute(page, started.base, route.path);
              snapshots.set(route.path, snap);
            } catch (err) {
              snapshots.set(route.path, { html: null, bodyTextLen: 0, error: err.message });
            }
            if (++done % 100 === 0) console.log(`[prerender] snapshotted ${done}/${contentRoutes.length}…`);
          }
        })());
        await Promise.all(workers);
        for (const page of pages) await page.close().catch(() => {});
        await context.close().catch(() => {});
        console.log(`[prerender] snapshotted ${done}/${contentRoutes.length}.`);
      }
    } catch (err) {
      degraded = true;
      console.error('[prerender] DEGRADED: snapshot phase error — falling back to head-only shells:', err?.message || err);
    } finally {
      if (browser) await browser.close().catch(() => {});
      if (previewServer) await previewServer.close().catch(() => {});
    }
  }

  // --- Write all files ----------------------------------------------------
  let written = 0;
  let failed = 0;
  let emptyBody = 0;
  const errors = [];
  const emptyBodyPaths = [];
  const sitemapUrls = [`${SITE_HOST}/`]; // homepage is always canonical

  for (const route of routes) {
    try {
      const meta = buildMetaBlock(route);
      let base = shell;
      if (route.tier === 'content') {
        const snap = snapshots.get(route.path);
        if (snap && snap.html) {
          base = snap.html;
          if (!snap.bodyTextLen || snap.bodyTextLen < 20) {
            emptyBody++;
            emptyBodyPaths.push(route.path);
          }
        } else {
          // snapshot missing/failed — head-only shell, flag as empty body
          emptyBody++;
          emptyBodyPaths.push(route.path);
        }
      }
      const html = rewriteHead(base, meta);
      const outFile = pathToOutFile(route.path);
      await mkdir(dirname(outFile), { recursive: true });
      await writeFile(outFile, html, 'utf8');
      written++;
      if (!SITEMAP_EXCLUDE_RE.test(route.path)) sitemapUrls.push(meta.canonical);
    } catch (err) {
      failed++;
      errors.push({ path: route.path, source: route.source, error: err.message });
    }
  }

  // --- Sitemap ------------------------------------------------------------
  await writeFile(join(DIST_DIR, 'sitemap.xml'), buildSitemap(sitemapUrls), 'utf8');
  console.log(`[prerender] Wrote sitemap.xml (${new Set(sitemapUrls).size} canonical URLs).`);

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `[prerender] Wrote ${written} routes in ${dt}s ` +
      `(content snapshots: ${snapshots.size}, body-empty: ${emptyBody}, degraded: ${degraded}).`,
  );

  // --- Manifest -----------------------------------------------------------
  const manifest = {
    generated_at: new Date().toISOString(),
    duration_seconds: Number(dt),
    target: 'vercel-ssg',
    supabase_enabled: Boolean(supabase),
    body_snapshot: !degraded,
    source_counts: sourceCounts,
    routes_written: written,
    routes_failed: failed,
    content_routes: contentRoutes.length,
    interactive_routes: interactiveRoutes.length,
    body_empty_count: emptyBody,
    body_empty_paths: emptyBodyPaths.slice(0, 50),
    skipped,
    failed_routes: errors,
  };
  await writeFile(join(DIST_DIR, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('[prerender] Wrote prerender-manifest.json');

  // --- Guards -------------------------------------------------------------
  if (failed > 0) {
    console.error(`[prerender] ${failed} routes failed to write:`);
    for (const e of errors.slice(0, 20)) console.error(`  - [${e.source}] ${e.path}: ${e.error}`);
    if (errors.length > 20) console.error(`  …and ${errors.length - 20} more.`);
  }

  const MIN_ROUTES_HARD_FAIL = 100;
  if (written < MIN_ROUTES_HARD_FAIL) {
    console.error(
      `[prerender] FATAL: only ${written} routes written, expected 470+. ` +
        `Source counts: ${JSON.stringify(sourceCounts)}. Supabase enabled: ${Boolean(supabase)}.`,
    );
    process.exit(1);
  }

  // If a browser WAS available but a large share of content bodies are empty,
  // that's a systemic render failure — fail loudly rather than ship empties.
  if (!degraded && contentRoutes.length > 0) {
    const emptyRatio = emptyBody / contentRoutes.length;
    if (emptyRatio > 0.05) {
      console.error(
        `[prerender] FATAL: ${emptyBody}/${contentRoutes.length} content routes ` +
          `(${(emptyRatio * 100).toFixed(1)}%) rendered an empty body. First few: ` +
          emptyBodyPaths.slice(0, 15).join(', '),
      );
      process.exit(1);
    }
    if (emptyBody > 0) {
      console.warn(`[prerender] WARN: ${emptyBody} content route(s) had an empty body (within tolerance): ${emptyBodyPaths.slice(0, 15).join(', ')}`);
    }
  }

  if (degraded) {
    console.warn(
      '[prerender] WARN: built in DEGRADED (head-only) mode — page bodies were NOT ' +
        'prerendered. Install a headless browser on the build host before relying on ' +
        'the body/LCP acceptance checks.',
    );
  }
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});
