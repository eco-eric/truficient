
# Fix Equipment Pricing Double-Count in Template Builder

## Problem

When adding equipment from System Pricing to a template, the `TemplateBuilder` calculates the price by summing `system_price` + `condenser_price` + `furnace_air_handler_price` + `evap_coil_price` + `heat_kit_price`. But `system_price` already includes those component prices, so they get counted twice.

Example: Mitsubishi 3 Ton system has `system_price` = $4,420.38, plus component prices totaling ~$2,599.35, producing an incorrect total of $7,019.73.

## Solution

Change `handleAddEquipment` in `TemplateBuilder.tsx` to use only `system_price` as the unit cost, since it is the pre-calculated authoritative total. This matches how the system pricing database is documented.

### `src/pages/admin/TemplateBuilder.tsx` (lines 335-361)

Replace the price calculation:

```
// BEFORE (double-counts):
const totalPrice = (parseFloat(equipment.system_price) || 0) +
  (parseFloat(equipment.condenser_price) || 0) +
  (parseFloat(equipment.furnace_air_handler_price) || 0) +
  (parseFloat(equipment.evap_coil_price) || 0) +
  (parseFloat(equipment.heat_kit_price) || 0);

// AFTER (correct):
const totalPrice = parseFloat(equipment.system_price) || 0;
```

This keeps it as a single "system" line item in templates (unlike the Estimate Builder which splits into components), but with the correct price.

One line changed, no database or API changes needed.
