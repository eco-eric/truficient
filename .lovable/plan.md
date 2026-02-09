
# Import Address from Job in Calendar Appointment Dialog

## Overview

Add a visible location field to the `JobAppointmentDialog` that auto-populates with the job's address when creating a new appointment. This allows users to see, verify, and optionally edit the location before syncing to Google Calendar.

---

## Current State

- The `location` prop is passed through from `JobDetail` → `JobAppointmentsCard` → `JobAppointmentDialog`
- Currently only used silently when syncing to Google Calendar (line 209)
- Users cannot see or edit the location before syncing

---

## Solution

Add a location input field with a "Use Job Address" button that imports the address from the job.

---

## UI Design

```text
┌─────────────────────────────────────────────────────┐
│ Location                                            │
│ ┌─────────────────────────────────┐ ┌─────────────┐ │
│ │ 1234 Main St, Dallas, TX 75001  │ │ Use Job Addr│ │
│ └─────────────────────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/admin/jobs/JobAppointmentDialog.tsx`

**1. Add location to formData state:**
```tsx
const [formData, setFormData] = useState({
  title: '',
  startDate: '',
  startTime: '08:00',
  endDate: '',
  endTime: '17:00',
  calendarId: '',
  teamId: '',
  notes: '',
  attendeeIds: [] as string[],
  location: ''  // NEW
});
```

**2. Auto-populate location for new appointments:**
```tsx
useEffect(() => {
  if (appointment) {
    // Editing existing - keep existing data
    setFormData({
      // ... existing fields
      location: '' // Could store in DB if needed
    });
  } else {
    // New appointment - auto-populate from job location
    setFormData({
      // ... existing defaults
      location: location || ''  // Pre-fill with job address
    });
  }
}, [appointment, open, location]);
```

**3. Add location input field with import button:**
```tsx
{/* Location */}
<div className="space-y-2">
  <Label className="flex items-center gap-2">
    <MapPin className="h-4 w-4" />
    Location
  </Label>
  <div className="flex gap-2">
    <Input
      value={formData.location}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      placeholder="Event location address"
      className="flex-1"
    />
    {location && formData.location !== location && (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setFormData({ ...formData, location: location })}
      >
        Use Job Address
      </Button>
    )}
  </div>
  {location && (
    <p className="text-xs text-muted-foreground">
      Job address: {location}
    </p>
  )}
</div>
```

**4. Update event payload to use form location:**
```tsx
const eventPayload = {
  summary: `${jobNumber} - ${customerName} - ${formData.title || jobTitle}`,
  description,
  location: formData.location || '',  // Use editable form value
  start: { ... },
  end: { ... },
  attendees: attendees.length > 0 ? attendees : undefined,
};
```

**5. Add MapPin icon import:**
```tsx
import { Calendar, RefreshCw, CheckCircle2, Users, MapPin } from 'lucide-react';
```

---

## Behavior

| Scenario | Location Field Value |
|----------|---------------------|
| New appointment, job has location | Pre-filled with job address |
| New appointment, no job location | Empty |
| Editing existing appointment | Empty (or stored value if we add DB field) |
| User clicks "Use Job Address" | Populated with job location |
| User manually types | Custom address used |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/jobs/JobAppointmentDialog.tsx` | Add location field to form state, add UI input with import button |

---

## Optional Enhancement

To persist the location on saved appointments, a future enhancement could add a `location` column to `crm_job_appointments`. However, for this initial implementation, the location will be:
1. Auto-populated from the job when creating new appointments
2. Editable before sync
3. Sent to Google Calendar with the event
