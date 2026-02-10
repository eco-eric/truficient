

# Fix: Calendar Timezone Issues Across All Components

## Problem
Your VA is in the Philippines (UTC+8) while your business operates in CST (UTC-6). Several components use browser-local time formatting instead of the CST utilities, causing appointments to display at the wrong time and potentially save incorrectly.

The appointment dialog that creates/edits appointments was already fixed to use CST, but the components that **display** those appointments and the older **SchedulingWidget** still use browser-local time.

## What's Going Wrong

| Component | Issue |
|-----------|-------|
| Job Appointments Card | Shows appointment times in Philippine Time instead of CST |
| Upcoming Appointments (Dashboard) | Same -- times shown in Philippine Time |
| Scheduling Widget (old job view) | Reads and writes times in Philippine Time, causing a 14-hour shift |
| Calendar page date range query | Query bounds calculated in browser-local time, can return wrong day's events |

## Fixes

### 1. `src/components/admin/jobs/JobAppointmentsCard.tsx`
Replace `format(new Date(...), 'h:mm a')` calls with `formatTimeCSTDisplay()` from the CST utility, and use `formatInCST()` for the date display. This ensures the appointment list on the Job Detail page always shows Central Time.

### 2. `src/components/admin/dashboard/UpcomingAppointments.tsx`
Same fix -- replace `format(new Date(apt.start_datetime), 'h:mm a')` with `formatTimeCSTDisplay()` so the dashboard widget shows correct CST times.

### 3. `src/components/admin/calendar/SchedulingWidget.tsx`
Refactor to use `formatInCST()` when loading existing schedule times into the form, and `buildCSTDateTime()` when constructing the ISO strings to send to Google Calendar. Currently it uses date-fns `format`/`parseISO` which interpret everything in browser-local time.

### 4. `src/pages/admin/Calendar.tsx`
Update `getDateRange()` to build date bounds in CST rather than browser-local time. This ensures the calendar query fetches the correct day's events regardless of the user's browser timezone.

## Technical Details

All fixes use the existing `src/lib/cstTimezone.ts` utility that is already imported and working correctly in the appointment dialog. The changes are:

- Import `formatInCST`, `buildCSTDateTime`, `formatTimeCSTDisplay` where missing
- Replace `format(new Date(isoString), 'h:mm a')` with `formatTimeCSTDisplay(isoString)`
- Replace `format(new Date(isoString), 'EEE, MMM d, yyyy')` with CST-aware date formatting
- Replace `format(parseISO(isoString), "yyyy-MM-dd'T'HH:mm")` in SchedulingWidget with `formatInCST()` destructured into date + time
- Replace `new Date(localInput).toISOString()` in SchedulingWidget with `buildCSTDateTime(date, time)`
- Build calendar query date ranges using CST-aware day boundaries

No new dependencies or database changes required.

