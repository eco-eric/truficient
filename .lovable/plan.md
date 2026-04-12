

# Sticky Table Header for SEO Management Page

## Summary
Make the table header row in the SEO Management page stick to the top when scrolling, so column labels remain visible.

## Changes

### 1. Update the table container (`src/pages/admin/SEOManagement.tsx`)
- Add `max-height` and `overflow-y-auto` to the table's wrapping `<div>` so the table scrolls within a fixed-height container
- This keeps the header visible while the body scrolls

### 2. Make `TableHeader` sticky
- Add `sticky top-0 z-10 bg-white` classes to the `<TableHeader>` element on line 380
- This pins the header row to the top of the scrollable container

### Files Modified
| File | Change |
|------|--------|
| `src/pages/admin/SEOManagement.tsx` | Add sticky classes to `TableHeader`, add `max-h-[calc(100vh-300px)] overflow-y-auto` to table container div |

