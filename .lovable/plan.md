

# Fix: Materials Always Added to Indoor Section Instead of Selected Section

## Problem

When you click "Material" from the **Miscellaneous Outside** section (or Ducting, etc.), the material picker dialog opens but the selected section context is lost. On line 1450, `handleAddMaterial(mat)` is called **without** passing the `currentAddSection` state that was set when the dialog opened. This causes the function to fall back to auto-mapping by category, which defaults most materials to `miscellaneous_inside`.

## Fix

### `src/pages/admin/EstimateBuilder.tsx` (line 1450)

Pass `currentAddSection` as the second argument so the material is placed in the section the user clicked from:

```
// BEFORE:
onClick={() => { handleAddMaterial(mat); }}

// AFTER:
onClick={() => { handleAddMaterial(mat, currentAddSection || undefined); }}
```

This ensures that when you click "Material" from the Outdoor section, the material goes to Outdoor. If `currentAddSection` is null (shouldn't happen in normal flow), it falls back to the existing auto-mapping logic.

## Scope

- One line changed in one file
- No database changes needed

