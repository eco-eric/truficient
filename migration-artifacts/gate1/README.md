# Gate 1 — Staging parity check (Vercel)

**Target:** `https://truficient.vercel.app` · **Date:** 2026-06-20 · **Phase 1**
**Method:** `gate1-check.mjs` (Playwright, mobile viewport) + `curl`. Non-auth only.

## Verdict: app runs on Vercel ✅ — admin-login sub-check blocked on Phase-2 SPA fallback ⚠️

### PASS — the raw app works on Vercel
| Check | Result |
|---|---|
| Homepage HTTP | **200**, `Server: Vercel` |
| React mounts | `#root` has 4 children; H1 = "Your Comfort, Done Right."; ~1,855 chars body text |
| Title | correct ("Truficient Energy Solutions \| HVAC Services…") |
| Client-side navigation | clicked `/contact` → URL changed, page **re-rendered** (React Router runs) |
| Supabase data layer | **3× HTTP 200** (`rpc/get_public_tracking_settings`, `social_links`, `page_seo`) — backend reachable from Vercel |
| Env vars inlined | Supabase URL present in the JS bundle → Vercel Prod+Preview env took effect |

Screenshots: `home-mobile.png` (rendered homepage), `admin-login-deeplink.png`.

### EXPECTED GAP — no `vercel.json` yet, so server-side routing isn't configured
Direct (server) requests to deep links all return Vercel's default **404**:

| Direct URL | Result | Why |
|---|---|---|
| `/admin/login` | 404 | No SPA-fallback rewrite yet → can't boot admin via direct URL |
| `/hvac-garland-tx/` | 404 | No `cleanUrls`/`trailingSlash`; current build emits flat `dist/<path>.html` |
| `/this-should-404-xyz/` | 404 | (this one *should* 404 — desired end-state) |

This is **exactly what Phase 2's `vercel.json` fixes** (2.1: `trailingSlash`, `.html`→`/`
redirects, SPA fallback for `/admin/*` + app routes, real 404). Until then, Vercel does no
SPA fallback, so admin login can't be reached by direct URL on staging.

### Note on the "13 failed requests" in the raw log
Test-sequence artifacts, **not** homepage failures: they are in-flight chunk/analytics/
`button_clicks` requests **aborted** because the script navigated away during the deep-link
probes, plus the three deep-link 404s. The homepage itself loaded clean (Supabase calls 200).

## Implication / recommendation
The core of Gate 1 — "staging serves the working app" — **passes**: the Vite app + the
Supabase data layer both run on Vercel with the env vars applied. The "incl. admin login"
clause genuinely **requires the SPA-fallback rewrite**, which is Phase 2.1 work. Recommend
proceeding to Phase 2 (add `vercel.json`), then verifying admin login on staging — the full
admin smoke test is formally Gate 3.4 regardless.
