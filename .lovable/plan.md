

## Fix Estimator Issues: Abandoned Cart & GHL Sync

### Summary of Issues Found

| Issue | Root Cause | Solution |
|-------|------------|----------|
| **Ducted abandoned cart not working** | The Edge Function is working, but the `save-abandoned-cart` function is NOT being called from the published site - no recent logs show ducted abandon attempts | Verify published site has latest code |
| **Ducted submission not syncing to GHL** | The `sync-ghl-contact` function call uses `supabase.functions.invoke()` without proper headers for anonymous users | Update to use public fetch call like abandoned cart tracker |
| **Ductless abandoned carts in wrong admin tab** | The AbandonedCarts.tsx page ONLY queries `ducted_estimate_submissions` - it ignores `ductless_estimate_submissions` | Update admin page to include ductless partial submissions |

---

### Part 1: Fix Ducted Submission GHL Sync

The issue is that `supabase.functions.invoke()` requires authentication by default, but public users submitting quotes are not authenticated.

**Current problematic code** in `Step10QuoteResults.tsx` (line 183):
```typescript
supabase.functions.invoke("sync-ghl-contact", {
  body: { ... }
})
```

**Solution**: Use direct `fetch()` with the Edge Function URL, similar to how the abandoned cart tracker works:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... }),
})
```

**Files to modify:**
- `src/pages/estimators/ducted/steps/Step10QuoteResults.tsx`

---

### Part 2: Fix Ductless Submission GHL Sync (Same Issue)

The same issue exists in the ductless `QuoteSummary.tsx`:

**Files to modify:**
- `src/pages/estimators/ductless/steps/QuoteSummary.tsx`

---

### Part 3: Fix Admin Panel to Show Ductless Abandoned Carts

The `AbandonedCarts.tsx` page currently only queries `ducted_estimate_submissions` with `status = 'partial'`. It completely ignores the `ductless_estimate_submissions` table.

**Solution**: Update the admin page to:
1. Query both `ducted_estimate_submissions` and `ductless_estimate_submissions` where `status = 'partial'`
2. Merge the results into a unified list with an `estimator_type` indicator
3. Update the table to show which estimator type each abandoned cart came from

**Files to modify:**
- `src/pages/admin/AbandonedCarts.tsx`

---

### Part 4: Verify Published Site Has Latest Code

After implementing fixes, you MUST publish the site to ensure the production URL uses the updated code.

---

### Implementation Details

#### A. Step10QuoteResults.tsx Changes

Replace the `supabase.functions.invoke("sync-ghl-contact", ...)` pattern with direct fetch:

```typescript
// Replace lines ~183-240
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName,
    lastName,
    email: state.customerInfo.email,
    phone: state.customerInfo.phone || undefined,
    address: fullAddress || undefined,
    notes: state.customerInfo.notes || undefined,
    source: "Ducted HVAC Estimator",
    tags,
    message: `...`,
    zipCode: state.customerInfo.zipCode || undefined,
    isDfw: true,
    quote: { ... },
  }),
})
  .then(async (res) => {
    if (res.ok) {
      const data = await res.json();
      if (data.contactId) {
        await supabase
          .from("ducted_estimate_submissions")
          .update({ 
            ghl_contact_id: data.contactId,
            ghl_sync_status: "synced" 
          })
          .eq("id", state.partialSubmissionId);
      }
    }
  })
  .catch(err => console.error("GHL sync error:", err));
```

#### B. QuoteSummary.tsx Changes (Ductless)

Same pattern - replace `supabase.functions.invoke` with direct fetch.

#### C. AbandonedCarts.tsx Changes

```typescript
// Updated query to fetch from BOTH tables
const { data: abandonedCarts, isLoading } = useQuery({
  queryKey: ["abandoned-carts"],
  queryFn: async () => {
    // Fetch ducted abandoned carts
    const { data: ductedData, error: ductedError } = await supabase
      .from("ducted_estimate_submissions")
      .select("*")
      .eq("status", "partial")
      .order("created_at", { ascending: false });
    
    if (ductedError) throw ductedError;

    // Fetch ductless abandoned carts
    const { data: ductlessData, error: ductlessError } = await supabase
      .from("ductless_estimate_submissions")
      .select("*")
      .eq("status", "partial")
      .order("created_at", { ascending: false });
    
    if (ductlessError) throw ductlessError;

    // Merge and sort by created_at
    const ducted = (ductedData || []).map(item => ({ 
      ...item, 
      estimator_type: 'ducted' as const 
    }));
    const ductless = (ductlessData || []).map(item => ({ 
      ...item, 
      estimator_type: 'ductless' as const 
    }));

    return [...ducted, ...ductless]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
});
```

Also update the table display to show the estimator type badge.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/estimators/ducted/steps/Step10QuoteResults.tsx` | Replace `supabase.functions.invoke` with direct `fetch()` for GHL sync |
| `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | Same - replace with direct `fetch()` |
| `src/pages/admin/AbandonedCarts.tsx` | Query both tables, merge results, show estimator type |

---

### Testing Plan

After implementation:

1. **Test ducted abandoned cart**: Go to ducted estimator, fill through Step 8, close tab - verify it appears in admin abandoned carts
2. **Test ducted full submission**: Complete ducted estimator - verify GHL sync shows "synced" 
3. **Test ductless abandoned cart**: Same flow - verify it appears in admin abandoned carts (not submissions)
4. **Test ductless full submission**: Already working per your report - verify still works
5. **Publish the site** and repeat all tests on production URL

