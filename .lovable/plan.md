

## Plan: Simplify Investment Breakdown in Thank You Dialog

### What needs to change

The "Your Estimate Details" dialog on the Thank You page (Step 11) currently splits the price into "Equipment Package" and "Professional Installation" as separate line items. Per your instructions, these should be combined into a single "Equipment + Install" line showing the full equipment price (which already includes labor, installation & tax).

### Changes

**File: `src/pages/estimators/ducted/steps/Step11ThankYou.tsx` (lines 314-328)**

Replace the two separate line items ("Equipment Package" + "Professional Installation") with:

```
Investment Breakdown
─────────────────────────────────
Equipment + Install          $combined_price
[Addon 1]                    $price
[Addon 2]                    $price
─────────────────────────────────
Total Investment              $total
```

- **"Equipment + Install"** will show `equipmentCost + installationCost` as a single value
- **Add-ons** remain listed individually below
- **Total Investment** stays the same (already correct)

This is a single-file, ~10-line edit.

