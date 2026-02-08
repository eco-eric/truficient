

# Job Edit & Calendar Scheduling Improvements

## Issues Identified

1. **No Edit Button on Job Detail Page** - Cannot modify job after creation
2. **Schedule fields use datetime** - User wants date-only for job scheduling
3. **Calendar entries need to be separate** - Appointment times should be managed independently from job dates

---

## Solution Architecture

```text
CURRENT                                    NEW
-------                                    ---
crm_jobs.scheduled_start (TIMESTAMPTZ)     crm_jobs.scheduled_date (DATE)
crm_jobs.scheduled_end (TIMESTAMPTZ)       crm_jobs.scheduled_end_date (DATE)
                                           
                                           + NEW TABLE
SchedulingWidget manages times on job      crm_job_appointments (separate table)
                                           - job_id
                                           - start_datetime
                                           - end_datetime
                                           - google_calendar_event_id
                                           - assigned_team_id
                                           - notes
```

---

## Database Changes

### 1. Add Date-Only Columns to crm_jobs

```sql
ALTER TABLE crm_jobs 
ADD COLUMN scheduled_date DATE,
ADD COLUMN scheduled_end_date DATE;
```

### 2. Create Calendar Appointments Table

```sql
CREATE TABLE crm_job_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  title TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  google_calendar_id UUID REFERENCES google_calendars(id),
  google_calendar_event_id TEXT,
  assigned_team_id UUID REFERENCES crm_teams(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policy
ALTER TABLE crm_job_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage job appointments" 
  ON crm_job_appointments FOR ALL 
  USING (auth.role() = 'authenticated');
```

### 3. Migrate Existing Data (if any)

```sql
UPDATE crm_jobs 
SET scheduled_date = DATE(scheduled_start),
    scheduled_end_date = DATE(scheduled_end)
WHERE scheduled_start IS NOT NULL;
```

---

## UI Changes

### 1. Add Edit Button to Job Detail Page

Add an "Edit Job" button in the header that opens the existing JobFormDialog:

```text
┌─────────────────────────────────────────────────────────────────┐
│  ← Back    TRU-2026-0001  [High] [Installation]     [Edit Job]  │
│            Replace HVAC System - 3 ton unit          [AI Chat]  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Update JobFormDialog - Use Date Pickers

Change schedule inputs from datetime-local to date only:

```text
CURRENT                          NEW
-------                          ---
Scheduled Start [datetime]       Scheduled Date [date picker]
Scheduled End [datetime]         End Date [date picker]
```

### 3. Redesign SchedulingWidget → Calendar Appointments

Replace the single datetime pair with a list of appointments:

```text
┌─────────────────────────────────────────────────────────────────┐
│  📅 Calendar Appointments                    [+ Add Appointment] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Site Survey                                              │  │
│  │  Mon, Feb 10, 2026 • 9:00 AM - 11:00 AM                  │  │
│  │  📍 Crew A  ✓ Synced to Google Calendar     [Edit] [Del]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Installation Day 1                                       │  │
│  │  Wed, Feb 12, 2026 • 8:00 AM - 5:00 PM                   │  │
│  │  📍 Crew A + Crew B  ○ Not synced           [Edit] [Del]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Appointment Form Dialog

```text
┌────────────────────────────────────────┐
│  Add Calendar Appointment              │
├────────────────────────────────────────┤
│  Title:                                │
│  ┌──────────────────────────────────┐  │
│  │ Installation Day 1               │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Start:                                │
│  ┌──────────────┐ ┌────────────────┐   │
│  │ Feb 12, 2026 │ │ 8:00 AM        │   │
│  └──────────────┘ └────────────────┘   │
│                                        │
│  End:                                  │
│  ┌──────────────┐ ┌────────────────┐   │
│  │ Feb 12, 2026 │ │ 5:00 PM        │   │
│  └──────────────┘ └────────────────┘   │
│                                        │
│  Assign Team: [Crew A         ▼]       │
│  Calendar:    [Primary Calendar ▼]     │
│                                        │
│  Notes:                                │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│     [Cancel]  [Save & Sync to Calendar]│
└────────────────────────────────────────┘
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| MIGRATE | Database | Add date columns, create appointments table |
| CREATE | `src/components/admin/jobs/JobAppointmentDialog.tsx` | Form for creating/editing appointments |
| CREATE | `src/components/admin/jobs/JobAppointmentsCard.tsx` | List of appointments for job detail |
| MODIFY | `src/pages/admin/JobDetail.tsx` | Add Edit button, replace SchedulingWidget |
| MODIFY | `src/components/admin/jobs/JobFormDialog.tsx` | Change datetime inputs to date pickers |
| MODIFY | `src/pages/admin/Jobs.tsx` | Open edit dialog from detail page |

---

## Data Model

### Job Dates (date-only, for high-level scheduling)
- `scheduled_date` - When job is planned to start (date only)
- `scheduled_end_date` - When job is planned to complete (date only)

### Appointments (full datetime, for calendar sync)
- Multiple appointments per job
- Each syncs independently to Google Calendar
- Can assign different teams to different appointments
- Tracks start/end with full time precision

---

## Security

- New `crm_job_appointments` table follows same RLS pattern as `crm_jobs`
- Only authenticated users can manage appointments
- Cascading delete ensures cleanup when job is deleted

---

## Implementation Order

1. Run database migrations (add columns, create table)
2. Update JobFormDialog with date pickers
3. Create JobAppointmentsCard component  
4. Create JobAppointmentDialog component
5. Update JobDetail page with Edit button and new appointments UI
6. Update SchedulingWidget logic or replace entirely

