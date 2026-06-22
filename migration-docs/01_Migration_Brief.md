# 01 — Migration Brief (the "what" and "why")
**For:** the Claude Code agent executing this migration. Read fully before writing any code.

## 1. Current state (root cause to fix)
- Stack: **Vite + React + React Router (`createBrowserRouter`)** SPA, **Supabase** backend, lazy-loaded routes, admin under `/admin/*` behind `<ProtectedRoute>`. Hosted on **Lovable**.
- `scripts/prerender.mjs` rewrites only the `<head>` of each route into a flat `dist/<path>.html`. **The body stays the empty SPA shell.**
- **Lovable serves the SPA shell (homepage, `canonical=/`) for every extensionless URL** because it can't do directory-index. Only `/foo.html` returns the right head.
- Every internal link in `src/` is an extensionless React Router `<Link>` (zero use `.html`).
- **Consequence (measured in GSC):** 982 pages not indexed (444 "alternate page w/ canonical", 169 "crawled–not indexed", 83 soft-404), 206 slugs indexed under multiple URLs, 183 clicks on 25,128 impressions in 92 days.

Full evidence: `../Truficient Website Revamp/Internal Linking Audit — 2026-06-20.md`.

## 2. Target architecture
**Host:** Vercel. **DNS:** Cloudflare. **Canonical URL form:** clean trailing-slash (`/hvac-garland-tx/`).

1. **Public marketing pages → full static prerender (SSG).** Each public route is rendered to **complete HTML (body included)** and written as **`dist/<path>/index.html`** so Vercel serves it at the clean trailing-slash URL. Each page keeps a **self-referencing canonical** to its own clean URL.
2. **Admin/CRM/estimator/app routes stay client-rendered.** `/admin/*` and the interactive app routes are **not** prerendered; Vercel's SPA fallback serves `index.html` and React boots as today. **No change to admin behavior, data layer, or auth.**
3. **Redirects (see `03_URL_Redirect_Map.md`)** consolidate every legacy URL onto the canonical form: `http→https`, `www→non-www`, `*.html → /*/`, and enforce trailing slash. 301 (permanent).
4. **Sitemap** lists only the canonical clean URLs; submit after cutover.

### Recommended implementation (lowest-refactor, agent may substitute)
The repo already depends on **Playwright** (`playwright.config.ts`). Recommended: a **build-time snapshot prerender** that reuses the existing Supabase route-list logic in `scripts/prerender.mjs`:
1. `vite build` as today.
2. Serve `dist/` locally; for each **public** route (static list + Supabase blog/equipment/location slugs), load it in Playwright, wait until the body content **and** the client-set `<link rel=canonical>` are present, then write the rendered `documentElement.outerHTML` to `dist/<path>/index.html`.
3. Do **not** snapshot `/admin/*` or app-only routes — leave them to SPA fallback.
4. Switch client mount to `hydrateRoot` when a prerendered root exists (fall back to `createRoot` otherwise). If hydration proves unstable this weekend, the acceptable fallback is fresh client render over the static HTML — crawlers and LCP still benefit; do not block go-live on perfect hydration.

Alternatives the agent may choose **if** they better meet the acceptance criteria within the timebox: `vite-react-ssg`, or **Vike** per `docs/seo-prerender-vike-followup.md`. Pick the path with the least admin-app risk. Do not adopt a full SSR runtime unless SSG cannot render a required route.

## 3. Acceptance criteria (all must pass on STAGING before cutover)
1. **Body HTML present at the clean URL.** `curl -s https://<staging>/ductless-hvac-oak-cliff-dallas/ | grep -i "<known body string>"` matches — not just the `<title>`. Repeat for 1 location page, 1 equipment page, 1 blog post.
2. **Self-canonical, not home.** Raw (no-JS) fetch of 10 sampled public URLs shows `<link rel=canonical>` pointing to the page's own clean URL — never `https://truficient.com/`.
3. **Redirects work.** `http://`, `www`, `.html`, and no-slash variants each return **301** to the canonical clean URL (test the list in `03_URL_Redirect_Map.md`).
4. **Admin fully functional, zero regression.** Login → dashboard loads; create an SEO location page in `/admin/seo`; open/edit an estimate; inbox loads; SEO dashboard loads. (Mirror the checklist in `docs/seo-prerender-vike-followup.md`.)
5. **No broken routes.** Every route in `src/App.tsx` resolves (public renders real HTML; app/admin render in browser). 404s return a real 404, not the homepage.
6. **Sitemap** contains only canonical clean URLs and validates.
7. **Counts sane.** Prerender writes ≥ the expected public-route count (reuse the existing `MIN_ROUTES_HARD_FAIL` guard). Build fails loudly if not.
8. **Performance not worse:** sampled location-page mobile LCP improved vs the 13.7s baseline (target < 2.5s; any large improvement is acceptable for go-live).

## 4. Non-negotiables (hard constraints)
- **Production is never edited in place.** All work on a branch + Vercel **preview/staging** deploy. Cutover is a deliberate DNS switch after gates pass.
- **The admin app cannot regress.** If any admin smoke test fails, it's NO-GO.
- **URL preservation is mandatory.** No impression-earning URL may 404. Everything maps per `03_URL_Redirect_Map.md`.
- **No secrets in chat or in the repo's client bundle beyond what's already public** (the Supabase anon key is already public; the **service-role key must never** be added client-side or pasted to the agent).
- **Phone number** stays `214-238-4349` everywhere (display + `tel:`). **No Oncor rebate** language introduced.
- **Reversible at every step** (`06_Rollback_Plan.md`).

## 5. Out of scope (do NOT do this weekend)
- Content rewrites, new pages, design changes.
- The internal-linking *coverage* improvements (hub link distribution, expanded footer/related-links). Those come **after** the infra is stable — they're easy once clean URLs render. Note them as follow-ups; don't bundle them into the cutover.
- Admin/CRM refactors.
- **Database move + AI provider switch.** Confirmed Lovable-managed Supabase, and Eric is keeping Lovable — so the DB, 50 edge functions, and AI gateway stay exactly where they are and keep working. **The agent must not export the DB, change AI providers, or take over function deploys.** The frontend on Vercel simply calls the same Supabase URL + anon key (same `truficient.com` origin → no CORS change). See `08_Database_and_AI_Migration.md` (deferred/reference only).
