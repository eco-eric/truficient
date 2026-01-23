# Ducted HVAC Estimator Documentation

## Overview

- **Route**: `/estimate/ducted`
- **Purpose**: Multi-step estimator for ducted HVAC systems (AC + Gas Furnace or Heat Pump)
- **Total Steps**: 11 (Steps 0-10)
- **Main Component**: `src/pages/estimators/ducted/DuctedEstimator.tsx`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DUCTED ESTIMATOR FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0          Step 1         Step 2          Step 3         Step 4       │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │ ZIP  │──────▶│ HOME │──────▶│ HOME │───────▶│INSUL-│──────▶│USAGE │      │
│  │ GATE │       │ TYPE │       │DETAILS│       │ATION │       │PTRNS │      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                                              │
│  Step 5         Step 6         Step 7          Step 8         Step 9        │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │HEAT- │──────▶│SYSTEM│──────▶│ TIER │───────▶│QUOTE │──────▶│ INFO │      │
│  │ ING  │       │ SIZE │       │SELECT│        │RESULT│       │SUBMIT│      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                                    │         │
│                                                              Step 10         │
│                                                              ┌──────┐        │
│                                                              │THANK │        │
│                                                              │ YOU  │        │
│                                                              └──────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/pages/estimators/ducted/
├── DuctedEstimator.tsx           # Main component with step routing
├── context/
│   └── EstimatorContext.tsx      # State management provider
├── hooks/
│   └── useDuctedPricing.ts       # Pricing calculations
├── types/
│   └── index.ts                  # TypeScript interfaces and constants
└── steps/
    ├── Step0ZipCodeGate.tsx      # Service area validation
    ├── Step1HomeType.tsx         # Home type selection
    ├── Step2HomeDetails.tsx      # Layout, sqft, system count
    ├── Step3InsulationFactors.tsx# Attic, windows, age
    ├── Step4UsagePatterns.tsx    # Temperature preferences
    ├── Step5HeatingType.tsx      # Gas vs Heat Pump
    ├── Step6SystemSize.tsx       # Tonnage selection
    ├── Step7EfficiencyTier.tsx   # Efficiency tier selection
    ├── Step8QuoteResults.tsx     # Equipment & pricing display
    ├── Step9CustomerInfo.tsx     # Lead capture form
    └── Step10ThankYou.tsx        # Confirmation page
```

---

## State Management

### Context Provider
**File**: `src/pages/estimators/ducted/context/EstimatorContext.tsx`

### State Interface (`DuctedEstimatorState`)

```typescript
interface DuctedEstimatorState {
  // Navigation
  currentStep: number;
  
  // Zip Gate
  zipCode: string;
  zipCity: string | null;
  zipState: string | null;
  isInServiceArea: boolean | null;
  
  // Home Configuration
  homeType: HomeType | null;           // single_family, townhome, condo, manufactured
  homeLayout: HomeLayout | null;       // single_story, two_story, multi_story
  systemCount: SystemCount;            // 1 or 2
  coverage: Coverage | null;           // whole_home, partial
  squareFootage: SquareFootage | null; // Range categories
  
  // Insulation Factors (affect tonnage)
  atticInsulation: AtticInsulation | null;  // good, average, poor
  windowType: WindowType | null;            // double_pane, single_pane
  homeAge: HomeAge | null;                  // new, mid, old
  
  // Usage Patterns
  hotColdSpots: HotColdSpots | null;
  winterTemp: TempPreference | null;
  summerTemp: TempPreference | null;
  
  // System Selection
  heatingType: HeatingType | null;          // gas_system, heat_pump
  selectedTonnage: number | null;
  recommendedTonnage: number | null;
  scannedEquipmentInfo: {...} | null;       // From equipment scanner
  
  // Equipment Selection
  efficiencyTierId: string | null;
  selectedEquipmentId: string | null;
  selectedAddonIds: string[];
  
  // Customer Info
  customerInfo: CustomerInfo;
  
