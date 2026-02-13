

## Fix: WorkEdge Photo Thumbnails Not Loading (Expired Signed URLs)

### Root Cause
When media is synced from WorkEdge, the URLs stored in `workedge_project_media.media_url` are **signed URLs** from WorkEdge's storage with short-lived tokens (they expire in ~1 hour). After expiration, the images silently fail to load, showing only the "Field media" alt text you're seeing.

### Solution
Download each photo from WorkEdge during sync and re-upload it to your own file storage bucket, then store the permanent public URL in the database. This ensures thumbnails always load regardless of when you view them.

### Changes

**1. Create a storage bucket for WorkEdge media**
- Create a `workedge-media` public storage bucket via SQL migration
- Add RLS policies allowing authenticated users to read/upload

**2. Update the `workedge-sync` edge function (`get-project-media` action)**
- After fetching media items from the WorkEdge API, download each photo/video thumbnail binary
- Upload each file to the `workedge-media` bucket under a path like `{workedge_project_id}/{filename}`
- Store the resulting permanent public URL in `media_url` instead of the expiring signed URL
- Add error handling: if a download/upload fails for a specific item, fall back to storing the original URL (better than losing the record entirely)

**3. Update `WorkEdgeProjects.tsx` Field Media grid**
- Add an `onError` handler on the `<img>` tag that shows the media type icon as a fallback when an image fails to load (handles any remaining old expired URLs gracefully)
- Add a subtle "expired" indicator for items whose URLs no longer work

**4. Update `WorkEdgePanel.tsx` (job detail sidebar)**
- Same `onError` fallback treatment for any thumbnail display

### Files to modify
1. **Database migration** -- create `workedge-media` storage bucket + RLS policies
2. `supabase/functions/workedge-sync/index.ts` -- download and re-upload media during sync
3. `src/pages/admin/WorkEdgeProjects.tsx` -- add image error fallback in the Field Media grid

### What this does NOT change
- Existing expired URLs in the database will still be broken until you re-sync those projects (click the refresh icon on each linked project). The `onError` fallback ensures they show an icon instead of a broken image in the meantime.

