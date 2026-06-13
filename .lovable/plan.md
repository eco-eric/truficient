## Goal
Prevent duplicate tags (caused by misspellings) on job estimates by suggesting existing tags as the user types.

## Approach
Add a typeahead autocomplete to the tag input in the Estimate Builder. As the user types, show matching tags pulled from all existing estimates. They can click a suggestion to use the exact existing spelling, or press Enter to create a new tag.

No dropdown opens on focus (the list can get long) — suggestions only appear once the user has typed at least 1 character, filtered to matches, capped at ~8 results.

## UX
- Input behaves as today: type, Enter / Add button creates a tag chip.
- While typing, a small popover below the input lists matching existing tags (case-insensitive contains match), most-used first.
- Click a suggestion → adds that tag (exact existing spelling) and clears input.
- Enter with no exact match → creates new tag as today.
- Enter with an exact (case-insensitive) match to an existing tag → reuses the existing spelling instead of creating a near-duplicate.
- Suggestions hide once input is empty or a tag is added.

## Technical
- File: `src/pages/admin/EstimateBuilder.tsx` (only file touched).
- New query: `useQuery(['estimate-tags-all'])` → `supabase.from('estimates').select('tags').not('tags','is',null)`; flatten + dedupe (case-insensitive, keep first-seen casing) + count frequency → sorted `{tag, count}[]`. Cached 5 min.
- Replace the current Input + Add button block (~lines 1126-1148) with a small inline component that renders the input, the chips row (unchanged), and a conditional suggestion list (absolute-positioned `div` with `bg-popover border rounded-md shadow` — no Popover/Command needed, keeps it lightweight and avoids focus stealing).
- Keyboard: ArrowDown/ArrowUp to navigate suggestions, Enter to accept highlighted suggestion (else create), Esc to close.
- Match design tokens already used in the file (no new colors).

## Out of scope
- No new table / migration — we derive the tag vocabulary from existing `estimates.tags` data.
- No bulk rename/merge of existing duplicate tags (can be a follow-up if you want a tag-cleanup tool).
- No changes to the Estimates list page tag filter.