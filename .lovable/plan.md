

# Show All Media Counts Including Zero

## Problem

The current code filters out categories with zero items (`.filter(c => c.count > 0)`), so if there are no videos, the "Videos" label doesn't appear at all. The user wants to always see Photos, Videos, Files, and Notes counts -- even when some are zero.

## Change

### `src/components/admin/jobs/WorkEdgePanel.tsx`

Remove the `.filter(c => c.count > 0)` so all four categories always display. Also show the counts row even in the empty state (all zeros), and remove the media grid and activity list since the user only wants counts.

Result will always show something like:

```
101 Photos  ·  0 Videos  ·  0 Files  ·  2 Notes
```

One file changed, display-only.

