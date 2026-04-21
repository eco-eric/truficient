#!/usr/bin/env node
/**
 * Post-deploy verification for the SEO prerender pipeline.
 *
 * Runs against a live deployment (default: https://truficient.com) and asserts
 * that the prerender output matches what the spec promises:
 *
 *   1. /prerender-manifest.json exists, has supabase_enabled=true,
 *      routes_written >= MIN_ROUTES, and zero failed routes.
 *   2. Four representative pages each return HTML with:
 *        - server-rendered <title>, <meta name=description>, canonical
 *        - og:* + twitter:* tags
 *        - matching values per page (title contains the expected keyword)
 *   3. For pages that ship JSON-LD (@graph): structure validates, and
 *      FAQPage entities match the visible FAQ accordion content (hash check).
 *
 * Usage
 * -----
 *   node scripts/verify-prerender-deploy.mjs
 *   node scripts/verify-prerender-deploy.mjs --base https://staging.truficient.com
 *   node scripts/verify-prerender-deploy.mjs --json   # machine-readable output
 *
 * Exit codes
 * ----------
 *   0  all assertions passed
 *   1  one or more hard assertions failed
 *   2  manifest unreachable / network error before assertions could run
 *
 * Notes on the water-crisis build
 * -------------------------------
 *   The 17-page water-crisis spoke set (1 hub, 11 city pages, 6 explainers) is
 *   queued behind this verification. The PENDING_BUILD section below lists the
 *   routes that should exist *after* that build ships. They're checked in
 *   "soft" mode today (warn-only) and can be promoted to hard assertions by
 *   flipping WATER_CRISIS_BUILD_SHIPPED to true.
 */
import { argv, exit } from 'node:process';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = argv.slice(2);
const BASE = (() => {
  const i = args.indexOf('--base');
  if (i !== -1 && args[i + 1]) return args[i + 1].replace(/\/+$/, '');
  return 'https://truficient.com';
})();
const JSON_OUT = args.includes('--json');

const MIN_ROUTES = 389;
const WATER_CRISIS_BUILD_SHIPPED = false;

/** Pages that should already be prerendered today. */
const REPRESENTATIVE_PAGES = [
  {
    label: 'Oak Cliff service+location',
    path: '/ac-repair-oak-cliff-dallas',
    expectedTitleMatch: /oak cliff/i,
    expectedCanonical: 'https://truficient.com/ac-repair-oak-cliff-dallas',
    requireJsonLd: false,
  },
  {
    label: 'Bluffview neighborhood',
    path: '/bluffview-kessler-park-heat-island-hvac',
    expectedTitleMatch: /bluffview|kessler/i,
    expectedCanonical: 'https://truficient.com/bluffview-kessler-park-heat-island-hvac',
    requireJsonLd: false,
  },
  {
    label: 'Goodman equipment page',
    path: '/equipment/goodman-gsx140601ka',
    expectedTitleMatch: /goodman/i,
    expectedCanonical: 'https://truficient.com/equipment/goodman-gsx140601ka',
    requireJsonLd: false,
  },
  {
    label: 'North Texas Water Crisis blog (hub)',
    path: '/blog/north-texas-water-crisis-conservation',
    expectedTitleMatch: /water|texas/i,
    expectedCanonical: 'https://truficient.com/blog/north-texas-water-crisis-conservation',
    // Will become true once the SEO build ships @graph + FAQPage:
    requireJsonLd: WATER_CRISIS_BUILD_SHIPPED,
    requireFaqHashMatch: WATER_CRISIS_BUILD_SHIPPED,
  },
];

/** Routes the queued build will add. Soft-asserted today. */
const PENDING_BUILD_ROUTES = [
  '/blog/north-texas-water-crisis-conservation', // canonical hub slug
  '/water-restrictions/dallas-tx-2026',
  '/water-restrictions/fort-worth-tx-2026',
  '/water-restrictions/plano-tx-2026',
  '/water-restrictions/frisco-tx-2026',
  '/water-restrictions/mckinney-tx-2026',
  '/water-restrictions/arlington-tx-2026',
  '/water-restrictions/irving-tx-2026',
  '/water-restrictions/garland-tx-2026',
  '/water-restrictions/richardson-tx-2026',
  '/water-restrictions/denton-tx-2026',
  '/water-restrictions/grapevine-tx-2026',
  '/water/stage-2-restrictions-explained',
  '/water/lake-texoma-water-supply',
  '/water/lake-lavon-water-supply',
  '/water/north-texas-municipal-water-district',
  '/water/conservation-rebates-dallas',
  '/water/hvac-water-usage-dallas',
];

// ---------------------------------------------------------------------------
// Result tracking
// ---------------------------------------------------------------------------