  // Pricing
  totals: PricingTotals;
}
```

### Context Methods

```typescript
interface EstimatorContextValue {
  state: DuctedEstimatorState;
  
  // Navigation
  goToStep(step: number): void;
  nextStep(): void;
  prevStep(): void;
  
  // Zip Gate
  setZipCode(zipCode: string): void;
  setZipLocation(city: string | null, state: string | null): void;
  setIsInServiceArea(value: boolean | null): void;
  
  // Home Configuration
  setHomeType(type: HomeType | null): void;
  setHomeLayout(layout: HomeLayout | null): void;
  setSystemCount(count: SystemCount): void;
  setCoverage(coverage: Coverage | null): void;
  setSquareFootage(sqft: SquareFootage | null): void;
  
  // Insulation Factors
  setAtticInsulation(value: AtticInsulation | null): void;
  setWindowType(value: WindowType | null): void;
  setHomeAge(value: HomeAge | null): void;
  
  // Usage Patterns
  setHotColdSpots(value: HotColdSpots | null): void;
  setWinterTemp(temp: TempPreference | null): void;
  setSummerTemp(temp: TempPreference | null): void;
  
  // System Selection
  setHeatingType(type: HeatingType | null): void;
  setSelectedTonnage(tonnage: number | null): void;
  setRecommendedTonnage(tonnage: number | null): void;
  setScannedEquipmentInfo(info: {...} | null): void;
  
  // Equipment Selection
  setEfficiencyTierId(id: string | null): void;
  setSelectedEquipmentId(id: string | null): void;
  toggleAddon(addonId: string): void;
  setSelectedAddonIds(ids: string[]): void;
  
  // Customer & Pricing
  setCustomerInfo(info: Partial<CustomerInfo>): void;
  setTotals(totals: PricingTotals): void;
  resetEstimator(): void;
}
```

---

## Step Breakdown

| Step | Component | Purpose | Key State Updates |
|------|-----------|---------|-------------------|
| 0 | `Step0ZipCodeGate` | DFW service area validation | `zipCode`, `isInServiceArea`, `zipCity`, `zipState` |
| 1 | `Step1HomeType` | Home type selection | `homeType` |
| 2 | `Step2HomeDetails` | Layout, sqft, system count | `homeLayout`, `squareFootage`, `systemCount`, `coverage` |
| 3 | `Step3InsulationFactors` | Attic, windows, home age | `atticInsulation`, `windowType`, `homeAge` |
| 4 | `Step4UsagePatterns` | Hot/cold spots, temp prefs | `hotColdSpots`, `winterTemp`, `summerTemp` |
| 5 | `Step5HeatingType` | Gas furnace vs Heat Pump | `heatingType` |
| 6 | `Step6SystemSize` | Tonnage selection | `selectedTonnage`, `recommendedTonnage` |
| 7 | `Step7EfficiencyTier` | Good/Better/Premium/Elite | `efficiencyTierId` |
| 8 | `Step8QuoteResults` | Equipment selection, pricing | `selectedEquipmentId`, `totals`, add-ons |
| 9 | `Step9CustomerInfo` | Lead capture, submission | `customerInfo`, GHL sync triggered |
| 10 | `Step10ThankYou` | Confirmation page | — |

---

## Tonnage Calculation Engine

**File**: `src/pages/estimators/ducted/hooks/useDuctedPricing.ts`

### Adjustment Factors

```typescript
// Attic Insulation Impact
const ATTIC_INSULATION_FACTOR = {
  good: 1.0,      // No adjustment
  average: 1.05,  // +5% capacity needed
  poor: 1.10,     // +10% capacity needed
};

// Window Type Impact
const WINDOW_TYPE_FACTOR = {
  double_pane: 1.0,   // No adjustment
  single_pane: 1.08,  // +8% capacity needed
};

// Home Age Impact
const HOME_AGE_FACTOR = {
  new: 1.0,    // Built after 2000
  mid: 1.05,   // Built 1980-2000
  old: 1.10,   // Built before 1980
};
```

### Tonnage Calculation Logic

```typescript
// 1. Get base tonnage from sizing rules table
const baseTonnage = getBaseTonnageFromRules(homeType, layout, squareFootage);

