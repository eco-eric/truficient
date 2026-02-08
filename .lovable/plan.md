
# Multi-Calendar Filter with Toggle Checkboxes

## Overview

Replace the single-select dropdown with a Google Calendar-style multi-select sidebar that allows you to toggle individual calendars on/off while viewing multiple calendars at once.

---

## Current State

- The calendar page has a `Select` dropdown with "All Calendars" or single calendar options
- Selecting a specific calendar hides all other calendar events
- There's no way to view a subset of calendars (e.g., just Install + Service calendars)

---

## Solution: Calendar Sidebar with Checkboxes

Add a collapsible sidebar panel on the left side of the calendar that shows:
- **CRM Jobs** toggle (always visible, controls job appointment visibility)
- **Google Calendars** section with checkboxes for each synced calendar
- Color indicator next to each calendar name
- "Show All" / "Hide All" quick actions

---

## UI Design

```text
┌─────────────────────┬──────────────────────────────────────┐
│ CALENDARS           │                                      │
│ ─────────────────── │     (Calendar Grid - unchanged)      │
│ ☑ CRM Jobs          │                                      │
│                     │                                      │
│ GOOGLE CALENDARS    │                                      │
│ ☑ ● Install Team    │                                      │
│ ☑ ● Service Team    │                                      │
│ ☐ ● Personal        │                                      │
│                     │                                      │
│ Show All | Hide All │                                      │
└─────────────────────┴──────────────────────────────────────┘
```

---

## Technical Changes

### State Management

Replace the single `selectedCalendarId` state with two pieces of state:
- `showCrmJobs: boolean` - toggles CRM job appointments visibility
- `visibleCalendarIds: Set<string>` - set of Google Calendar IDs currently enabled

Initialize with all calendars visible by default.

### Calendar Sidebar Component

Create a new component `CalendarFilterSidebar.tsx` with:
- Checkbox for CRM Jobs with primary color indicator
- List of Google calendars with colored checkboxes
- Quick toggle buttons (Show All / Hide All)
- Responsive design that collapses on mobile

### Filter Logic Updates

Update the `combinedEvents` memo to:
- Only include CRM job appointments if `showCrmJobs` is true
- Only include Google events from calendars in `visibleCalendarIds`
- Also update the edge function query to only fetch from visible calendars (optimization)

### Layout Changes

- Wrap the calendar controls and grid in a flex container
- Add the sidebar as a fixed-width panel on the left (200-250px)
- On mobile, show as a dropdown/popover instead of sidebar

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Calendar.tsx` | Add sidebar, update state management, update filter logic |
| `src/components/admin/calendar/CalendarFilterSidebar.tsx` | **NEW** - sidebar component with checkbox controls |

---

## Implementation Details

### New Sidebar Component

```tsx
interface CalendarFilterSidebarProps {
  calendars: GoogleCalendar[];
  showCrmJobs: boolean;
  onShowCrmJobsChange: (show: boolean) => void;
  visibleCalendarIds: Set<string>;
  onVisibleCalendarsChange: (ids: Set<string>) => void;
}
```

### Updated State in Calendar.tsx

```tsx
// Before
const [selectedCalendarId, setSelectedCalendarId] = useState<string>("all");

// After
const [showCrmJobs, setShowCrmJobs] = useState(true);
const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());

// Initialize with all calendars visible when data loads
useEffect(() => {
  if (calendars?.length) {
    setVisibleCalendarIds(new Set(calendars.map(c => c.id)));
  }
}, [calendars]);
```

### Updated Event Filtering

```tsx
const combinedEvents = useMemo(() => {
  const events = [];
  
  // Add CRM jobs only if toggle is on
  if (showCrmJobs) {
    appointments?.forEach(apt => { /* ... */ });
  }
  
  // Add Google events only from visible calendars
  googleEvents?.forEach(event => {
    const calendar = calendars?.find(c => c.calendar_id === event.calendarId);
    if (calendar && visibleCalendarIds.has(calendar.id)) {
      // ... add event
    }
  });
  
  return events;
}, [appointments, googleEvents, calendars, showCrmJobs, visibleCalendarIds]);
```

---

## User Experience

After implementation:
1. A sidebar shows all available calendars with checkboxes
2. Click any checkbox to toggle that calendar's events
3. Each calendar shows its assigned color
4. CRM Jobs toggle controls internal appointment visibility
5. "Show All" and "Hide All" buttons for quick selection
6. State persists within the session
