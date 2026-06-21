# LCP Investigation — Location Pages (Vercel preview)

**Date:** 2026-06-21 · **Pages:** `/hvac-{garland,richardson,plano}-tx/`
PSI mobile (preview vs Eric's same-day baseline): LCP 7.5/7.5/5.9 s (was 8.6/8.5/9.7);
FCP 5.6/4.8/3.2 s (was 3.3/3.3/3.3).

## 1. What is the LCP element?
**The hero `<h1>` text** — e.g. `HVAC Service for Garland, Texas` — inside
`<section class="bg-primary text-primary-foreground py-16">`. It's **text on a solid
color background**. There is **no hero image** (`background-image`: 0 occurrences). The
only above-the-fold image is the inline base64 logo (110×56). Gallery/content images are
remote (Supabase image CDN, `?width=&quality=75` + srcset 400/800/1200, `loading="lazy"`,
below the fold) and local `/assets/*.webp` service cards are also below-fold + lazy.

## 2. Is unoptimized images / `sharp` the bottleneck? **No.**
- The LCP element is **text**, so image optimization cannot move it. Hero is solid color.
- Content images are already CDN-resized + lazy; local images are below-the-fold + lazy.
- All `<img>` already carry `width`/`height` (no CLS from missing dimensions); the logo
  is `fetchpriority="high"`. A hero-image preload/priority is **N/A** (no hero image).
- Infra is fast, not the cause: HTML **TTFB ≈ 0.16 s, `X-Vercel-Cache: HIT`**; CSS bundle
  25.7 KB gzip; JS 59.6 KB. None of this explains a 6–7 s LCP.

**The real bottleneck — hydration discards the prerendered hero:**
`LocationPage` (and `BlogPost`, `EquipmentDetail`) initialize `data = null, loading = true`
and **fetch their data client-side in a `useEffect`**, rendering only a `<Loader2>` spinner
while `loading` (LocationPage L107-109/276, BlogPost L63-64/203, EquipmentDetail L294).
On the client, React's **first hydration render is the spinner**, which **mismatches the
prerendered hero HTML → React throws away the static content and client-renders from
scratch**, then the hero re-paints only **after** the client Supabase fetch finishes
(~5-7 s under Lighthouse's Slow-4G + 4× CPU throttle). So:
- Crawlers/SEO still get the body (raw HTML is correct — verified). ✅
- But **LCP re-times to the client fetch**, which is why SSG only *modestly* improved it.

## 3. FCP "regression": preview artifact or real?
**Mostly real (the content flash), not cold cache.** TTFB is 0.16 s with `X-Vercel-Cache:
HIT` — the CDN is warm, so it is **not** a preview cold-cache/TTFB effect. The FCP churn
comes from the prerendered content painting, then being **replaced by the spinner** during
hydration, then re-appearing. Single-run PSI variance explains the inconsistency (plano FCP
was flat at 3.2 s while its LCP improved a lot; the other two rose). It would behave the
same on production until the hydration fix lands. The fix below removes the flash.

## Recommended fix (public routes only; no backend/admin)
**Make the data-driven public pages hydration-stable so the prerendered content survives.**
At snapshot time, embed each page's fetched data into the HTML (e.g. a
`<script type="application/json">` block), and have `LocationPage`/`BlogPost`/
`EquipmentDetail` initialize their state from it **synchronously** (so the first client
render === the prerendered HTML: `loading=false`, data present). Result: no hydration
mismatch, no re-fetch flash → **LCP = the static paint (~2-2.5 s)** and the FCP flash is
gone. Scope: the prerender + a small shared hook + those 3 components. Effort: moderate;
risk: low–medium, contained to public pages.

**Separately (cheap, low value for location LCP):** add `sharp` + `svgo` devDeps so
`ViteImageOptimizer` actually runs (it has been skipped the whole time). This shrinks total
image weight and helps page types whose hero *is* a local image (homepage/service pages),
but will **not** move location-page LCP (text LCP).

## Go/No-Go framing
The **primary migration goal** (crawlable bodies + self-canonical + URL consolidation —
fixing the 982 unindexed pages) is fully achieved and independent of this. Per Brief §3.8
("target <2.5 s; **any large improvement is acceptable for go-live**"), LCP 5.9-7.5 s vs the
13.7 s baseline is a large improvement — so this is **not a hard NO-GO**. But the hydration
fix is high-value (LCP to ~target + removes a visible content flash) and contained;
recommend applying it on the branch before cutover.
