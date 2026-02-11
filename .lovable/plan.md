

# Fix Equipment Price Display in Template Builder Equipment Picker

## Problem

The previous fix corrected the price assigned when equipment is **added** to the template, but there's a **second** price calculation at lines 547-551 that's used to **display** the price in the equipment selection dialog. This one still double-counts by summing `system_price + condenser_price + furnace_air_handler_price + evap_coil_price + heat_kit_price`.

This means:
- The price shown in the picker dialog is inflated (what the user sees and reports)
- The price actually saved to the line item is now correct (from the earlier fix)

## Fix

### `src/pages/admin/TemplateBuilder.tsx` (lines 547-551)

Replace the double-counted display calculation:

```
// BEFORE (lines 547-551):
const totalPrice = (parseFloat(eq.system_price as any) || 0) +
  (parseFloat(eq.condenser_price as any) || 0) +
  (parseFloat(eq.furnace_air_handler_price as any) || 0) +
  (parseFloat(eq.evap_coil_price as any) || 0) +
  (parseFloat(eq.heat_kit_price as any) || 0);

// AFTER:
const totalPrice = parseFloat(eq.system_price as any) || 0;
```

One line changed in one file. This makes the displayed price in the equipment picker match the actual price that gets saved.

