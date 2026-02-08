

# Link Individual Team Members to Calendars

## Overview

Add the ability to associate individual team members with Google Calendars on the Calendar Settings page, similar to the existing "Link to Team" functionality.

---

## Current State

The `google_calendars` table currently supports:
- `linked_job_type_id` - Links calendar to a job type
- `linked_team_id` - Links calendar to a team

**Missing**: No ability to link a calendar to an individual team member (e.g., "Sheyla's Calendar" linked to Sheyla)

---

## Solution

Add a new "Link to Member" dropdown next to the existing "Link to Team" dropdown, allowing calendars to be associated with specific individuals from `crm_team_members`.

---

## UI Design

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ● Sheyla Calendar | Installer                                     Active [●]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Set as Primary      Link to Job Type      Link to Team       Link to Member   │
│  [Make Primary]      [None           ▼]    [None        ▼]    [Sheyla Rios  ▼] │
│                                                                                 │
│  Last synced: 2/8/2026, 5:42:50 PM                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Database Migration

Add a new column to `google_calendars`:

```sql
ALTER TABLE google_calendars 
ADD COLUMN linked_member_id uuid REFERENCES crm_team_members(id) ON DELETE SET NULL;
```

### 2. CalendarSettings.tsx Updates

**Fetch team members:**
```tsx
const { data: teamMembers } = useQuery({
  queryKey: ["team-members"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("crm_team_members")
      .select("id, first_name, last_name, email")
      .eq("is_active", true)
      .order("first_name");
    if (error) throw error;
    return data;
  },
});
```

**Add new dropdown in the grid (4 columns instead of 3):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Existing: Primary, Job Type, Team */}
  
  {/* NEW: Link to Member */}
  <div>
    <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
      <User className="h-4 w-4" />
      Link to Member
    </label>
    <Select
      value={calendar.linked_member_id || "none"}
      onValueChange={(value) =>
        updateCalendarMutation.mutate({
          id: calendar.id,
          linked_member_id: value === "none" ? null : value,
        })
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select member" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {teamMembers?.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.first_name} {m.last_name || ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
```

**Update interface:**
```tsx
interface GoogleCalendar {
  // ... existing fields
  linked_member_id: string | null;  // NEW
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `linked_member_id` column with FK to `crm_team_members` |
| `src/pages/admin/CalendarSettings.tsx` | Add team members query, new dropdown, update interface |

---

## Benefits

- Associate individual team members' calendars with their profiles
- Useful for filtering events by team member
- Complements the team-level linking (a calendar can be linked to both a team AND a specific member)
- Enables future features like "Show only my calendar" for logged-in technicians

