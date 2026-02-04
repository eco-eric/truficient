

## Fix Abandoned Cart Tracking for Both Estimators

### Problem Summary

Testing revealed two distinct issues:

| Estimator | Dashboard | GHL Sync |
|-----------|-----------|----------|
| **Ducted** | Working | NOT syncing to GHL |
| **Ductless** | NOT working | NOT syncing to GHL |

---

### Root Cause Analysis

**Ducted (GHL Sync Failing):**
- The Edge Function logs show NO recent calls to `save-abandoned-cart`
- This suggests the `fetch` with `keepalive` may be failing silently in certain browsers
- Need to add better error handling and verify the Edge Function is receiving calls

**Ductless (No Tracking At All):**
- The `DuctlessEstimator.tsx` never implemented abandoned cart tracking
- The `QuoteContext.tsx` doesn't have a `partialSubmissionId` field for tracking
- The `ductless_estimate_submissions` table is missing columns for GHL sync
- Table has NOT NULL constraints that prevent partial saves (zone_count, subtotal, etc. are required)

---

### Solution Overview

```text
   DUCTED FIX                          DUCTLESS NEW IMPLEMENTATION
   ──────────────                      ─────────────────────────────
   ┌─────────────────────┐             ┌─────────────────────────────┐
   │ Update Edge Function │             │ 1. Add DB columns          │
   │ - Better logging     │             │ 2. Create ductless hook     │
   │ - Debug GHL call     │             │ 3. Update Edge Function     │
   │ - Handle errors      │             │ 4. Add tracker component    │
   └─────────────────────┘             └─────────────────────────────┘
```

---

### Database Changes (Ductless)

Add columns to `ductless_estimate_submissions`:

```sql
ALTER TABLE ductless_estimate_submissions
  -- Allow partial saves with minimal data
  ALTER COLUMN zone_count SET DEFAULT 0,
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN rebates SET DEFAULT 0,
  ALTER COLUMN final_total SET DEFAULT 0,
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN customer_email DROP NOT NULL,
  -- Add GHL tracking columns
  ADD COLUMN IF NOT EXISTS ghl_sync_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/estimators/ductless/hooks/useDuctlessAbandonedCartTracker.ts` | Track ductless abandoned carts (mirrors ducted implementation) |

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/save-abandoned-cart/index.ts` | Add ductless support + better logging |
| `src/pages/estimators/ductless/context/QuoteContext.tsx` | Add `partialSubmissionId` state |
| `src/pages/estimators/ductless/DuctlessEstimator.tsx` | Add abandoned cart tracker component |
| `src/pages/estimators/ductless/types/index.ts` | Add `partialSubmissionId` to QuoteState |
| `src/pages/admin/AbandonedCarts.tsx` | Add ductless abandoned carts tab |

---

### Edge Function Updates

Modify `save-abandoned-cart` to handle both estimators:

```typescript
// Add estimator_type parameter
const estimatorType = data.estimator_type || 'ducted'; // default to ducted for backwards compat

// Insert to appropriate table
const tableName = estimatorType === 'ductless' 
  ? 'ductless_estimate_submissions' 
  : 'ducted_estimate_submissions';

// Build appropriate payload based on estimator type
const submissionData = estimatorType === 'ductless'
  ? buildDuctlessSubmission(data)
  : buildDuctedSubmission(data);

// GHL tags vary by estimator
const tags = estimatorType === 'ductless'
  ? ["abandoned-cart", "ductless-estimator", "website-lead"]
  : ["abandoned-cart", "ducted-estimator", "website-lead"];
```

Add enhanced logging for debugging:

```typescript
console.log("=== ABANDONED CART SAVE START ===");
console.log("Estimator type:", estimatorType);
console.log("Has GHL credentials:", Boolean(GHL_API_KEY && GHL_LOCATION_ID));
// ... log each step
console.log("=== ABANDONED CART SAVE END ===");
```

---

### Ductless Abandoned Cart Hook

Create `useDuctlessAbandonedCartTracker.ts` mirroring the ducted version:

```typescript
export const useDuctlessAbandonedCartTracker = (
  state: QuoteState,
  setPartialSubmissionId: (id: string | null) => void
) => {
  // Same pattern as ducted:
  // - Listen for visibilitychange, beforeunload, pagehide
  // - Save when currentStep >= 1 (after customer info) and < 8 (before thank you)
  // - Call Edge Function with estimator_type: 'ductless'
};
```

The ductless flow captures contact info at **Step 1**, so tracking starts earlier than ducted.

---

### QuoteContext Updates

Add partial submission tracking:

```typescript
// In types/index.ts - add to QuoteState
export interface QuoteState {
  // ... existing fields ...
  partialSubmissionId: string | null; // NEW
}

// In context/QuoteContext.tsx
const INITIAL_STATE: QuoteState = {
  // ... existing ...
  partialSubmissionId: null,
};

// Add setter function
const setPartialSubmissionId = useCallback((id: string | null) => {
  setState((prev) => ({ ...prev, partialSubmissionId: id }));
}, []);
```

---

### DuctlessEstimator Integration

```typescript
// In DuctlessEstimator.tsx
import { useDuctlessAbandonedCartTracker } from "./hooks/useDuctlessAbandonedCartTracker";

// Add tracker component
const AbandonedCartTracker = () => {
  const { state, setPartialSubmissionId } = useQuote();
  useDuctlessAbandonedCartTracker(state, setPartialSubmissionId);
  return null;
};

// Wrap in provider
const DuctlessEstimator = () => {
  return (
    <QuoteProvider>
      <AbandonedCartTracker /> {/* NEW */}
      <EstimatorContent />
    </QuoteProvider>
  );
};
```

---

### Admin Dashboard Updates

Modify `AbandonedCarts.tsx` to show both estimator types:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Abandoned Carts                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Ducted] [Ductless] [All]  ← Tab switcher                          │
│                                                                     │
│  ┌─────────┬────────┬────────┬────────┐                             │
│  │ Today   │ Week   │ Month  │ Total  │  ← Stats per selected type  │
│  └─────────┴────────┴────────┴────────┘                             │
│                                                                     │
│  ... table with Source column showing Ducted/Ductless ...           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Technical Details

**Ductless Contact Info Step:** Step 1 (vs Ducted Step 8)

| Field | Ducted Step | Ductless Step |
|-------|-------------|---------------|
| Contact Info | Step 8 | Step 1 |
| Trigger Step | >= 8 | >= 1 |
| Completion Step | 11 | 8 |

**GHL Custom Fields for Ductless:**
- `zone_count` - Number of rooms/zones
- `unit_type` - Wall mount, ceiling, etc.
- `system_tier` - Good/Better/Best
- `customer_address` - Full formatted address

---

### Testing Checklist

After implementation:

**Ducted:**
1. Open `/estimator/ducted`, complete through Step 8
2. Enter contact info, then close tab
3. Check Edge Function logs for "ABANDONED CART SAVE START"
4. Verify GHL has contact with `abandoned-cart` tag

**Ductless:**
1. Open `/estimator/ductless`, complete Step 1 (enter contact info)
2. Close tab without completing
3. Check Abandoned Carts admin page for ductless entry
4. Verify GHL has contact with `ductless-estimator` + `abandoned-cart` tags

