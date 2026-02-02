

## Add Multi-Zone Discount to Ductless Estimator

### Overview

Implement a tiered discount system for the ductless estimator where customers receive a 25% discount on certain zones based on a repeating pattern:

| Zone Position | Discount |
|--------------|----------|
| Zone 1 | Full price (0%) |
| Zones 2-4 | 25% off |
| Zone 5 | Full price (0%) |
| Zones 6-8 | 25% off |
| Zone 9 | Full price (0%) |
| Zones 10-12 | 25% off |
| ... | Pattern repeats |

**Pattern Logic**: Every group of 4 zones, the first zone is full price and the next 3 are discounted.

---

### Current Pricing Flow

```text
RoomSelector → usePricing hook → PricingBreakdown
                    ↓
           baseEquipmentCost = sum of each room's unit_type.base_price
                    ↓
           equipmentTotal = baseEquipmentCost × tierMultiplier
                    ↓
           finalTotal = equipmentTotal + addonsTotal - rebates
```

Currently, all zones are priced at full `base_price` regardless of quantity.

---

### Solution Approach

#### Option A: Hardcoded in Pricing Hook (Recommended - Simplest)
Add a discount calculation function directly in `usePricing.ts` with the 25% discount constant. Quick to implement and easy to modify later.

#### Option B: Database-Driven Configuration
Create a new `ductless_pricing_config` table to store discount settings, making them admin-configurable. More flexible but requires additional admin UI.

**Recommendation**: Start with Option A for immediate implementation. The 25% discount is hardcoded but clearly defined in one place. Admin UI can be added later if discount values need frequent adjustment.

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/estimators/ductless/hooks/usePricing.ts` | MODIFY | Add zone discount calculation |
| `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | MODIFY | Display per-zone pricing with discounts |
| `src/pages/estimators/ductless/types/index.ts` | MODIFY | Add discount info to PricingBreakdown type |

---

### Implementation Details

#### 1. Discount Calculation Function

Add to `usePricing.ts`:

```typescript
// Multi-zone discount configuration
const MULTI_ZONE_DISCOUNT_RATE = 0.25; // 25% off
const FULL_PRICE_INTERVAL = 4; // Every 4th zone starting from 1 is full price

/**
 * Determine if a zone (1-indexed position) gets a discount
 * Pattern: Zone 1 = full, Zones 2-4 = discount, Zone 5 = full, Zones 6-8 = discount, etc.
 */
function getZoneDiscount(zonePosition: number): number {
  // Position within the 4-zone cycle (0-3)
  const positionInCycle = (zonePosition - 1) % FULL_PRICE_INTERVAL;
  
  // First position in each cycle (0) = full price, rest get discount
  return positionInCycle === 0 ? 0 : MULTI_ZONE_DISCOUNT_RATE;
}

/**
 * Calculate per-zone pricing with discounts
 */
function calculateZonePricing(
  rooms: RoomConfig[],
  unitTypes: DuctlessUnitType[],
  globalUnitTypeId: string | null
): { perZonePrices: ZonePrice[]; totalEquipment: number; totalSavings: number } {
  let totalEquipment = 0;
  let totalSavings = 0;
  
  const perZonePrices = rooms.map((room, index) => {
    const zonePosition = index + 1; // 1-indexed
    const roomUnitType = unitTypes.find(u => u.id === room.unitTypeId);
    const basePrice = roomUnitType?.base_price || 0;
    
    const discountRate = getZoneDiscount(zonePosition);
    const discountAmount = basePrice * discountRate;
    const finalPrice = basePrice - discountAmount;
    
    totalEquipment += finalPrice;
    totalSavings += discountAmount;
    
    return {
      roomId: room.id,
      roomLabel: room.label,
      basePrice,
      discountRate,
      discountAmount,
      finalPrice,
      zonePosition,
    };
  });
  
  return { perZonePrices, totalEquipment, totalSavings };
}
```

#### 2. Updated PricingBreakdown Type

Add to `types/index.ts`:

```typescript
export interface ZonePrice {
  roomId: string;
  roomLabel: string;
  basePrice: number;
  discountRate: number;      // 0 or 0.25
  discountAmount: number;    // Saved amount
  finalPrice: number;        // After discount
  zonePosition: number;      // 1-indexed position
}

export interface PricingBreakdown {
  // ... existing fields ...
  
  // Multi-zone discount tracking
  perZonePrices: ZonePrice[];
  totalSavings: number;      // Sum of all discounts
}
```

#### 3. Quote Summary Display Updates

Show discounts in the "Configured Zones" section:

```tsx
{state.selectedRooms.map((room, index) => {
  const zonePrice = pricing.perZonePrices.find(z => z.roomId === room.id);
  const hasDiscount = (zonePrice?.discountRate || 0) > 0;
  
  return (
    <li key={room.id} className="text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-[#a5a983]" />
          <span className="font-medium">{room.label}</span>
          {hasDiscount && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              25% OFF
            </span>
          )}
        </div>
        <div className="text-right">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through mr-2">
              {formatMoney(zonePrice.basePrice)}
            </span>
          )}
          <span>{formatMoney(zonePrice?.finalPrice || 0)}</span>
        </div>
      </div>
    </li>
  );
})}

{/* Show total savings if applicable */}
{pricing.totalSavings > 0 && (
  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-sm text-green-700 font-medium">
      Multi-Zone Discount: You're saving {formatMoney(pricing.totalSavings)}!
    </p>
  </div>
)}
```

---

### Example Calculations

| Scenario | Zone 1 | Zone 2 | Zone 3 | Zone 4 | Zone 5 | Total |
|----------|--------|--------|--------|--------|--------|-------|
| Base Price ($3,000 each) | $3,000 | $3,000 | $3,000 | $3,000 | $3,000 | $15,000 |
| After Discount | $3,000 | $2,250 | $2,250 | $2,250 | $3,000 | $12,750 |
| Savings | $0 | $750 | $750 | $750 | $0 | $2,250 |

---

### Visual Indicator in Room Selector

Optionally, show discount preview as users select rooms:

```text
+-------------------------------+
| 3 zones selected              |
| Zone 1: Full price            |
| Zones 2-3: 25% off            |
| Add more rooms for discounts! |
+-------------------------------+
```

---

### Investment Summary Updates

The "Investment Summary" section will show:

```text
Equipment (5 zones)                    $12,750
  └ Multi-zone discount applied         -$2,250

+ Add-ons Total                        $X,XXX
-----------------------------------------
TOTAL                                  $XX,XXX
```

---

### Technical Considerations

1. **Order-independent**: Discounts are based on position in the rooms array, so the order rooms are added determines which get discounts
2. **Tier multiplier applies after discount**: Equipment cost after discounts is then multiplied by the tier factor
3. **Display consistency**: Both the per-zone list and totals will reflect discounted prices
4. **GHL sync**: The quote details sent to CRM will include discount information

---

### Testing Scenarios

After implementation, verify these scenarios:

| Zones | Full Price Zones | Discounted Zones | Expected Savings |
|-------|-----------------|------------------|------------------|
| 1 | 1 | 0 | $0 |
| 2 | 1 | 1 | 25% of Zone 2 |
| 4 | 1 | 3 | 25% of Zones 2-4 |
| 5 | 2 | 3 | 25% of Zones 2-4 |
| 8 | 2 | 6 | 25% of Zones 2-4 + 6-8 |

