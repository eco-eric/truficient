
# Add Job Board & Calendar Widgets to Dashboard

## Overview

Add two new dashboard widgets for quick access to Jobs and Calendar, positioned **before** the GHL Sync Health section (as indicated in the screenshot). These will provide at-a-glance operations visibility without leaving the dashboard.

---

## Current Dashboard Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Stats Cards Row                          │
├───────────────────────────────┬─────────────────────────────────┤
│        Revenue Summary        │        Pipeline Status          │
├───────────────────────────────┼─────────────────────────────────┤
│        GHL Sync Health        │        Sync Issues              │  ◀── Move DOWN
├───────────────────────────────┼─────────────────────────────────┤
│       Ducted Estimator        │      Ductless Estimator         │
└───────────────────────────────┴─────────────────────────────────┘
```

## Proposed Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Stats Cards Row                          │
├───────────────────────────────┬─────────────────────────────────┤
│        Revenue Summary        │        Pipeline Status          │
├───────────────────────────────┼─────────────────────────────────┤
│     Jobs Board Preview        │    Upcoming Appointments        │  ◀── NEW ROW
├───────────────────────────────┼─────────────────────────────────┤
│        GHL Sync Health        │        Sync Issues              │
├───────────────────────────────┼─────────────────────────────────┤
│       Ducted Estimator        │      Ductless Estimator         │
└───────────────────────────────┴─────────────────────────────────┘
```

---

## New Components

### 1. JobBoardPreview

A compact card showing recent jobs grouped by stage:

```text
┌──────────────────────────────────────────────────────────────────┐
│ 📋 Jobs Board                                    [View All →]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Initial (2)    In Progress (3)    Review (1)    Completed (0)  │
│  ┌─────────┐   ┌─────────┐        ┌─────────┐                   │
│  │ TRU-... │   │ TRU-... │        │ TRU-... │                   │
│  └─────────┘   │ TRU-... │        └─────────┘                   │
│                │ TRU-... │                                       │
│                └─────────┘                                       │
│                                                                  │
│  📊 5 active jobs  •  2 urgent priority  •  $24,500 total       │
└──────────────────────────────────────────────────────────────────┘
```

Features:
- Shows job counts by stage type (Initial, In Progress, Review, Completed)
- Displays up to 2-3 job cards per column (compact)
- Summary stats at bottom: active jobs, urgent count, total quoted
- "View All" link to `/admin/jobs`
- Click on job card navigates to job detail

---

### 2. UpcomingAppointments

A compact calendar widget showing today's and upcoming appointments:

```text
┌──────────────────────────────────────────────────────────────────┐
│ 📅 Upcoming Appointments                       [View Calendar →] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Today, Feb 9                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ■ 9:00 AM  TRU-2026-0042 - AC Installation    [Team Blue] │ │
│  │ ■ 2:00 PM  TRU-2026-0045 - Heat Pump Service              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Tomorrow, Feb 10                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ■ 10:30 AM TRU-2026-0048 - Ductless Install               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  📊 3 appointments this week  •  Next 7 days: 8 scheduled       │
└──────────────────────────────────────────────────────────────────┘
```

Features:
- Groups appointments by day (Today, Tomorrow, then dates)
- Shows time, job number, title, and team assignment
- Color-coded by team or job type
- Summary: this week count, next 7 days total
- "View Calendar" link to `/admin/calendar`
- Click appointment navigates to job detail

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/dashboard/JobBoardPreview.tsx` | Mini kanban view of jobs by stage |
| `src/components/admin/dashboard/UpcomingAppointments.tsx` | Today/upcoming appointments list |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Dashboard.tsx` | Import new components, insert row between Pipeline Status and GHL Sync Health |

---

## Data Queries

### JobBoardPreview

```typescript
// Fetch recent jobs with stage info
const { data: jobs } = useQuery({
  queryKey: ['dashboard-jobs-preview'],
  queryFn: async () => {
    const { data } = await supabase
      .from('crm_jobs')
      .select(`
        id, job_number, title, priority, quoted_amount,
        current_stage:crm_job_stages(stage_type, name, color),
        customer:crm_customers(first_name, last_name, company_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);
    return data;
  }
});
```

### UpcomingAppointments

```typescript
// Fetch appointments from today onwards
const { data: appointments } = useQuery({
  queryKey: ['dashboard-appointments'],
  queryFn: async () => {
    const today = startOfDay(new Date()).toISOString();
    const weekEnd = addDays(new Date(), 7).toISOString();
    
    const { data } = await supabase
      .from('crm_job_appointments')
      .select(`
        id, title, start_datetime, end_datetime,
        job:crm_jobs(id, job_number, title),
        team:crm_teams(id, name, color)
      `)
      .gte('start_datetime', today)
      .lte('start_datetime', weekEnd)
      .order('start_datetime')
      .limit(10);
    return data;
  }
});
```

---

## Dashboard Layout Update

Update `Dashboard.tsx` to insert the new row:

```tsx
{/* Revenue & Pipeline Row */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <RevenueSummary />
  <PipelineStatus />
</div>

{/* NEW: Jobs & Calendar Row */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <JobBoardPreview />
  <UpcomingAppointments />
</div>

{/* GHL Sync Health Row - MOVED DOWN */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <GHLSyncHealth />
  <FailedSyncsAlert />
</div>
```

---

## Component Styling

Both components will follow the existing dashboard card patterns:
- Use `Card`, `CardHeader`, `CardTitle`, `CardContent` from shadcn/ui
- Consistent icon usage (Briefcase for Jobs, Calendar for Appointments)
- "View All" button in header
- Skeleton loaders during loading state
- Compact layout optimized for dashboard (max height ~280px with scroll if needed)

