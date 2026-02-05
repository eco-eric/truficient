

## Fix Abandoned Cart Tracking for Both Estimators

### Summary

Your GHL sync guy correctly identified two distinct issues:

1. **Ducted**: Saves to dashboard but GHL sync may be failing after the revert
2. **Ductless**: Has NO abandoned cart tracking implemented at all - it's completely missing

---

### Root Cause Analysis

| Estimator | Database Save | GHL Sync | Status |
|-----------|--------------|----------|--------|
| Ducted | Works via `useAbandonedCartTracker` hook | May need re-deployment | Partial fix needed |
| Ductless | **Not implemented** | **Not implemented** | Full implementation needed |

The ducted estimator has the `useAbandonedCartTracker` hook and `save-abandoned-cart` Edge Function, but after your revert, the function may not be deployed with the GHL sync logic.

The ductless estimator was **never set up** with abandoned cart tracking - the `QuoteContext` doesn't track `partialSubmissionId` and there's no hook to save partial submissions.

---

### Solution Overview

#### Part 1: Re-deploy the Ducted Edge Function

Ensure `save-abandoned-cart` is deployed with the GHL sync logic that was added. This will fix the ducted → GHL sync.

#### Part 2: Add Ductless Abandoned Cart Tracking

Implement the same pattern used for ducted:

1. Add `partialSubmissionId` to the ductless `QuoteContext`
2. Create `useAbandonedCartTracker` hook for ductless
3. Update the Edge Function to handle ductless submissions
4. Wire it up in the `DuctlessEstimator` component

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/save-abandoned-cart/index.ts` | MODIFY | Add support for ductless table + type detection |
| `src/pages/estimators/ductless/context/QuoteContext.tsx` | MODIFY | Add `partialSubmissionId` state |
| `src/pages/estimators/ductless/hooks/useAbandonedCartTracker.ts` | CREATE | New hook mirroring ducted pattern |
| `src/pages/estimators/ductless/types/index.ts` | MODIFY | Add `partialSubmissionId` to `QuoteState` |
| `src/pages/estimators/ductless/DuctlessEstimator.tsx` | MODIFY | Wire up abandoned cart tracker |

---

### Implementation Details

#### 1. Update Edge Function for Dual-Table Support

The Edge Function will detect which estimator type is calling it:

```text
Request payload includes:
├── estimator_type: "ducted" | "ductless"
├── customer_email, customer_phone, customer_name
├── (ducted-specific): home_type, heating_type, etc.
└── (ductless-specific): selected_rooms, zone_count, etc.

Edge Function logic:
├── Validate contact info (email OR phone required)
├── Determine target table based on estimator_type
├── Save to ducted_estimate_submissions OR ductless_estimate_submissions
├── Sync to GHL with appropriate tags:
│   ├── ducted: ["abandoned-cart", "ducted-estimator", "website-lead"]
│   └── ductless: ["abandoned-cart", "ductless-estimator", "website-lead"]
└── Update sync status in the appropriate table
```

#### 2. Add Ductless Context State

Add to `QuoteState`:
```typescript
interface QuoteState {
  // ... existing fields
  partialSubmissionId: string | null;
}
```

Add to `QuoteProvider`:
```typescript
const setPartialSubmissionId = useCallback((id: string | null) => {
  setState((prev) => ({ ...prev, partialSubmissionId: id }));
}, []);
```

#### 3. Create Ductless Abandoned Cart Hook

New hook at `src/pages/estimators/ductless/hooks/useAbandonedCartTracker.ts`:

```text
Trigger conditions:
├── User is on Step 1+ (CustomerInfoStep)
├── User has NOT completed (step < 8 ThankYou)
├── User has entered email OR valid phone

Events monitored:
├── visibilitychange (tab switch, minimize)
├── beforeunload (browser close, navigation)
└── pagehide (mobile background)

Payload sent:
├── estimator_type: "ductless"
├── customer_name, customer_email, customer_phone
├── customer_address, customer_city, customer_zip
├── selected_rooms (JSON)
├── zone_count, unit_type_id, system_tier_id
└── partial_submission_id (for updates)
```

#### 4. Wire Up in DuctlessEstimator

Same pattern as ducted:
```typescript
const AbandonedCartTracker = () => {
  const { state, setPartialSubmissionId } = useQuote();
  useAbandonedCartTracker(state, setPartialSubmissionId);
  return null;
};
```

---

### GHL Tags by Estimator Type

| Estimator | Tags Applied |
|-----------|--------------|
| Ducted | `abandoned-cart`, `ducted-estimator`, `website-lead` |
| Ductless | `abandoned-cart`, `ductless-estimator`, `website-lead` |

This enables separate GHL automations/workflows for each lead type.

---

### When Ductless Abandoned Carts Are Captured

Unlike ducted (which captures from Step 8 onward), ductless captures from **Step 1** (CustomerInfoStep) since that's where contact info is collected:

```text
Ductless flow:
Step 0: Welcome       → No tracking
Step 1: Your Info     → ✅ Tracking starts here
Step 2: Select Rooms  → ✅ Tracked
...
Step 7: Your Quote    → ✅ Tracked
Step 8: Thank You     → Full submission, no longer "abandoned"
```

---

### Testing After Implementation

**Ducted Test:**
1. Go to ducted estimator, complete through Step 8 (Contact Info)
2. Fill in email and/or phone
3. Close tab or navigate to homepage
4. Check Admin → Abandoned Carts for new entry with `ghl_sync_status: synced`
5. Verify contact appears in GHL with `abandoned-cart` + `ducted-estimator` tags

**Ductless Test:**
1. Go to ductless estimator, click through to Step 1 (Your Info)
2. Fill in phone number (required) + optional email
3. Close tab or navigate to homepage
4. Check Admin → Abandoned Carts for new entry (filter to ductless)
5. Verify contact appears in GHL with `abandoned-cart` + `ductless-estimator` tags

---

### Technical Notes

- Both hooks use `fetch` with `keepalive: true` for reliable delivery during page unload
- Edge Function runs without authentication (configured in `config.toml`)
- GHL sync failures don't block database saves - errors are logged but non-fatal
- Debounce prevents duplicate saves within 5 seconds

