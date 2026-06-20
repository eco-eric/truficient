## Daily-rotating featured gallery photos

Admins can mark unlimited gallery photos as "Featured". The public Gallery page and homepage preview show **8 featured photos**, rotated daily (same 8 all day, new set tomorrow).

### How rotation works

- All photos with `is_featured = true` form the "featured pool".
- Each day, a deterministic 8-photo window is picked from the pool based on the current date (day-of-year). The window slides forward by 8 each day, wrapping around when it reaches the end.
- Pool ≤ 8 → same photos show every day (no rotation needed).
- Pool > 8 → fresh 8 each day, cycling through the whole pool over time.
- Deterministic by date means every visitor sees the same 8 on a given day (cache-friendly, SEO-friendly, no flicker).

### Changes

**`src/pages/Gallery.tsx`**
- Replace the current `.order('is_featured', ...)` sort with a two-query approach:
  1. Fetch today's 8 rotating featured IDs (see helper below).
  2. In the infinite query, sort those IDs to the top, then the rest by existing rules.

**`src/components/home/GalleryPreview.tsx`** (homepage preview)
- Pull from the same daily-rotation helper so the homepage and `/gallery` stay in sync.

**`src/lib/galleryRotation.ts`** (new)
- Export `getTodaysFeaturedIds(featuredIds: string[], count = 8): string[]`
- Uses CST day-of-year (per project timezone rule) to pick the window: `start = (dayOfYear * count) % pool.length`, then slice with wrap-around.

**Admin (`src/pages/admin/Gallery.tsx` or wherever the featured toggle lives)**
- Keep the current toggle exactly as-is (no lock, no cap).
- Add a small helper text near the toggle: *"Featured photos rotate daily — 8 shown per day."*
- Show a featured count badge somewhere on the page header: *"12 featured · 8 shown today"*.

### Notes

- No DB schema change — `is_featured` boolean stays as the source of truth.
- No cron job needed — rotation is computed client-side from the date, so it "just works" at midnight CST without any backend trigger.
- Public gallery still shows the full library below the featured 8 (existing infinite scroll unchanged).
