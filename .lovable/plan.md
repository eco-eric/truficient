
# Complete Calendar Linking System

## Overview

Implement a comprehensive system for sharing calendar access with team members, including shareable URLs, event assignments, Google Calendar invites, and role-based permissions.

---

## Features to Implement

### 1. Shareable Calendar URL
Generate a link to the admin calendar that team members with appropriate permissions can access directly.

### 2. Assign Team Members to Events
Enhance the `JobAppointmentDialog` to assign individual team members (not just teams) to appointments.

### 3. Google Calendar Invites
When syncing appointments to Google Calendar, include assigned team members as attendees so they receive calendar invites.

### 4. Calendar Permissions via Role System
Use the existing permission system (`nav.calendar`) to control who can view/edit the calendar.

---

## Technical Implementation

### Database Changes

Add an `attendees` column to `crm_job_appointments` to store assigned team member IDs:

```sql
ALTER TABLE crm_job_appointments
ADD COLUMN attendee_member_ids uuid[] DEFAULT '{}';
```

This links appointments to individual team members from `crm_team_members`.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/jobs/JobAppointmentDialog.tsx` | Add multi-select for team member attendees |
| `supabase/functions/google-calendar-sync/index.ts` | Include attendee emails when creating/updating events |
| Database migration | Add `attendee_member_ids` column |

---

### 1. JobAppointmentDialog Enhancements

Add a new section to select individual team members as attendees:

```tsx
// Fetch team members
const { data: teamMembers = [] } = useQuery({
  queryKey: ['crm_team_members_active'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('crm_team_members')
      .select('id, first_name, last_name, email')
      .eq('is_active', true)
      .order('first_name');
    if (error) throw error;
    return data;
  }
});

// Multi-select for attendees
<div className="space-y-2">
  <Label>Attendees (will receive calendar invites)</Label>
  <MultiSelect
    options={teamMembers.map(m => ({
      value: m.id,
      label: `${m.first_name} ${m.last_name || ''}`.trim(),
      email: m.email
    }))}
    selected={formData.attendeeIds}
    onChange={(ids) => setFormData({ ...formData, attendeeIds: ids })}
    placeholder="Select team members..."
  />
</div>
```

---

### 2. Edge Function: Add Attendees to Google Events

When creating or updating Google Calendar events, include attendees:

```typescript
case "create-event": {
  const { calendarId, event, attendees } = params;
  
  // Add attendees if provided
  if (attendees?.length) {
    event.attendees = attendees
      .filter((a: any) => a.email)
      .map((a: any) => ({ email: a.email }));
  }
  
  const createdEvent = await createEvent(accessToken, calendarId, event);
  return new Response(JSON.stringify(createdEvent), { ... });
}
```

Update the `GoogleCalendarEvent` interface:

```typescript
interface GoogleCalendarEvent {
  // ... existing fields
  attendees?: { email: string }[];
}
```

---

### 3. Calendar Access Permissions

The existing permission system already supports calendar access:
- `nav.calendar` - Permission to view the calendar page
- `nav.calendars` - Permission to access calendar settings

Field roles (technician, installer, etc.) start with permissions disabled by default. Super admins can enable calendar access for specific roles via `/admin/permissions`.

**No additional permission changes needed** - the infrastructure is already in place.

---

### 4. Shareable Calendar Link

The calendar is already accessible at `/admin/calendar`. Team members with the `nav.calendar` permission can access it directly.

To make sharing easier, add a "Copy Link" button:

```tsx
// In Calendar.tsx header
<Button 
  variant="outline" 
  size="sm"
  onClick={() => {
    navigator.clipboard.writeText(`${window.location.origin}/admin/calendar`);
    toast.success("Calendar link copied!");
  }}
>
  <Share className="h-4 w-4 mr-1" />
  Copy Link
</Button>
```

---

## Flow Summary

### Scheduling with Invites
1. Admin creates/edits appointment in `JobAppointmentDialog`
2. Selects team + individual attendees (technicians, installers)
3. Clicks "Save & Sync"
4. Edge function creates Google Calendar event with attendees
5. Attendees receive email invites from Google

### Sharing Calendar Access
1. Admin enables `nav.calendar` permission for field roles in `/admin/permissions`
2. Shares calendar link with team members
3. Team members log in and access `/admin/calendar`
4. Calendar shows all appointments based on their filter preferences

---

## UI Changes Summary

### JobAppointmentDialog
- New "Attendees" multi-select section below Team Assignment
- Shows team members with their emails
- Selected attendees will receive Google Calendar invites when synced

### Calendar.tsx Header
- Add "Copy Link" button for easy sharing

---

## Migration Required

```sql
-- Add attendee tracking to appointments
ALTER TABLE crm_job_appointments
ADD COLUMN attendee_member_ids uuid[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN crm_job_appointments.attendee_member_ids IS 
  'Array of crm_team_members IDs who should receive calendar invites';
```

---

## Summary of Deliverables

| Feature | Implementation |
|---------|---------------|
| Shareable URL | Copy link button in Calendar header |
| Assign to events | Multi-select attendees in JobAppointmentDialog |
| Calendar invites | Edge function adds attendees to Google Events |
| User permissions | Existing role permission system (nav.calendar) |
