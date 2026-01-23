# Ductless Mini-Split Estimator Documentation

## Overview

- **Route**: `/estimate/ductless`
- **Purpose**: Multi-zone mini-split system estimator with per-room configuration
- **Total Steps**: 9 (Steps 0-8)
- **Main Component**: `src/pages/estimators/ductless/DuctlessEstimator.tsx`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUCTLESS ESTIMATOR FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0          Step 1         Step 2          Step 3         Step 4       │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │WELCM │──────▶│ CUST │──────▶│ ROOM │───────▶│ ROOM │──────▶│ UNIT │      │
│  │ HERO │       │ INFO │       │SELECT│        │DETAIL│       │STYLE │      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                                              │
│  Step 5         Step 6         Step 7          Step 8                        │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐                      │
│  │SYSTEM│──────▶│ ADD- │──────▶│QUOTE │───────▶│THANK │                      │
│  │ TIER │       │ ONS  │       │SUMMARY│       │ YOU  │                      │
│  └──────┘       └──────┘       └──────┘        └──────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/pages/estimators/ductless/
├── DuctlessEstimator.tsx         # Main component with step routing
├── context/
│   └── QuoteContext.tsx          # State management provider
├── hooks/
│   └── usePricing.ts             # BTU calculations & pricing
├── types/
│   └── index.ts                  # TypeScript interfaces and constants
├── constants/
│   └── serviceArea.ts            # DFW ZIP code validation
├── components/
│   ├── CTAButton.tsx             # Reusable action button
│   ├── PriceBar.tsx              # Sticky price display bar
│   ├── ProgressIndicator.tsx     # Step progress bar
│   ├── SelectableCard.tsx        # Selection card component
│   └── StepContainer.tsx         # Step wrapper with animations
└── steps/
    ├── WelcomeHero.tsx           # Landing page
    ├── CustomerInfoStep.tsx      # Contact & address
    ├── RoomSelector.tsx          # Room type selection
    ├── RoomDetails.tsx           # Per-room configuration
    ├── UnitStyleSelector.tsx     # Indoor unit type selection
    ├── SystemTierComparison.tsx  # Good/Better/Best tier
    ├── AddOnsSelector.tsx        # Optional upgrades
    ├── QuoteSummary.tsx          # Final quote & submit
    └── ThankYou.tsx              # Confirmation page
```

---

## State Management

### Context Provider
**File**: `src/pages/estimators/ductless/context/QuoteContext.tsx`

### State Interface (`QuoteState`)

```typescript
interface QuoteState {
  currentStep: number;
  selectedRooms: RoomConfig[];        // Array of room configurations
  unitTypeId: string | null;          // Global unit type (if apply to all)
  systemTierId: string | null;        // Selected tier ID
  selectedAddonIds: string[];         // Array of addon IDs
  customerInfo: CustomerInfo;         // Contact details
  totals: PricingTotals;             // Calculated pricing
  applyUnitTypeToAll: boolean;        // Use same unit for all rooms
}
```

### Room Configuration Interface (`RoomConfig`)

```typescript
interface RoomConfig {
  id: string;                         // Unique room ID
  roomType: RoomType;                 // master_bedroom, living_room, etc.
  label: string;                      // Display label
  size: RoomSize;                     // small, medium, large
  ceilingHeight: number;              // in feet (8, 9, 10, 12, 14+)
  sunExposure: SunExposure;           // north, east, south, west
  quantity: number;                   // Number of this room type
  recommendedBtu: number;             // Calculated BTU
  unitTypeId?: string;                // Per-room unit type override
  garageConfig?: GarageConfig;        // Garage-specific settings
}
```

### Garage Configuration (`GarageConfig`)

```typescript
interface GarageConfig {
  isInsulated: boolean;       // Yes = +0, No = +0.25 tons
  isStandalone: boolean;      // Attached = +0, Standalone = +0.5 tons
  hasAtticAbove: boolean;     // Room above = +0, Attic = +0.25 tons
  wantsComfortTemp: boolean;  // Storage = +0, Comfort = +0.25 tons
}
```

### Customer Info Interface

```typescript
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  // Extended address fields from Google Places
  streetAddress?: string;
  formattedAddress?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  placeId?: string;
}
```

### Context Methods

```typescript
interface QuoteContextValue {
  state: QuoteState;
  
