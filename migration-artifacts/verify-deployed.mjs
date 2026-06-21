// Verify the SSG hydration seed on the DEPLOYED preview (not local dist).
// Loads pages under mobile throttling; checks LCP, no spinner, and that the
// client does NOT re-fetch the seeded page data.
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://truficient-git-infra-vercel-ssg-migration-eric-loves-projects.vercel.app').replace(/\/$/, '');
const PATHS = ['/hvac-garland-tx/', '/hvac-plano-tx/', '/equipment/trane/5ttv8x48a1000aa/'];
const MAIN_FETCH = /seo_location_pages|blog_posts/; // location/blog main data (equipment also has a related query)

const browser = await chromium.launch({ headless: true });
for (const path of PATHS) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = Math.round(e.renderTime || e.loadTime || e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const fetches = [];
  page.on('request', (r) => { if (/seo_location_pages|blog_posts|equipment_pages/.test(r.url())) fetches.push((r.url().split('/rest/v1/')[1] || '').split('?')[0]); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4500);
  const lcp = await page.evaluate(() => window.__lcp);
  const spinners = await page.locator('.animate-spin').count();
  console.log(`${path}\n  LCP ${lcp}ms | spinners ${spinners} | page-data fetches: [${fetches.join(',') || 'none'}]`);
  await ctx.close();
}
await browser.close();
console.log('DONE');
