# Production Baseline — truficient.com (Lovable)

**Captured:** 2026-06-20 · **Branch:** `infra/vercel-ssg-migration` · **Phase 0 (Prep & safety)**

This is the pre-migration snapshot of production (still live on Lovable). It is the
reference we compare against after cutover. Nothing here touches production.

## Files
| File | What it is |
|---|---|
| `sitemap.xml` | Raw production sitemap (HTTP 200, 132 KB). |
| `sitemap-urls.txt` | The 683 `<loc>` URLs extracted from it. |
| `url-status-canonical.txt` | `curl` status + raw (no-JS) canonical + title for 10 representative URLs. |
| `body-presence-check.txt` | Proof the SPA shell serves no page-specific body at clean URLs. |
| `clean-build.log` | Full output of the clean `npm run build` (exit 0). |

## Sitemap facts
- **683 URLs total; 682 end in `.html`** (only the homepage is extensionless).
- This is the artifact of Lovable's flat-file prerender (`scripts/prerender.mjs` writes
  `dist/<path>.html`). It confirms the brief's root cause.

## The bug, captured (`url-status-canonical.txt`)
Every clean trailing-slash URL returns **HTTP 200 but serves the homepage SPA shell**:

| URL | canonical in raw HTML | title in raw HTML |
|---|---|---|
| `/hvac-garland-tx/` (1,503 impr) | `https://truficient.com/` ❌ | homepage title ❌ |
| `/hvac-richardson-tx/` | `https://truficient.com/` ❌ | homepage title ❌ |
| `/hvac-plano-tx/` | `https://truficient.com/` ❌ | homepage title ❌ |
| `/hvac-lakewood-dallas/` | `https://truficient.com/` ❌ | homepage title ❌ |
| `/equipment/trane/5ttv8x48a1000aa/` | `https://truficient.com/` ❌ | homepage title ❌ |
| `/blog/ashrae-…-requirements/` | `https://truficient.com/` ❌ | homepage title ❌ |

…while the legacy `.html` URLs return the **correct** head (own canonical, own title):

| URL | canonical | title |
|---|---|---|
| `/service-areas.html` | `…/service-areas.html` ✅ | "HVAC Service Areas Dallas TX" |
| `/about.html` | `…/about.html` ✅ | "About Truficient Energy Solutions" |
| `/contact.html` | `…/contact.html` ✅ | "Contact Us" |

This is exactly the "alternate page w/ proper canonical" + soft-404 mass the migration
fixes: clean URLs (the ones that earn impressions) collapse onto the homepage canonical.

`body-presence-check.txt`: a no-JS fetch of `/hvac-garland-tx/` contains the term
"Garland" **0 times** (and the blog post contains "ASHRAE" 0 times) — the body is the
empty SPA shell. Post-migration these must be > 0 (Brief §3.1).

## Build baseline (`clean-build.log`)
- `npm run build` → **exit 0** (vite build + `scripts/prerender.mjs`).
- vite: 5064 modules transformed, built in ~39s.
- prerender: sources `page_seo=717 blog=15 equipment=94 location=538 static=27`,
  **wrote 762 routes** (homepage skipped). Manifest written.
- Known non-blocking issues observed (pre-existing, not introduced by this branch):
  1. **`sharp`/`svgo` not installed** → `vite-plugin-image-optimizer` skips image
     optimization with warnings. Build still succeeds; images are copied unoptimized.
  2. **1 of 762 routes fails to write:** `/equipment/mitsubishi-electric/sez-kd18na4-<h>`
     — a malformed slug containing `<h>` (illegal filename chars). Data-quality issue in
     `page_seo`; non-fatal (build exits 0). Flag for cleanup, not a Phase-0 blocker.
  3. **Prerender runs twice per build** (`VITE_SUPABASE_URL=env` then `=fallback`) — the
     npm script runs it once; a vite plugin appears to run it again. Redundant, harmless.
     To be resolved when prerender is reworked in Phase 2.

## Performance / LCP
- Documented baseline (Brief §3.8): **mobile LCP ≈ 13.7s** on location pages; target < 2.5s.
- A fresh Lighthouse/PageSpeed run was **not** taken here (no headless Chrome/PSI key in
  this environment). Recommend capturing PSI for 3 location pages before cutover so the
  improvement is measured against a same-day number — see hand-off note in the report.

## Install note
`npm ci` failed: the committed `package-lock.json` is **stale / out of sync** with
`package.json` (this repo's authoritative lockfile is `bun.lock`; bun is not installed on
this machine). Used `npm install` to get a working tree — this regenerated
`package-lock.json` locally.

**Resolved (Eric, 2026-06-20):** use **bun**. The regenerated `package-lock.json` was
**discarded** (`git checkout --`) to avoid npm drift; `bun.lock` stays as source of truth.
Vercel install command will be `bun install`. (Note: a *stale* `package-lock.json` is still
committed — recommend removing it in a later commit so nothing falls back to npm.)
