
# Fix: Add super_admin to Pipeline RLS Policies

## Problem Identified

The `crm_pipeline_entries` table has RLS policies that only allow `admin` and `manager` roles to INSERT, UPDATE, and DELETE entries. Since you have the `super_admin` role, these operations are being blocked by Row Level Security.

## Root Cause

When the `super_admin` role was added, the existing RLS policies were not updated to include it. The hierarchy should be: `super_admin` > `admin` > `manager`, meaning super admins should have all admin/manager privileges.

## Solution

Update all affected RLS policies across CRM tables to include `super_admin` in the role checks.

---

## Database Migration

Update policies for `crm_pipeline_entries`:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Admins and managers can insert pipeline entries" ON crm_pipeline_entries;
DROP POLICY IF EXISTS "Admins and managers can update pipeline entries" ON crm_pipeline_entries;
DROP POLICY IF EXISTS "Admins can delete pipeline entries" ON crm_pipeline_entries;

-- Recreate with super_admin included
CREATE POLICY "Admins and managers can insert pipeline entries" 
  ON crm_pipeline_entries FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update pipeline entries" 
  ON crm_pipeline_entries FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete pipeline entries" 
  ON crm_pipeline_entries FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );
```

---

## Additional Tables to Review

Other CRM tables likely have the same issue. This fix should also update:

| Table | Policies Affected |
|-------|-------------------|
| `crm_customers` | INSERT, UPDATE, DELETE |
| `crm_interactions` | INSERT, UPDATE, DELETE |
| `crm_locations` | INSERT, UPDATE, DELETE |
| `crm_jobs` | INSERT, UPDATE, DELETE |

---

## Technical Details

**Files Changed:** None (database migration only)

**Migration Approach:**
1. Drop existing INSERT/UPDATE/DELETE policies that reference only `admin` and `manager`
2. Recreate policies with `super_admin` included in the role array
3. Use consistent pattern: `role IN ('super_admin', 'admin', 'manager')`

---

## Testing After Fix

1. Navigate to `/admin/pipeline`
2. Click "Add to Pipeline"
3. Select a customer (Dora Payne is available)
4. Select a stage and submit
5. Verify the card appears in the Kanban board
