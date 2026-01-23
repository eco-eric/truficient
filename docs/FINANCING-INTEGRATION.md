# Financing Integration Documentation

> Last Updated: January 2026

## Overview

This document describes how financing options are managed in the admin dashboard and displayed in the ducted and ductless estimators. The system uses Synchrony Bank financing with configurable plans.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD                                    │
│                   /admin/financing                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Financing Options Manager                       │   │
│  │  - Create/Edit financing plans                                   │   │
│  │  - Set APR, payment factors, terms                               │   │
│  │  - Toggle active status                                          │   │
│  │  - Assign to estimator types (ducted/ductless)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                                     │
│                  financing_options table                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  id | plan_name | promotional_offer | interest_rate | payment_factor   │
│     | months_to_payoff | contractor_fee | applies_to | sort_order      │
│     | is_active                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│    DUCTED ESTIMATOR         │ │    DUCTLESS ESTIMATOR       │
│    Step8QuoteResults.tsx    │ │    QuoteSummary.tsx         │
├─────────────────────────────┤ ├─────────────────────────────┤
│  ┌───────────────────────┐  │ │  ┌───────────────────────┐  │
│  │ FinancingOptionsSection│  │ │  │ FinancingOptionsSection│  │
│  │ estimatorType="ducted" │  │ │  │ estimatorType="ductless│  │
│  │ finalTotal={price}     │  │ │  │ finalTotal={price}     │  │
│  └───────────────────────┘  │ │  └───────────────────────┘  │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## Database Schema

### Table: `financing_options`

**File:** `supabase/migrations/20260117145723_78094fc0-4c71-464b-8b94-04597805bda7.sql`

```sql
CREATE TABLE public.financing_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,                    -- e.g., "Plan 943"
  tran_code TEXT,                             -- Synchrony transaction code
  promotional_offer TEXT NOT NULL,            -- e.g., "9.99% APR Until Paid in Full"
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,  -- e.g., 9.99
  payment_factor DECIMAL(10,6) NOT NULL DEFAULT 0, -- e.g., 0.0125
  months_to_payoff INTEGER,                   -- e.g., 132
  contractor_fee DECIMAL(5,2) NOT NULL DEFAULT 0,  -- e.g., 6.35%
  dealer_net_cost TEXT,                       -- Notes about dealer cost
  notes TEXT,                                 -- Additional notes
  applies_to TEXT[] DEFAULT ARRAY['ductless', 'ducted'], -- Which estimators
  sort_order INTEGER NOT NULL DEFAULT 0,      -- Display order
  is_active BOOLEAN NOT NULL DEFAULT true,    -- Show in estimators
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Row Level Security

```sql
-- All authenticated users can view
CREATE POLICY "Authenticated users can view financing options" 
ON public.financing_options FOR SELECT TO authenticated USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert/update/delete financing options" 
ON public.financing_options FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

---

## Admin Management

### Page: Financing Options
**File:** `src/pages/admin/FinancingOptions.tsx`
**Route:** `/admin/financing`

### Features

1. **List All Plans**
   - Sortable table with all financing options
   - Shows: Plan Name, APR, Factor, Term, Fee, Active status
   - Ducted/Ductless columns show assignment status

2. **Create/Edit Plans**
   - Dialog form for plan details
   - Fields:
     - Plan Name (required)
     - Transaction Code
     - Promotional Offer (required)
     - Interest Rate (APR %)
     - Payment Factor (decimal)
     - Months to Payoff
     - Contractor Fee (%)
     - Dealer Net Cost
     - Notes
     - Applies To (checkboxes: Ducted, Ductless)
     - Sort Order
     - Active Status

3. **Delete Plans**
   - Confirmation required
   - Cascades to remove from estimators

### Form State

```typescript
const [form, setForm] = useState({
  plan_name: "",
  tran_code: "",
  promotional_offer: "",
  interest_rate: 0,
  payment_factor: 0,
  months_to_payoff: "",
  contractor_fee: 0,
  dealer_net_cost: "",
  notes: "",
  applies_to_ductless: true,
  applies_to_ducted: true,
  sort_order: 0,
  is_active: true,
});
```

