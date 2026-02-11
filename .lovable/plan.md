

# Add Media Type Counts to WorkEdge Panel

## Change

In the "linked" view of `src/components/admin/jobs/WorkEdgePanel.tsx`, add a row of small count badges (e.g. "4 Photos | 2 Videos | 1 Note") between the project name and the media grid. This uses data already loaded — no new queries needed.

### `src/components/admin/jobs/WorkEdgePanel.tsx`

- Compute counts from the existing `media` array:
  ```typescript
  const counts = {
    photos: media.filter(m => m.media_type === 'photo').length,
    videos: media.filter(m => m.media_type === 'video').length,
    documents: media.filter(m => m.media_type === 'document').length,
    notes: media.filter(m => m.media_type === 'note' || m.media_type === 'voice_note').length,
  };
  ```
- Render a compact row of non-zero counts using small badges or muted text, e.g.:
  ```
  3 Photos  ·  1 Video  ·  2 Notes
  ```
- Only show this row when `media.length > 0`

One file changed, display-only, no database or API changes.
