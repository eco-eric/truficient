

## Problem: Permission Matrix Out of Sync with Sidebar

### Root Cause

There's a **default-value mismatch** between two parts of the system:

1. **Permission Matrix UI** (`RolePermissions.tsx` line 232): `permissions[role][item.permissionKey] ?? true` — when a permission key has **no row** in the database, the checkbox shows as **checked** (defaults to `true`).

2. **Sidebar filtering** (`useRolePermissions.ts`): Only loads rows where `enabled = true` into a `Set`, then `hasPermission()` checks `permissions.has(permissionKey)` — if there's **no row**, the item is **denied** (defaults to `false`).

So the Matrix shows items as enabled when they're actually blocked in the sidebar. When you click to "disable" an item that looks checked, it writes `enabled: false` to the DB — but the sidebar was already denying it. Clicking again writes `enabled: true`, which should work, but the visual state is inverted the whole time.

**Additionally**: Gary's browser caches permissions in `sessionStorage` (`cached_permissions`), so even after you change permissions, his session won't pick them up until he refreshes or the cache is cleared.

### Plan

**1. Fix the default value in Permission Matrix (RolePermissions.tsx)**
- Change line 232: `?? true` → `?? false`
- This makes the checkboxes accurately reflect what the sidebar enforces — unchecked means denied

**2. Fix the toggle logic (same file, line ~90)**  
- `const currentValue = permissions[role][permissionKey] ?? true` → `?? false`
- So toggling correctly flips from the real state

**3. Clear stale session cache on permission save**
- After a successful upsert in the Permission Matrix, the target user (Gary) still has stale `sessionStorage`. This is inherent to client-side caching — we can't clear his cache remotely. However, we should add a note/toast reminding the admin that affected users need to refresh their browser.

### Files to Edit
- `src/pages/admin/RolePermissions.tsx` — fix `?? true` → `?? false` in two places (lines 90 and 232), add admin toast note about user refresh

### What This Fixes
After this change, when you open the Lead Tech tab, you'll see only the 8 items that are actually enabled (Dashboard, Customers, Locations, Calendar, Jobs, Teams, WorkEdge, Job Types) checked — matching Gary's sidebar screenshot exactly. Toggling additional items on will immediately take effect for Gary on his next page refresh.

