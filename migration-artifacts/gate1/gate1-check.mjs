// Gate 1 staging smoke test (non-auth) — runs against the Vercel preview.
// Usage: node migration-artifacts/gate1/gate1-check.mjs https://truficient.vercel.app
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = (process.argv[2] || 'https://truficient.vercel.app').replace(/\/$/, '');
const OUT = 'migration-artifacts/gate1';
await mkdir(OUT, { recursive: true });

const results = [];
const log = (k, v) => { results.push(`${k}: ${v}`); console.log(`${k}: ${v}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent:
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
const page = await ctx.newPage();

const consoleErrors = [];
const failedReq = [];
const supabaseReq = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('requestfailed', r => failedReq.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText}`));
page.on('response', r => { if (r.url().includes('supabase.co')) supabaseReq.push(`${r.status()} ${r.url().split('?')[0]}`); });

// 1) Homepage boot
const resp = await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
log('homepage.httpStatus', resp.status());
log('homepage.title', await page.title());
const rootChildren = await page.evaluate(() => document.querySelector('#root')?.children.length ?? 0);
log('homepage.rootChildren', rootChildren + (rootChildren > 0 ? ' (React mounted)' : ' (EMPTY — app did not mount)'));
const h1 = (await page.locator('h1').first().textContent().catch(() => null))?.trim();
log('homepage.firstH1', h1 ? JSON.stringify(h1.slice(0, 80)) : '<none>');
const bodyText = (await page.locator('body').innerText().catch(() => '')).length;
log('homepage.bodyTextLen', bodyText);
await page.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: false });

// 2) Client-side navigation (proves React Router runs in-browser)
const navHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href^="/"]')]
    .find(a => { const h = a.getAttribute('href'); return h && h !== '/' && !h.startsWith('//') && !h.includes('#'); });
  return a ? a.getAttribute('href') : null;
});
if (navHref) {
  await page.evaluate(h => {
    const a = [...document.querySelectorAll('a[href^="/"]')].find(x => x.getAttribute('href') === h);
    a?.click();
  }, navHref);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  const url = page.url();
  const stillMounted = await page.evaluate(() => (document.querySelector('#root')?.children.length ?? 0) > 0);
  log('clientNav.clickedHref', navHref);
  log('clientNav.resultUrl', url.replace(BASE, ''));
  log('clientNav.renderedAfterNav', stillMounted ? 'YES' : 'NO');
} else {
  log('clientNav', 'no internal <a href="/..."> link found on homepage');
}

// 3) Probe server routing for deep-links (documents Phase-2 need; not a Gate-1 pass/fail)
for (const path of ['/admin/login', '/hvac-garland-tx/', '/this-should-404-xyz/']) {
  const r = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => null);
  const status = r ? r.status() : 'ERR';
  await page.waitForTimeout(1500);
  const mounted = await page.evaluate(() => (document.querySelector('#root')?.children.length ?? 0) > 0);
  const title = await page.title();
  log(`deeplink ${path}`, `http=${status} mounted=${mounted} title=${JSON.stringify(title.slice(0,40))}`);
  if (path === '/admin/login') await page.screenshot({ path: `${OUT}/admin-login-deeplink.png` });
}

log('console.errorCount', consoleErrors.length);
if (consoleErrors.length) log('console.errors', JSON.stringify(consoleErrors.slice(0, 8), null, 0));
log('network.failedCount', failedReq.length);
if (failedReq.length) log('network.failed', JSON.stringify(failedReq.slice(0, 8), null, 0));
log('supabase.requests', supabaseReq.length ? JSON.stringify(supabaseReq.slice(0, 6)) : 'NONE observed');

await browser.close();

const fs = await import('node:fs/promises');
await fs.writeFile(`${OUT}/gate1-results.txt`,
  `# Gate 1 staging smoke (non-auth) — ${BASE}\n# 2026-06-20\n\n` + results.join('\n') + '\n');
console.log('\nWROTE ' + OUT + '/gate1-results.txt');
