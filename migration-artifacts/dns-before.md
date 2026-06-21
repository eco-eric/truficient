# Cloudflare DNS — pre-cutover rollback record (truficient.com)

**Captured:** 2026-06-21 (by Eric, before Phase 4). Screenshot: `dns-before.png`.
**This is the restore target if cutover is aborted** (`06_Rollback_Plan.md`).

## Records the cutover WILL change (restore these to roll back to Lovable)
| Name | Type | Value | Proxy | TTL |
|---|---|---|---|---|
| `@` (truficient.com) | A | `185.158.133.1` | DNS-only (grey) | Auto |
| `www` | CNAME | `truficient.lovable.app` | DNS-only (grey) | Auto |

## SSL/TLS (Cloudflare)
- Encryption mode: **Full (strict)**
- Always Use HTTPS: **ON**
- HSTS: not enabled

## DO NOT TOUCH (other 25 records on the zone)
- Google **MX** records
- **Resend / Amazon SES** email records
- `_domainconnect` CNAME
- `go.truficient.com` → A `185.158.133.1` (DNS-only) — separate Lovable subdomain, leave as-is
- SPF / TXT records — Cloudflare flags a **duplicate-SPF conflict; pre-existing, leave it**

## To roll back (if needed during/after cutover)
Restore the two rows above exactly: root `@` A → `185.158.133.1`, `www` CNAME →
`truficient.lovable.app`, both DNS-only. Cloudflare low TTL → back on Lovable in minutes.
