# 10 — Claude Code Launch Prompts & Getting Started
Copy-paste prompts to run the migration with Claude Code, phase by phase. Drive it **one phase at a time** and approve each gate.

---

## A. Get Claude Code running (one-time, ~10 min)
Open a terminal (PowerShell) and run:
```
node -v        # need v20+. If missing: install Node LTS from nodejs.org
npm install -g @anthropic-ai/claude-code
claude         # launches; sign in when prompted, then type /exit for now
```
Authenticate git so the agent can push:
```
git --version  # if missing, install Git for Windows
git clone https://github.com/eco-eric/truficient.git C:\dev\truficient
```
If the clone asks for credentials, install GitHub CLI and run `gh auth login` (choose HTTPS), then retry the clone.

Make the plan available to the agent — copy these migration docs into the repo:
```
mkdir C:\dev\truficient\migration-docs
copy "C:\Users\eric\OneDrive\Documents\Claude\Projects\Truficient Infrastructure Migration\*.md" C:\dev\truficient\migration-docs\
```
Start Claude Code **inside the repo**:
```
cd C:\dev\truficient
claude
```
Keep the desktop awake (Settings → System → Power → Screen & sleep → "Never" while plugged in). Run Claude Code in its normal **approve-each-step** mode for this work.

---

## B. Phase 0 launch prompt (paste this first)
```
You are executing a production infrastructure migration for truficient.com. Read these files in the repo before doing anything: migration-docs/01_Migration_Brief.md, migration-docs/02_ClaudeCode_Agent_Runbook.md, migration-docs/03_URL_Redirect_Map.md, and migration-docs/06_Rollback_Plan.md.

Hard rules you must follow for the entire migration:
- NEVER commit to `main`. Work only on a branch named infra/vercel-ssg-migration.
- NEVER touch the backend: do not modify, deploy, or migrate the Supabase database, the edge functions, or anything AI. The backend stays Lovable-managed and unchanged. (See migration-docs/08 — it is DEFERRED/reference-only.)
- Do NOT perform any step marked 🧑 (these need Eric's credentials or are irreversible: Vercel connect, env vars, Cloudflare DNS, GSC). When you reach one, STOP and give me the exact values/clicks, then wait.
- Production stays live on Lovable until we deliberately cut over. All work happens on a branch + Vercel preview (staging).
- Stop at every ✅ gate, report results against it, and wait for my approval before the next phase.
- Never paste or print secrets/API keys. Never run destructive commands (force-push, rm -rf, delete project).

Now execute Phase 0 only (Prep & safety) from the runbook: create the branch, do a clean install and build, and capture the production baseline into migration-artifacts/baseline/. Then STOP and report against Gate 0. List anything you need from me.
```

---

## C. Advance prompts (paste one per phase, after the prior gate passes)

**Phase 1 — stand up Vercel (parity check):**
```
Gate 0 is approved. Proceed to Phase 1 from migration-docs/02. Tell me exactly what to do on my side for the 🧑 steps: the Vercel project import settings (framework, build command, output dir) and the exact list of environment variable NAMES to set (values I'll paste in Vercel myself — never here). After I confirm I've done them and you've triggered the preview deploy, smoke-test the staging *.vercel.app (homepage, navigation, admin login, open an estimate) and report against Gate 1.
```

**Phase 2 — implement full-body prerender + routing config:**
```
Gate 1 is approved. Proceed to Phase 2: add vercel.json (trailingSlash:true, the 301 redirects from migration-docs/03, SPA fallback for /admin/* and app-only routes, real 404s), upgrade prerendering to full-body for PUBLIC routes only (recommended: Playwright snapshot reusing the existing Supabase route-list in scripts/prerender.mjs), exclude /admin/* and app routes, update the sitemap to canonical clean URLs, and wire hydration. Do NOT change any backend/edge-function/AI code. Commit to the branch, push for a fresh preview, and report against Gate 2.
```

**Phase 3 — verify on staging (the big gate):**
```
Gate 2 is approved. Run the full Phase 3 verification against the staging URL and write results to migration-artifacts/staging-verification.md: (1) body HTML present via no-JS fetch on a location/equipment/blog page, (2) self-canonical (never /) on 10 public URLs, (3) redirects 301 correctly (.html, no-slash; http/www once domain is on), (4) the ADMIN smoke test — login, create a location page in /admin/seo, open & edit an estimate, inbox + SEO dashboard load, (5) no orphaned 404s on 20 sampled URLs from migration-docs/03, (6) LCP on 3 location pages vs the 13.7s baseline. Report each as PASS/FAIL against Gate 3. Do not cut over. If anything fails, stop and tell me.
```

**Phase 4 — cutover (only after I confirm Gate 3 = GO):**
```
I confirm Gate 3 = GO. Walk me through Phase 4 cutover step by step. These are MY actions — give me exact instructions and pause between each: (a) add truficient.com + www in Vercel and show me the DNS target, (b) remind me to screenshot/save the current Cloudflare DNS records first (rollback escape hatch), (c) the exact Cloudflare changes (point records to Vercel, www→non-www, Always-HTTPS). After DNS resolves, verify the live domain (5 location pages: body + self-canonical; admin login; 3 redirect rules) and report against Gate 4. If anything is wrong, give me the one-line rollback from migration-docs/06.
```

**Phase 5 — post-launch:**
```
Gate 4 is approved and the live site looks good. Do Phase 5: confirm GA4/GTM fire on the new host, re-fetch 10 URLs to confirm self-canonical + body, save migration-artifacts/postlaunch-verification.md, and give me the exact GSC steps (submit sitemap, request indexing on the homepage + 5 priority pages — I'll do those myself). Then tell me when it's safe to merge the branch to main and tag the release.
```

---

## D. How to drive it (your role)
- Paste **one** prompt, let the agent work, read its **gate report**, then either approve (paste the next prompt) or have it fix issues.
- When the agent says **🧑 STOP**, that's your cue to do the Vercel/Cloudflare/GSC action it describes. Take your time.
- You are never more than one step from safe: through Gate 3, production is still 100% on Lovable. After cutover, rollback is reverting the Cloudflare DNS record (you saved it).
- If anything feels off at the Sunday gate, it's fine to **hold** — production keeps running and we finish later.

## E. During-execution quick reference
| Gate | Means | If it fails |
|---|---|---|
| 0 | clean build + baseline | fix build/env, retry |
| 1 | app runs on Vercel staging incl. admin login | fix hosting/env before rendering work |
| 2 | branch builds; staging redeploys | fix build errors |
| 3 | **GO/NO-GO** — body+canonical+redirects+**admin**+LCP all pass | do not cut over; fix or HOLD |
| 4 | live domain serves prerendered pages, admin works, redirects 301 | **rollback:** restore Cloudflare DNS to saved Lovable values |

**Rollback one-liner:** in Cloudflare, set the DNS record(s) back to the saved Lovable target. Low TTL = back in minutes. Bad Vercel deploy = Vercel → Deployments → Instant Rollback.
