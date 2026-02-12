

## Fix: Date Selection Being Reset in Appointment Dialog

### Root Cause
In `JobAppointmentDialog.tsx`, the form-reset `useEffect` (line 95) has `existingCalendarLinks` in its dependency array (line 125). React Query returns a new array reference on each render cycle, causing this effect to fire repeatedly -- resetting the form (including dates) back to the original appointment values every time.

### Solution
Remove `existingCalendarLinks` from the `useEffect` dependency array and instead load calendar link data only once when the dialog opens or the appointment changes. Use a separate, controlled initialization approach.

### Technical Details

**File: `src/components/admin/jobs/JobAppointmentDialog.tsx`**

1. Remove `existingCalendarLinks` from the dependency array of the form-reset `useEffect` (line 125)
2. Add a separate `useEffect` that sets `calendarIds` only when `existingCalendarLinks` transitions from empty to populated (initial load), using a ref to track whether calendar IDs have been initialized for the current appointment
3. This ensures:
   - The form initializes correctly with saved calendar selections when editing
   - Typing into date/time fields no longer triggers a full form reset
   - All other form behavior remains unchanged

**Changes summary:**
- Add a `useRef` to track calendar link initialization state
- Split the single reset effect into two: one for core appointment fields (depends on `appointment`, `open`, `location`) and one for calendar IDs (depends on `existingCalendarLinks` with guarded logic)
- Reset the ref when `appointment?.id` changes

