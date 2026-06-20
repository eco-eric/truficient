# 02 — Claude Code Agent Runbook (the "how")
**Audience:** the Claude Code agent on Eric's desktop. **Repo:** `eco-eric/truficient`.
**Read `01_Migration_Brief.md` and `03_URL_Redirect_Map.md` first.** Obey every non-negotiable.

Legend: 🤖 = agent does it · 🧑 = **STOP, Eric does it** (credential/irreversible) · ✅ = gate (must pass to continue).

---

## Phase 0 — Prep & safety (no production impact)
🤖 0.1 Clone fresh and create a working branch. Never commit to `main` during this work:
```
git clone https://github.com/eco-eric/truficient.git
cd truficient
git checkout -b infra/vercel-ssg-migration
npm ci   # or: bun install  (repo has bun.lock)
```
🤖 0.2 Confirm a clean local build before changing anything:
```
npm run build          # vite build + existing prerender.mjs
```
If it fails, fix the build env first (Supabase env vars — see `04_Accounts_and_Access.md`) before proceeding. Do not continue on a red build.

🤖 0.3 Capture a baseline of production so we can compare after cutover. Save to `migration-artifacts/baseline/`:
- The current sitemap URL list (already analyzed: 384 `.html`).
- `curl -sI` status + canonical for 10 representative live URLs (homepage, 3 location, 1 equipment, 1 blog, 1 hub, /about, /contact).
- Note current Lighthouse/LCP if available.

✅ **Gate 0:** clean build + baseline captured.

---

