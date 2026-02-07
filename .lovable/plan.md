

# Phase 5: Google Calendar Integration with Multi-Calendar Support

## Overview

This phase integrates Google Calendar into the CRM for job scheduling, crew availability tracking, and conflict detection. You'll create calendars in Google Workspace, share them with the service account, and the CRM will let you select which calendar to use when scheduling jobs.

---

## How It Works

### Your Google Workspace Setup
1. Create calendars in your truficient.com Google Workspace (e.g., "Install Jobs", "Service Calls", "Inspections")
2. Share each calendar with the service account email: `truficient-admin-sync@truficient-estimator-465520.iam.gserviceaccount.com` (give Editor permissions)
3. The CRM will automatically discover these shared calendars

### In the CRM
- Link calendars to teams (e.g., "Install Crew A" uses the "Install Jobs" calendar)
- When scheduling a job, pick which calendar the event goes on
- Events appear on team member calendars when they're added as attendees
- View all jobs in a unified calendar view with conflict detection

---

## What Will Be Built

### 1. Database Changes

**New table: `google_calendars`**
Stores the calendars shared with your service account:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| calendar_id | text | Google Calendar ID |
| name | text | Display name |
| color | text | Calendar color |
| is_primary | boolean | Default calendar for new jobs |
| is_active | boolean | Show in selection |

**Updates to `crm_jobs`:**
- `google_calendar_event_id` - Links job to Google Calendar event
- `google_calendar_id` - Which calendar the event is on

### 2. Edge Function: `google-calendar-sync`

Handles all Google Calendar API operations:

| Action | Description |
|--------|-------------|
| `list-calendars` | Fetches all calendars shared with service account |
| `sync-calendars` | Updates local calendar list from Google |
| `create-event` | Creates calendar event when job is scheduled |
| `update-event` | Updates event when job details change |
| `delete-event` | Removes event when job is cancelled |
| `get-events` | Fetches events for calendar view |
| `check-availability` | Detects scheduling conflicts |

### 3. Calendar Management Page (`/admin/calendars`)

Simple page to:
- View all synced Google Calendars
- Set a default calendar for new jobs
- Link calendars to specific job types
- Refresh calendar list from Google

### 4. Calendar View Page (`/admin/calendar`)

Full scheduling interface:
- Week/month/day/agenda views
- Jobs color-coded by job type
- Filter by team, calendar, or job type
- Click event to view job details
- Drag-and-drop rescheduling
- Red conflict indicators for double-bookings

### 5. Scheduling Widget (Job Detail Page)

Integrated into the existing Job Detail sidebar:
- Date/time picker for scheduling
- Calendar selector dropdown
- Crew availability display
- One-click "Sync to Calendar" button
- Auto-conflict warnings before saving

---

## Event Data Mapping

When a job is synced to Google Calendar:

```text
Title: TRU-2026-0042 - Smith Residence - AC Install
Location: 1234 Oak Lane, Dallas, TX 75201
Description:
  Job Type: Residential Install
  Customer: John Smith
  Phone: (469) 555-1234
  Priority: High
  
  Notes:
  Gate code: 1234
  Dog in backyard - ring doorbell first

Start: 2026-02-10 08:00 AM
End: 2026-02-10 04:00 PM

Attendees: 
  - mike@truficient.com (crew lead)
  - john@truficient.com (installer)
```

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/google-calendar-sync/index.ts` | Edge function for all Google Calendar API calls |
| `src/pages/admin/Calendar.tsx` | Main calendar view page |
| `src/pages/admin/CalendarSettings.tsx` | Calendar management page |
| `src/components/admin/calendar/CalendarView.tsx` | Week/month/day views |
| `src/components/admin/calendar/EventCard.tsx` | Job event display component |
| `src/components/admin/calendar/SchedulingWidget.tsx` | Scheduling UI for Job Detail |
| `src/components/admin/calendar/CalendarSelector.tsx` | Dropdown for picking calendar |
| `src/components/admin/calendar/AvailabilityGrid.tsx` | Shows crew availability |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/admin/JobDetail.tsx` | Add SchedulingWidget to sidebar |
| `src/components/admin/adminNavConfig.ts` | Add Calendar and Calendar Settings to Operations section |
| `src/App.tsx` | Add routes for calendar pages |
| `supabase/config.toml` | Add google-calendar-sync function config |

### Database Migration

```text
1. Create google_calendars table
2. Add google_calendar_event_id to crm_jobs
3. Add google_calendar_id to crm_jobs
4. Add RLS policies for google_calendars table
```

---

## Technical Details

### Service Account Authentication

The edge function will use a JWT for service account authentication:

```text
1. Parse service account JSON from secret
2. Create JWT with Google Calendar scope
3. Exchange JWT for access token
4. Use access token for all API calls
5. Tokens are cached and refreshed automatically
```

### Calendar Discovery Flow

```text
1. User clicks "Sync Calendars" in admin
2. Edge function calls Google Calendar API calendarList.list()
3. Returns all calendars where service account has access
4. Upserts records into google_calendars table
5. UI refreshes to show available calendars
```

### Event Sync Flow

```text
1. Admin sets job scheduled_start/scheduled_end
2. Selects target calendar
3. Assigns crew members
4. Clicks "Sync to Calendar"
5. Edge function creates Google Calendar event
6. Job record updated with google_calendar_event_id
7. Future job changes trigger automatic updates
```

---

## Dependencies

### NPM Packages (already installed)
- `date-fns` - Date manipulation
- `react-day-picker` - Calendar date selection

### Additional Package (if needed for calendar view)
- May use existing components or add a lightweight calendar grid

---

## Required Action From You

Before implementation begins:

1. **Create calendars** in your Google Workspace admin (optional - can do later)
2. **Share calendars** with: `truficient-admin-sync@truficient-estimator-465520.iam.gserviceaccount.com`
3. **Grant Editor permissions** so the service account can create/modify events

The integration will work as soon as you share at least one calendar. You can add more calendars at any time.

---

## Implementation Order

1. Store service account credentials as Cloud secret
2. Create database migration (new table + columns)
3. Create `google-calendar-sync` edge function
4. Build Calendar Settings page (manage synced calendars)
5. Build Calendar View page (week/month views)
6. Add Scheduling Widget to Job Detail page
7. Update navigation and routes
8. Test end-to-end

