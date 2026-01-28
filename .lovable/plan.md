

## Fix Equipment Price Display in Add Equipment Modal

### Problem

The "Add Equipment" modal is showing an incorrect, elevated price ($7,019.73) for equipment systems. This happens because the display calculation is double-counting by adding `system_price` plus individual component prices.

**Current incorrect calculation (lines 1203-1207):**
```
$7,019.73 = $4,420.38 (system_price) + $2,599.35 (condenser_price) + $0 + $0 + $0
```

**Correct calculation:**
```
$4,420.38 (system_price only)
```

### Root Cause

The `equipment_systems` table stores:
- `system_price`: The **total** price for the complete system (pre-calculated sum of all components)
- Individual component prices (`condenser_price`, `air_handler_price`, etc.): For itemized breakdown

The modal display code is adding `system_price` together with component prices, causing double-counting.

### Solution

Update the price display in the equipment search dialog (line 1203-1207) to use only `system_price`:

**Before:**
```typescript
const totalPrice = (Number(eq.system_price) || 0) +
  (Number(eq.condenser_price) || 0) +
  (Number(eq.furnace_air_handler_price) || 0) +
  (Number(eq.evap_coil_price) || 0) +
  (Number(eq.heat_kit_price) || 0);
```

**After:**
```typescript
const totalPrice = Number(eq.system_price) || 0;
```

### Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/pages/admin/EstimateBuilder.tsx` | 1203-1207 | Remove component price addition, use only `system_price` |

### Result

After this fix:
- Modal preview will show **$4,420.38** (correct `system_price`)
- Importing will still create itemized components with correct individual prices
- Total of imported items will match the modal preview