const results = { passed: [], failed: [], warned: [] };
const log = (icon, label, detail) => {
  if (JSON_OUT) return;
  const line = detail ? `${icon} ${label} — ${detail}` : `${icon} ${label}`;
  console.log(line);
};
const pass = (label, detail) => { results.passed.push({ label, detail }); log('✅', label, detail); };
const fail = (label, detail) => { results.failed.push({ label, detail }); log('❌', label, detail); };
const warn = (label, detail) => { results.warned.push({ label, detail }); log('⚠️ ', label, detail); };

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, text, contentType: res.headers.get('content-type') || '' };
}

// ---------------------------------------------------------------------------
// HTML parsing helpers (regex — same approach the prerender script uses)
// ---------------------------------------------------------------------------

function extractTag(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}
const getTitle = (h) => extractTag(h, /<title>([\s\S]*?)<\/title>/i);
const getMeta = (h, name) =>
  extractTag(h, new RegExp(`<meta\\s+name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'));
const getMetaProp = (h, prop) =>
  extractTag(h, new RegExp(`<meta\\s+property=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i'));
const getCanonical = (h) =>
  extractTag(h, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      blocks.push({ __invalid: true, raw: m[1].slice(0, 200) });
    }
  }
  return blocks;
}

/** Pull visible FAQ content out of accordion-ish markup. */
function extractVisibleFaqs(html) {
  const faqs = [];
  // Common shadcn Accordion pattern: trigger + content sibling structures.
  // We use a permissive heuristic — the spec doesn't fix component structure yet.
  const re = /data-faq-question=["']([^"']+)["'][\s\S]*?data-faq-answer=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    faqs.push({ q: decodeHtml(m[1]).trim(), a: decodeHtml(m[2]).trim() });
  }
  return faqs;
}
function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

async function checkManifest() {
  const url = `${BASE}/prerender-manifest.json`;
  let payload;
  try {
    const res = await fetchText(url);
    if (res.status !== 200) {
      fail('Manifest reachable', `${url} → HTTP ${res.status}`);
      return null;
    }
    payload = JSON.parse(res.text);
  } catch (err) {
    fail('Manifest reachable', `${url} → ${err.message}`);
    return null;
  }
  pass('Manifest reachable', url);

  if (payload.supabase_enabled === true) pass('manifest.supabase_enabled', 'true');
  else fail('manifest.supabase_enabled', `expected true, got ${payload.supabase_enabled}`);

  if ((payload.routes_written || 0) >= MIN_ROUTES) {
    pass('manifest.routes_written', `${payload.routes_written} ≥ ${MIN_ROUTES}`);
  } else {
    fail('manifest.routes_written', `${payload.routes_written} < ${MIN_ROUTES}`);
  }

  if ((payload.routes_failed || 0) === 0) pass('manifest.routes_failed', '0');
  else fail('manifest.routes_failed', `${payload.routes_failed} failed`);

  const counts = payload.source_counts || {};
  for (const src of ['page_seo', 'blog_posts', 'equipment_pages', 'seo_location_pages']) {
    if ((counts[src] || 0) > 0) pass(`source_counts.${src}`, String(counts[src]));
    else fail(`source_counts.${src}`, `0 rows — RLS or env-var problem`);
  }

  return payload;
}

