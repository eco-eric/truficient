// Functional test for the gallery redesign on the built dist (local vite preview).
import { preview } from 'vite';
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const server = await preview({
  root: resolve(process.cwd()), configFile: false, build: { outDir: 'dist' },
  preview: { port: 4180, strictPort: true, host: '127.0.0.1' }, logLevel: 'warn',
});
const base = (server.resolvedUrls?.local?.[0] || 'http://127.0.0.1:4180').replace(/\/$/, '');

const b = await chromium.launch({ headless: true });
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

await page.goto(base + '/gallery/', { waitUntil: 'load', timeout: 45000 });
// wait for grid tiles to populate from Supabase
await page.locator('main button').first().waitFor({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);

const tileCount = () => page.locator('main button').count();
const initial = await tileCount();
console.log('initial tiles:', initial);
console.log('h1:', (await page.locator('h1').first().textContent())?.trim());

// 1) Popular chip filter
const chip = page.getByRole('button', { name: /^Ductless\s*\d+/ }).first();
let chipOk = false, urlAfterChip = '';
if (await chip.count()) {
  await chip.click();
  await page.waitForTimeout(900);
  urlAfterChip = new URL(page.url()).search;
  const after = await tileCount();
  chipOk = urlAfterChip.includes('systemType') && after <= initial && after > 0;
  console.log(`popular chip "Ductless": url="${urlAfterChip}" tiles ${initial}->${after} | active pill: ${await page.getByText('Clear all').count() ? 'yes' : 'no'}`);
}

// 2) Search type-ahead
await page.getByPlaceholder(/Search ZIP/i).fill('75');
await page.waitForTimeout(500);
const suggestZip = await page.getByText('ZIP Code', { exact: true }).count();
console.log('search "75" → ZIP Code group shown:', suggestZip > 0);
await page.getByPlaceholder(/Search ZIP/i).fill('');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 3) Clear all
if (await page.getByText('Clear all').count()) {
  await page.getByText('Clear all').first().click();
  await page.waitForTimeout(700);
  console.log('after Clear all: url search="' + new URL(page.url()).search + '" tiles=' + (await tileCount()));
}

// 4) Lightbox
await page.locator('main button').first().click();
await page.waitForTimeout(800);
const dialog = page.getByRole('dialog');
const lbOpen = await dialog.count();
const hasTags = await page.getByText(/Tags \(click to filter\)/i).count();
console.log('lightbox open:', lbOpen > 0, '| clickable tags section:', hasTags > 0);

console.log('console errors:', errors.length, errors.slice(0, 4).join(' || '));
await b.close();
await server.close();
console.log('DONE');
