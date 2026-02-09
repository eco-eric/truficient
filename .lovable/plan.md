

# Add "Link Existing WorkEdge Project" Option

## Overview

Enhance the WorkEdge panel to provide two options when a job isn't linked:
1. **Create New Project** (existing functionality)
2. **Link Existing Project** (new - allows searching/selecting from existing WorkEdge projects)

---

## Current State

- `WorkEdgePanel.tsx` only shows "Create WorkEdge Project" button when not linked
- No ability to search or browse existing WorkEdge projects
- No edge function action to list/search projects

---

## UI Design

When job is not linked to WorkEdge:

```text
┌─────────────────────────────────────────────────────┐
│ WorkEdge                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│              Not linked to WorkEdge yet             │
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  + Create New       │  │  🔗 Link Existing   │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

After clicking "Link Existing":

```text
┌─────────────────────────────────────────────────────┐
│ Link Existing WorkEdge Project                 [X]  │
├─────────────────────────────────────────────────────┤
│ Search projects...                    [🔍]          │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📋 TRU-2025-0042 - Smith HVAC Install          │ │
│ │    123 Main St, Dallas, TX                     │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📋 TRU-2025-0039 - Johnson Heat Pump           │ │
│ │    456 Oak Ave, Frisco, TX                     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Or enter Project ID manually:                       │
│ ┌────────────────────────────┐ ┌────────┐          │
│ │ e.g., abc123...            │ │  Link  │          │
│ └────────────────────────────┘ └────────┘          │
└─────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Edge Function: Add `list-projects` Action

**File:** `supabase/functions/workedge-sync/index.ts`

Add new action to fetch existing projects from WorkEdge:

```typescript
interface WorkEdgeSyncRequest {
  action: 'create-project' | 'sync-customer' | 'get-project-media' | 
          'get-equipment' | 'create-service-record' | 'list-projects' | 'link-project';
  // ... existing fields
  searchQuery?: string;
}

// New case in switch:
case 'list-projects': {
  const response = await fetch(`${apiUrl}/api-projects`, {
    method: 'GET',
    headers: { 'x-api-key': WORKEDGE_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`WorkEdge API error: ${response.status}`);
  }

  const projectsData = await response.json();
  result = { 
    success: true, 
    projects: projectsData.items || projectsData || [] 
  };
  break;
}

case 'link-project': {
  if (!jobId || !workedgeProjectId) {
    throw new Error('jobId and workedgeProjectId are required');
  }

  // Just update the local job with the WorkEdge project ID
  await supabase
    .from('crm_jobs')
    .update({ 
      workedge_project_id: workedgeProjectId,
      workedge_last_sync: new Date().toISOString()
    })
    .eq('id', jobId);

  result = { success: true, workedge_project_id: workedgeProjectId };
  break;
}
```

---

### 2. New Component: `LinkWorkEdgeDialog.tsx`

**File:** `src/components/admin/jobs/LinkWorkEdgeDialog.tsx`

Create a dialog component with:
- Search input to filter projects
- List of available WorkEdge projects (from API)
- Manual project ID input as fallback
- Link button that calls the `link-project` action

---

### 3. Update `WorkEdgePanel.tsx`

**File:** `src/components/admin/jobs/WorkEdgePanel.tsx`

Update the "not linked" state to show two buttons:
- Keep existing "Create WorkEdge Project"
- Add new "Link Existing" that opens the dialog

```tsx
// Add state for dialog
const [showLinkDialog, setShowLinkDialog] = useState(false);

// Update the not-linked UI:
<div className="flex gap-2 justify-center">
  <Button onClick={() => createProjectMutation.mutate()} disabled={createProjectMutation.isPending}>
    <Plus className="h-4 w-4 mr-2" />
    Create New
  </Button>
  <Button variant="outline" onClick={() => setShowLinkDialog(true)}>
    <Link2 className="h-4 w-4 mr-2" />
    Link Existing
  </Button>
</div>

<LinkWorkEdgeDialog 
  open={showLinkDialog}
  onOpenChange={setShowLinkDialog}
  jobId={jobId}
  onLinked={() => {
    queryClient.invalidateQueries({ queryKey: ['crm_job', jobId] });
    setShowLinkDialog(false);
  }}
/>
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `supabase/functions/workedge-sync/index.ts` | Modify | Add `list-projects` and `link-project` actions |
| `src/components/admin/jobs/LinkWorkEdgeDialog.tsx` | Create | New dialog for searching/linking projects |
| `src/components/admin/jobs/WorkEdgePanel.tsx` | Modify | Add "Link Existing" button and dialog integration |

---

## User Flow

1. User opens job detail page with no WorkEdge link
2. Sees two options: "Create New" or "Link Existing"
3. If "Link Existing":
   - Dialog opens showing list of WorkEdge projects
   - User can search/filter or manually enter ID
   - User selects project and clicks "Link"
   - Job is updated with WorkEdge project ID
   - Dialog closes and panel refreshes to show linked state