async function checkPage(page) {
  const url = `${BASE}${page.path}`;
  let res;
  try {
    res = await fetchText(url);
  } catch (err) {
    fail(`[${page.label}] reachable`, `${url} → ${err.message}`);
    return;
  }
  if (res.status !== 200) {
    fail(`[${page.label}] HTTP 200`, `got ${res.status}`);
    return;
  }
  pass(`[${page.label}] HTTP 200`, page.path);

  const title = getTitle(res.text);
  const desc = getMeta(res.text, 'description');
  const canonical = getCanonical(res.text);
  const ogTitle = getMetaProp(res.text, 'og:title');
  const ogImage = getMetaProp(res.text, 'og:image');
  const twCard = getMeta(res.text, 'twitter:card');

  if (title && title !== 'Truficient Energy Solutions' && page.expectedTitleMatch.test(title)) {
    pass(`[${page.label}] <title>`, title);
  } else {
    fail(`[${page.label}] <title>`, `got "${title}" — expected match ${page.expectedTitleMatch}`);
  }

  if (desc && desc.length > 20) pass(`[${page.label}] meta description`, `${desc.length} chars`);
  else fail(`[${page.label}] meta description`, `missing or too short: "${desc}"`);

  if (canonical === page.expectedCanonical) {
    pass(`[${page.label}] canonical`, canonical);
  } else {
    fail(`[${page.label}] canonical`, `got "${canonical}", expected "${page.expectedCanonical}"`);
  }

  if (ogTitle) pass(`[${page.label}] og:title`, ogTitle);
  else fail(`[${page.label}] og:title`, 'missing');
  if (ogImage) pass(`[${page.label}] og:image`, ogImage);
  else fail(`[${page.label}] og:image`, 'missing');
  if (twCard) pass(`[${page.label}] twitter:card`, twCard);
  else fail(`[${page.label}] twitter:card`, 'missing');

  if (page.requireJsonLd) {
    const blocks = extractJsonLdBlocks(res.text);
    if (blocks.length === 0) {
      fail(`[${page.label}] JSON-LD present`, 'no <script type="application/ld+json"> found');
      return;
    }
    pass(`[${page.label}] JSON-LD present`, `${blocks.length} block(s)`);

    const graphBlock = blocks.find((b) => b && Array.isArray(b['@graph']));
    if (!graphBlock) {
      fail(`[${page.label}] @graph structure`, 'no block with @graph[] array');
    } else {
      const types = graphBlock['@graph'].map((n) => n['@type']).filter(Boolean);
      const required = ['Article', 'FAQPage', 'BreadcrumbList', 'Organization'];
      const missing = required.filter((t) => !types.includes(t));
      if (missing.length === 0) {
        pass(`[${page.label}] @graph types`, types.join(', '));
      } else {
        fail(`[${page.label}] @graph types`, `missing: ${missing.join(', ')}`);
      }

      if (page.requireFaqHashMatch) {
        const faqNode = graphBlock['@graph'].find((n) => n['@type'] === 'FAQPage');
        const schemaFaqs = (faqNode?.mainEntity || []).map((q) => ({
          q: (q.name || '').trim(),
          a: (q.acceptedAnswer?.text || '').trim(),
        }));
        const visibleFaqs = extractVisibleFaqs(res.text);

        if (visibleFaqs.length === 0) {
          fail(`[${page.label}] FAQ visible`, 'no data-faq-question/answer attrs found in HTML');
        } else if (schemaFaqs.length !== visibleFaqs.length) {
          fail(
            `[${page.label}] FAQ count match`,
            `schema=${schemaFaqs.length} visible=${visibleFaqs.length}`,
          );
        } else {
          let mismatches = 0;
          for (let i = 0; i < schemaFaqs.length; i++) {
            if (
              schemaFaqs[i].q !== visibleFaqs[i].q ||
              schemaFaqs[i].a !== visibleFaqs[i].a
            ) mismatches++;
          }
          if (mismatches === 0) {
            pass(`[${page.label}] FAQ hash match`, `${schemaFaqs.length} Q&A pairs identical`);
          } else {
            fail(`[${page.label}] FAQ hash match`, `${mismatches} of ${schemaFaqs.length} mismatched`);
          }
        }
      }
    }
  }
}

async function checkPendingBuildRoutes(manifest) {
  if (!manifest) return;
  const routeSet = new Set(manifest.route_paths || []);
  const present = PENDING_BUILD_ROUTES.filter((r) => routeSet.has(r));
  const missing = PENDING_BUILD_ROUTES.filter((r) => !routeSet.has(r));

  if (WATER_CRISIS_BUILD_SHIPPED) {
    if (missing.length === 0) pass('Water-crisis routes prerendered', `all ${PENDING_BUILD_ROUTES.length}`);
    else fail('Water-crisis routes prerendered', `missing: ${missing.join(', ')}`);
  } else {
    warn(
      'Water-crisis routes (queued)',
      `${present.length}/${PENDING_BUILD_ROUTES.length} present — flip WATER_CRISIS_BUILD_SHIPPED=true after build ships`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  if (!JSON_OUT) {
    console.log(`\nVerifying prerender deploy at ${BASE}\n${'─'.repeat(60)}`);
  }

  let manifest;
  try {
    manifest = await checkManifest();
  } catch (err) {
    console.error(`Fatal: could not check manifest — ${err.message}`);
    exit(2);
  }

  for (const page of REPRESENTATIVE_PAGES) {
    await checkPage(page);
  }

  await checkPendingBuildRoutes(manifest);

  if (JSON_OUT) {
    console.log(JSON.stringify({
      base: BASE,
      passed: results.passed.length,
      failed: results.failed.length,
      warned: results.warned.length,
      details: results,
    }, null, 2));
  } else {
    console.log(`${'─'.repeat(60)}`);
    console.log(`Passed: ${results.passed.length}   Failed: ${results.failed.length}   Warnings: ${results.warned.length}`);
  }
  exit(results.failed.length > 0 ? 1 : 0);
})().catch((err) => {
  console.error('Unhandled:', err);
  exit(2);
});
