# 04 — Accounts & Access (who touches what)

## Golden rules
- **Agents never receive passwords, API secrets, or the Supabase service-role key.** Credentialed actions happen in the service's own UI, performed by Eric.
- The **Supabase anon (publishable) key is already public** (it ships in the client bundle) — safe to use in Vercel env vars. The **service-role key is secret** and is **not needed** for the public site; never add it client-side or paste it anywhere near the agent.
- Put secrets in **Vercel's Environment Variables UI** and the local **`.env`** only — not in chat, not committed to git.

## Accounts involved
| Account | Purpose in this migration | Who acts | Notes |
|---|---|---|---|
| **GitHub** (`eco-eric/truficient`) | Source of truth; agent pushes the `infra/vercel-ssg-migration` branch; Vercel deploys from it | 🤖 agent (commits/pushes) · 🧑 Eric (authorize Claude Code on desktop) | Agent needs the desktop's git to be authenticated (see `05`). Do not force-push `main`. |
| **Vercel** | New host; preview/staging deploys; production domain; one-click rollback | 🧑 Eric (create/connect, env vars, add domain) · 🤖 agent (build config, triggers deploys via branch pushes) | Import repo, preset **Vite**, build `npm run build`, output `dist`. |
| **Cloudflare** | DNS for truficient.com; the final cutover; http→https + www→non-www | 🧑 Eric only | Low TTL = fast propagation + fast rollback. |
| **Domain registrar** | Where the domain is registered (may differ from Cloudflare DNS) | 🧑 Eric (confirm) | Only relevant if nameservers need checking; DNS itself is at Cloudflare. |
| **Supabase** | Backend the site + admin read from | 🧑 Eric (copy env values from dashboard/.env into Vercel) · 🤖 agent (reuses existing client code) | Anon key → Vercel env (Prod+Preview). Service-role key → **do not use here.** |
| **Lovable** | Current host — stays live as the rollback target until cutover succeeds | 🧑 Eric | Don't delete the Lovable project until the new site is confirmed stable for a few days. |
| **Google Search Console** | Submit new sitemap; request indexing; monitor | 🧑 Eric | Note the "Verify it's you" re-auth gate hit on June 20 — clear it before Phase 5. |
| **Google Analytics / GTM** (`GTM-TPHS4HT7`) | Confirm tracking still fires on Vercel | 🤖 agent verifies · 🧑 Eric if container edits needed | No expected change; just verify. |

## Environment variables to set in Vercel (Production + Preview)
Mirror the repo `.env` — the `VITE_`-prefixed names the app already uses:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- Any other `VITE_*` already present in `.env` (e.g. analytics IDs, maps/autocomplete keys). The agent will list the exact names found in the repo; **Eric pastes the values in Vercel's UI.**

Do **not** add: `SUPABASE_SERVICE_ROLE_KEY` or any secret server key — the public build doesn't use it. (Server-side **edge functions** do use the service-role key, but that's a Supabase-side secret you set in the Supabase dashboard, not a Vercel/client value — see `08_Database_and_AI_Migration.md` for the full secrets inventory and the AI-provider keys.)

## Pre-flight checklist for Eric (before Phase 1)
- [ ] Vercel account exists and is connected to the GitHub that owns `eco-eric/truficient`.
- [ ] You can log into Cloudflare and edit truficient.com DNS.
- [ ] You have the Supabase project's `VITE_SUPABASE_URL` + anon key handy (from the repo `.env` or Supabase dashboard → Project Settings → API).
- [ ] You can log into Lovable (rollback) and Google Search Console (re-auth cleared).
- [ ] Claude Code is installed and git-authenticated on the always-on desktop (`05_Desktop_ClaudeCode_Setup.md`).
