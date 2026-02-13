

# Add "Closed Won" Stage to All Job Types

## What This Does
Adds a "Closed Won" stage to every active job type so you can mark jobs as successfully completed. These stages will be hidden from the Kanban board view to keep it uncluttered — just like "Cancelled" stages are already hidden.

## Changes

### 1. Insert "Closed Won" stages into the database
- Add a "Closed Won" stage (green, `#22C55E`) for each active job type
- Uses the `closed_won` stage type (already allowed by the constraint we just added)
- Placed at the end of each job type's stage order

### 2. Hide "Closed Won" from the Kanban board
- **File:** `src/pages/admin/Jobs.tsx` (line 201)
- The board already filters out `cancelled` stages — we just add `closed_won` to the same filter:
  ```
  .filter(s => s.stage_type !== 'cancelled' && s.stage_type !== 'closed_won')
  ```

### 3. Clean up unused `closed_lost` from the constraint
- Since you don't need "Closed Lost" (cancelled covers it), we'll remove `closed_lost` from the allowed stage types to keep things clean

