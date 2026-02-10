
# Add WorkEdge Project Name to the Panel

## Change

Pass the job's name info (`job_number` and `title`) down to the `WorkEdgePanel` so it can display the project name (e.g. "J-00042 - Install") below the project ID badge.

### 1. `src/pages/admin/JobDetail.tsx` (line 784)
Add two new props to `WorkEdgePanel`:
```tsx
<WorkEdgePanel
  jobId={job.id}
  workedgeProjectId={job.workedge_project_id}
  jobNumber={job.job_number}
  jobTitle={job.title}
/>
```

### 2. `src/components/admin/jobs/WorkEdgePanel.tsx`
- Add `jobNumber` and `jobTitle` to the props interface
- In the "linked" view, add a small text line below the header showing the project name:
  ```
  Project: J-00042 - Install
  ```
  Displayed as muted helper text beneath the existing project ID badge area, so both the human-readable name and the UUID are visible.

Two files changed, display-only enhancement.
