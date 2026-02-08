
# Fix: RLS Infinite Recursion on user_roles Table

## What Happened

The comprehensive RLS migration I just ran introduced a critical bug. The policies on the `user_roles` table were updated to use:

```sql
EXISTS (SELECT 1 FROM user_roles WHERE ...)
```

But this creates an infinite recursion because to check if you can access `user_roles`, the policy queries `user_roles`, which triggers the same check again, forever.

Your `super_admin` role is **still in the database** - I verified it exists. You just can't read it because of this recursion error.

---

## Root Cause

The correct pattern for `user_roles` RLS is to use a **SECURITY DEFINER function** that bypasses RLS:

```sql
-- This function runs with owner privileges, bypassing RLS
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
SECURITY DEFINER  -- Key: bypasses RLS
SET search_path = public
AS $$ ... $$;
```

The migration incorrectly replaced calls to `has_role()` with inline `EXISTS` subqueries on the `user_roles` table itself.

---

## Solution

Fix the `user_roles` table policies to NOT query `user_roles` within their own RLS. Instead:

1. **Users can read their own role** - Simple check: `user_id = auth.uid()`
2. **Admins can view all roles** - Use the `has_role()` function (which is SECURITY DEFINER)
3. **Admins can manage roles** - Use the `has_role()` function

---

## Database Migration

```sql
-- Drop the broken policies
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Recreate with correct pattern using SECURITY DEFINER functions

-- 1. Users can always read their own role (no recursion)
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- 2. Admins can view all roles using SECURITY DEFINER function
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- 3. Admins can insert roles using SECURITY DEFINER function
CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- 4. Admins can update roles using SECURITY DEFINER function
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- 5. Admins can delete roles using SECURITY DEFINER function
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
  );

-- Keep bootstrap policy for first admin claim
-- (Already exists and is correct)
```

---

## Why This Fixes It

| Before (Broken) | After (Fixed) |
|-----------------|---------------|
| Policy queries `user_roles` directly | Policy uses `has_role()` function |
| `has_role()` is SECURITY DEFINER | Same - bypasses RLS |
| Creates infinite loop | Function runs with elevated privileges, no recursion |

The `has_role()` function already exists and is defined as `SECURITY DEFINER`, meaning it executes with the function owner's privileges and **bypasses RLS entirely**. This breaks the recursion cycle.

---

## Verification Data

Your `super_admin` role still exists:
```
user_id: 4a05ab76-47d3-4523-8042-8bdcf787488f
role: super_admin
created_at: 2026-01-15
```

The database is fine - it's just the RLS policies blocking access.

---

## Technical Details

**Current Error (flooding logs):**
```
ERROR: infinite recursion detected in policy for relation "user_roles"
```

**Files Changed:** Database migration only - no code changes needed

**Impact:** Once fixed, all admin functionality will immediately work again because other tables' RLS policies can successfully query `user_roles` to check your role.

---

## Testing After Fix

1. Refresh `/admin/settings` - Should show your `super_admin` role
2. Navigate to `/admin/submissions` - Should show all counts
3. Navigate to `/admin/customers` - Should show customer list
4. WorkEdge toggle should persist
