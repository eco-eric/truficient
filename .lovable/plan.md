

## Clean Up Installation Cost Comparison - Use Real Database Pricing

### Overview

The ROIComparison component currently shows hardcoded placeholder pricing. This plan updates it to:
1. Display line items WITHOUT individual prices (just the item names as a list)
2. Show only the **total price** at the bottom
3. Pull real Goodman 3-ton pricing from the `ducted_equipment` database table

### Real Pricing Data (from database)

| Item | Gas System | Heat Pump System |
|------|------------|------------------|
| Equipment Cost | $9,062 | $9,062 |
| Installation Labor | $6,500 | $6,500 |
| **Subtotal** | **$15,562** | **$15,562** |
| Federal Tax Credit | N/A | -$2,000 |
| **Final Total** | **$15,562** | **$13,562** |
| **Savings** | | **$2,000** |

### Visual Changes

**Before (current):**
```text
Gas Furnace (80% AFUE)        $4,500
Air Conditioner (14 SEER2)    $5,500
Installation Labor            $3,500
Gas Line & Venting            $1,500
─────────────────────────────────────
Total Investment              $15,000
```

**After (new design):**
```text
Included in your system:
  • Goodman 16 SEER2 Inverter Air Conditioner
  • 80% AFUE Gas Furnace  
  • Evaporator Coil
  • Connected Smart Thermostat
  • Professional Installation
  • 10-Year Warranty
─────────────────────────────────────
Total Investment              $15,562
```

### Technical Approach

The component will fetch real-time data from the database using React Query, matching the existing pattern in `useDuctedPricing.ts`.

**Data Fetching:**
- Query `ducted_equipment` for Goodman 3-ton systems
- Filter by `brand = 'Goodman'`, `tonnage = 3`, `is_active = true`
- Get both `gas_system` and `heat_pump` system types

**Component Updates:**
- Add Supabase query using `useQuery`
- Replace static arrays with dynamic data
- Display line items as bullet points (no prices)
- Show only total price in the highlighted box
- Include loading state handling

### Files to Modify

| File | Change |
|------|--------|
| `src/components/heat-pump/ROIComparison.tsx` | Add database query, restructure UI to show items without prices |

### UI Structure

**Gas Furnace + AC Card:**
- Header with flame icon
- "What's Included:" bullet list:
  - Goodman 16 SEER2 Inverter Air Conditioner
  - 80% AFUE Gas Furnace (60,000 BTU)
  - Evaporator Coil
  - Connected Smart Thermostat
  - Professional Installation
  - 10-Year Warranty
- Total box: **$15,562**
- Cons list (no federal tax credits, separate systems, volatile gas prices)

**Heat Pump System Card:**
- "BEST VALUE" badge
- Header with zap icon
- "What's Included:" bullet list:
  - Goodman 16 SEER2 Inverter Heat Pump
  - Variable Speed Air Handler
  - Backup Heat Kit
  - Connected Smart Thermostat
  - Professional Installation
  - 10-Year Warranty
- Subtotal: $15,562
- Federal Tax Credit: -$2,000 (highlighted in green)
- Total After Credits box: **$13,562**
- Pros list (tax credit, one system, rate protection)

**Savings Highlight Box:**
- Show $2,000 immediate savings (the tax credit)

### Code Pattern

```typescript
// Query for Goodman 3-ton systems
const { data: systems, isLoading } = useQuery({
  queryKey: ['goodman-3-ton-comparison'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('ducted_equipment')
      .select('*')
      .eq('brand', 'Goodman')
      .eq('tonnage', 3)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },
});

// Extract gas and heat pump systems
const gasSystem = systems?.find(s => s.system_type === 'gas_system');
const heatPumpSystem = systems?.find(s => s.system_type === 'heat_pump');

// Calculate totals
const gasTotal = (gasSystem?.equipment_cost || 0) + (gasSystem?.installation_labor || 0);
const heatPumpSubtotal = (heatPumpSystem?.equipment_cost || 0) + (heatPumpSystem?.installation_labor || 0);
const FEDERAL_TAX_CREDIT = 2000;
const heatPumpTotal = heatPumpSubtotal - FEDERAL_TAX_CREDIT;
const savings = gasTotal - heatPumpTotal;
```

### Fallback Values

If the database query fails or returns no data, use these fallback values matching the current database:
- Gas System Total: $15,562
- Heat Pump Total: $13,562
- Savings: $2,000

### Benefits of This Approach

1. **Accuracy**: Prices always match the estimator database
2. **Maintainability**: Price changes in admin panel automatically update this comparison
3. **Cleaner Design**: Focuses on what's included rather than itemized costs
4. **Single Source of Truth**: Uses same data source as the ducted estimator