// 2. Apply adjustment factors
const adjustedTonnage = baseTonnage 
  * ATTIC_INSULATION_FACTOR[atticInsulation]
  * WINDOW_TYPE_FACTOR[windowType]
  * HOME_AGE_FACTOR[homeAge];

// 3. Round to nearest available tonnage
// For variable-speed brands (Trane, Bosch): always round UP
const recommendedTonnage = roundToAvailableTonnage(adjustedTonnage, heatingType);
```

### Square Footage Mapping

```typescript
function getSquareFootageMidpoint(sqft: SquareFootage): number {
  const mapping = {
    "under_1000": 800,
    "1000_1500": 1250,
    "1500_2000": 1750,
    "2000_2500": 2250,
    "2500_3000": 2750,
    "3000_3500": 3250,
    "3500_4000": 3750,
    "4000_plus": 4500,
  };
  return mapping[sqft];
}
```

---

## Pricing Engine

**File**: `src/pages/estimators/ducted/hooks/useDuctedPricing.ts`

### Constants

```typescript
const TAX_RATE = 0.0825;           // 8.25% Texas sales tax
const FINANCING_TERM_MONTHS = 60;  // 60-month financing
const FINANCING_APR = 0.0999;      // 9.99% APR default
```

### Pricing Breakdown Interface

```typescript
interface PricingBreakdown {
  equipmentCost: number;      // From ducted_equipment table
  installationCost: number;   // From ducted_equipment table
  addonsCost: number;         // Sum of selected add-ons
  subtotal: number;           // equipment + installation + addons
  taxAmount: number;          // subtotal * TAX_RATE
  finalTotal: number;         // subtotal + taxAmount
  monthlyPayment: number;     // Calculated financing payment
}
```

### Equipment Matching Logic

```typescript
// Find equipment matching:
// 1. Heating type (gas_system → furnace, heat_pump → heat pump)
// 2. Effective tonnage (after adjustments)
// 3. Efficiency tier ID

