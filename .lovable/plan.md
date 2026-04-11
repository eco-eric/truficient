

# Dynamic Gallery Integration for Location Pages

## Summary
Implement the structured photo tagging system from the specification document so that each of the 215+ neighborhood/service-area pages automatically displays matching real job photos with a multi-level fallback chain. No manual photo assignment per page.

## What Changes

### 1. Database: Structured Tag Taxonomy
Add a `tag_type` column to `gallery_tags` to categorize tags into the 6 types from the spec:

```sql
ALTER TABLE gallery_tags ADD COLUMN tag_type TEXT;
-- tag_type values: geography, zip, city, service, system, property
```

Update existing tags with their correct type (e.g. "Mitsubishi" → system, "Ductless" → system, "Residential" → property, etc.) and seed any missing tags from the spec's taxonomy.

### 2. Database: Location Page Gallery Metadata
Add query-driving fields to `seo_location_pages`:

```sql
ALTER TABLE seo_location_pages
  ADD COLUMN geography_tag TEXT,
  ADD COLUMN zip_tag TEXT,
  ADD COLUMN city_tag TEXT DEFAULT 'dallas',
  ADD COLUMN service_tags TEXT[],
  ADD COLUMN property_tags TEXT[],
  ADD COLUMN gallery_heading TEXT;
```

These fields tell the gallery component which tags to query for each page.

### 3. Database: Photo Approval & Legacy Support
Add fields to `gallery_images` for the approval workflow and legacy migration:

```sql
ALTER TABLE gallery_images
  ADD COLUMN approved_for_website BOOLEAN DEFAULT false,
  ADD COLUMN is_legacy BOOLEAN DEFAULT false,
  ADD COLUMN photo_date DATE;
```

Existing approved photos (`is_active = true`) get `is_legacy = true` and `approved_for_website = true` so they remain visible. New uploads require all tags before approval.

### 4. New Component: `LocationGallery.tsx`
A reusable gallery section component that:
- Accepts the page's tag metadata (geography, zip, service, etc.)
- Runs the **fallback chain** server-side via a single query:
  1. Exact geography + service match
  2. City + service match
  3. Service match only
  4. Any approved Truficient photos (branded fallback)
- Shows max 9 photos in a 3x3 grid (6 on mobile)
- Sorted by most recent `photo_date`
- Each photo opens in the existing `MediaLightbox`
- Dynamic heading: "Our Work in [Neighborhood Name]"
- Injects `ImageObject` schema into the page's JSON-LD

### 5. Update `LocationPage.tsx`
- Import and render `LocationGallery` between the content and `ToolLinksSection`
- Pass the location's gallery metadata fields to the component
- Update the `ToolLinksSection` gallery link to scroll to the on-page gallery section instead of linking to `/gallery/`

### 6. Update Admin: LocationPageBuilder
- Add the 6 new gallery metadata fields (geography_tag, zip_tag, city_tag, service_tags, property_tags, gallery_heading) to the builder form
- Geography and ZIP dropdowns pull from `gallery_tags` filtered by `tag_type`
- Auto-populate `gallery_heading` as "Our Work in [Neighborhood]"

### 7. Update Admin: Gallery Upload Form
- Restructure tag selection in the image upload dialog to show tags grouped by `tag_type`
- Add `photo_date` date picker
- Add `approved_for_website` toggle (disabled until all 5 required tag types are selected for non-legacy photos)
- Auto-generate alt text from tags: "{system} {service} in {neighborhood}, {city} {zip}"
- Add "Needs Tags" filter view and bulk tag-apply for legacy photos

## Files Changed

| File | Change |
|---|---|
| 1 migration | `tag_type` on gallery_tags, gallery metadata on seo_location_pages, approval fields on gallery_images |
| `src/components/gallery/LocationGallery.tsx` | New — dynamic gallery section with fallback chain |
| `src/pages/service-areas/LocationPage.tsx` | Add LocationGallery section + ImageObject schema |
| `src/pages/admin/LocationPageBuilder.tsx` | Add gallery metadata fields to form |
| `src/pages/admin/Gallery.tsx` | Restructure tag UI by type, add approval toggle, date picker, alt-text auto-gen, "Needs Tags" filter, bulk tag-apply |

## Privacy
- No customer PII in tags — geography, city, ZIP, service type, system type, and property type only
- Alt text uses tag-derived text, never customer names or addresses

