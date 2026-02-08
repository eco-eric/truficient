

# Start Calendar View at 6 AM

## Problem

The calendar time grid currently starts at midnight (12 AM) and requires scrolling down to see business hours where most appointments occur.

## Solution

Two changes are needed:
1. Change the displayed hours to start at 6 AM instead of midnight
2. Auto-scroll the view to 6 AM when the calendar loads

---

## Technical Changes

### File: `src/components/admin/calendar/CalendarView.tsx`

**1. Update the HOURS constant**

Change the hours array to start at 6 AM:

```tsx
// Before
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// After  
const START_HOUR = 6;
const HOURS = Array.from({ length: 24 }, (_, i) => (i + START_HOUR) % 24);
```

**2. Adjust event positioning**

Update `getEventStyle` to account for the 6 AM offset:

```tsx
const getEventStyle = (event: CalendarEvent) => {
  const eventHour = event.start.getHours();
  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
  
  // Adjust for 6 AM start - events before 6 AM appear at top
  const adjustedMinutes = startMinutes - (START_HOUR * 60);
  const topPosition = adjustedMinutes < 0 ? 0 : adjustedMinutes;
  
  // ... rest of styling
  return {
    top: `${(topPosition / 60) * HOUR_HEIGHT}px`,
    // ...
  };
};
```

**3. Handle edge cases**

Events scheduled before 6 AM will still be visible at the top of the grid, just positioned above the 6 AM line (or we can show a small "early hours" section if needed).

---

## Alternative Approach (Recommended)

Instead of reordering hours, keep the full 24-hour grid but **auto-scroll to 6 AM** on mount. This is simpler and preserves the ability to see early morning events:

```tsx
import { useEffect, useRef } from "react";

// Add ref to ScrollArea
const scrollRef = useRef<HTMLDivElement>(null);

// Auto-scroll to 6 AM on mount
useEffect(() => {
  if (scrollRef.current) {
    const scrollPosition = START_HOUR * HOUR_HEIGHT;
    scrollRef.current.scrollTop = scrollPosition;
  }
}, [viewMode]);
```

This way:
- Calendar opens scrolled to 6 AM
- Users can still scroll up to see midnight-6 AM if needed
- No complex event repositioning logic required

---

## Summary

| Change | Description |
|--------|-------------|
| Add `START_HOUR = 6` constant | Define the default starting hour |
| Add scroll ref | Reference to the ScrollArea component |
| Add useEffect | Auto-scroll to 6 AM on component mount |