const matchingEquipment = equipment.filter(eq => 
  eq.system_type === heatingType &&
  eq.tonnage === effectiveTonnage &&
  eq.efficiency_tier_id === efficiencyTierId &&
  eq.is_active === true
);
```

### Price Range Calculation

```typescript
// For efficiency tier cards, show min-max range
function getPriceRange(baseTonnage: number, tiers: DuctedEfficiencyTier[]) {
  const matchingEquipment = getEquipmentForTonnage(baseTonnage);
  
  return tiers.map(tier => {
    const tierEquipment = matchingEquipment.filter(
      eq => eq.efficiency_tier_id === tier.id
    );
    
    return {
      tierId: tier.id,
      minPrice: Math.min(...tierEquipment.map(eq => eq.equipment_cost + eq.installation_labor)),
      maxPrice: Math.max(...tierEquipment.map(eq => eq.equipment_cost + eq.installation_labor)),
    };
  });
}
```

---

## Database Schema

### `ducted_estimate_submissions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_name` | TEXT | Full name |
| `customer_email` | TEXT | Email address |
| `customer_phone` | TEXT | Phone number |
| `customer_address` | TEXT | Full address |
| `home_type` | TEXT | single_family, townhome, etc. |
| `home_layout` | TEXT | single_story, two_story, multi_story |
| `square_footage` | TEXT | Range category |
| `coverage` | TEXT | whole_home, partial |
| `system_count` | INTEGER | 1 or 2 |
| `heating_type` | TEXT | gas_system, heat_pump |
| `hot_cold_spots` | TEXT | User preference |
| `winter_temp` | TEXT | Temperature preference |
| `summer_temp` | TEXT | Temperature preference |
| `recommended_tonnage` | NUMERIC | Calculated tonnage |
| `efficiency_tier_id` | UUID | FK to ducted_efficiency_tiers |
| `equipment_id` | UUID | FK to ducted_equipment |
| `equipment_cost` | NUMERIC | Equipment price |
| `installation_cost` | NUMERIC | Labor cost |
| `addons_cost` | NUMERIC | Add-ons total |
| `tax_amount` | NUMERIC | Tax amount |
| `final_total` | NUMERIC | Grand total |
| `selected_addons` | JSONB | Array of addon IDs |
| `notes` | TEXT | Additional notes |
| `status` | TEXT | new, contacted, quoted, etc. |
| `ghl_contact_id` | TEXT | GoHighLevel contact ID |
| `ghl_sync_status` | TEXT | pending, synced, failed |
| `created_at` | TIMESTAMP | Submission timestamp |
| `updated_at` | TIMESTAMP | Last update |

### `ducted_equipment`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `brand` | TEXT | Trane, Carrier, Lennox, etc. |
| `system_name` | TEXT | Display name |
| `system_type` | TEXT | gas_system, heat_pump |
| `tonnage` | NUMERIC | 1.5, 2, 2.5, 3, 3.5, 4, 5 |
| `efficiency_tier_id` | UUID | FK to ducted_efficiency_tiers |
| `seer2_rating` | NUMERIC | SEER2 efficiency rating |
| `hspf2_rating` | NUMERIC | HSPF2 for heat pumps |
| `eer2_rating` | NUMERIC | EER2 rating |
| `equipment_cost` | NUMERIC | Equipment price |
| `installation_labor` | NUMERIC | Labor cost |
| `warranty_years` | INTEGER | Warranty period |
| `is_energy_star` | BOOLEAN | Energy Star certified |
| `is_best_value` | BOOLEAN | Featured as best value |
| `is_active` | BOOLEAN | Available for selection |
| `condenser_model` | TEXT | Outdoor unit model |
| `air_handler_model` | TEXT | Indoor unit model |
| `furnace_model` | TEXT | Furnace model (gas systems) |
| `heat_pump_model` | TEXT | Heat pump model |
| `features` | JSONB | Array of feature strings |

### `ducted_efficiency_tiers`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | good, better, premium, elite |
| `display_name` | TEXT | Good, Better, Premium, Elite |
| `description` | TEXT | Tier description |
| `seer_min` | NUMERIC | Minimum SEER for tier |
| `seer_max` | NUMERIC | Maximum SEER for tier |
| `features` | JSONB | Tier features array |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Tier is available |

### `ducted_addons`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Add-on name |
| `description` | TEXT | Description |
| `price` | NUMERIC | Fixed price |
| `icon_name` | TEXT | Lucide icon name |
| `is_popular` | BOOLEAN | Show "Popular" badge |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Available for selection |

### `ducted_tonnage_sizing_rules`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `home_type` | TEXT | single_family, townhome, etc. |
| `layout` | TEXT | single_story, two_story |
| `sq_ft_min` | INTEGER | Min square footage |
| `sq_ft_max` | INTEGER | Max square footage |
| `recommended_tonnage` | NUMERIC | Base tonnage recommendation |
| `notes` | TEXT | Additional notes |
| `is_active` | BOOLEAN | Rule is active |

---

## GHL Integration

### Sync Trigger

The GHL sync is triggered in `Step9CustomerInfo.tsx` after successful form submission:

```typescript
// 1. Insert submission to Supabase
const { data: submission } = await supabase
  .from('ducted_estimate_submissions')
  .insert({ ... })
  .select()
  .single();

// 2. Sync to GHL
const { data: ghlResponse } = await supabase.functions.invoke('sync-ghl-contact', {
  body: {
    firstName: customerInfo.name.split(' ')[0],
    lastName: customerInfo.name.split(' ').slice(1).join(' '),
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    source: 'ducted_estimator',
    tags: ['Ducted Estimator', 'Online Estimate'],
    customFields: {
      quote_raw_details: buildQuoteRawDetails(),
      service_type: heatingType === 'heat_pump' ? 'Heat Pump' : 'AC + Furnace',
      equipment_tonnage: selectedTonnage,
      estimated_total: totals.finalTotal,
    },
  },
});

