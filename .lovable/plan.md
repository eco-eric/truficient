

## Fix Abandoned Cart Tracking + Add Admin Testing Settings

### Problem Summary

The abandoned cart feature has two issues:
1. **`sendBeacon` doesn't work reliably** - Supabase REST API requires headers that `sendBeacon` cannot send
2. **No way to test/configure the triggers** - Admins need settings to adjust thresholds for testing

---

### Solution Overview

| Component | Change |
|-----------|--------|
| Fix `sendBeacon` | Replace with Edge Function that handles unauthenticated partial saves |
| Admin Settings Section | Add configurable triggers in Abandoned Carts admin page |
| Testing Mode | Allow manual trigger button for testing |

---

### Technical Implementation

#### 1. Create Edge Function for Abandoned Cart Saves

Create `supabase/functions/save-abandoned-cart/index.ts`:
- Accepts partial submission data
- Uses service role key to insert directly
- Returns success/failure
- This solves the `sendBeacon` header limitation

#### 2. Update `useAbandonedCartTracker.ts`

Replace the `sendBeacon` direct Supabase call with a call to the new Edge Function:
- Use `fetch` with `keepalive: true` for `beforeunload` events
- Fall back to Edge Function endpoint which doesn't require auth headers
- Ensure proper error handling

#### 3. Add Admin Settings UI

In `/admin/abandoned-carts`, add a settings panel:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚙️ Abandoned Cart Settings                        [Collapse ▲] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Trigger Conditions                                              │
│ ─────────────────────────────────────────────────────────────   │
│ Minimum Step Required:          [8 ▼] (Contact Info step)       │
│ Require Email:                  [✓]                             │
│ Require Phone:                  [✓] (either email OR phone)     │
│ Debounce Interval:              [5] seconds                     │
│                                                                 │
│ ─────────────────────────────────────────────────────────────   │
│ Testing Tools                                                   │
│ ─────────────────────────────────────────────────────────────   │
│ [🧪 Create Test Abandoned Cart]  [🗑️ Clear Test Data]           │
│                                                                 │
│ How to Test Manually:                                           │
│ 1. Open /estimator/ducted in a new tab                          │
│ 2. Complete steps 0-8 (enter contact info)                      │
│ 3. Close the tab OR switch tabs OR click away                   │
│ 4. Return here and refresh to see the partial submission        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/save-abandoned-cart/index.ts` | Edge function for reliable partial saves during page unload |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/estimators/ducted/hooks/useAbandonedCartTracker.ts` | Use Edge Function endpoint instead of direct sendBeacon to Supabase |
| `src/pages/admin/AbandonedCarts.tsx` | Add settings panel with testing tools |

---

### Edge Function Implementation

```typescript
// supabase/functions/save-abandoned-cart/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    
    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabaseAdmin
      .from('ducted_estimate_submissions')
      .insert({
        ...data,
        status: 'partial',
        ghl_sync_status: 'pending',
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

### Updated Tracker Hook

Key changes to `useAbandonedCartTracker.ts`:
- Replace `sendBeacon` with `fetch(..., { keepalive: true })` to Edge Function
- The Edge Function URL doesn't require auth headers
- Add console logging for debugging

```typescript
// In savePartialSubmissionSync:
const savePartialSubmissionSync = useCallback(() => {
  // ... validation checks ...

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/save-abandoned-cart`;

  // Use fetch with keepalive for reliable delivery
  fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData),
    keepalive: true, // Ensures request completes even during page unload
  }).catch(e => console.error('Abandoned cart save failed:', e));
}, [buildSubmissionData, hasMinimumContactInfo]);
```

---

### Admin Testing Features

1. **Create Test Abandoned Cart Button**
   - Inserts a mock `partial` submission with test data
   - Useful for verifying the admin view works

2. **Clear Test Data Button**
   - Deletes submissions where `customer_email` contains `@test` or similar marker
   - Keeps production data safe

3. **Testing Instructions**
   - Clear, step-by-step guide for manually testing the flow
   - Explains what events trigger saves

---

### Testing Checklist

After implementation:
1. [ ] Open estimator in new tab, complete through Step 8
2. [ ] Close tab (without completing) - check admin for partial submission
3. [ ] Switch tabs at Step 9 - verify `visibilitychange` saves
4. [ ] Use "Create Test Abandoned Cart" button - verify it appears
5. [ ] Verify completed submissions (Step 11) show as "new" not "partial"

