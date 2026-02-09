

# Fix: Calendar Appointment Dialog Not Scrollable

## Problem
The `JobAppointmentDialog` has many form fields (title, dates, location, team, attendees, calendar, notes, actions) which makes it taller than the viewport. The dialog uses a fixed center position with no overflow scrolling, so the bottom content is unreachable.

## Solution
Add `max-h-[90vh] overflow-y-auto` to the `DialogContent` component in `JobAppointmentDialog.tsx`. This caps the dialog height at 90% of the viewport and enables vertical scrolling when content overflows.

## File to Modify

**`src/components/admin/jobs/JobAppointmentDialog.tsx`** (line 284)

Change:
```tsx
className="max-w-lg"
```
To:
```tsx
className="max-w-lg max-h-[90vh] overflow-y-auto"
```

That's it -- a one-line CSS fix.
