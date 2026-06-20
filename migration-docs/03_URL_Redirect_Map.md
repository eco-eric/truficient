# 03 — URL Redirect Map & Preservation Guarantee
**This is the safety backbone. No URL that earns impressions today may 404 after cutover.**

## Canonical rule
Every page has exactly one canonical address: **`https://` (secure) · non-`www` · clean path · trailing slash**.
Example canonical: `https://truficient.com/hvac-garland-tx/`

Chosen because it (a) keeps your highest-impression pages exactly where they are, and (b) matches the URL form your internal links already use. Verified against all 876 URLs in GSC: every one maps to a surviving canonical via the four rules below — **zero impression-earning pages are orphaned.**

## The four redirect rules (301, permanent)
| # | From | To | Where it's enforced |
|---|---|---|---|
| 1 | `http://…` | `https://…` | Cloudflare "Always Use HTTPS" |
| 2 | `www.truficient.com/…` | `truficient.com/…` | Cloudflare redirect rule (or Vercel domain redirect) |
| 3 | `/path.html` | `/path/` | `vercel.json` redirects |
| 4 | `/path` (no slash) | `/path/` | `vercel.json` `"trailingSlash": true` |

Rules stack: `http://www.truficient.com/foo.html` → `https://truficient.com/foo/` in one resolved 301 chain (keep chains ≤1–2 hops; Vercel collapses these).

## Verification sample (top URLs by current impressions → surviving target)
Every row maps to a live page. "(already canonical)" = no redirect needed; the rest 301 to the target.

| Current URL (GSC) | Maps to | Impr | Rule |
|---|---|---|---|
| http://www.truficient.com/ | https://truficient.com/ | 6138 | http+www |
| /hvac-garland-tx/ | /hvac-garland-tx/ | 1503 | already canonical |
| https://truficient.com/ | https://truficient.com/ | 1434 | already canonical |
| /hvac-richardson-tx/ | /hvac-richardson-tx/ | 817 | already canonical |
| /hvac-plano-tx/ | /hvac-plano-tx/ | 706 | already canonical |
| /blog/ashrae-texas-code-dfw-humidity-requirements | …/ | 655 | trailing slash |
| /hvac-lakewood-dallas/ | /hvac-lakewood-dallas/ | 549 | already canonical |
| https://www.truficient.com/ | https://truficient.com/ | 529 | www |
| /hvac-highland-park-university-park-dallas/ | (same) | 523 | already canonical |
| /blog/dallas-urban-heat-island-effect-energy-hvac | …/ | 483 | trailing slash |
| /ac-repair-preston-hollow-dallas/ | (same) | 365 | already canonical |
| /ac-repair-preston-hollow-dallas.html | /ac-repair-preston-hollow-dallas/ | 360 | .html |
| /blog/why-dfw-humidity-is-rising.html | /blog/why-dfw-humidity-is-rising/ | 297 | .html |
| /about | /about/ | 296 | trailing slash |
| /bosch-mini-split-preston-hollow-dallas.html | …/ | 142 | .html |
| /equipment/trane/5ttv8x48a1000aa (www) | https://truficient.com/equipment/trane/5ttv8x48a1000aa/ | 166 | www+slash |
| /contact.html | /contact/ | 101 | .html |

**Coverage:** of 876 distinct GSC URLs, 251 are already canonical; the remaining 625 are covered by rules 1–4. The 92 "Not found (404)" and 83 "soft 404" from GSC Coverage are resolved by SSG (real pages now exist at the clean URL) plus the rules.

## Reproduce the full per-URL map (agent)
Run against `Pages.csv` (in `../Truficient Website Revamp/` GSC exports) to emit the complete CSV the redirect tests draw from:
```python
import csv
def canon(path):
    p = path[:-5] if path.endswith('.html') else path
    p = p.rstrip('/')
    return '/' if p=='' else p+'/'
def target(u):
    p = u.split('://',1)[-1].replace('www.','',1)
    path = p.split('truficient.com',1)[-1]
    return 'https://truficient.com'+canon(path)
for r in csv.DictReader(open('Pages.csv')):
    u=r['Top pages'].strip()
    print(u, '->', target(u))
```
Use this list in Phase 3.3 / 3.5 to confirm every URL returns 200 (canonical) or 301 (to canonical) — and **none returns the homepage**.

## Post-cutover GSC
- Submit the new sitemap (canonical URLs only).
- Expect "Alternate page with proper canonical tag" (444) and "Soft 404" (83) to decline as Google recrawls and the duplicates collapse onto one URL each.
- Don't re-add `.html` URLs to the sitemap; they exist only as 301 sources now.