  // Navigation
  goToStep(step: number): void;
  nextStep(): void;
  prevStep(): void;
  
  // Room Management
  addRoom(room: RoomConfig): void;
  updateRoom(id: string, updates: Partial<RoomConfig>): void;
  removeRoom(id: string): void;
  setSelectedRooms(rooms: RoomConfig[]): void;
  
  // Equipment Selections
  setUnitTypeId(id: string | null): void;
  setSystemTierId(id: string | null): void;
  setApplyUnitTypeToAll(value: boolean): void;
  
  // Add-ons
  toggleAddon(addonId: string): void;
  setSelectedAddonIds(ids: string[]): void;
  
  // Customer & Pricing
  setCustomerInfo(info: Partial<CustomerInfo>): void;
  setTotals(totals: PricingTotals): void;
  resetQuote(): void;
}
```

---

## Step Breakdown

| Step | Component | Purpose | Key State Updates |
|------|-----------|---------|-------------------|
| 0 | `WelcomeHero` | Landing/hero page | — |
| 1 | `CustomerInfoStep` | Contact & address capture | `customerInfo` |
| 2 | `RoomSelector` | Select room types to condition | `selectedRooms` (basic) |
| 3 | `RoomDetails` | Configure each room (size, ceiling, sun) | `selectedRooms` (detailed), BTU calc |
| 4 | `UnitStyleSelector` | Wall mount, floor mount, ceiling | `unitTypeId` per room or global |
| 5 | `SystemTierComparison` | Good/Better/Best tier selection | `systemTierId` |
| 6 | `AddOnsSelector` | Optional upgrades | `selectedAddonIds` |
| 7 | `QuoteSummary` | Review quote, submit | GHL sync, Supabase insert |
| 8 | `ThankYou` | Confirmation page | — |

---

## BTU Calculation Engine

**File**: `src/pages/estimators/ductless/hooks/usePricing.ts`

### Room Size to Square Footage Mapping

```typescript
const ROOM_SIZE_SQFT = {
  small: 200,   // Up to 250 sq ft
  medium: 325,  // 250-400 sq ft
  large: 500,   // 400-600 sq ft
};
```

### Ceiling Height Multipliers

```typescript
const CEILING_MULTIPLIERS = {
  8: 1.0,    // Standard 8ft
  9: 1.05,   // +5%
  10: 1.10,  // +10%
  12: 1.15,  // +15%
  14: 1.25,  // +25% (vaulted)
};
```

### Sun Exposure Multipliers

```typescript
const SUN_EXPOSURE_MULTIPLIERS = {
  north: 1.0,   // Coolest exposure
  east: 1.05,   // Morning sun
  south: 1.10,  // Full day sun
  west: 1.15,   // Hot afternoon sun
};
```

### Standard BTU Calculation

```typescript
function calculateRoomBtu(room: RoomConfig): number {
  // Base: 20 BTU per square foot
  const baseBtu = ROOM_SIZE_SQFT[room.size] * 20;
  
  // Apply multipliers
  const adjustedBtu = baseBtu 
    * CEILING_MULTIPLIERS[room.ceilingHeight]
    * SUN_EXPOSURE_MULTIPLIERS[room.sunExposure];
  
  // Round to nearest standard size: 6k, 9k, 12k, 15k, 18k, 24k
  return roundToStandardBtu(adjustedBtu);
}
```

### Garage BTU Calculation

```typescript
function calculateGarageBtu(room: RoomConfig): number {
  const config = room.garageConfig;
  
  // Base calculation
  let baseBtu = calculateRoomBtu(room);
  
  // Garage-specific adjustments (in tons, converted to BTU)
  let addedTons = 0;
  
  if (!config.isInsulated) addedTons += 0.25;      // No insulation
  if (config.isStandalone) addedTons += 0.5;       // Detached garage
  if (config.hasAtticAbove) addedTons += 0.25;     // Attic above
  if (config.wantsComfortTemp) addedTons += 0.25;  // Comfort temp
  
  // Convert tons to BTU (1 ton = 12,000 BTU)
  const addedBtu = addedTons * 12000;
  
  return roundToStandardBtu(baseBtu + addedBtu);
}
```

### BTU Breakdown Helper

```typescript
interface BtuBreakdown {
  baseSquareFootage: number;
  baseBtu: number;
  ceilingMultiplier: number;
  sunExposureMultiplier: number;
  garageAdditions?: {
    insulation: number;
    attachment: number;
    attic: number;
    comfort: number;
  };
  finalBtu: number;
}

