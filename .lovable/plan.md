

## Prevent Duplicate Estimate Creation Bug

### Problem

After creating and saving a new estimate, there's a race condition that can cause duplicate line items or estimates if the user saves again quickly before the data refetches.

**What happens:**
1. User creates a new estimate with line items (all marked `isNew: true`)
2. User saves → estimate is created, line items are inserted
3. `onSuccess` runs:
   - Sets `lastSavedState` with line items that **still have** `isNew: true`
   - Navigates to `/admin/estimates/[new-id]`
   - Invalidates queries (triggers refetch)
4. If user clicks save again **before** the refetch completes:
   - The line items still have `isNew: true`
   - They get inserted **again** (duplicates)

### Solution

Add protection at two levels:

**1. Clear `isNew` flags after successful save**
After a successful save, update line items state to remove `isNew` flags and add the database-generated IDs (for new items).

**2. Add a "save in progress" guard**
Prevent multiple simultaneous saves by checking if `saveMutation.isPending` before executing the mutation logic. (Already done via `disabled={saveMutation.isPending}`)

**3. Better refetch handling**
After navigating to the new estimate URL, wait for the refetch to complete before allowing another save.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/EstimateBuilder.tsx` | Update save mutation to return created item IDs and update state properly |

### Technical Implementation

**Update the save mutation to:**

1. Return the created line item IDs from the database
2. In `onSuccess`, update the `lineItems` state to:
   - Set `isNew: false` for all items
   - Add the database-generated `id` to newly created items

```typescript
// In mutationFn, after creating line items:
if (itemsToCreate.length > 0) {
  const { data: createdItems, error } = await supabase
    .from('estimate_line_items')
    .insert(newItems)
    .select('id'); // Return the created IDs
  if (error) throw error;
  // Return createdItems for use in onSuccess
}

return { estimateId, createdItemIds: createdItems?.map(i => i.id) || [] };
```

```typescript
// In onSuccess:
onSuccess: ({ estimateId, createdItemIds }) => {
  // Update line items to clear isNew flags and add IDs
  const updatedLineItems = lineItems.map((item, index) => {
    if (item.isNew && !item.isDeleted) {
      const createdItemIndex = itemsToCreate.findIndex(i => i.sort_order === item.sort_order);
      return {
        ...item,
        isNew: false,
        id: createdItemIds?.[createdItemIndex] || item.id,
      };
    }
    return { ...item, isNew: false };
  });
  
  setLineItems(updatedLineItems);
  setLastSavedState({ formData, lineItems: updatedLineItems });
  // ... rest of success handling
}
```

### Simpler Alternative

A simpler approach that achieves the same result:

After successful save, clear the `isNew` flag on all line items before updating `lastSavedState`:

```typescript
onSuccess: (estimateId) => {
  // Clear isNew flags to prevent duplicate inserts on subsequent saves
  const clearedLineItems = lineItems.map(item => ({
    ...item,
    isNew: false,
  }));
  setLineItems(clearedLineItems);
  
  setLastSavedState({ formData, lineItems: clearedLineItems });
  setHasUnsavedChanges(false);
  queryClient.invalidateQueries({ queryKey: ['estimates'] });
  queryClient.invalidateQueries({ queryKey: ['estimate', estimateId] });
  toast.success(isNew ? 'Estimate created successfully' : 'Estimate saved successfully');
  if (isNew) {
    navigate(`/admin/estimates/${estimateId}`);
  }
}
```

This prevents the race condition because even if the user saves again before refetch, the items no longer have `isNew: true`, so they won't be re-inserted.

### Additional Safety: Prevent Duplicate Estimate Creation

To also protect against double-clicking the save button creating two estimates, we can:

1. Add a local `isSaving` ref that's checked at the start of `mutationFn`
2. Use React Query's built-in mutation state (already done with `saveMutation.isPending`)

The buttons are already disabled during pending state, which should prevent this. But we can add an additional guard inside the mutation itself:

```typescript
const saveMutation = useMutation({
  mutationFn: async () => {
    // Double-check not already saving (extra safety)
    if (saveMutation.isPending) return;
    
    let estimateId = id;
    // ... rest of mutation
  },
  // ...
});
```

### Recommended Fix

The simplest and most effective fix is to **clear the `isNew` flags in `onSuccess`**. This is the "Simpler Alternative" approach above.

