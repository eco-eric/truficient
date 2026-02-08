
# Role Permissions Management System

## Overview

This plan implements a comprehensive, database-driven permissions system that allows you (as super_admin) to:

1. **Update user roles** via the existing Users page
2. **Configure granular permissions** for each role via checkboxes
3. **Dynamically show/hide nav items** based on permissions stored in the database
4. **Persist changes** so that when you check/uncheck boxes, the permissions update immediately

---

## Current System Analysis

Currently, permissions are **hardcoded** in `adminNavConfig.ts`:
- Each nav item has `adminOnly: true/false`
- The sidebar filters items based on `isAdmin` from `useUserRole`
- No database-driven granular permissions exist

---

## New Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE PERMISSIONS TABLE                       │
├─────────────────────────────────────────────────────────────────┤
│  role          │  permission_key       │  enabled  │  updated   │
├────────────────┼───────────────────────┼───────────┼────────────┤
│  manager       │  nav.dashboard        │  true     │  2026-02-08│
│  manager       │  nav.customers        │  true     │  2026-02-08│
│  manager       │  nav.submissions      │  true     │  2026-02-08│
│  manager       │  nav.system-pricing   │  false    │  2026-02-08│
│  admin         │  nav.dashboard        │  true     │  2026-02-08│
│  admin         │  nav.system-pricing   │  true     │  2026-02-08│
│  ...           │  ...                  │  ...      │  ...       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Concept**: `super_admin` bypasses all permission checks and always has full access.

---

## Database Changes

### 1. New Table: `role_permissions`

```sql
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage permissions
CREATE POLICY "Super admins can manage permissions"
  ON role_permissions
  FOR ALL
  USING (is_super_admin(auth.uid()));

-- All authenticated users can read (for nav filtering)
CREATE POLICY "Authenticated users can read permissions"
  ON role_permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### 2. Seed Default Permissions

Pre-populate the table with all nav items for `admin` and `manager` roles, defaulting to current `adminOnly` settings.

---

## New UI: Permission Management Page

A new page at `/admin/permissions` (super_admin only) with:

### Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  Role Permissions Management                                    │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: [Admin] [Manager]                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Overview ──────────────────────────────────────────────┐  │
│  │ ☑ Dashboard                                               │  │
│  │ ☑ Abandoned Carts                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── CRM ───────────────────────────────────────────────────┐  │
│  │ ☑ Customers                                               │  │
│  │ ☑ Locations                                               │  │
│  │ ☑ Submissions                                             │  │
│  │ ☑ Pipeline                                                │  │
│  │ ☐ DFW Watch List                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── Operations ────────────────────────────────────────────┐  │
│  │ ☑ Calendar                                                │  │
│  │ ☑ Jobs Board                                              │  │
│  │ ...                                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Behavior
- Clicking a checkbox immediately updates the `role_permissions` table
- Changes take effect on the next page load for affected users
- Toast confirmation on save
- "Select All" / "Deselect All" buttons per section

---

## Code Changes

### 1. New Hook: `useRolePermissions`

```typescript
// src/hooks/useRolePermissions.ts
export const useRolePermissions = () => {
  // Fetches permissions for current user's role
  // Returns a Set of enabled permission_keys
  // super_admin returns ALL permissions enabled
};
```

### 2. Update `adminNavConfig.ts`

Add `permissionKey` to each nav item:

```typescript
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey: string; // e.g., "nav.customers", "nav.system-pricing"
}
```

### 3. Update AdminSidebar

Replace hardcoded `adminOnly` filtering with permission-based filtering:

```typescript
const { permissions, loading } = useRolePermissions();

const visibleSections = navSections
  .map(section => ({
    ...section,
    items: section.items.filter(item => 
      isSuperAdmin || permissions.has(item.permissionKey)
    ),
  }))
  .filter(section => section.items.length > 0);
```

### 4. New Page: `RolePermissions.tsx`

Located at `/admin/permissions` with the checkbox UI shown above.

### 5. Update Users Page

Add a link to "Manage Permissions" for super_admins.

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| CREATE | `supabase/migrations/xxx_add_role_permissions.sql` | New table + seed data |
| CREATE | `src/hooks/useRolePermissions.ts` | Permission fetching hook |
| CREATE | `src/pages/admin/RolePermissions.tsx` | Permission management UI |
| MODIFY | `src/components/admin/adminNavConfig.ts` | Add `permissionKey` to items |
| MODIFY | `src/components/admin/AdminSidebar.tsx` | Use permission-based filtering |
| MODIFY | `src/components/admin/MobileAdminNav.tsx` | Use permission-based filtering |
| MODIFY | `src/App.tsx` | Add route for `/admin/permissions` |

---

## Permission Key Naming Convention

Format: `nav.<section>.<item>` or `nav.<item>`

Examples:
- `nav.dashboard`
- `nav.customers`
- `nav.submissions`
- `nav.system-pricing`
- `nav.gallery`
- `nav.ai-settings`

---

## Security Model

| Role | Behavior |
|------|----------|
| `super_admin` | **Bypasses all checks** - always sees everything |
| `admin` | Sees items where `role_permissions(admin, key) = true` |
| `manager` | Sees items where `role_permissions(manager, key) = true` |

RLS ensures only `super_admin` can INSERT/UPDATE/DELETE permissions.

---

## Testing Checklist

1. Login as super_admin → See all nav items
2. Go to `/admin/permissions` → See permission matrix
3. Uncheck "Gallery" for `admin` role → Save
4. Login as `admin` → Confirm Gallery is hidden
5. Re-check "Gallery" → Login as admin → Confirm Gallery appears
6. Verify manager role permissions work similarly
7. Confirm super_admin always sees everything regardless of database state

---

## Future Enhancements (Not in Scope)

- Data-level permissions (e.g., "can only see own customers")
- Feature flags beyond navigation
- Audit log of permission changes