function getBtuBreakdown(room: RoomConfig): BtuBreakdown {
  // Returns detailed breakdown for display in UI
}
```

---

## Pricing Engine

**File**: `src/pages/estimators/ductless/hooks/usePricing.ts`

### Pricing Constants

```typescript
const TAX_RATE = 0.0825;           // 8.25% Texas sales tax
const FINANCING_TERM_MONTHS = 60;  // Default financing term
const DEFAULT_APR = 0.0999;        // 9.99% APR
```

### Pricing Breakdown Interface

```typescript
interface PricingBreakdown {
  baseEquipmentCost: number;  // Sum of per-room unit prices
  tierMultiplier: number;     // From system tier (e.g., 1.0, 1.15, 1.30)
  equipmentTotal: number;     // baseEquipmentCost * tierMultiplier
  addonsCost: number;         // Sum of selected add-ons
  subtotal: number;           // equipmentTotal + addonsCost
  taxAmount: number;          // subtotal * TAX_RATE
  rebates: number;            // Any applicable rebates
  finalTotal: number;         // subtotal + taxAmount - rebates
  monthlyPayment: number;     // Calculated financing payment
}
```

### Per-Room Unit Pricing

```typescript
// Pricing is based on BTU size from ductless_unit_size_pricing table
function getUnitPriceForRoom(room: RoomConfig, unitTypeId: string): number {
  const sizePricing = unitSizePricing.find(
    p => p.unit_type_id === unitTypeId && p.size_btu === room.recommendedBtu
  );
  return sizePricing?.price ?? 0;
}

// Total equipment cost before tier multiplier
const baseEquipmentCost = selectedRooms.reduce((sum, room) => {
  const unitId = room.unitTypeId ?? globalUnitTypeId;
  return sum + getUnitPriceForRoom(room, unitId);
}, 0);
```

### Tier Multiplier Application

```typescript
// System tiers have price_multiplier values:
// Good: 1.0, Better: 1.15, Best: 1.30

const tierMultiplier = selectedTier?.price_multiplier ?? 1.0;
const equipmentTotal = baseEquipmentCost * tierMultiplier;
```

### Add-on Pricing

```typescript
// Add-ons can be fixed or per-zone
interface DuctlessAddon {
  price: number;
  price_type: "fixed" | "per_zone";
}