// 3. Update submission with GHL contact ID
await supabase
  .from('ducted_estimate_submissions')
  .update({ 
    ghl_contact_id: ghlResponse.contactId,
    ghl_sync_status: 'synced'
  })
  .eq('id', submission.id);
```

### Quote Raw Details Format

```
===== DUCTED HVAC ESTIMATE =====
Date: January 23, 2026

----- CUSTOMER INFO -----
Name: John Smith
Email: john@example.com
Phone: (555) 123-4567
Address: 123 Main St, Dallas, TX 75201

----- HOME DETAILS -----
Type: Single Family Home
Layout: Two Story
Square Footage: 2,000 - 2,500 sq ft
System Count: 1

----- SYSTEM CONFIGURATION -----
Heating Type: Heat Pump
Recommended Tonnage: 3.5 tons
Efficiency Tier: Premium (18+ SEER2)

----- SELECTED EQUIPMENT -----
Brand: Trane
System: XR17 Heat Pump
SEER2: 18.0
HSPF2: 9.5
Warranty: 12 years

----- PRICING -----
Equipment: $8,500
Installation: $3,200
Add-ons: $450
Subtotal: $12,150
Tax (8.25%): $1,002.38
TOTAL: $13,152.38

----- FINANCING -----
Monthly (60 mo @ 9.99% APR): $280/mo
```

---

## Financing Integration

**Component**: `src/components/estimators/FinancingOptionsSection.tsx`

```tsx
<FinancingOptionsSection 
  estimatorType="ducted" 
  finalTotal={pricing.finalTotal} 
/>
```

### Display Logic

1. Fetches active plans from `financing_options` where `applies_to` contains `"ducted"`
2. Calculates monthly payment: `finalTotal * plan.payment_factor`
3. Shows promotional offer text
4. Displays APR and term information
5. Includes mandatory Synchrony disclaimers

---

## UI/UX Features

### Header Behavior

```typescript
// Step 0: Full website header
const showStandardHeader = currentStep === 0;

// Steps 1-9: Compact estimator header with logo
const showCompactHeader = currentStep > 0 && currentStep < 10;

// Step 10: No header (thank you page has its own)
```

### Progress Indicator

```typescript
// Shown on steps 1-9 (after zip gate, before thank you)
const showProgress = currentStep > 0 && currentStep < 10;

// 9 visible steps in progress bar
const STEP_LABELS = [
  "Home Type", "Home Details", "Insulation", "Comfort",
  "Heating Type", "System Size", "Efficiency", "Your Quote", "Contact Info"
];
```

### Footer Behavior

```typescript
// Standard footer on step 0 (welcome) and step 10 (thank you)
const showStandardFooter = currentStep === 0 || currentStep === 10;
```

---

## Troubleshooting

### Common Issues

1. **Equipment not showing for tonnage**
   - Check `ducted_equipment` table has active entries for the tonnage/heating type
   - Verify `efficiency_tier_id` matches selected tier

2. **Tonnage calculation seems off**
   - Review adjustment factors in `useDuctedPricing.ts`
   - Check `ducted_tonnage_sizing_rules` for correct ranges

3. **GHL sync failing**
   - Check edge function logs: `supabase--edge-function-logs`
   - Verify `GHL_API_KEY_Contact` secret is set
   - Check `GHL_LOCATION_ID` matches the correct location

4. **Financing not displaying**
   - Verify `financing_options` has entries with `"ducted"` in `applies_to` array
   - Check `is_active` is true for the plans

---

## Related Documentation

- [GHL Integration](./GHL-INTEGRATION.md)
- [Financing Integration](./FINANCING-INTEGRATION.md)
- [Admin Dashboard](./ADMIN-DASHBOARD.md)
- [Ductless Estimator](./DUCTLESS-ESTIMATOR.md)
