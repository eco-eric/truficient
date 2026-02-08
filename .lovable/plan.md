

# Fix: Role Permissions Page Redirect Race Condition

## Root Cause

The `RolePermissions.tsx` component redirects non-super-admins to `/admin`. However, there's a race condition in the `useUserRole` hook that causes `isSuperAdmin` to be `false` during a brief window when navigating, even for actual super_admin users.

### The Race Condition

```text
Timeline:
1. Component mounts
2. useAuth() returns { user: null, loading: true }
3. useUserRole() effect runs with user=null
4. useUserRole() sets loading=false (no user, nothing to fetch)  <-- BUG: loading now false
5. RolePermissions checks: loading=false, roleLoading=false, isSuperAdmin=false
6. Component renders <Navigate to="/admin"> and redirects  <-- TOO EARLY!
7. (Meanwhile) useAuth() completes, user becomes available
8. (Too late) useUserRole() would now fetch the role
```

---

## Solution

Fix the `useUserRole` hook to properly manage loading state when the user object becomes available after initial mount:

### Changes to `src/hooks/useUserRole.ts`

```typescript
useEffect(() => {
  const fetchRole = async () => {
    // If auth is still loading (user undefined vs null), keep loading
    if (user === undefined) {
      return; // Don't set loading to false yet
    }
    
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // IMPORTANT: Reset loading to true when starting fetch
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('No role found for user');
        setRole(null);
      } else {
        setRole(data.role as AppRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  fetchRole();
}, [user]);
```

However, there's a problem: `user` is typed as `User | null`, not `User | null | undefined`. The real issue is that `useAuth` returns `loading: true` initially, but `useUserRole` doesn't check that.

### Better Fix: Check `authLoading` in `useUserRole`

```typescript
// src/hooks/useUserRole.ts
export const useUserRole = (): UserRoleState => {
  const { user, loading: authLoading } = useAuth();  // <-- Get auth loading state
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      // Wait for auth to complete first
      if (authLoading) {
        return; // Keep loading=true, don't proceed
      }
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Starting fresh fetch
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('No role found for user');
          setRole(null);
        } else {
          setRole(data.role as AppRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading]);  // <-- Add authLoading dependency

  // ... rest unchanged
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useUserRole.ts` | Check `authLoading` before proceeding; reset `loading=true` when starting fetch |

---

## Why This Fixes It

| Before | After |
|--------|-------|
| `authLoading=true` -> useUserRole sets `loading=false` (no user) | `authLoading=true` -> useUserRole keeps `loading=true` |
| RolePermissions sees `roleLoading=false`, `isSuperAdmin=false` | RolePermissions sees `roleLoading=true`, waits |
| Redirects before role is known | Waits for auth + role fetch to complete |
| User is bounced to dashboard | User sees loading spinner, then page loads |

---

## Testing

1. Log out completely
2. Log in as super_admin
3. Navigate directly to `/admin/permissions`
4. Should see loading spinner, then page content (not redirect)
5. Click "Role Permissions" in sidebar
6. Should navigate successfully (no redirect to dashboard)

