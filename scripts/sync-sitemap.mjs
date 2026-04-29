#!/usr/bin/env node
/**
 * Build-time sync of `public/sitemap.xml` from the live `generate-sitemap`
 * Supabase Edge Function.
 *
 * Why this exists
 * ---------------
 * Lovable Hosting serves `public/sitemap.xml` as a static file, which means
 * the `generate-sitemap` edge function output is invisible to crawlers
 * unless we bake it into the deploy. This script fetches the live function
 * output and writes it to `public/sitemap.xml` BEFORE Vite copies `public/`
 * into `dist/`, so the deployed sitemap always matches what the edge
 * function would return (with .html-suffixed URLs for prerendered pages).
 *
 * Failure mode: if the fetch fails, we log a warning and KEEP the existing
 * `public/sitemap.xml` rather than blow up the build. A stale sitemap is
 * better than no sitemap.
 */

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'public', 'sitemap.xml');

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function main() {
  if (!SUPABASE_URL) {
    console.warn('[sync-sitemap] SUPABASE_URL not set — skipping');
    return;
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/generate-sitemap`;
  console.log(`[sync-sitemap] Fetching ${url}`);

  const headers = { Accept: 'application/xml' };
  if (ANON_KEY) {
    headers.Authorization = `Bearer ${ANON_KEY}`;
    headers.apikey = ANON_KEY;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`generate-sitemap responded ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  if (!xml.includes('<urlset')) {
    throw new Error('generate-sitemap response did not contain <urlset>');
  }

  const htmlCount = (xml.match(/<loc>[^<]*\.html<\/loc>/g) || []).length;
  const totalCount = (xml.match(/<loc>/g) || []).length;
  console.log(
    `[sync-sitemap] Writing ${OUT_PATH} (${totalCount} URLs, ${htmlCount} ending in .html)`,
  );

  await writeFile(OUT_PATH, xml, 'utf8');
}

main().catch((err) => {
  console.warn(
    '[sync-sitemap] Failed to refresh public/sitemap.xml — keeping existing file.',
  );
  console.warn('[sync-sitemap]', err?.message || err);
});
