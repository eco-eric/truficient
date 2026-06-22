# 07 — Weekend Schedule (target: live Sunday night, gated)
Today is **Saturday, June 20, 2026.** This is a plan with decision gates, not a countdown. If a gate fails, you **hold** — production stays on Lovable and you lose nothing.

## Saturday
| Block | What | Who | Gate |
|---|---|---|---|
| Sat AM | Desktop setup: Claude Code installed, git authenticated, repo cloned, briefs reachable (`05`). Eric confirms Vercel/Cloudflare/Supabase access (`04` pre-flight). | 🧑 + 🤖 | — |
| Sat midday | **Phase 0** clean build + baseline. **Phase 1** Eric connects repo to Vercel, sets env vars; agent ships first preview; smoke-test incl. admin login on `*.vercel.app`. | 🤖 + 🧑 | ✅ Gate 0, Gate 1 |
| Sat PM | **Phase 2** implement full-body SSG prerender (Playwright snapshot) + `vercel.json` (trailingSlash, redirects, SPA fallback for admin/app) + sitemap. Push → staging. | 🤖 | ✅ Gate 2 |
| Sat eve | Begin **Phase 3** verification on staging: body-present, self-canonical, redirects. Fix issues. | 🤖 | progress |

## Sunday
| Block | What | Who | Gate |
|---|---|---|---|
| Sun AM | Finish **Phase 3**: full acceptance suite incl. the **admin smoke test** (the critical one) + LCP. Eric eyeballs staging. | 🤖 + 🧑 | ✅ **Gate 3 = GO/NO-GO** |
| Sun PM | If GO: **Phase 4 cutover** — Eric adds domain in Vercel, records current Cloudflare DNS, points DNS to Vercel, sets www→non-www + Always-HTTPS. Agent verifies live. | 🧑 + 🤖 | ✅ Gate 4 |
| Sun eve | **Phase 5**: submit sitemap in GSC, request indexing on homepage + 5 priority pages, confirm GA4/GTM, save post-launch verification, tag release. | 🧑 + 🤖 | live ✅ |

## The Sunday-night decision
At the Sunday PM gate, ask one question: **did every Gate 3 check pass, including admin?**
- **Yes →** cut over. You're live Sunday night.
- **No →** **hold.** Production keeps running on Lovable exactly as today. Resume Monday. This is a perfectly good outcome — the only bad outcome is cutting over on a failed gate.

## Realistic-expectations note
This is achievable in a weekend because the app already works, the admin is staying as-is, and the route data already loads from Supabase. The likeliest time sinks are (a) hydration quirks from the snapshot step — there's a documented fallback so they don't block go-live, and (b) the Supabase env wiring on Vercel — front-load that in Phase 1. After go-live, ranking improvements appear over **1–3+ weeks** as Google recrawls; the cutover itself is the milestone for Sunday, not the ranking jump.

## After the weekend (separate, not blocking)
Two separate fast-follow workstreams (do **not** cram into this weekend):
1. **Lovable independence** (`08_Database_and_AI_Migration.md`): **DEFERRED — not happening now.** Confirmed Lovable-managed Supabase, and Eric is keeping Lovable (paid annually), so the backend stays put and keeps working. This whole workstream is reference-only unless Eric later decides to leave Lovable.
2. **Internal-linking coverage** (hub link distribution, expanded footer/related-links) — now easy because clean URLs render real HTML.