### Save Mutation

```typescript
const saveMutation = useMutation({
  mutationFn: async () => {
    const appliesTo: string[] = [];
    if (form.applies_to_ductless) appliesTo.push("ductless");
    if (form.applies_to_ducted) appliesTo.push("ducted");

    const payload = {
      plan_name: form.plan_name.trim(),
      tran_code: form.tran_code.trim() || null,
      promotional_offer: form.promotional_offer.trim(),
      interest_rate: Number(form.interest_rate || 0),
      payment_factor: Number(form.payment_factor || 0),
      months_to_payoff: form.months_to_payoff.trim() ? Number(form.months_to_payoff) : null,
      contractor_fee: Number(form.contractor_fee || 0),
      dealer_net_cost: form.dealer_net_cost.trim() || null,
      notes: form.notes.trim() || null,
      applies_to: appliesTo,
      sort_order: Number(form.sort_order || 0),
      is_active: !!form.is_active,
    };

    if (editingOption) {
      await supabase.from("financing_options").update(payload).eq("id", editingOption.id);
    } else {
      await supabase.from("financing_options").insert(payload);
    }
  },
});
```

---

## Estimator Integration

### Component: FinancingOptionsSection
**File:** `src/components/estimators/FinancingOptionsSection.tsx`

### Props

```typescript
interface FinancingOptionsSectionProps {
  estimatorType: "ducted" | "ductless";
  finalTotal: number;  // The quote total for payment calculation
}
```

### Data Fetching

```typescript
const { data: financingOptions = [], isLoading } = useQuery({
  queryKey: ["financing_options", estimatorType],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("financing_options")
      .select("*")
      .eq("is_active", true)
      .contains("applies_to", [estimatorType])  // Filter by estimator type
      .order("sort_order");
    
    if (error) {
      console.error("Error fetching financing options:", error);
      return [];
    }
    return data as FinancingOption[];
  },
});
```

### Payment Calculation

```typescript
// Monthly payment = Total × Payment Factor
const monthlyPayment = finalTotal * plan.payment_factor;

// Example: $14,847 × 0.0125 = $185.59/mo
```

### Display Format

```
┌─────────────────────────────────────────────────────────────┐
│  💳 Financing Options                                       │
│  Subject to credit approval • Powered by Synchrony          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Plan 943                                  ~$186/mo  │   │
│  │ 9.99% APR Until Paid in Full                        │   │
│  │ [9.99% APR] [132 months]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Plan 960                                  ~$260/mo  │   │
│  │ 3.99% APR Until Paid in Full                        │   │
│  │ [3.99% APR] [57 months]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ DISCLAIMERS:                                                │
│ *Subject to credit approval. Minimum monthly payments       │
│  required. See store for details. Financing provided by     │
│  Synchrony Bank.                                            │
│                                                             │
│ Example: A $14,847 purchase at 9.99% APR for 132 months    │
│ requires monthly payments of approximately $186.            │
│                                                             │
│ [Deferred interest disclosure if applicable]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Synchrony Disclaimers

### Required Disclosures

The component automatically includes required Synchrony financing disclosures:

#### 1. Primary Disclaimer (Always Shown)
```
*Subject to credit approval. Minimum monthly payments required. 
See store for details. Financing provided by Synchrony Bank.
```

#### 2. APR/Payment Example (When APR Plans Exist)
```typescript
{examplePlan && (
  <p>
    Example: A {formatMoney(finalTotal)} purchase at {examplePlan.interest_rate}% APR 
    for {examplePlan.months_to_payoff} months requires monthly payments of approximately 
    {formatMoney(Math.round(finalTotal * examplePlan.payment_factor))}.
  </p>
)}
```

#### 3. Deferred Interest Disclosure (Plans 920, 924, etc.)
```typescript
// Check if any deferred interest plans are shown
const hasDeferredInterestPlan = financingOptions.some(
  (plan) => plan.plan_name.includes("920") || plan.plan_name.includes("924")
);

