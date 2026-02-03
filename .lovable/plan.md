

## Add Multi-Zone Discount Indicators to Ductless Estimator Steps

### Problem Summary

The multi-zone 25% discount **IS correctly implemented** in the pricing engine (`usePricing.ts`) and displayed on the Quote Summary page (Step 7). However, the discount is **NOT visible** on earlier steps where customers are making selections:

| Step | Component | Current State | Needed |
|------|-----------|---------------|--------|
| Step 4 | UnitStyleSelector | Shows full unit prices | Show discount badge on zones 2-4, 6-8, etc. |
| Step 5 | SystemTierComparison | Uses raw base cost | Use discounted equipment total |
| Steps 4-7 | PriceBar | Shows total only | Add "You're saving $X" indicator |

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/estimators/ductless/steps/UnitStyleSelector.tsx` | MODIFY | Add discount badges to multi-room selector |
| `src/pages/estimators/ductless/steps/SystemTierComparison.tsx` | MODIFY | Use discounted base cost and show savings |
| `src/pages/estimators/ductless/components/PriceBar.tsx` | MODIFY | Add savings indicator when discount applies |
| `src/pages/estimators/ductless/DuctlessEstimator.tsx` | MODIFY | Pass savings info to PriceBar |

---

### Implementation Details

#### 1. UnitStyleSelector.tsx - Add Discount Badges

For multi-room selection, show which zones get discounts next to their position:

```tsx
{/* Multi Room: Per-Room Selection with discount badges */}
{!isSingleRoom && (
  <div className="space-y-4 mb-8">
    {state.selectedRooms.map((room, index) => {
      const zonePosition = index + 1;
      const hasDiscount = (zonePosition - 1) % 4 !== 0; // Zones 2-4, 6-8, etc.
      
      return (
        <div key={room.id} className="...">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{room.label}</h4>
                {hasDiscount && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    25% OFF
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {room.recommendedBtu.toLocaleString()} BTU
                {hasDiscount && " • Zone discount applies"}
              </p>
            </div>
            {/* Unit selector dropdown */}
          </div>
        </div>
      );
    })}
  </div>
)}

{/* Add savings preview banner */}
{state.selectedRooms.length >= 2 && (
  <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
    <p className="text-sm text-green-700 font-medium">
      Multi-Zone Discount Active: 25% off zones 2-4, 6-8, and beyond!
    </p>
  </div>
)}
```

#### 2. SystemTierComparison.tsx - Use Discounted Pricing

Update to use `pricing.equipmentTotal` (after discount) instead of calculating raw base cost:

```tsx
export const SystemTierComparison = () => {
  const { state, setSystemTierId, nextStep, prevStep } = useQuote();

  const { tiers, unitTypes, pricing, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  // Use the discounted equipment total from pricing engine
  // Note: pricing.equipmentTotal already has tier applied, 
  // so we need the base after discount
  const discountedBaseEquipment = pricing.baseEquipmentCost - pricing.totalSavings;

  return (
    <StepContainer>
      {/* ... */}
      
      {/* Show savings banner if multi-zone discount applies */}
      {pricing.totalSavings > 0 && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium text-center">
            Multi-Zone Discount: Saving {formatMoney(pricing.totalSavings)} on equipment!
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {tiers.map((tier) => {
          // Use discounted base for tier pricing
          const tierPrice = Math.round(discountedBaseEquipment * tier.price_multiplier);
          
          return (
            <SelectableCard key={tier.id} ...>
              {/* Show original and discounted price */}
              <div className="text-right">
                {pricing.totalSavings > 0 && (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatMoney(Math.round(pricing.baseEquipmentCost * tier.price_multiplier))}
                  </div>
                )}
                <div className="text-lg font-bold text-[#1e3a5f]">
                  {formatMoney(tierPrice)}
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </StepContainer>
  );
};
```

#### 3. PriceBar.tsx - Add Savings Indicator

Update the sticky price bar to show savings when discount applies:

```tsx
interface PriceBarProps {
  label?: string;
  amount: number;
  showRange?: boolean;
  lowAmount?: number;
  highAmount?: number;
  savings?: number;  // NEW: Optional savings amount
}

export const PriceBar = ({ 
  label = "Estimated Total", 
  amount, 
  showRange, 
  lowAmount, 
  highAmount,
  savings = 0 
}: PriceBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e3a5f] text-white py-3 px-4 md:py-4 md:px-6 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-medium">{label}</span>
          {savings > 0 && (
            <span className="text-xs text-green-300 font-medium">
              Saving {formatMoney(savings)} with multi-zone discount
            </span>
          )}
        </div>

        <motion.div key={amount} ...>
          {/* Price display */}
        </motion.div>
      </div>
    </div>
  );
};
```

#### 4. DuctlessEstimator.tsx - Pass Savings to PriceBar

Update the PriceBar invocation to include savings:

```tsx
{/* Price bar */}
{showPriceBar && state.systemTierId && (
  <PriceBar
    label="Estimated Total"
    amount={pricing.finalTotal}
    showRange={showRange}
    lowAmount={pricing.finalTotal}
    highAmount={pricing.finalTotal}
    savings={pricing.totalSavings}  // NEW
  />
)}
```

---

### Visual Indicators Summary

After implementation, users will see discount indicators at every step:

| Step | Visual Indicator |
|------|-----------------|
| Step 4 (Unit Style) | "25% OFF" badge next to zones 2-4, 6-8, etc. |
| Step 4 (Unit Style) | Green banner: "Multi-Zone Discount Active" |
| Step 5 (Tier) | Strikethrough original price, green discounted price |
| Step 5 (Tier) | Green banner showing total savings amount |
| Steps 4-7 (Price Bar) | "Saving $X with multi-zone discount" text |
| Step 7 (Summary) | Full breakdown with per-zone prices (already implemented) |

---

### Testing Scenarios

After implementation, verify these scenarios show discounts correctly:

1. Select 2 rooms → Zone 2 shows "25% OFF", savings appear
2. Select 4 rooms → Zones 2-4 show discount, Zone 1 full price
3. Select 5 rooms → Zone 5 shows full price again
4. Tier selection → Prices reflect discounted base, not full base
5. Price bar → Shows savings amount when 2+ zones selected