const addonsCost = selectedAddons.reduce((sum, addon) => {
  if (addon.price_type === "per_zone") {
    return sum + (addon.price * selectedRooms.length);
  }
  return sum + addon.price;
}, 0);
```

---

## Database Schema

### `ductless_estimate_submissions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_name` | TEXT | Full name |
| `customer_email` | TEXT | Email address |
| `customer_phone` | TEXT | Phone number |
| `customer_address` | TEXT | Street address |
| `customer_city` | TEXT | City |
| `customer_county` | TEXT | County |
| `customer_state` | TEXT | State (TX) |
| `customer_zip` | TEXT | ZIP code |
| `google_place_id` | TEXT | Google Places ID |
| `zone_count` | INTEGER | Number of zones |
| `selected_rooms` | JSONB | Array of RoomConfig objects |
| `unit_type_id` | UUID | FK to ductless_unit_types |
| `system_tier_id` | UUID | FK to ductless_system_tiers |
| `selected_addons` | JSONB | Array of addon IDs |
| `subtotal` | NUMERIC | Pre-tax total |
| `tax_amount` | NUMERIC | Tax amount |
| `rebates` | NUMERIC | Applied rebates |
| `final_total` | NUMERIC | Grand total |
| `notes` | TEXT | Additional notes |
| `status` | TEXT | new, contacted, quoted, etc. |
| `created_at` | TIMESTAMP | Submission timestamp |
| `updated_at` | TIMESTAMP | Last update |

### `ductless_unit_types`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Internal name |
| `display_name` | TEXT | Display name |
| `description` | TEXT | Description |
| `base_price` | NUMERIC | Fallback base price |
| `benefits` | JSONB | Array of benefit strings |
| `image_url` | TEXT | Unit image URL |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Available for selection |

### `ductless_unit_size_pricing`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `unit_type_id` | UUID | FK to ductless_unit_types |
| `size_btu` | INTEGER | BTU size (6000, 9000, etc.) |
| `size_tons` | NUMERIC | Ton equivalent |
| `price` | NUMERIC | Price for this size |
| `is_available` | BOOLEAN | Size is available |
| `sort_order` | INTEGER | Display order |

### `ductless_system_tiers`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | good, better, best |
| `display_name` | TEXT | Good, Better, Best |
| `tier_level` | TEXT | good, better, best |
| `description` | TEXT | Tier description |
| `price_multiplier` | NUMERIC | 1.0, 1.15, 1.30 |
| `features` | JSONB | Feature list |
| `seer_rating` | NUMERIC | SEER efficiency rating |
| `warranty_years` | INTEGER | Warranty period |
| `is_featured` | BOOLEAN | Show "Recommended" badge |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Tier is available |

### `ductless_addons`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Add-on name |
| `description` | TEXT | Description |
| `price` | NUMERIC | Price (fixed or per-zone) |
| `price_type` | TEXT | "fixed" or "per_zone" |
| `icon_name` | TEXT | Lucide icon name |
| `is_popular` | BOOLEAN | Show "Popular" badge |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Available for selection |

---

## GHL Integration

### Sync Trigger

The GHL sync is triggered in `QuoteSummary.tsx`:

```typescript
// Submit to Supabase
const { data: submission } = await supabase
  .from('ductless_estimate_submissions')
  .insert({ ... })
  .select()
  .single();

// Sync to GHL
await supabase.functions.invoke('sync-ghl-contact', {
  body: {
    firstName: customerInfo.name.split(' ')[0],
    lastName: customerInfo.name.split(' ').slice(1).join(' '),
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.formattedAddress,
    source: 'ductless_estimator',
    tags: ['Ductless Estimator', 'Mini-Split', 'Online Estimate'],
    customFields: {
      quote_raw_details: buildQuoteRawDetails(),
      service_type: 'Ductless Mini-Split',
      zone_count: selectedRooms.length,
      estimated_total: pricing.finalTotal,
    },
  },
});
```

### Quote Raw Details Format

```
===== DUCTLESS MINI-SPLIT ESTIMATE =====
Date: January 23, 2026

----- CUSTOMER INFO -----
Name: Jane Smith
Email: jane@example.com
Phone: (555) 987-6543
Address: 456 Oak Ave, Plano, TX 75024

----- ZONE CONFIGURATION -----
Total Zones: 3

Zone 1: Master Bedroom
  Size: Large (400-600 sq ft)
  Ceiling: 9 ft
  Sun Exposure: West
  Recommended BTU: 15,000
  Unit Type: Wall Mount

Zone 2: Living Room
  Size: Large (400-600 sq ft)
  Ceiling: 10 ft
  Sun Exposure: South
  Recommended BTU: 18,000
  Unit Type: Wall Mount

Zone 3: Home Office
  Size: Medium (250-400 sq ft)
  Ceiling: 8 ft
  Sun Exposure: North
  Recommended BTU: 9,000
  Unit Type: Wall Mount

----- SYSTEM TIER -----
Tier: Better
SEER Rating: 20
Warranty: 10 years

----- ADD-ONS -----
• WiFi Smart Controller (+$199 x 3 zones = $597)
• Extended Warranty (+$299)

----- PRICING -----
Equipment (3 zones): $12,500
Tier Multiplier (1.15x): $14,375
Add-ons: $896
Subtotal: $15,271
Tax (8.25%): $1,259.86
TOTAL: $16,530.86

