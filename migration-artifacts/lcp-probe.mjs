// LCP probe: load a deployed page under mobile throttling and report the LCP
// element + timing, with JS enabled (hydration) vs disabled (pure static HTML).
// Usage: node migration-artifacts/lcp-probe.mjs <url>
import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://truficient-git-infra-vercel-ssg-migration-eric-loves-projects.vercel.app/hvac-garland-tx/';

async function measure({ jsEnabled }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143 Mobile Safari/537.36',
    javaScriptEnabled: jsEnabled,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  // Lighthouse "Slow 4G"-ish: ~1.6 Mbps down, 750 Kbps up, 150ms RTT, 4x CPU.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  // give LCP a moment to settle (post-hydration)
  await page.waitForTimeout(jsEnabled ? 6000 : 3000);

  const result = await page.evaluate(() => new Promise((resolve) => {
    const out = { lcp: null, fcp: null, el: null, size: null };
    for (const e of performance.getEntriesByType('paint')) {
      if (e.name === 'first-contentful-paint') out.fcp = Math.round(e.startTime);
    }
    const lcps = performance.getEntriesByType('largest-contentful-paint');
    if (lcps.length) {
      const last = lcps[lcps.length - 1];
      out.lcp = Math.round(last.renderTime || last.loadTime || last.startTime);
      out.size = last.size;
      const el = last.element;
      out.el = el ? `${el.tagName}${el.className ? '.' + String(el.className).split(' ')[0] : ''}: "${(el.innerText || el.textContent || '').trim().slice(0, 50)}"` : '(none)';
    }
    resolve(out);
  }));
  await browser.close();
  return result;
}

console.log('URL:', URL);
for (const jsEnabled of [false, true]) {
  const r = await measure({ jsEnabled });
  console.log(`\n--- JS ${jsEnabled ? 'ENABLED (hydration)' : 'DISABLED (static HTML only)'} ---`);
  console.log(`  FCP: ${r.fcp} ms | LCP: ${r.lcp} ms | LCP size: ${r.size}`);
  console.log(`  LCP element: ${r.el}`);
}
