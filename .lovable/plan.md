
# Fix: WorkEdge Toggle Not Persisting

## Problem Identified

The toggle switch for enabling WorkEdge integration doesn't work because the RLS (Row Level Security) policy on the `integration_configs` table only allows users with the `admin` role. Since you have the `super_admin` role, you're blocked from both reading and writing to this table.

## Root Cause

The RLS policy was created with:
```sql
CREATE POLICY "Admins can manage integration configs"
ON public.integration_configs FOR ALL
USING (has_role(auth.uid(), 'admin'))
```

This explicitly checks for `admin` role only. The `super_admin` role is excluded, so the query returns 0 rows and the toggle appears to do nothing.

---

## Solution

Update the RLS policy to include `super_admin` in the role check. This is the same pattern we used for the CRM tables earlier.

---

## Database Migration

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage integration configs" ON public.integration_configs;

-- Recreate with super_admin included
CREATE POLICY "Admins can manage integration configs"
ON public.integration_configs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('super_admin', 'admin')
  )
);
```

---

## Additional Tables to Fix

The same issue likely exists for other WorkEdge tables. These should be updated too:

| Table | Current Policy | Fix |
|-------|----------------|-----|
| `workedge_sync_log` | `has_role(auth.uid(), 'admin')` | Include `super_admin` |
| `workedge_project_media` | `has_role(auth.uid(), 'admin')` | Include `super_admin` |

---

## Recommended Frontend Improvement

Additionally, the current mutation doesn't provide feedback when it fails. After fixing RLS, we should also add optimistic updates and proper error handling to the toggle so the UI correctly reflects the actual state.

**Current code (line 481-484):**
```tsx
<Switch
  checked={config?.is_active}
  onCheckedChange={(checked) => updateConfigMutation.mutate({ is_active: checked })}
/>
```

**Problem:** If `config` is undefined (due to RLS blocking), `checked={undefined}` makes the Switch uncontrolled, causing the "reverts when clicking away" behavior.

**Fix:** Add proper loading state and optimistic update handling.

---

## Technical Details

**Files to Change:**
- Database migration (RLS policy updates)
- `src/pages/admin/WorkEdgeProjects.tsx` (optional: improved toggle handling)

**Why the Toggle Reverts:**
1. RLS blocks the SELECT query → `config` is `undefined`
2. Switch shows as unchecked (because `undefined` is falsy)
3. User toggles it → mutation fires but UPDATE is blocked by RLS
4. Query is invalidated → still returns `undefined` → switch appears off again

---

## Testing After Fix

1. Navigate to `/admin/workedge`
2. Go to **Settings** tab
3. Toggle "Enable WorkEdge Integration" to ON
4. Navigate away and back
5. Verify toggle remains ON
