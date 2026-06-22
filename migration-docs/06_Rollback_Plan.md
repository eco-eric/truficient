# 06 — Rollback Plan (undo any step in minutes)

## Before you start (capture the escape hatch)
🧑 **Record the current Cloudflare DNS records for truficient.com** (screenshot the A/CNAME values pointing to Lovable) and save them in `migration-artifacts/dns-before.png`. This is what you restore to if cutover goes wrong. **Do this before Phase 4.**

## Rollback by phase
| Phase | If something's wrong | Rollback | Time |
|---|---|---|---|
| 0–3 (build/staging) | Anything | Nothing is live. Just stop; delete the preview / branch. **Production is still on Lovable, untouched.** | instant |
| 4 (cutover) — bad deploy on Vercel | Pages broken but DNS already moved | Vercel → Deployments → **Instant Rollback** to the last good deployment (or re-promote it) | ~1 min |
| 4 (cutover) — site wrong / want to abort entirely | DNS now points to Vercel | **Restore the Cloudflare DNS records** to the saved Lovable values (`dns-before.png`). Cloudflare low TTL = back in minutes | ~5–15 min |
| 5 (post-launch) — content/render issue found later | Live on Vercel | Fix on branch → new preview → verify → re-promote; or Instant Rollback to prior good deploy | minutes |

## Hard "abort the weekend" path
If at any point you're not comfortable: **do nothing to DNS.** Production stays exactly as it is today on Lovable. The branch + Vercel preview sit harmlessly until you resume. There is no decaying state and no penalty for waiting.

## What NOT to do during rollback
- Don't delete the Lovable project until the new site has been stable for several days.
- Don't delete the Vercel project on a panic — Instant Rollback is faster and reversible.
- Don't change content/URLs to "fix" a rendering bug — that risks SEO; roll back rendering instead and fix on the branch.

## Sanity checks after any rollback
- `curl -sI https://truficient.com/` returns 200 from the expected host.
- Homepage + admin login load.
- One location page loads.
