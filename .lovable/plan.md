
# Fix WorkEdge Media and Notes Import

## Problem
When clicking "Sync from WorkEdge", the system reports "Synced 0 media items" even though the project has 8 photos. The issue is that the edge function expects media data in a specific format (`mediaData.items`) but the WorkEdge API likely returns it in a different structure.

## Root Cause Analysis
The sync logs confirm:
- `get-project-media` calls are returning `media_count: 0`  
- The linked project shows `photo_count: 8` in the project list

The code on line 201 of `workedge-sync/index.ts` only checks for `.items`:
```typescript
const mediaRecords = (mediaData.items || []).map(...)
```

The WorkEdge API (hosted at `vesncoasnajcdinipgkv.supabase.co/functions/v1`) likely returns media in a different format - possibly as a direct array, or nested under `photos`, `media`, or `data.items`.

---

## Solution

### 1. Add Debug Logging to Edge Function
First, add logging to see the actual API response structure.

### 2. Update Media Extraction Logic
Make the media extraction more defensive to handle multiple response structures:

```typescript
// Extract items from response - handle various structures
function extractItems(response: any): any[] {
  if (!response || typeof response !== 'object') return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.photos)) return response.photos;
  if (Array.isArray(response.media)) return response.media;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  if (response.data && Array.isArray(response.data.photos)) return response.data.photos;
  return [];
}
```

### 3. Map Media Fields Defensively
WorkEdge may use different field names. Update mapping to handle:
- `type` or `media_type`
- `url` or `media_url` or `file_url`
- `thumbnail_url` or `thumb_url` or `thumbnail`
- `created_at` or `captured_at` or `taken_at`

### 4. Add Notes Support
Notes may come from a separate endpoint or be included with media. Add logic to fetch notes if not included in media response.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/workedge-sync/index.ts` | Add `extractItems` helper, update `get-project-media` to handle multiple response formats, add console logging for debugging |

---

## Implementation Details

### Edge Function Changes (`workedge-sync/index.ts`)

1. **Add helper function** to safely extract items from API responses

2. **Update get-project-media case** (around line 183-234):
   - Log the raw API response for debugging
   - Use `extractItems()` to handle various response structures
   - Map fields defensively with fallbacks
   - Handle notes if included in media or fetch separately

3. **Enhanced media record mapping**:
```typescript
const mediaRecords = extractItems(mediaData).map((item: any) => ({
  job_id: jobId,
  workedge_project_id: workedgeProjectId,
  media_type: item.type || item.media_type || 'photo',
  media_url: item.url || item.media_url || item.file_url,
  thumbnail_url: item.thumbnail_url || item.thumb_url || item.thumbnail,
  title: item.title || item.name || item.filename,
  description: item.description || item.caption || item.content,
  transcription: item.transcription,
  captured_by: item.captured_by || item.author || item.created_by,
  captured_at: item.captured_at || item.created_at || item.taken_at,
  synced_at: new Date().toISOString()
}));
```

---

## Testing
After implementation:
1. Link a WorkEdge project with known photos
2. Click "Sync from WorkEdge"
3. Check edge function logs for the raw API response structure
4. Verify media items appear in the panel