----- FINANCING -----
Monthly (60 mo @ 9.99% APR): $352/mo
```

### Email My Quote Feature

```typescript
const handleEmailQuote = async () => {
  await supabase.functions.invoke('sync-ghl-contact', {
    body: {
      email: customerInfo.email,
      source: 'ductless_estimator_save_quote',
      tags: ['Quote Saved', 'Ductless Estimator'],
      customFields: {
        quote_raw_details: buildQuoteRawDetails(),
      },
    },
  });
  
  toast.success("Quote saved! Check your email.");
};
```

---

## Financing Integration

**Component**: `src/components/estimators/FinancingOptionsSection.tsx`

```tsx
<FinancingOptionsSection 
  estimatorType="ductless" 
  finalTotal={pricing.finalTotal} 
/>
```

### Display Logic

1. Fetches active plans from `financing_options` where `applies_to` contains `"ductless"`
2. Calculates monthly payment: `finalTotal * plan.payment_factor`
3. Shows promotional offer text
4. Displays APR and term information
5. Includes mandatory Synchrony disclaimers

---

## UI/UX Features

### Price Bar

```typescript
// Shown on steps 4-7 (tier selection through summary)
const showPriceBar = currentStep >= 4 && currentStep <= 7;

// Shows range when tier selected but not all rooms have units
const showRange = state.systemTierId && !allRoomsHaveUnits;
```

### Header Behavior

```typescript
// Step 0: Full website header
const showStandardHeader = currentStep === 0;

// Steps 1-7: Compact estimator header
const showHeader = currentStep > 0 && currentStep < 8;
```

### Progress Indicator

```typescript
// Shown on steps 1-7
const showProgress = currentStep > 0 && currentStep < 8;

const STEP_LABELS = [
  "Your Info", "Select Rooms", "Room Details", "Unit Style",
  "System Tier", "Add-ons", "Your Quote"
];
```

### Room Type Options

```typescript
const ROOM_TYPE_OPTIONS = [
  { type: "master_bedroom", label: "Master Bedroom", icon: "BedDouble", allowMultiple: false },
  { type: "living_room", label: "Living Room", icon: "Sofa", allowMultiple: false },
  { type: "kitchen", label: "Kitchen", icon: "ChefHat", allowMultiple: false },
  { type: "home_office", label: "Home Office", icon: "Monitor", allowMultiple: false },
  { type: "bedroom", label: "Bedroom", icon: "Bed", allowMultiple: true },
  { type: "dining_room", label: "Dining Room", icon: "UtensilsCrossed", allowMultiple: false },
  { type: "bonus_room", label: "Bonus Room", icon: "Gamepad2", allowMultiple: true },
  { type: "basement", label: "Basement", icon: "Home", allowMultiple: false },
  { type: "garage", label: "Garage", icon: "Car", allowMultiple: false },
  { type: "sunroom", label: "Sunroom", icon: "Sun", allowMultiple: false },
];
```

---

## Troubleshooting

### Common Issues

1. **BTU calculation seems wrong**
   - Check room size mapping in `usePricing.ts`
   - Verify ceiling/sun exposure multipliers
   - For garages, check all config options

2. **Unit price not found**
   - Verify `ductless_unit_size_pricing` has entry for BTU size + unit type
   - Check `is_available` is true

3. **System tier not applying multiplier**
   - Verify tier has correct `price_multiplier` value
   - Check tier `is_active` is true

4. **Add-ons pricing wrong**
   - Check `price_type` is correct (fixed vs per_zone)
   - Verify zone count for per-zone pricing

5. **GHL sync failing**
   - Check edge function logs
   - Verify all required fields are present
   - Check `GHL_API_KEY_Contact` secret

---

## Related Documentation

- [GHL Integration](./GHL-INTEGRATION.md)
- [Financing Integration](./FINANCING-INTEGRATION.md)
- [Admin Dashboard](./ADMIN-DASHBOARD.md)
- [Ducted Estimator](./DUCTED-ESTIMATOR.md)
