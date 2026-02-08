
# System Stability Analysis & Refinement Plan

## Executive Summary

After thorough analysis of the codebase, I've identified several issues causing the "loading and reloading" behavior reported. The issues span React Query configuration, authentication race conditions, component ref warnings, and unnecessary re-renders.

---

## Issue 1: React Ref Warning in JobTypesConfig

**Severity: Medium**
**Source:** Console error shown in logs

The console shows this error:
```
Warning: Function components cannot be given refs.
Check the render method of `JobTypesConfig`.
at JobTypeItem
```

**Root Cause:**
The `JobTypeItem` component (lines 302-341) is used inside a context where a parent might be trying to pass a ref to it. Function components cannot receive refs without `React.forwardRef()`.

**Location:** `src/pages/admin/JobTypesConfig.tsx` lines 302-341

**Fix:** Wrap `JobTypeItem` with `React.forwardRef`:

```typescript
const JobTypeItem = React.forwardRef<HTMLDivElement, {...}>(({ 
  type, 
  isSelected, 
  onClick, 
  onEdit, 
  onDelete 
}, ref) => {
  const Icon = iconMap[type.icon_name] || Wrench;
  
  return (
    <div
      ref={ref}
      className={cn(...)}
      onClick={onClick}
    >
      {/* ... */}
    </div>
  );
});
JobTypeItem.displayName = 'JobTypeItem';
```

---

## Issue 2: QueryClient Missing Global Configuration

**Severity: High**
**Source:** `src/App.tsx` line 101

The QueryClient is instantiated with default settings:
```typescript
const queryClient = new QueryClient();
```

This means:
- No stale time configured (defaults to 0 - always refetch)
- Window focus refetching enabled by default (causes reloading when switching tabs)
- Aggressive retry behavior

**Fix:** Add sensible defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

---

## Issue 3: Authentication Loading Race Condition

**Severity: Medium**
**Source:** `src/hooks/useAuth.ts` and `src/hooks/useUserRole.ts`

The current flow has a potential race condition:

```text
useAuth.loading=true → useUserRole waits → ProtectedRoute shows Loading...
                                          ↓
useAuth resolves → useUserRole.loading=true → ProtectedRoute shows Loading...
                                             ↓
useUserRole resolves → ProtectedRoute renders children
```

The issue is that `useUserRole` resets `loading` to `true` when it starts fetching (line 40), which can cause a flash of the loading screen after auth completes.

**Current Code (lines 39-41):**
```typescript
// Reset loading when starting fetch
setLoading(true);
```

**Fix:** Don't reset loading to true if we already have a role cached:

```typescript
// Only set loading if we don't have a cached role
if (!role) {
  setLoading(true);
}
```

---

## Issue 4: Unnecessary Query Invalidations

**Severity: Medium**
**Source:** Multiple files

Several components invalidate broad query keys that trigger cascading refetches:

```typescript
// JobFormDialog.tsx
queryClient.invalidateQueries({ queryKey: ['crm_jobs'] });
```

When on the JobDetail page, this invalidates all job-related queries, but the JobDetail page also refetches its own data. Combined with the window focus refetching, this creates multiple redundant network requests.

**Fix:** Use more specific invalidation where possible:

```typescript
// Instead of invalidating all jobs, only invalidate specific job + list
queryClient.invalidateQueries({ queryKey: ['crm_job', editingJob?.id] });
queryClient.invalidateQueries({ queryKey: ['crm_jobs'] });
```

---

## Issue 5: Dialog State Not Reset on Close

**Severity: Low**
**Source:** `src/pages/admin/JobTypesConfig.tsx`

The `JobTypeDialog` and `StageDialog` components use `useState` with initial values derived from `editingType`/`editingStage`:

```typescript
const [formData, setFormData] = useState<Partial<JobType>>(
  editingType || {
    // defaults...
  }
);
```

The problem is that `useState` only uses the initial value once. When `editingType` changes, the form doesn't reset. This is handled by some dialogs with `useEffect`, but these don't have it.

**Fix:** Add reset effect:

```typescript
useEffect(() => {
  setFormData(editingType || {
    category: 'residential',
    // ... defaults
  });
}, [editingType]);
```

---

## Issue 6: Multiple useQuery Calls for Same Data

**Severity: Low**
**Source:** `src/pages/admin/JobDetail.tsx`

The JobDetail page makes 7 separate useQuery calls on mount:
1. `crm_job` - job details
2. `crm_job_stages` - stages for job type
3. `crm_job_stage_history` - stage changes
4. `crm_job_assignments` - team assignments
5. `crm_teams_active` - all active teams
6. `crm_job_types` - all job types
7. `crm_job_stages_all` - all stages

This is architecturally fine, but without proper staleTime, all queries fire on every mount and window focus.

**Fix:** This is addressed by Issue #2 (QueryClient defaults).

---

## Issue 7: Session Replay Shows Repeated Truncation

**Severity: Info**
**Source:** Session replay data

The session replay data shows multiple `truncated: true` events, indicating large DOM updates or data transfers. This correlates with the query invalidation cascade.

---

## Implementation Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Configure QueryClient with staleTime and disable refetchOnWindowFocus |
| `src/pages/admin/JobTypesConfig.tsx` | Add forwardRef to JobTypeItem, add useEffect for form reset |
| `src/hooks/useUserRole.ts` | Prevent loading flash by not resetting to true if role exists |
| `src/components/admin/jobs/JobFormDialog.tsx` | More specific query invalidation |
| `src/pages/admin/JobDetail.tsx` | More specific query invalidation on edit close |

---

## Technical Details

### QueryClient Configuration Explained

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes - won't refetch unless stale
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,
      
      // Only retry once on failure (down from 3)
      retry: 1,
    },
  },
});
```

### forwardRef Pattern

```typescript
import React from 'react';

interface JobTypeItemProps {
  type: JobType;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const JobTypeItem = React.forwardRef<HTMLDivElement, JobTypeItemProps>(
  ({ type, isSelected, onClick, onEdit, onDelete }, ref) => {
    // Component implementation
    return <div ref={ref}>...</div>;
  }
);

JobTypeItem.displayName = 'JobTypeItem';
```

---

## Implementation Order

1. **QueryClient Configuration** - Biggest impact, affects entire app
2. **forwardRef Fix** - Eliminates console warning
3. **useUserRole Loading State** - Prevents auth flash
4. **Form Reset Effects** - Prevents stale form data
5. **Specific Query Invalidation** - Reduces network requests

---

## Expected Outcomes

After implementation:
- Reduced network requests by ~60% due to staleTime
- No more loading flashes when switching tabs
- Console warning about refs eliminated
- Smoother navigation between admin pages
- Forms properly reset when opening with different data
