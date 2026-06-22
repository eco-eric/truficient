# Post-launch verification — truficient.com LIVE on Vercel

**Captured:** 2026-06-21 · **Phase 5.2 / 5.3** · Live domain (production now on Vercel).

## 5.2 — Raw (no-JS) fetch of 10 live URLs
| URL | HTTP | body | canonical |
|---|---|---|---|
| `/` | 200 | shell¹ | `https://truficient.com/` |
| `/hvac-garland-tx/` | 200 | full | `…/hvac-garland-tx/` |
| `/hvac-richardson-tx/` | 200 | full | `…/hvac-richardson-tx/` |
| `/hvac-plano-tx/` | 200 | full | `…/hvac-plano-tx/` |
| `/equipment/trane/5ttv8x48a1000aa/` | 200 | full | `…/equipment/trane/5ttv8x48a1000aa/` |
| `/blog/ashrae-texas-code-dfw-humidity-requirements/` | 200 | full | `…/blog/ashrae-…/` |
| `/service-areas/` | 200² | full | `…/service-areas/` |
| `/about/` | 200 | full | `…/about/` |
| `/contact/` | 200 | full | `…/contact/` |
| `/equipment/trane/` | 200 | full | `…/equipment/trane/` |

¹ Homepage is intentionally the clean SPA-fallback shell (decided in Phase 2).
² First attempt returned curl `000` (transient connection blip); 3/3 retries = 200, full body.
All non-homepage URLs serve prerendered body and self-reference their own clean URL.

## 5.3 — GA4 / GTM (`GTM-TPHS4HT7`) on the new host
| Page | Tags fired | dataLayer |
|---|---|---|
| `/` | gtag, gtm.js, **GTM-TPHS4HT7**, GA4 collect | 10 |
| `/hvac-garland-tx/` | gtag, gtm.js, **GTM-TPHS4HT7**, GA4 collect | 10 |
| `/admin/login/` | **none** (correctly excluded) | n/a |

Tracking is intact on Vercel and still correctly suppressed on `/admin/*`.

## Cutover summary
- DNS: apex `A 76.76.21.21`, `www` CNAME → vercel-dns (both DNS-only). www→apex 308,
  http→https 308, `.html`→`/` 301, unknown→404, admin route serves.
- Build on Vercel: full-body SSG via `@sparticuz/chromium` (`body_snapshot:true`, 746
  content routes, 0 empty). Hydration seed → location LCP ~2.4–2.7 s.
- Rollback target preserved in `dns-before.md`.
