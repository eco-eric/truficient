

# Fix WorkEdge Media Sync to Include Videos, Files, and Notes

## Problem

The media sync only calls one WorkEdge API endpoint (`/api-projects/{id}/media`), which appears to return only photos. The WorkEdge project actually has 3 videos, 7 files, and 1 note that are not being synced.

## Root Cause

In `supabase/functions/workedge-sync/index.ts`, the `get-project-media` action fetches from a single endpoint. WorkEdge organizes content into separate endpoints (photos/media, videos, notes, files/documents).

## Solution

Update the `get-project-media` action in the edge function to call multiple WorkEdge API endpoints and merge the results.

### `supabase/functions/workedge-sync/index.ts`

In the `get-project-media` case (around line 264), replace the single API call with calls to four endpoints:

1. `/api-projects/{id}/media` (or `/photos`) -- for photos (already working)
2. `/api-projects/{id}/videos` -- for videos
3. `/api-projects/{id}/notes` -- for notes
4. `/api-projects/{id}/files` (or `/documents`) -- for documents/files

Each call will:
- Use the same auth header (`x-api-key`)
- Use the `extractItems()` helper to handle varied response shapes
- Tag each item with the correct `media_type` (`photo`, `video`, `note`, `document`)
- Skip any endpoint that returns 404 (in case some endpoints don't exist yet)
- Merge all results before inserting into `workedge_project_media`

### Technical Detail

```text
Current flow:
  GET /api-projects/{id}/media --> extract items --> insert as photos

New flow:
  GET /api-projects/{id}/media   --> tag as 'photo'   --|
  GET /api-projects/{id}/videos  --> tag as 'video'   --|-- merge all
  GET /api-projects/{id}/notes   --> tag as 'note'    --|-- insert into DB
  GET /api-projects/{id}/files   --> tag as 'document' -|
```

Each endpoint call is wrapped in a try/catch so a failure on one type doesn't block the others. Console logging will show how many items were fetched from each endpoint.

### No frontend changes needed

The `WorkEdgePanel.tsx` count logic is already correct -- it filters by `media_type`. Once the sync stores videos, notes, and files in the database, the counts will display accurately.

One file changed: `supabase/functions/workedge-sync/index.ts`