## Phase 1 — Stand up Vercel (parity check, prod still on Lovable)
🧑 1.1 In **Vercel**, "Add New Project" → import `eco-eric/truficient` from GitHub. Framework preset: **Vite**. Do **not** add the production domain yet. (Agent: provide Eric the build command `npm run build`, output dir `dist`, and the env-var names to set — values from `04_Accounts_and_Access.md`. Eric pastes secrets in Vercel's UI, never in chat.)
🧑 1.2 Set Vercel **Environment Variables** (Production + Preview) to match the repo `.env` (the `VITE_SUPABASE_*` names). Use the **anon** key only. The service-role key is **not** needed for the public site — do not add it.
🤖 1.3 Trigger the first **preview** deploy (push the branch). Vercel produces a `*.vercel.app` preview URL — this is **staging**. Production traffic is untouched (still Lovable).
🤖 1.4 Smoke-test the raw SPA on staging: homepage loads, navigation works, **admin login works**, an estimate opens. This proves the app runs on Vercel before we change rendering.

✅ **Gate 1:** staging `*.vercel.app` serves the working app incl. admin login. If not, stop and fix hosting/env before touching rendering.

---

## Phase 2 — Implement SSG prerender + routing config (on branch)
🤖 2.1 **Add `vercel.json`** at repo root:
- `"trailingSlash": true` (enforces `/foo` → `/foo/`).
- **Redirects** (301) per `03_URL_Redirect_Map.md`: `*.html` → `/$1/`; plus the host-level http/www handled in Phase 4 (domain settings).
- **SPA fallback** for app/admin routes that are NOT prerendered (rewrite to `/index.html`), so `/admin/*`, estimators, scanner, public-estimate-preview still boot client-side.
- A real **404** for unknown content URLs (don't let them fall back to the homepage).

🤖 2.2 **Upgrade prerendering to full body (recommended: Playwright snapshot).**
- Reuse the Supabase route-list loaders already in `scripts/prerender.mjs` (page_seo, blog_posts, equipment_pages, seo_location_pages) + the static public routes. **Exclude** `/admin/*` and app-only routes (estimators, scanner, forms, public-estimate-preview, login).
- Build, serve `dist/` locally, and for each public route: load in Playwright, wait for (a) a known body selector/`<h1>` and (b) `<link rel=canonical>` to be set by the app, then write `documentElement.outerHTML` to `dist/<path>/index.html`.
- Verify each snapshot's canonical is the page's own clean URL (not `/`). Fail the build if any public route's canonical is `/` or body is empty.
- Keep the existing **hard-fail guard** (≥100 routes / expected count).

🤖 2.3 **Client hydration:** switch `src/main.tsx` to use `hydrateRoot` when `#root` has prerendered children, else `createRoot`. If hydration mismatches block progress, fall back to fresh client render (document the choice). Admin path must be unaffected.

🤖 2.4 **Sitemap:** update generation to emit canonical clean trailing-slash URLs only; write `dist/sitemap.xml`.

🤖 2.5 Commit; push branch → new Vercel preview (staging) deploy.

✅ **Gate 2:** branch builds green; staging redeploys without errors.

---

## Phase 3 — Verify on staging (the big gate)
Run **all** acceptance criteria from `01_Migration_Brief.md §3` against the staging `*.vercel.app` URL. Record results in `migration-artifacts/staging-verification.md`.

🤖 3.1 **Body present (no-JS):** for 1 location, 1 equipment, 1 blog URL — fetch raw HTML and grep a known body string. Must match.
🤖 3.2 **Self-canonical:** raw-fetch 10 public URLs; canonical = own clean URL, never `/`.
🤖 3.3 **Redirects:** for each rule, `curl -sI` a sample and confirm **301 → canonical** (`.html`, no-slash, and — once domain is on — http/www).
🤖 3.4 **Admin smoke test (critical):** login → dashboard; create a location page in `/admin/seo`; open & edit an estimate; inbox loads; SEO dashboard loads. **Any failure = NO-GO.**
🤖 3.5 **No orphaned 404s:** spot-check 20 URLs from `03_URL_Redirect_Map.md`; all resolve or 301.
🤖 3.6 **LCP:** PageSpeed on 3 location pages; confirm large improvement vs 13.7s baseline.
🧑 3.7 **Eric eyeballs staging:** click around the public site and the admin on the `*.vercel.app` URL. Confirm it looks/works right.

✅ **Gate 3 (GO/NO-GO):** every item 3.1–3.7 passes. If anything fails, **do not cut over** — fix or hold per `07_Weekend_Schedule.md`. Production is still safely on Lovable.

---

## Phase 4 — Cutover (only after Gate 3 = GO)
🧑 4.1 In **Vercel** → Project → **Domains**, add `truficient.com` and `www.truficient.com`. Vercel shows the DNS target (a CNAME/A value).
🧑 4.2 In **Cloudflare** DNS: point the records to Vercel's target as Vercel instructs. Set **redirect: `www` → non-`www`** and ensure **http → https** (Cloudflare "Always Use HTTPS" ON). Follow Vercel's proxy guidance (typically set the record to **DNS-only/grey-cloud** during validation, then re-enable proxy with **Full (strict)** SSL if desired). Cloudflare TTL is low, so propagation is minutes.
🤖 4.3 The moment DNS resolves to Vercel, verify on the **real domain**: homepage, 5 location pages (body + self-canonical), admin login, 3 redirect rules (http/www/.html → canonical). 
🤖 4.4 If anything is wrong → **immediate rollback** (`06_Rollback_Plan.md`): revert the Cloudflare record to Lovable. Site is back in minutes.

✅ **Gate 4:** live domain serves prerendered pages with self-canonicals, admin works, redirects 301 correctly.

---

## Phase 5 — Post-launch (same night / next morning)
🧑 5.1 **Google Search Console:** submit `https://truficient.com/sitemap.xml`. Use **URL Inspection → Request indexing** on the homepage + 5 priority location pages.
🤖 5.2 Re-fetch 10 URLs raw; confirm self-canonical + body. Save to `migration-artifacts/postlaunch-verification.md`.
🤖 5.3 Confirm GA4/GTM still fire on the new host (the `GTM-TPHS4HT7` container).
🤖 5.4 Leave production branch merged to `main` only **after** the live site is confirmed good. Tag the release.
🧑 5.5 Monitor GSC Coverage + Performance over the next 1–3 weeks: expect "Alternate page w/ canonical" and soft-404 counts to fall and indexed unique pages to consolidate. Short-term ranking wobble is normal.

---

## Working rules for the agent
- Make **small, reviewable commits**; push to the branch for fresh previews.
- **Never** run a destructive git/host command (`push --force` to main, delete project, drop env) — flag for Eric instead.
- If a step needs a credential or an irreversible account action, **stop and hand it to Eric** with the exact values/clicks.
- After each phase, **report status against the gate** before proceeding.
- If blocked, prefer **hold** over a risky workaround — production safety beats the Sunday target.
