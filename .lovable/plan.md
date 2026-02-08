
# Fix Calendar Sync: Add Manual Calendar Import

## Problem

The current sync uses `calendarList` API, which only returns calendars explicitly added to the service account's list. When you share a calendar with a service account, it grants access to the calendar data but **doesn't automatically add it to the service account's calendar list**.

Your screenshot shows you've correctly shared the calendar with "See all event details" permission - the issue is purely a discovery problem.

## Solution

Add a manual "Add Calendar" feature that lets you paste the Calendar ID directly. The edge function will then verify access and add it to your database.

---

## Changes Required

### 1. Update Edge Function

Add a new `add-calendar` action that:
- Takes a calendar ID as input
- Attempts to fetch the calendar metadata directly using `calendars/{calendarId}` endpoint
- If successful, upserts the calendar to the database
- Returns success/error status

### 2. Update CalendarSettings.tsx

Add an "Add Calendar Manually" dialog with:
- Input field for Calendar ID
- Instructions on where to find the Calendar ID
- Submit button that calls the new edge function action
- Success/error feedback

---

## Where to Find Your Calendar ID

In your Google Calendar settings:
1. Click on "Integrate calendar" in the left sidebar
2. Copy the "Calendar ID" - it looks like:
   - `c_abc123...@group.calendar.google.com` (for created calendars)
   - `your-email@domain.com` (for primary calendars)

---

## Technical Details

### Edge Function Addition

```typescript
case "add-calendar": {
  const { calendarId } = params;
  
  // Fetch calendar metadata directly by ID
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!response.ok) {
    throw new Error("Cannot access this calendar. Ensure it's shared with the service account.");
  }
  
  const calData = await response.json();
  
  // Upsert to database
  await supabase.from("google_calendars").upsert({
    calendar_id: calendarId,
    name: calData.summary || calendarId,
    description: calData.description,
    color: calData.backgroundColor || "#4285f4",
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "calendar_id" });
  
  return { success: true, calendar: calData };
}
```

### UI Changes

- Add Plus icon button next to "Sync Calendars"
- Dialog with Input and helpful instructions
- Mutation to call `add-calendar` action

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/google-calendar-sync/index.ts` | Add `add-calendar` action |
| `src/pages/admin/CalendarSettings.tsx` | Add manual calendar dialog |

---

## User Flow After Implementation

1. Click "Add Calendar" button
2. Paste Calendar ID from Google Calendar settings
3. Click Submit
4. System verifies access and adds calendar to list
5. Calendar appears in settings ready to configure
