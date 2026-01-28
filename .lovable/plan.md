

## Fix Custom Item Typing Bug - Focus Loss Issue

### Problem

When typing in a custom item's name field, the input loses focus after each keystroke, requiring you to click back into the field to continue typing.

### Root Cause

The component uses an unstable key for items that don't have a database ID:
```typescript
key={item.id || `${item.name}-${item.sort_order}`}
```

For new custom items (which don't have an `id` yet), the key includes `item.name`. When you type, the name changes, which changes the key, causing React to:
1. Unmount the old row component
2. Mount a new row component
3. The input in the new component is not focused

This happens in multiple places:
- Line 174: `useSortable({ id: item.id || \`${item.name}-${item.sort_order}\` })`
- Line 353: `items.map(item => item.id || \`${item.name}-${item.sort_order}\`)`
- Line 358: `key={item.id || \`${item.name}-${item.sort_order}\`}`

### Solution

Use a stable identifier that doesn't change when the item name changes. Options:

1. **Use only `sort_order`** - Already unique within the context since items are mapped by position
2. **Generate a stable temporary ID** - Create a UUID when the item is first added

The cleanest fix is to use `sort_order` as the stable identifier for items without a database ID:
```typescript
item.id || `new-${item.sort_order}`
```

This ensures the key stays constant while typing, preventing the focus loss.

---

### Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/components/admin/estimates/EstimateSection.tsx` | 174, 280-281, 353, 358 | Replace `${item.name}-${item.sort_order}` with `new-${item.sort_order}` |

---

### Code Changes

**Line 174** - useSortable hook:
```typescript
// Before
useSortable({ id: item.id || `${item.name}-${item.sort_order}` });

// After
useSortable({ id: item.id || `new-${item.sort_order}` });
```

**Lines 280-281** - handleDragEnd:
```typescript
// Before
const oldIndex = items.findIndex(item => (item.id || `${item.name}-${item.sort_order}`) === active.id);
const newIndex = items.findIndex(item => (item.id || `${item.name}-${item.sort_order}`) === over.id);

// After
const oldIndex = items.findIndex(item => (item.id || `new-${item.sort_order}`) === active.id);
const newIndex = items.findIndex(item => (item.id || `new-${item.sort_order}`) === over.id);
```

**Line 353** - SortableContext items:
```typescript
// Before
items={items.map(item => item.id || `${item.name}-${item.sort_order}`)}

// After
items={items.map(item => item.id || `new-${item.sort_order}`)}
```

**Line 358** - SortableRow key:
```typescript
// Before
key={item.id || `${item.name}-${item.sort_order}`}

// After
key={item.id || `new-${item.sort_order}`}
```

---

### Why This Works

- `sort_order` is assigned when the item is created and stays constant
- The key `new-{sort_order}` remains stable while you edit the name
- Once saved, the item gets a real database `id` which is used instead
- Drag-and-drop still works because the identifiers remain consistent

