

## Plan: Gallery Overlay on Landing Page

### Approach
Add a "View Full Gallery" button below the existing 6 static photos in the gallery section. Clicking it opens a full-screen overlay/drawer that fetches all active images from the `gallery_images` database table — the same data source used by the main `/gallery` page. The overlay stays on the landing page (no navigation away), keeping visitors in the conversion funnel.

### Implementation Steps

1. **Create a `GalleryOverlay` component** (`src/components/landing/GalleryOverlay.tsx`)
   - Full-screen fixed overlay with dark backdrop, close button, and scrollable grid of images
   - Uses `useQuery` to fetch from `gallery_images` where `is_active = true`, ordered by `sort_order`
   - Includes a loading spinner while fetching
   - Clicking a thumbnail opens the existing `MediaLightbox` component for full-size view
   - Styled with the landing page navy/orange branding (inline styles or scoped CSS)
   - Animates in/out with framer-motion

2. **Add "View Full Gallery" button to the gallery section** of `SmartGroupMarchGoogleLanding.tsx`
   - Placed below the existing 6-photo grid
   - Opens the overlay on click
   - Styled as a secondary/outline button matching the landing page design

### Technical Details
- Query: `supabase.from('gallery_images').select('id, title, image_url, thumbnail_url, media_type, alt_text').eq('is_active', true).order('sort_order').order('created_at', { ascending: false })`
- Data only loads when overlay opens (lazy fetch via `enabled` flag)
- Reuses the existing `MediaLightbox` for individual image/video viewing
- No new database tables or migrations needed

