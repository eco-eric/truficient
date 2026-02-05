

## Fix Abandoned Cart Tracking & GHL Sync

### Summary of Issues Found

| Issue | Status | Root Cause |
|-------|--------|------------|
| Ductless abandoned cart saves | ❌ FAILING | Database constraint violation - `partial` status not allowed |
| Ducted GHL sync | ❌ NOT SYNCING | GHL credentials may not be reaching Edge Function, or sync code missing |
| Save quote tags | ❌ MISSING | Tags `save-quote-ducted` and `save-quote-ductless` not implemented |

---

### Part 1: Fix Ductless Database Constraint

The `ductless_estimate_submissions` table only allows these status values:
- `new`, `contacted`, `scheduled`, `converted`, `closed`

The ducted table allows:
- `new`, **`partial`**, `contacted`, `scheduled`, `quoted`, `converted`, `lost`, `junk`

**Solution:** Add `partial` and `junk` statuses to the ductless constraint for consistency.

```sql
ALTER TABLE ductless_estimate_submissions 
DROP CONSTRAINT ductless_estimate_submissions_status_check;

ALTER TABLE ductless_estimate_submissions 
ADD CONSTRAINT ductless_estimate_submissions_status_check 
CHECK (status = ANY (ARRAY['new', 'partial', 'contacted', 'scheduled', 'quoted', 'converted', 'closed', 'junk']));
```

---

### Part 2: Debug & Fix GHL Sync

The Edge Function logs show it's receiving data but we need to verify GHL credentials are available.

**Diagnostic steps:**
1. Check if `GHL_API_Key_Contact` and `GHL_LOCATION_ID` secrets are set (already confirmed ✅)
2. Add explicit logging in Edge Function to confirm GHL sync is attempted
3. Test with a manual curl call to verify the Edge Function can reach GHL

**Update Edge Function** to add better logging:
```typescript
// After save, log GHL sync attempt
console.log("GHL credentials check:", {
  hasApiKey: !!GHL_API_KEY,
  hasLocationId: !!GHL_LOCATION_ID
});
```

---

### Part 3: Add Save Quote Tags

When a user completes a quote (submits the final form), add these GHL tags:
- **Ducted:** `save-quote-ducted`
- **Ductless:** `save-quote-ductless`

This requires updating the final submission logic in both estimators, likely in the `sync-ghl-contact` Edge Function that handles full submissions (not abandoned carts).

**Files to check/modify:**
- `supabase/functions/sync-ghl-contact/index.ts` - Add tags to final submission sync
- `src/pages/estimators/ducted/steps/Step11ThankYou.tsx` - Confirm submission logic
- `src/pages/estimators/ductless/steps/QuoteSummary.tsx` - Confirm submission logic

---

### Implementation Plan

1. **Database Migration**
   - Add `partial` to ductless status constraint
   
2. **Edge Function Updates**
   - Add GHL sync debugging logs
   - Verify sync code is executing
   - Re-deploy `save-abandoned-cart` function
   
3. **Full Submission GHL Tags**
   - Update `sync-ghl-contact` to include `save-quote-ducted` / `save-quote-ductless` tags
   - OR update the submission handlers to explicitly add these tags

---

### Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `partial` to ductless status constraint |
| `supabase/functions/save-abandoned-cart/index.ts` | Add GHL debug logging |
| `supabase/functions/sync-ghl-contact/index.ts` | Add `save-quote-*` tags for completed submissions |

---

### Testing After Implementation

1. **Ductless Abandoned Cart Test**
   - Go to `/estimate/ductless`
   - Fill Step 1 contact info
   - Navigate away
   - Verify record in `ductless_estimate_submissions` with `status: partial`
   - Verify GHL contact with `abandoned-cart` + `ductless-estimator` tags

2. **Ducted Abandoned Cart Test**
   - Go to `/estimate/ducted`
   - Complete through Step 8 with contact info
   - Navigate away
   - Verify GHL sync status changes to `synced`

3. **Save Quote Tags Test**
   - Complete full quote submission for each estimator
   - Verify GHL contact has `save-quote-ducted` or `save-quote-ductless` tag

