// Hydration + LCP test: serve the built dist locally and load prerendered pages
// under mobile throttling. Verifies the SSG seed works — hero stays painted, no
// spinner, NO client re-fetch of page data — and measures LCP via a
// PerformanceObserver injected before navigation.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const PATHS = ['/hvac-garland-tx/', '/blog/ashrae-texas-code-dfw-humidity-requirements/', '/equipment/trane/5ttv8x48a1000aa/'];
const FETCH_TABLES = /seo_location_pages|blog_posts|equipment_pages/;

const server = await preview({
  root: ROOT, configFile: false, build: { outDir: 'dist' },
  preview: { port: 5055, strictPort: true, host: '127.0.0.1' }, logLevel: 'warn',
});
const base = (server.resolvedUrls?.local?.[0] || 'http://127.0.0.1:5055').replace(/\/$/, '');

const browser = await chromium.launch({ headless: true });
for (const path of PATHS) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true });
  const page = await ctx.newPage();
  // LCP observer must exist before paint.
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp = Math.round(e.renderTime || e.loadTime || e.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const dataFetches = [];
  page.on('request', (r) => { if (FETCH_TABLES.test(r.url())) dataFetches.push((r.url().split('/rest/v1/')[1] || '').split('?')[0]); });

  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(base + path, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(4000);
  const lcp = await page.evaluate(() => window.__lcp);
  const h1 = (await page.locator('h1').first().textContent().catch(() => ''))?.trim().slice(0, 45);
  const spinners = await page.locator('.animate-spin').count();

  console.log(`\n=== ${path} ===`);
  console.log(`  LCP (throttled Slow-4G+4xCPU): ${lcp} ms`);
  console.log(`  hero h1 final                : "${h1}"`);
  console.log(`  loading spinners             : ${spinners}`);
  console.log(`  client re-fetch of page data : ${dataFetches.length}  ${dataFetches.length === 0 ? '[SKIPPED ✓ seed works]' : '[' + dataFetches.join(',') + ' — seed NOT working]'}`);
  await ctx.close();
}
await browser.close();
await server.close();
console.log('\nDONE');
