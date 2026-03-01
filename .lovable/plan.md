

## Investigation Results

The ducted estimator's add-on infrastructure is fully intact:
- **Context** (`EstimatorContext.tsx`): `selectedAddonIds`, `toggleAddon`, `setSelectedAddonIds` all present
- **Pricing hook** (`useDuctedPricing.ts`): Fetches from `ducted_addons` table, calculates `addonsCost`, `addonsBreakdown`
- **Quote display** (`Step10QuoteResults.tsx`): Renders add-on line items and includes them in submission
- **Thank you** (`Step11ThankYou.tsx`): Shows add-on breakdown in the PDF/summary

**The problem**: There is no add-on selection step component in the ducted flow. The step sequence goes directly from Step 7 (What's Included) → Step 8 (Customer Info), skipping any add-on picker. Users never get a chance to select add-ons.

## Plan

### 1. Create a new `Step8AddOns.tsx` component
- Model it after the ductless `AddOnsSelector.tsx`, adapted for the ducted context
- Use `useEstimator()` for state and `useDuctedPricing()` for fetching `ducted_addons`
- Display add-on cards with icon, name, description, price, and popular badge
- Include a "Skip Add-ons" option when none are selected
- Match the existing ducted estimator styling (navy `#1e3a5f`, gold `#d4a84b`)

### 2. Renumber steps 8-11 → 9-12 in `DuctedEstimator.tsx`
- Rename existing imports: `Step8CustomerInfo` → rendered at step 9, `Step9EfficiencyTier` → step 10, `Step10QuoteResults` → step 11, `Step11ThankYou` → step 12
- Insert `Step8AddOns` at case 8 in the switch
- Update `STEP_LABELS` array to include "Add-ons" at index 8
- Update progress indicator `totalSteps` from 10 to 11
- Update header/footer visibility conditions (thank you is now step 12)

### 3. Update step labels and progress
- New labels: Location, Home Type, Home Details, Insulation, Comfort, Heating Type, System Size, What's Included, **Add-ons**, Contact Info, Efficiency, Your Quote, Thank You
- Adjust `showProgress`, `showCompactHeader`, `showStandardFooter` boundaries to account for the new 13-step flow (0-12)