{hasDeferredInterestPlan && (
  <p>
    For deferred interest promotions: No interest will be charged on this purchase 
    if you pay the promotional balance in full within the promotional period. 
    Interest will be charged to your account from the purchase date if the 
    promotional balance is not paid in full within the promotional period. 
    Minimum monthly payments required.
  </p>
)}
```

---

## Integration Points

### Ducted Estimator
**File:** `src/pages/estimators/ducted/steps/Step8QuoteResults.tsx`

```tsx
// At the bottom of the quote results, before navigation buttons
<FinancingOptionsSection 
  estimatorType="ducted" 
  finalTotal={selectedPrice}  // The selected system total
/>
```

### Ductless Estimator
**File:** `src/pages/estimators/ductless/steps/QuoteSummary.tsx`

```tsx
// At the bottom of the investment summary
<FinancingOptionsSection 
  estimatorType="ductless" 
  finalTotal={pricing.finalTotal}  // The calculated total
/>
```

---

## Sample Data

### Current Active Plans (Ducted)

| Plan | Promotional Offer | APR | Factor | Term |
|------|-------------------|-----|--------|------|
| Plan 943 | 9.99% APR Until Paid in Full | 9.99% | 0.0125 | 132 mo |
| Plan 960 | 3.99% APR Until Paid in Full | 3.99% | 0.0300 | 57 mo |
| Plan 933 | 0% Interest for 60 Months | 0.00% | 0.0167 | 60 mo |

### Current Active Plans (Ductless)

| Plan | Promotional Offer | APR | Factor | Term |
|------|-------------------|-----|--------|------|
| Plan 980 | 5.99% APR Until Paid in Full | 5.99% | 0.0270 | 37 mo |
| Plan 924 | No Monthly Interest if Paid in Full within 18 Months | 0.00% | 0.0556 | 18 mo |
| Plan 920 | No Interest if Paid in Full within 6 Months | 0.00% | 0.1667 | 6 mo |

---

## Payment Factor Reference

The payment factor is a multiplier used to calculate the estimated monthly payment:

```
Monthly Payment = Total × Payment Factor
```

| APR | Term | Factor | Example ($15,000) |
|-----|------|--------|-------------------|
| 9.99% | 132 mo | 0.0125 | $187.50/mo |
| 7.99% | 61 mo | 0.0200 | $300.00/mo |
| 5.99% | 37 mo | 0.0300 | $450.00/mo |
| 3.99% | 57 mo | 0.0260 | $390.00/mo |
| 0.00% | 60 mo | 0.0167 | $250.50/mo |

---

## Data Flow Summary

```
1. Admin creates/edits financing plan in /admin/financing
                    │
                    ▼
2. Plan saved to financing_options table
   - applies_to = ['ducted'] or ['ductless'] or both
   - is_active = true (to show in estimators)
                    │
                    ▼
3. User goes through estimator and reaches quote results
                    │
                    ▼
4. FinancingOptionsSection queries financing_options
   - WHERE is_active = true
   - AND applies_to CONTAINS estimatorType
   - ORDER BY sort_order
                    │
                    ▼
5. Component calculates monthly payments for each plan
   - monthlyPayment = finalTotal × payment_factor
                    │
                    ▼
6. Displays plans with Synchrony disclaimers
```

---

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/admin/FinancingOptions.tsx` | Admin management page |
| `src/components/estimators/FinancingOptionsSection.tsx` | Display component |
| `src/pages/estimators/ducted/steps/Step8QuoteResults.tsx` | Ducted integration |
| `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | Ductless integration |
| `supabase/migrations/20260117145723_*.sql` | Database schema |

---

## Troubleshooting

### Plans Not Showing

1. **Check is_active:** Plan must have `is_active = true`
2. **Check applies_to:** Plan must include the estimator type in array
3. **Check sort_order:** Verify plans are being returned in expected order

### Wrong Monthly Payment

1. **Verify payment_factor:** Should be a decimal (e.g., 0.0125, not 1.25)
2. **Check finalTotal:** Ensure the correct total is being passed

### Disclaimers Not Showing

1. **Check for APR plans:** Example disclaimer requires at least one plan with `interest_rate > 0` and `months_to_payoff`
2. **Deferred interest check:** Looks for "920" or "924" in plan_name string
