

## Speed Up Admin Sidebar Menu Loading

### Root Cause

The sidebar has a **3-step sequential waterfall** of database queries before any nav items appear:

```text
useAuth (getSession + check admin role)  ~300-500ms
       |
       v
useUserRole (fetch role from user_roles)  ~200-400ms
       |
       v
useRolePermissions (fetch permissions from role_permissions)  ~200-400ms
       |
       v
Sidebar finally renders nav items
```

Each hook waits for the previous one to finish loading before it even starts its query. That adds up to 1-2 seconds of blank sidebar on every page navigation.

Additionally, both `useAuth` and `useUserRole` independently query `user_roles` -- `useAuth.checkAdminRole` checks for `role = 'admin'`, and then `useUserRole` queries the same table again for the actual role value. That's a wasted duplicate call.

### Fix Strategy

1. **Cache role and permissions in sessionStorage** so on subsequent page navigations within the same session, the sidebar renders instantly with cached data while fresh data loads in the background.

2. **Remove the duplicate `user_roles` query** from `useAuth` -- it checks admin role separately, but `useUserRole` already does this. The `isAdmin` field in `useAuth` is not used by `ProtectedRoute` (it uses `useUserRole.hasAccess` instead).

3. **Fetch role + permissions in parallel** by combining the `useUserRole` and `useRolePermissions` into a single query path -- once we have the user, fire both queries at the same time instead of waiting for role before fetching permissions.

4. **Show nav items immediately** while permissions load, instead of hiding everything until loading completes.

### Technical Details

**File: `src/hooks/useAuth.ts`**
- Remove the `checkAdminRole` function and its database query
- Remove `isAdmin` from auth state (it's handled by `useUserRole`)
- This eliminates one sequential DB call on every page load

**File: `src/hooks/useUserRole.ts`**
- Add sessionStorage caching: on mount, read cached role and set it immediately (so `loading` starts as `false` if cached)
- After fetching fresh role, write it to sessionStorage
- Clear cache on sign-out

**File: `src/hooks/useRolePermissions.ts`**
- Add sessionStorage caching for permissions
- Initialize from cache so sidebar can render immediately
- For super_admin, skip the permissions query entirely (already done, just needs caching)

**File: `src/components/admin/AdminSidebar.tsx`**
- Remove the dependency on `permissionsLoading` for rendering -- show nav items using cached/current permissions immediately
- The sidebar already doesn't explicitly check `permissionsLoading` before rendering, but the `permissions` Set starts empty, so nothing shows until loaded. With caching, this is solved.

**File: `src/components/admin/ProtectedRoute.tsx`**
- No changes needed -- it already handles loading states correctly

### Expected Result

- First visit after login: ~500ms (single waterfall: auth then role+permissions in parallel)
- Subsequent navigations within session: near-instant (cached data renders immediately, fresh data updates in background)
