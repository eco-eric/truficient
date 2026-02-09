

# Fix: Calendar Change Causes 404 Error

## Problem
When editing an existing appointment that's already synced to Google Calendar and changing the calendar selection, the code attempts to update the event on the **new** calendar using the old event ID. Since that event only exists on the **old** calendar, Google returns a 404 "Not Found" error.

The save to the database still succeeds (which is why it "works" afterward), but the Google Calendar sync fails.

## Solution
In `JobAppointmentDialog.tsx`, detect when the calendar has changed compared to the original appointment. When it has:
1. Delete the event from the old calendar
2. Create a new event on the new calendar
3. Store the new event ID

## File to Modify

**`src/components/admin/jobs/JobAppointmentDialog.tsx`**

In the `saveMutation` logic (around the Google Calendar sync section), add a check:

```
if calendar changed AND old event ID exists:
  1. delete event from OLD calendar
  2. create event on NEW calendar
  3. save new event ID
else if old event ID exists:
  update event on same calendar (existing behavior)
else:
  create event on new calendar (existing behavior)
```

### Specific Changes

Inside the sync block (around lines 192-225), replace the simple create-or-update logic with a three-way branch:

1. Track whether the calendar changed: compare `appointment.google_calendar_id` with `formData.calendarId`
2. If changed: find the old calendar's `calendar_id`, call `delete-event`, then call `create-event` on the new calendar
3. If not changed: keep existing update logic
4. If no old event: keep existing create logic

This is a targeted change to the mutation function only -- no UI changes needed.
