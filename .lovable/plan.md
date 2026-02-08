
# Fix: Submissions Page Not Showing Data for Super Admins

## Problem Identified

The Submissions page tabs are showing:
- Ducted (0), Contact (0), Landing Page (0), Ductless (0) - all returning zero
- Scanner (3) - working correctly

From the screenshot, you have "Craig James test" and "Dave the man" submissions visible in the dashboard's Recent Submissions widget (which uses a different query), but the Unified Submissions page returns empty for most tabs.

## Root Cause

The RLS (Row Level Security) policies on submission tables don't include `super_admin` in their role checks:

| Table | Current SELECT Policy | Missing Role |
|-------|----------------------|--------------|
| `contact_submissions` | `['admin', 'manager']` | `super_admin` |
| `ducted_estimate_submissions` | `['admin', 'manager']` | `super_admin` |
| `ductless_estimate_submissions` | `['admin', 'manager']` | `super_admin` |
| `landing_page_submissions` | `has_role('admin')` | `super_admin` |
| `equipment_scans` | `USING (true)` - public | N/A (works) |

**Why Scanner works:** The `equipment_scans` table has a public SELECT policy (`USING (true)`), so it bypasses role checks entirely.

**Actual data in database:**
- 17 ducted submissions
- 5 ductless submissions  
- 10 contact submissions
- 0 landing page submissions
- 94 equipment scans

---

## Solution

Update all submission table RLS policies to include `super_admin` in the role checks.

---

## Database Migration

```sql
-- 1. Fix contact_submissions
DROP POLICY IF EXISTS "Admins and managers can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins and managers can update submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON contact_submissions;

CREATE POLICY "Admins and managers can view submissions" 
  ON contact_submissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update submissions" 
  ON contact_submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete submissions" 
  ON contact_submissions FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- 2. Fix ducted_estimate_submissions
DROP POLICY IF EXISTS "Admins and managers can view ducted submissions" 
  ON ducted_estimate_submissions;
DROP POLICY IF EXISTS "Admins and managers can update ducted submissions" 
  ON ducted_estimate_submissions;
DROP POLICY IF EXISTS "Admins can delete ducted submissions" 
  ON ducted_estimate_submissions;

-- (Same pattern: include 'super_admin' in role checks)

-- 3. Fix ductless_estimate_submissions
-- (Same pattern)

-- 4. Fix landing_page_submissions
-- (Same pattern)
```

---

## Tables and Policies to Update

| Table | Policy | Operation | New Role Check |
|-------|--------|-----------|----------------|
| `contact_submissions` | View | SELECT | `super_admin, admin, manager` |
| `contact_submissions` | Update | UPDATE | `super_admin, admin, manager` |
| `contact_submissions` | Delete | DELETE | `super_admin, admin` |
| `ducted_estimate_submissions` | View | SELECT | `super_admin, admin, manager` |
| `ducted_estimate_submissions` | Update | UPDATE | `super_admin, admin, manager` |
| `ducted_estimate_submissions` | Delete | DELETE | `super_admin, admin` |
| `ductless_estimate_submissions` | View | SELECT | `super_admin, admin, manager` |
| `ductless_estimate_submissions` | Update | UPDATE | `super_admin, admin, manager` |
| `ductless_estimate_submissions` | Delete | DELETE | `super_admin, admin` |
| `landing_page_submissions` | View | SELECT | `super_admin, admin` |
| `landing_page_submissions` | Update | UPDATE | `super_admin, admin` |
| `landing_page_submissions` | Delete | DELETE | `super_admin, admin` |

---

## Technical Details

**No frontend code changes required** - the React queries are correct; they're just returning empty arrays because RLS is blocking the SELECT.

**Pattern used:**
```sql
EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('super_admin', 'admin', 'manager')
)
```

This replaces the older `has_role(auth.uid(), 'admin')` calls and explicit `ARRAY['admin', 'manager']` checks with a consistent pattern that includes `super_admin`.

---

## Testing After Fix

1. Navigate to `/admin/submissions`
2. Verify tab counts update:
   - Ducted should show (17)
   - Contact should show (10)  
   - Ductless should show (5)
   - Scanner should remain (3)
3. Click each tab and verify submissions are visible
4. Test status dropdown updates work
5. Test delete functionality (moves to trash)
