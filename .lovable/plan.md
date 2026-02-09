
# Add "Unlink WorkEdge Project" Functionality

## Overview

Add the ability to unlink a WorkEdge project from a job. This will allow users to disconnect a job from its linked WorkEdge project without deleting the project from WorkEdge itself.

---

## Current State

When a job is linked to WorkEdge, the panel shows:
- The WorkEdge project ID badge
- A refresh/sync button
- Media grid and external link

**Missing:** No way to unlink/disconnect the project

---

## UI Design

Add an "Unlink" option in the linked state header:

```text
┌─────────────────────────────────────────────────────┐
│ WorkEdge                                            │
│                                                     │
│  [abc123] [🔄 Sync] [⋮ Menu]                       │
│                         ├─ Unlink Project           │
│                         └─ Open in WorkEdge         │
└─────────────────────────────────────────────────────┘
```

Or simpler approach - add an unlink button with confirmation:

```text
┌─────────────────────────────────────────────────────┐
│ WorkEdge                      [abc123] [🔄] [🔗✕]   │
├─────────────────────────────────────────────────────┤
│ (media content)                                     │
└─────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Edge Function: Add `unlink-project` Action

**File:** `supabase/functions/workedge-sync/index.ts`

Add new action to clear the WorkEdge link from the job:

```typescript
case 'unlink-project': {
  if (!jobId) {
    throw new Error('jobId is required');
  }

  // Clear the WorkEdge project ID from the job
  await supabase
    .from('crm_jobs')
    .update({ 
      workedge_project_id: null,
      workedge_last_sync: null
    })
    .eq('id', jobId);

  // Optionally: delete synced media from local table
  await supabase
    .from('workedge_project_media')
    .delete()
    .eq('job_id', jobId);

  result = { success: true };
  break;
}
```

---

### 2. Update `WorkEdgePanel.tsx`

**File:** `src/components/admin/jobs/WorkEdgePanel.tsx`

Add unlink functionality to the linked state:

- Add `Unlink2` (or use `Link2Off`) icon import from lucide-react
- Add `unlinkProjectMutation` mutation
- Add unlink button with confirmation dialog
- Show confirmation before unlinking

Changes:
- Add `AlertDialog` for confirmation
- Add unlink mutation
- Update header to include unlink option

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `supabase/functions/workedge-sync/index.ts` | Modify | Add `unlink-project` action |
| `src/components/admin/jobs/WorkEdgePanel.tsx` | Modify | Add unlink button with confirmation dialog |

---

## User Flow

1. User views a job linked to WorkEdge
2. Clicks "Unlink" button (or menu option)
3. Confirmation dialog appears: "Are you sure you want to unlink this WorkEdge project? This will remove the connection but won't delete the project from WorkEdge."
4. User confirms
5. Job's `workedge_project_id` is set to null
6. Local synced media is cleared
7. Panel refreshes to show "Not linked" state with Create/Link options
