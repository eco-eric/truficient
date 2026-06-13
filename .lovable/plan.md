## Add multi-select to Dispatch Map sidebar

Add checkbox-based selection to the Dispatch Map sidebar list so the user can pick a subset of jobs/appointments and view only those markers on the map together.

### Behavior

- Each sidebar list item (jobs or appointments) gets a checkbox on the left.
- New "Select all / Clear" toggle at the top of the sidebar list, plus a count like "3 of 12 selected".
- A "Filter map to selection" toggle button (default OFF). When OFF, all mappable items render as today. When ON, only checked items render markers and the map auto-fits to those markers.
- Clicking a list item's label still pans/opens its marker (only when its marker is visible). Clicking the checkbox toggles selection without panning.
- Selection state resets whenever the view tab changes (jobs / service / installs / appointments) or the appointments date changes, since the underlying item list changes.
- Selection state lives in component state only (no persistence, no URL params).

### Files

- `src/pages/admin/DispatchMap.tsx` — only file touched.
  - New state: `selectedIds: Set<string>`, `filterToSelection: boolean`.
  - Reset both whenever `view` or `ymd` changes.
  - Derive `visibleJobs` / `visibleAppts` from the existing `mappableJobs` / `mappableAppts` by filtering on `selectedIds` when `filterToSelection` is true.
  - Marker render `useEffect` uses the new visible lists (replace `mappableJobs` / `mappableAppts` references in that effect and update its dependency array).
  - Sidebar header: add "Select all" checkbox + "Filter map to selection" toggle (shadcn `Checkbox` + `Button` variant=`outline` with active style using NAVY).
  - Sidebar list rows: add a leading `Checkbox` (stopPropagation on its onClick so the row's focusMarker click still works on the label area).
  - `focusMarker` keyed by item id instead of array index, so it works correctly when the visible list is a filtered subset.

### Out of scope

- No routing, clustering, or persisted selections.
- No bulk actions on selected jobs (no assign/dispatch buttons) — this change is view-only as requested.
- No changes to the geocode backfill flow, tabs, or appointments date picker.
