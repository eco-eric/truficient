
# Add New Roles: Technician, Lead Tech, Installer, Helper

## Security Architecture Review

The current system has proper security in place:
- `user_roles` table with RLS policies using `has_role()` SECURITY DEFINER function
- `role_permissions` table with RLS allowing super_admins to manage, authenticated users to read
- `is_super_admin()` function for critical access control
- Edge function `admin-password-reset` validates admin role server-side before operations

## Implementation Plan

### 1. Database Migration: Add Enum Values

Add the four new roles to the PostgreSQL `app_role` enum:

```sql
ALTER TYPE app_role ADD VALUE 'technician';
ALTER TYPE app_role ADD VALUE 'lead_tech';
ALTER TYPE app_role ADD VALUE 'installer';
ALTER TYPE app_role ADD VALUE 'helper';
```

### 2. Database Migration: Seed Default Permissions

Insert default permission entries (all disabled) for each new role across all 42 permission keys:

```sql
INSERT INTO role_permissions (role, permission_key, enabled)
SELECT r.role::app_role, p.key, false
FROM (VALUES ('technician'), ('lead_tech'), ('installer'), ('helper')) AS r(role)
CROSS JOIN (
  VALUES 
    ('nav.dashboard'), ('nav.abandoned-carts'), ('nav.customers'), ('nav.locations'),
    ('nav.submissions'), ('nav.pipeline'), ('nav.dfw-watchlist'), ('nav.calendar'),
    ('nav.jobs'), ('nav.teams'), ('nav.workedge'), ('nav.job-types'), ('nav.calendars'),
    ('nav.blog'), ('nav.gallery'), ('nav.equipment-library'), ('nav.estimates'),
    ('nav.estimate-templates'), ('nav.system-pricing'), ('nav.customer-equipment'),
    ('nav.ductless-config'), ('nav.materials'), ('nav.labor-rates'), ('nav.admin-costs'),
    ('nav.financing'), ('nav.seo'), ('nav.calculators'), ('nav.landing-pages'),
    ('nav.ghl-tags'), ('nav.ghl-conversations'), ('nav.scanner-analytics'),
    ('nav.button-clicks'), ('nav.analytics'), ('nav.social-media'), ('nav.users'),
    ('nav.permissions'), ('nav.ai-settings'), ('nav.automations'), ('nav.lead-sources'),
    ('nav.campaign-tags'), ('nav.trash-bin'), ('nav.settings')
) AS p(key)
ON CONFLICT (role, permission_key) DO NOTHING;
```

### 3. Update Edge Function: admin-password-reset

Modify the role validation in `supabase/functions/admin-password-reset/index.ts`:

| Current | Updated |
|---------|---------|
| `['admin', 'manager']` | `['super_admin', 'admin', 'manager', 'technician', 'lead_tech', 'installer', 'helper']` |

Also update the admin check to include `super_admin`:

```typescript
// Check if calling user is admin or super_admin
const { data: roleData } = await userClient
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .in('role', ['admin', 'super_admin'])
  .single();
```

### 4. Update TypeScript Type: AppRole

In `src/hooks/useUserRole.ts`:

```typescript
export type AppRole = 'super_admin' | 'admin' | 'manager' | 'technician' | 'lead_tech' | 'installer' | 'helper';
```

Add helper booleans for role detection:

```typescript
const isTechnician = role === 'technician';
const isLeadTech = role === 'lead_tech';
const isInstaller = role === 'installer';
const isHelper = role === 'helper';
const isFieldRole = isTechnician || isLeadTech || isInstaller || isHelper;
```

### 5. Update RolePermissions.tsx

Add tabs for the four new roles in the permission management interface:

```text
Tabs: [Admin] [Manager] [Technician] [Lead Tech] [Installer] [Helper]
```

Update the `AppRole` type definition and permissions state:

```typescript
type AppRole = 'admin' | 'manager' | 'technician' | 'lead_tech' | 'installer' | 'helper';

const [permissions, setPermissions] = useState<Record<AppRole, Record<string, boolean>>>({
  admin: {},
  manager: {},
  technician: {},
  lead_tech: {},
  installer: {},
  helper: {},
});
```

### 6. Update Users.tsx

Add new roles to all dropdown selects:

```tsx
<SelectItem value="technician">Technician</SelectItem>
<SelectItem value="lead_tech">Lead Tech</SelectItem>
<SelectItem value="installer">Installer</SelectItem>
<SelectItem value="helper">Helper</SelectItem>
```

Update role badge variants and Role Legend card to include descriptions for new roles.

---

## Role Badge Color Scheme

| Role | Badge Variant | Description |
|------|---------------|-------------|
| super_admin | destructive (red) | System Configuration |
| admin | default (primary) | Full Access |
| manager | secondary | Management Access |
| technician | outline | Field Technician |
| lead_tech | outline | Lead Technician |
| installer | outline | Installation Crew |
| helper | outline | Helper/Apprentice |

---

## Security Considerations

1. **Existing RLS Policies**: No changes needed - `has_role()` function already handles any valid `app_role` enum value
2. **Edge Function Validation**: Updated to allow super_admin access and accept all new roles
3. **Permission Matrix**: New roles start with ALL permissions DISABLED by default
4. **Super Admin Protection**: Only super_admin can access Role Permissions page (unchanged)
5. **Role Assignment**: Only admin/super_admin can assign roles (RLS enforced)

---

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add 4 enum values + seed 168 permission rows (4 roles × 42 keys) |
| `supabase/functions/admin-password-reset/index.ts` | Accept new roles, check for super_admin |
| `src/hooks/useUserRole.ts` | Update AppRole type, add helper booleans |
| `src/pages/admin/RolePermissions.tsx` | Add 4 new role tabs, update state management |
| `src/pages/admin/Users.tsx` | Add new roles to dropdowns, update role legend |

---

## Implementation Order

1. Run database migration (enum values + permission seeds)
2. Update edge function for role validation
3. Update TypeScript types in useUserRole hook
4. Update RolePermissions page with new tabs
5. Update Users page with new role options
