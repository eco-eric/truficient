

## Import Equipment as Editable Itemized Line Items

### Overview

When importing equipment from the System Pricing database into an estimate, instead of adding a single combined line item, the system will create multiple itemized line items for each component. This allows you to:
- See the breakdown of costs (condenser, air handler, coil, etc.)
- Edit individual component prices after import
- Delete components that don't apply to a specific job

---

### Current Behavior

When you click "Add" on a Mitsubishi 3 Ton system:
- Creates 1 line item: "Mitsubishi 3 Ton SUZ| SVZ Ducted System"
- Unit cost: Combined total of all components

### New Behavior

When you click "Add" on a Mitsubishi 3 Ton system:
- Creates multiple line items, one for each component with a price:
  - **Outdoor Unit (SUZ-AA36NL)** — $2,599.35
  - **Air Handler (SVZ-AP36NL)** — $1,821.03
  - **Thermostat (MHK2)** — $320.00
- Each line item is editable (you can change the price)
- Total matches system_price: $4,420.38

---

### Component Breakdown Logic

The import will check for these component fields and create a line item for each:

| Component | Field (Model) | Field (Price) | Line Item Name Format |
|-----------|---------------|---------------|----------------------|
| Outdoor Unit | `condenser_heat_pump_model` | `condenser_price` | "Outdoor Unit (MODEL)" |
| Furnace | `furnace_model` | `furnace_price` | "Gas Furnace (MODEL)" |
| Air Handler | `air_handler_model` | `air_handler_price` | "Air Handler (MODEL)" |
| Evap Coil | `evap_coil_model` | `evap_coil_price` | "Evaporator Coil (MODEL)" |
| Heat Kit | `heat_kit` | `heat_kit_price` | "Electric Heat Kit (MODEL)" |
| Thermostat | `thermostat_model` | `thermostat_price` | "Thermostat (MODEL)" |

Only components with a valid price (> 0) will be added as line items.

---

### UI Changes

**Line Item Display:**
- All equipment component line items will be editable (price input instead of static text)
- Components are grouped together visually since they share the same `equipment_system_id`

**Edit Capability:**
- Change the unit_cost field to an editable input for equipment items
- Changes automatically recalculate line_total and estimate totals

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/EstimateBuilder.tsx` | Update `handleAddEquipment` to create multiple line items for each component |
| `src/components/admin/estimates/EstimateSection.tsx` | Update `SortableRow` to allow price editing for equipment items |

---

### Technical Details

**Updated handleAddEquipment function:**

```typescript
const handleAddEquipment = (equipment: any) => {
  const newItems: LineItem[] = [];
  const baseItem = {
    item_type: 'equipment' as const,
    material_id: null,
    labor_rate_id: null,
    admin_cost_id: null,
    equipment_system_id: equipment.id,
    quantity: 1,
    unit: 'each',
    section: 'equipment_controls' as EstimateSection,
    isNew: true,
  };

  // Add outdoor unit / condenser if present
  if (equipment.condenser_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Outdoor Unit (${equipment.condenser_heat_pump_model || 'Heat Pump/Condenser'})`,
      description: `${equipment.system_type} - ${equipment.tonnage}T`,
      unit_cost: parseFloat(equipment.condenser_price),
      line_total: parseFloat(equipment.condenser_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  // Add furnace if present (gas systems)
  if (equipment.furnace_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Gas Furnace (${equipment.furnace_model || 'Furnace'})`,
      description: equipment.furnace_afue ? `${equipment.furnace_afue}% AFUE` : null,
      unit_cost: parseFloat(equipment.furnace_price),
      line_total: parseFloat(equipment.furnace_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  // Add air handler if present (heat pump systems)
  if (equipment.air_handler_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Air Handler (${equipment.air_handler_model || 'Air Handler'})`,
      description: equipment.air_handler_cfm ? `${equipment.air_handler_cfm} CFM` : null,
      unit_cost: parseFloat(equipment.air_handler_price),
      line_total: parseFloat(equipment.air_handler_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  // Add evap coil if present
  if (equipment.evap_coil_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Evaporator Coil (${equipment.evap_coil_model || 'Evap Coil'})`,
      description: null,
      unit_cost: parseFloat(equipment.evap_coil_price),
      line_total: parseFloat(equipment.evap_coil_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  // Add heat kit if present
  if (equipment.heat_kit_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Electric Heat Kit (${equipment.heat_kit || 'Heat Kit'})`,
      description: null,
      unit_cost: parseFloat(equipment.heat_kit_price),
      line_total: parseFloat(equipment.heat_kit_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  // Add thermostat if present
  if (equipment.thermostat_price > 0) {
    newItems.push({
      ...baseItem,
      name: `Thermostat (${equipment.thermostat_model || 'Thermostat'})`,
      description: null,
      unit_cost: parseFloat(equipment.thermostat_price),
      line_total: parseFloat(equipment.thermostat_price),
      sort_order: lineItems.length + newItems.length,
    });
  }

  if (newItems.length === 0) {
    toast.error('No priced components found for this system');
    return;
  }

  setLineItems([...lineItems, ...newItems]);
  setIsAddDialogOpen(false);
  toast.success(`Added ${newItems.length} components from ${equipment.system_name}`);
};
```

**Updated SortableRow to allow equipment price editing:**

```typescript
// In EstimateSection.tsx, line ~222
<TableCell className="text-right">
  {item.item_type === 'custom' || item.item_type === 'admin_cost' || item.item_type === 'equipment' ? (
    <Input
      type="number"
      min="0"
      step="0.01"
      value={item.unit_cost}
      onChange={(e) => onUpdateItem(actualIndex, 'unit_cost', parseFloat(e.target.value) || 0)}
      className="h-8 w-24 text-right"
    />
  ) : (
    <span className="font-mono">{formatCurrency(item.unit_cost)}</span>
  )}
</TableCell>
```

---

### Example: Mitsubishi 3 Ton System Import

After clicking "Add" on the Mitsubishi system, the Equipment & Controls section will show:

| Type | Item | Qty | Unit | Unit Cost | Line Total |
|------|------|-----|------|-----------|------------|
| 🔧 | Outdoor Unit (SUZ-AA36NL) | 1 | each | **$2,599.35** | $2,599.35 |
| 🔧 | Air Handler (SVZ-AP36NL) | 1 | each | **$1,821.03** | $1,821.03 |
| 🔧 | Thermostat (MHK2) | 1 | each | **$320.00** | $320.00 |

**Bold = editable input field**

You can then adjust any price as needed for the specific job.

---

### Benefits

1. **Transparency**: See exactly what components make up the system cost
2. **Flexibility**: Adjust individual component prices for negotiation or job-specific pricing
3. **Accuracy**: Remove components that aren't needed for a specific installation
4. **Audit Trail**: Clear breakdown for customer-facing estimates

