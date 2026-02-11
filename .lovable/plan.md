
# Restrict Job Deletion to Super Admin

## What Changes

### `src/pages/admin/Jobs.tsx` (List view)
- Import `useUserRole` hook
- Call `const { isSuperAdmin } = useUserRole()` at the top of the component
- Conditionally render the "Delete" dropdown menu item only when `isSuperAdmin` is true

### `src/pages/admin/JobDetail.tsx` (Detail view)
- Import `useUserRole` hook
- Call `const { isSuperAdmin } = useUserRole()`
- If there is a delete button/action on this page, wrap it with `isSuperAdmin` check

## Technical Detail

Both files get a single-line hook call and a conditional wrapper around the delete UI:

```tsx
import { useUserRole } from '@/hooks/useUserRole';
// ...
const { isSuperAdmin } = useUserRole();

// In the dropdown/menu:
{isSuperAdmin && (
  <DropdownMenuItem className="text-destructive" onClick={...}>
    <Trash2 className="h-4 w-4 mr-2" /> Delete
  </DropdownMenuItem>
)}
```

No database or permission table changes needed -- this is a UI-level gate using the existing role system. The soft-delete mutation already requires authenticated access via RLS.
