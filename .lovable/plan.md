
# Add Counts to All Tabs + Live Jobs Tab

## Problem 1: Missing Tab Counts
The "Jobs", "Estimates", and "Equipment" tabs show no counts, while "Locations" and "Activity" do. All tabs should consistently show counts.

## Problem 2: Jobs Tab is Static
The Jobs tab (lines 372-382) is a hardcoded empty placeholder. It never queries `crm_jobs`, so Marrianne's two jobs (TRU-2026-0004 and TRU-2026-0009) don't appear.

## Changes to `src/pages/admin/CustomerDetail.tsx`

### 1. Add a query for jobs
Fetch from `crm_jobs` where `customer_id` matches and `deleted_at` is null. Include related stage info via `current_stage_id` join to `crm_job_stages`.

### 2. Add a query for estimates count
Fetch from `estimates` where `customer_id` matches, just for the count (the LinkedSubmissions component handles the full display).

### 3. Add a query for linked submissions count
Fetch count from `crm_submission_links` where `customer_id` matches, to combine with estimates count for a total "Estimates" tab count.

### 4. Update all tab labels to show counts

```text
Overview | Locations (1) | Activity (0) | Jobs (2) | Estimates (2) | Equipment (0)
```

- Jobs: use `jobs?.length || 0`
- Estimates: use combined count of `crm_submission_links` + `estimates` rows
- Equipment: `0` for now (placeholder until equipment records are wired)

### 5. Replace the static Jobs tab with a live list
Display each job as a clickable card showing:
- Job number (e.g., TRU-2026-0004)
- Title
- Priority badge
- Scheduled date (if set)
- Link to `/admin/jobs/{jobId}`

Keep the empty state for when there are truly zero jobs.

## Scope
- One file modified: `src/pages/admin/CustomerDetail.tsx`
- No database changes
