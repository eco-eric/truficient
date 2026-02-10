

# Fix: Force All Calendar Times to CST (America/Chicago)

## Problem
When your VA in the Philippines enters "10:00 AM" for an appointment, the browser interprets that as 10:00 AM Philippine Time (UTC+8). The system then converts it to UTC for storage, which shifts it 14 hours away from the intended CST time. The result: the appointment shows up at the wrong time on the calendar.

## Solution
Force all date/time handling to use CST (America/Chicago), regardless of where the user is located. When someone enters 10:00 AM, it will always mean 10:00 AM Central Time.

## Changes

### 1. `src/components/admin/jobs/JobAppointmentDialog.tsx`

**Saving (creating the timestamp):**
- Instead of `new Date("2026-02-10T10:00")` (which uses the browser's local timezone), explicitly construct an ISO string that represents that time in CST.
- CST is UTC-6, CDT is UTC-5. To handle daylight saving automatically, we'll calculate the correct UTC offset for the "America/Chicago" timezone.

**Loading (populating the form):**
- When an existing appointment is loaded, convert the stored UTC timestamp to CST before extracting the date and time strings for the form fields.

**Approach:**
- Add a helper that formats a UTC date as CST date/time parts using `toLocaleString` with `timeZone: 'America/Chicago'`.
- Add a helper that takes a date string + time string (intended as CST) and produces the correct UTC ISO string.
- Add a small label "(CST)" next to the time inputs so users know the timezone.

### 2. `src/components/admin/calendar/CalendarView.tsx`

- Event display times (the "h:mm a" labels) are currently rendered in the viewer's local timezone. These will also be forced to display in CST using `toLocaleString` with the America/Chicago timezone.

### 3. `src/pages/admin/Calendar.tsx`

- The combined events are built from parsed dates. Google Calendar events already include `timeZone: 'America/Chicago'` in the payload, so they should render correctly. The job appointment dates stored in UTC will be displayed using CST-aware formatting in CalendarView.

## Technical Details

**New helper functions** (added at the top of `JobAppointmentDialog.tsx` or a shared util):

```text
formatInCST(date) -> { date: "YYYY-MM-DD", time: "HH:mm" }
  Uses Intl/toLocaleString with timeZone "America/Chicago"

buildCSTDateTime(dateStr, timeStr) -> ISO string (UTC)
  Constructs the correct UTC moment for "dateStr at timeStr in CST"
  Uses a temporary Date + timezone offset calculation
```

**Form label update:** Time inputs will show "(CST)" to make the timezone explicit for all users.

**No database changes required** -- the stored UTC timestamps are correct in concept; the fix is entirely in how we convert to/from UTC.

