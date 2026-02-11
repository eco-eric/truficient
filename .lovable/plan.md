

## Remove "Lead" Role Option from Team Members

Remove the "Lead" option from the Role dropdown in the team member edit/create dialog. The other two roles mentioned (Install Manager and Sales) are not currently present in the dropdown, so no changes needed for those.

### What Changes

The Role dropdown in the Member Dialog currently shows:
- Lead (will be removed)
- Technician
- Apprentice
- Helper

After the change it will show:
- Technician
- Apprentice
- Helper

### Technical Details

**File: `src/pages/admin/Teams.tsx`** (line 1004)
- Remove `<SelectItem value="lead">Lead</SelectItem>` from the Role select dropdown in the `MemberDialog` component
- Update the default role value to ensure it defaults to "technician" instead of potentially defaulting to the removed "lead" value

