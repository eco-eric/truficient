# Cutover DNS target (Vercel) — what Cloudflare will point to

**Captured:** 2026-06-21 (Step 3). Apply these in Step 4. Keep **Proxy: DNS-only (grey)**.

| Name | New type/value (Vercel recommended) | Proxy | Replaces (Lovable) |
|---|---|---|---|
| `@` (apex) | **CNAME → `4bdb5784222af98b.vercel-dns-016.com`** | DNS-only | A `185.158.133.1` |
| `www` | **CNAME → `4bdb5784222af98b.vercel-dns-016.com`** | DNS-only | CNAME `truficient.lovable.app` |

- Vercel now recommends a **CNAME at the apex** (IP-range expansion). Cloudflare **flattens
  root CNAMEs** to A records at resolution, and flattening works for DNS-only records — so a
  grey-cloud root CNAME is valid. (Legacy `A @ 76.76.21.21` / `CNAME www cname.vercel-dns.com`
  also work if flattening ever misbehaves.)
- No `_vercel` TXT verification record was required.
- **DNS-only (grey)** means Cloudflare doesn't proxy → Vercel serves its own SSL cert and
  handles **http→https** itself. Cloudflare's "Always Use HTTPS" / SSL mode only affect
  proxied traffic, so they're inert for these grey records (no change needed).

## www → non-www redirect
Vercel's domain redirect for `www` is currently **307 (temporary)**. www has real impressions
in GSC (http://www… 6138, https://www… 529), so we want a **permanent** redirect to firmly
consolidate it. Fix: set the www redirect to **308** in Vercel (or, fallback, a `vercel.json`
host-based 301). Do this BEFORE the DNS flip.
