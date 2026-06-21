# Staging Verification — Vercel Preview

**Preview:** `https://truficient-git-infra-vercel-ssg-migration-eric-loves-projects.vercel.app`
**Branch:** `infra/vercel-ssg-migration` · **Date:** 2026-06-20 → 06-21
**Verified build:** `c8ab28f` (full-body snapshot via `@sparticuz/chromium`, incl. `/equipment/trane`)

> Production remains on Lovable (untouched). This is the Gate 3 record. Deployment
> Protection was temporarily turned OFF for Preview so the raw (no-JS) checks below
> could run via `curl`.

## Build / prerender on Vercel
Deployed `/prerender-manifest.json`:
```
body_snapshot: true | degraded: false
routes_written: 755 | content: 746 | interactive: 9 | body_empty: 0 | failed: 0
duration: ~255s
```
The first Vercel builds **degraded** (Playwright's bundled Chromium can't launch in
Vercel's build image). Fixed by switching the build-time browser to
**`@sparticuz/chromium@143.0.4`** (pinned to Playwright 1.57's Chromium 143). The
snapshot now runs on Vercel (255s build, 0 empty bodies).

## Acceptance criteria (Brief §3)

| # | Criterion | Result |
|---|---|---|
| 1 | **Body present (no-JS)** at clean URL | ✅ `/hvac-garland-tx/` "Garland" ×33 (#root 14 KB); `/blog/ashrae-…/` "ASHRAE" ×43 (#root 23 KB); `/equipment/trane/5ttv8x48a1000aa/` #root 50 KB |
| 2 | **Self-canonical**, never homepage | ✅ 9/9 sampled public URLs canonical to their own clean trailing-slash URL (homepage→`/`, about, contact, service-areas, 3 locations, blog, financing, equipment model) |
| 3 | **Redirects 301** | ✅ `*.html` → `/…/` = **301** (about, contact, location, blog); no-slash → `/…/` = **308** (Vercel trailingSlash, permanent — SEO-equivalent to 301). http/www are Cloudflare (Phase 4). |
| 4 | **Admin functional** | ⏳ Routing ✅ — `/admin/login/` → **200, serves app shell** (the `(.*)` rewrite fix). Interactive login + open-estimate still pending (needs Eric eyeball or test creds). |
| 5 | **No broken routes / real 404** | ✅ `/zzz-not-a-page/`, `/blog/does-not-exist/`, `/equipment/trane/fake-model/` → **404** (real, not homepage). `/equipment/trane/` (brand hub) now **200, 44 KB body, self-canonical** (fixed in `c8ab28f`). |
| 6 | **Sitemap** clean | ✅ `/sitemap.xml` = 755 `<loc>`, **0 `.html`**, all trailing-slash |
| 7 | **Counts sane** | ✅ 754 written (≥100 hard-fail guard); 745 content + 9 interactive |
| 8 | **LCP improved** | ✅ Hydration seed fix (commit `0f7fc71`) — location/equipment pages no longer discard the prerendered hero (client re-fetch eliminated). Throttled LCP ~1.4–2.2s (local 1.4s; deployed plano 1964ms / equip 2172ms); was ~7.5s. Re-run PSI for the authoritative number. Blog hero is image-bound (separate follow-up). |

## Redirect spot-checks (Brief §3.3 / redirect map)
```
/about.html                          301 -> /about/
/contact.html                        301 -> /contact/
/ac-repair-preston-hollow-dallas.html 301 -> /ac-repair-preston-hollow-dallas/
/blog/why-dfw-humidity-is-rising.html 301 -> /blog/why-dfw-humidity-is-rising/
/hvac-richardson-tx (no slash)       308 -> /hvac-richardson-tx/
```

## Open items before Gate 3 GO
All automatable checks **PASS**. Remaining (need Eric):
1. **Admin interactive smoke test** (login → dashboard, create an SEO location page, open/edit an estimate, inbox loads, SEO dashboard loads) — needs Eric eyeball or throwaway test creds (Brief §3.4 — any failure = NO-GO). Routing already confirmed (`/admin/login/` serves the app).
2. **LCP** PageSpeed on 3 location pages on the preview (Brief §3.8).
3. **Re-enable Deployment Protection** for Preview before/at cutover (currently OFF so curl checks could run).

## Fix history on the branch (Phase 2 staging)
- `d610b95` initial SSG + vercel.json — Vercel build **degraded** (bundled Chromium can't launch) and admin rewrite missed trailing slash.
- `3ce86d3` pin build config + harden rewrites to `(.*)` — admin/redirects/404 ✅, still degraded.
- `dea22a3` switch to `@sparticuz/chromium@143.0.4` — **full-body snapshot works on Vercel** ✅.
- `c8ab28f` prerender `/equipment/trane` brand hub — last 404 gap closed ✅.
