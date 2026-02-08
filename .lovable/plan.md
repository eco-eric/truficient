

# Fix: Job Creation Dialog Closing Unexpectedly

## Problem

The job creation dialog closes without saving when you:
1. Click on a Select dropdown option (the dropdown renders in a portal outside the dialog)
2. Click anywhere outside the dialog
3. Press Escape

This is Radix UI Dialog's default behavior - it closes on any "outside interaction."

## Root Cause

Radix Dialog treats clicks on Select dropdowns as "outside clicks" because:
- Select options render in a portal outside the DialogContent
- The dialog sees this as a click on the overlay and closes
- Form data is lost because there's no save protection

## Solution

Add `onInteractOutside` and `onPointerDownOutside` handlers to prevent the dialog from closing unexpectedly, especially when interacting with Select dropdowns.

### Implementation

**File: `src/components/admin/jobs/JobFormDialog.tsx`**

Add event handlers to `DialogContent` that prevent closure when clicking on portal elements (like Select dropdowns):

```typescript
<DialogContent 
  className="max-w-2xl max-h-[90vh] overflow-y-auto"
  onInteractOutside={(e) => {
    // Prevent closing when clicking on portal elements (Select, etc.)
    const target = e.target as HTMLElement;
    if (target?.closest('[data-radix-popper-content-wrapper]')) {
      e.preventDefault();
    }
  }}
  onPointerDownOutside={(e) => {
    // Prevent closing when clicking on portal elements
    const target = e.target as HTMLElement;
    if (target?.closest('[data-radix-popper-content-wrapper]')) {
      e.preventDefault();
    }
  }}
>
```

### Additional Enhancement (Optional)

Add an unsaved changes warning when trying to close with form data:

```typescript
// Track if form has changes
const hasChanges = formData.title || formData.customer_id || formData.job_type_id;

// In DialogContent
onInteractOutside={(e) => {
  const target = e.target as HTMLElement;
  // Allow portal interactions
  if (target?.closest('[data-radix-popper-content-wrapper]')) {
    e.preventDefault();
    return;
  }
  // Warn about unsaved changes
  if (hasChanges) {
    const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
    if (!confirmClose) {
      e.preventDefault();
    }
  }
}}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/jobs/JobFormDialog.tsx` | Add `onInteractOutside` and `onPointerDownOutside` handlers to DialogContent |

---

## Technical Details

### Why This Works

- `onInteractOutside`: Fires when focus moves outside the dialog
- `onPointerDownOutside`: Fires when clicking outside the dialog
- `[data-radix-popper-content-wrapper]`: This data attribute is present on all Radix portal content (Select, Popover, etc.)
- Calling `e.preventDefault()` stops the dialog from closing

### Alternative Approach: Modal Prop

If you want the dialog to never close on outside click, you could also set `modal={false}` on the Dialog, but this changes focus trapping behavior and is less user-friendly.

---

## Testing Checklist

After the fix:
1. Open "New Job" dialog
2. Click on Customer dropdown and select a customer - dialog should stay open
3. Click on Job Type dropdown and select a type - dialog should stay open
4. Click on Priority dropdown and select a priority - dialog should stay open
5. Fill in required fields and click "Create Job" - job should save
6. Click outside the dialog (on the dark overlay) - should either close or warn about unsaved changes
7. Press Escape - should either close or warn about unsaved changes

