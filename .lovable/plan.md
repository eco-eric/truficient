

# Auto-Calculate Percentage-Based Admin Costs (Commission, Credit Card Fee, Insurance)

## Problem

When adding percentage-based admin costs (Sales Commission, Credit Card Fee, Insurance, etc.), the system currently opens a dialog asking the user to manually type in a "job total." Instead, these should automatically calculate based on the estimate's actual subtotal -- and stay updated as the estimate changes.

## Loop Prevention

Percentage-based items are excluded from their own calculation base. Only non-percentage line items contribute to the base subtotal. This means updating a commission line item does not change the base, so no infinite loop occurs.

```text
Non-percentage items total:    $10,000 (cost)
  x Profit Margin (1.5):       $15,000 (charge) <-- base for percentages

Sales Commission (3%):          $450
Credit Card Fee (2.5%):         $375
Insurance (1.5%):               $225

Grand Total = $15,000 + percentages + tax
```

## Changes to `src/pages/admin/EstimateBuilder.tsx`

### 1. Update `totals` useMemo (line ~379)

Split the subtotal calculation:
- `baseSubtotalCost`: sum of all line items where `unit !== 'est. total'`
- `baseSubtotalCharge`: `baseSubtotalCost * profit_margin` -- stable base for percentage items
- Keep `subtotalCost` and `subtotalCharge` as full totals (including percentage items) for display and grand total

### 2. Simplify `handleAddAdminCost` (line ~619)

When `cost.cost_type === 'percentage'`, skip the dialog entirely. Instead, directly call `addAdminCostLineItem` using `baseSubtotalCharge` as the job total. This applies to Sales Commission, Credit Card Fee, Insurance, and any future percentage-based cost.

### 3. Add auto-recalculation useEffect

Watch `baseSubtotalCharge`. When it changes, find all line items with `unit === 'est. total'` and update:
- `quantity = baseSubtotalCharge`
- `line_total = baseSubtotalCharge * unit_cost`

Since these items are excluded from `baseSubtotalCharge`, updating them cannot trigger another recalculation.

### 4. Remove manual dialog

Delete the following state variables and the associated Dialog component:
- `percentageCostDialogOpen`
- `selectedPercentageCost`
- `jobTotalForPercentage`
- The "Enter Job Total" Dialog JSX (lines ~1669-1725)
- The `handleConfirmPercentageCost` function (lines ~662-679)

## Scope

- One file modified: `src/pages/admin/EstimateBuilder.tsx`
- No database changes needed
- Applies to all percentage-based admin costs (commission, credit card fee, insurance, and any future ones)

