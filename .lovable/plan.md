

## SEO & Performance Fixes — Plan

Most of the items in this audit are **already implemented** in the current codebase. Here's the status of each item and what still needs to be done:

### Already Done (No Changes Needed)

| # | Item | Status |
|---|------|--------|
| 2 | YouTube facade pattern | ✅ `YouTubeFacade.tsx` already loads iframe only on click |
| 4 | Favicon optimization | ✅ Already 5.5 KB PNG; WebP savings negligible at this size |
| 5 | Preconnect hints | ✅ `index.html` already has `supabase.co` and `i.ytimg.com`; no Google Fonts preconnect exists |
| 6 | Exclude admin from GA | ✅ GTM script in `index.html` already checks `!window.location.pathname.startsWith('/admin')` |

### Changes Needed

**1. Canonical tags — enhance `usePageSEO` hook**
The hook already sets canonicals when a `page_seo` record exists, but pages without a DB record get no canonical. Fix: add a fallback canonical using `https://www.truficient.com` + current path + trailing slash, applied on every page load regardless of DB data.

- Edit `src/hooks/usePageSEO.ts` to always inject/update a `<link rel="canonical">` with the normalized URL (`https://www.truficient.com${path.replace(/\/$/, '')}/`), even when no `page_seo` row is found.

**3. Responsive images — resize oversized assets**
Three images are larger than their display size. Resize them at build-asset level using `cwebp`:

| Image | Current | Target | Display |
|-------|---------|--------|---------|
| `ducted-air-handler.webp` | 1000×625 (85 KB) | 700×438 | 662×448 |
| `ductless-services.webp` | 1013×633 (51 KB) | 800×500 | 784×413 |
| `truficient-logo.webp` | 911×463 (11 KB) | Already handled via `truficient-logo-sm.webp` (1.6 KB) |

- Resize the two service images using `cwebp`/`imagemagick` and overwrite the existing files.
- Add explicit `width`/`height` attributes to their `<img>` tags in `EstimatorCards.tsx`.

**5. Preconnect hints — minor adjustment**
Add `youtube-nocookie.com` preconnect (currently missing; `i.ytimg.com` is already present). The `i.ytimg.com` preconnect is actually useful since the facade thumbnail loads from it, so keep it.

- Add `<link rel="preconnect" href="https://www.youtube-nocookie.com" crossorigin />` to `index.html`.

### Files to modify
- `src/hooks/usePageSEO.ts` — fallback canonical logic
- `src/assets/ducted-air-handler.webp` — resize to 700px wide
- `src/assets/ductless-services.webp` — resize to 800px wide
- `src/components/home/EstimatorCards.tsx` — add width/height to img tags
- `index.html` — add youtube-nocookie.com preconnect

