// Reliable mobile LCP measurement on the DEPLOYED preview.
// 3 location pages x 3 runs, Slow-4G + 4x CPU, proper buffered LCP observer.
// Reports median + range per page and the LCP element identity/time.
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://truficient-git-infra-vercel-ssg-migration-eric-loves-projects.vercel.app').replace(/\/$/, '');
const PATHS = ['/hvac-garland-tx/', '/hvac-richardson-tx/', '/hvac-plano-tx/'];
const RUNS = 3;

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

async function runOnce(browser, path) {
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 823 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143 Mobile Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__fcp = 0; window.__lcp = 0; window.__lcpEl = '(none)'; window.__lcpSize = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__fcp = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__lcp = Math.round(e.renderTime || e.loadTime || e.startTime);
        window.__lcpSize = e.size;
        const el = e.element;
        window.__lcpEl = el ? `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).split(' ')[0] : ''} "${(el.innerText || el.textContent || '').trim().slice(0, 40)}"` : '(none)';
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(6000); // settle under throttle; LCP finalizes on interaction/quiet
  const r = await page.evaluate(() => ({ fcp: window.__fcp, lcp: window.__lcp, el: window.__lcpEl, size: window.__lcpSize }));
  await ctx.close();
  return r;
}

const browser = await chromium.launch({ headless: true });
for (const path of PATHS) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await runOnce(browser, path));
  const lcps = runs.map((r) => r.lcp);
  const fcps = runs.map((r) => r.fcp);
  console.log(`\n=== ${path} ===`);
  console.log(`  LCP runs: ${lcps.join(', ')} ms  -> median ${median(lcps)} ms (range ${Math.min(...lcps)}-${Math.max(...lcps)})`);
  console.log(`  FCP runs: ${fcps.join(', ')} ms  -> median ${median(fcps)} ms`);
  console.log(`  LCP element: ${runs[runs.length - 1].el}  (size ${runs[runs.length - 1].size})`);
}
await browser.close();
console.log('\nDONE');
