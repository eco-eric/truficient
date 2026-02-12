

## Fix: Job Board Updates Automatically When Stage Changes

### Problem
When you change a job's stage from the Job Detail page, the Jobs Board (Kanban view) doesn't reflect the change until you manually refresh. This happens because the stage change mutation only invalidates the single-job query (`['crm_job', id]`) but not the jobs list query (`['crm_jobs']`) that powers the board.

### Solution
Add `['crm_jobs']` to the list of invalidated queries whenever a job stage changes. This applies to two locations:

### Technical Details

**File: `src/pages/admin/JobDetail.tsx`**
- In the `moveJobMutation` `onSuccess` callback (around line 166), add an invalidation for `['crm_jobs']` so the board re-fetches automatically.
- Also add `['dashboard-jobs-preview']` invalidation so the dashboard mini Kanban stays in sync too.

**Before:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
  queryClient.invalidateQueries({ queryKey: ['crm_job_stage_history', id] });
  toast.success('Job moved to new stage');
}
```

**After:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
  queryClient.invalidateQueries({ queryKey: ['crm_job_stage_history', id] });
  queryClient.invalidateQueries({ queryKey: ['crm_jobs'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-jobs-preview'] });
  toast.success('Job moved to new stage');
}
```

This is a one-line addition (plus the dashboard key) to one file. When you move a job to a new stage from the detail page and navigate back to the board, it will already show the updated position.

