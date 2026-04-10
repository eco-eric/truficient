

# WorkEdge Media → Gallery Browser

## Summary
Add a "WorkEdge" tab to the admin Gallery page that lets you browse all synced WorkEdge media, search/filter it, and import selected items directly into the public gallery with auto-generated tags (city, ZIP, job type only — no customer PII).

## Privacy Approach
- Auto-tags will use **city**, **ZIP code**, and **job type** only (e.g. "Fort Worth", "76116", "AC Replacement")
- Customer names, addresses, and company names are **excluded** from tags and metadata
- Job titles that contain addresses (e.g. "Remodel - 6224 Curzon") will NOT be carried into gallery titles — you'll set titles manually or they default to the media type + date

## Database Changes

**1. Add source tracking to `gallery_images`** (migration):
```sql
ALTER TABLE gallery_images 
  ADD COLUMN source TEXT DEFAULT 'manual',
  ADD COLUMN source_id TEXT;
CREATE UNIQUE INDEX idx_gallery_source ON gallery_images(source, source_id) WHERE source IS NOT NULL AND source_id IS NOT NULL;
```
This prevents duplicate imports and tracks origin.

## New Component: `WorkEdgeMediaBrowser.tsx`

A new component rendered as a tab in the Gallery admin page with:

- **Grid view** of all `workedge_project_media` records (photos/videos), joined with `crm_jobs` and `crm_locations` for city/ZIP context
- **Search bar** filtering by job number, city, ZIP, or media type
- **Media type filter** (photos, videos, all)
- **Multi-select** with checkboxes for batch import
- **"Import to Gallery" button** that:
  1. Copies files from `workedge-media` bucket to `gallery-images` bucket
  2. Creates `gallery_images` records with `source = 'workedge'` and `source_id` = workedge media ID
  3. Auto-creates/matches `gallery_tags` for the city and ZIP (if available)
  4. Links tags via `gallery_image_tags`
  5. Skips already-imported items (checked via `source_id`)

## Gallery Page Update

- Add a "WorkEdge" tab alongside existing "Images" and "Tags" tabs
- Tab shows the `WorkEdgeMediaBrowser` component
- Include a "Sync All Projects" button that triggers the existing `workedge-sync` edge function to refresh media from WorkEdge before browsing

## Files Changed

| File | Change |
|---|---|
| `src/components/admin/WorkEdgeMediaBrowser.tsx` | New — browse/search/import component |
| `src/pages/admin/Gallery.tsx` | Add "WorkEdge" tab |
| 1 migration | Add `source` + `source_id` columns to `gallery_images` |

