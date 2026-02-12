
## Enable Multiple Google Calendar Selection for Appointments

### Problem
Currently, each job appointment can only be synced to a single Google Calendar. You want to be able to select multiple calendars (e.g., Tony's Calendar + Install Team calendar) so the event appears on all of them.

### Approach
Create a junction table to track which calendars each appointment is synced to, then update the UI to use a multi-select instead of a single select for calendars.

### Database Changes

**New table: `crm_job_appointment_calendars`**
- `id` (uuid, PK)
- `appointment_id` (uuid, FK to crm_job_appointments)
- `google_calendar_db_id` (uuid, FK to google_calendars) -- the internal DB ID
- `google_calendar_event_id` (text, nullable) -- the Google event ID for this specific calendar
- `created_at` (timestamptz)
- Unique constraint on (appointment_id, google_calendar_db_id)

**Migration of existing data**: Copy current `google_calendar_id` and `google_calendar_event_id` values from `crm_job_appointments` into the new junction table for any appointments that already have a calendar set.

The existing columns on `crm_job_appointments` (`google_calendar_id`, `google_calendar_event_id`) will be kept for now but no longer used by the app (to avoid a breaking migration).

### UI Changes

**File: `src/components/admin/jobs/JobAppointmentDialog.tsx`**
1. Change `calendarId` (string) in form state to `calendarIds` (string array)
2. Replace the single `Select` for Google Calendar with the existing `MultiSelect` component (already used for attendees)
3. On save, write rows to `crm_job_appointment_calendars` instead of setting `google_calendar_id`
4. On "Save and Sync", loop through selected calendars and create/update/delete events on each one, storing individual `google_calendar_event_id` per junction row
5. On edit, load existing calendar selections from the junction table
6. Update sync status indicator to show which calendars are synced

**File: `src/components/admin/jobs/JobAppointmentsCard.tsx`**
1. Update the query to join through `crm_job_appointment_calendars` instead of the single FK
2. Update sync status badge to show count (e.g., "Synced to 3 calendars") or list calendar names
3. Update delete logic to remove Google events from all linked calendars

### Sync Logic Changes

**File: `src/components/admin/jobs/JobAppointmentDialog.tsx` (save mutation)**
- For each selected calendar: check if a junction row exists with an event ID
  - If yes and calendar is still selected: update the event
  - If yes but calendar was deselected: delete the event from Google, remove the junction row
  - If no (newly selected): create the event on Google, insert junction row with the returned event ID
- This handles adding/removing calendars on subsequent edits gracefully

### Job Clone Support
The existing clone logic in `JobDetail.tsx` that copies appointments will also need to copy junction rows but with `google_calendar_event_id` set to null (un-synced copies), matching current behavior.

### Files to modify
1. **Database migration** -- create `crm_job_appointment_calendars` table + migrate existing data
2. `src/components/admin/jobs/JobAppointmentDialog.tsx` -- multi-select calendars, updated save/sync logic
3. `src/components/admin/jobs/JobAppointmentsCard.tsx` -- updated query and sync status display
4. `src/pages/admin/JobDetail.tsx` -- update clone logic to copy junction rows
