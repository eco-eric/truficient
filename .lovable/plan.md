

## Fix GHL Sync & Abandoned Cart Issues

### Summary of Findings

| Issue | Root Cause | Solution |
|-------|------------|----------|
| **`sync-ghl-contact` returns 404** | Edge Function is not deployed | Deploy the function |
| **Recent submissions stuck on `pending`** | Full quotes call `sync-ghl-contact` which isn't deployed | Deploy the function |
| **Abandoned carts from published site not saving** | Published site may have outdated code | Verify code is published |

---

### Part 1: Deploy the Missing `sync-ghl-contact` Edge Function

The `sync-ghl-contact` function exists in the codebase but is **not deployed**. This is why:
- Full quote submissions save to the database but don't sync to GHL
- The function returns 404 when called

**Required Action:** Deploy the Edge Function

I will also update it to use the modern `npm:` import pattern and `Deno.serve` to match the recently updated `save-abandoned-cart` function (which prevents bundle timeout errors).

---

### Part 2: Update `sync-ghl-contact` to Remove Auth Requirement for Public Submissions

The current `sync-ghl-contact` function **requires authentication**:

```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ success: false, error: 'Unauthorized - No authorization header' }),
    { status: 401 }
  );
}
```

This is the cause of the issue: when users submit quotes from the public estimator pages, they are **not authenticated**, so the function rejects them.

**Solution:** Remove the authentication requirement since:
1. This is a public-facing feature (estimators are for anonymous users)
2. The abandoned cart function already works without auth
3. The function only creates contacts in GHL, not sensitive database operations

---

### Part 3: Verify Published Site Has Latest Code

After the Edge Functions are fixed and deployed, you'll need to **publish** the site to ensure the frontend code on `truficient.lovable.app` is up to date with the latest changes.

---

### Implementation Steps

1. **Update `sync-ghl-contact` Edge Function**
   - Switch to `npm:` imports and `Deno.serve` (prevents bundle timeouts)
   - Remove authentication requirement for public submissions
   - Keep GHL sync logic intact

2. **Deploy Both Edge Functions**
   - Deploy `sync-ghl-contact`
   - Redeploy `save-abandoned-cart` (just in case)

3. **Test the Fixes**
   - Test abandoned cart flow
   - Test full quote submission
   - Verify GHL contacts are created with correct tags

4. **Publish the Site**
   - After confirming Edge Functions work, publish to update the live site

---

### Technical Changes

#### `sync-ghl-contact` Updates:

```typescript
// OLD (causes bundle timeout + requires auth)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(/* 401 error */);
  }
  // ... auth verification ...
});

// NEW (stable imports + no auth for public access)
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Skip auth - this is a public endpoint for estimator submissions
  // ... GHL sync logic ...
});
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/sync-ghl-contact/index.ts` | Update imports, remove auth, use `Deno.serve` |

---

### Post-Implementation Testing

1. **Test sync-ghl-contact directly:**
   - Send a test POST request to verify it syncs to GHL

2. **Test ductless estimator:**
   - Complete a full quote submission
   - Verify `save-quote-ductless` tag appears in GHL

3. **Test ducted estimator:**
   - Complete a full quote submission
   - Verify `save-quote-ducted` tag appears in GHL

4. **Test abandoned cart:**
   - Start an estimator, fill contact info, close tab
   - Verify partial submission with `abandoned-cart` tag in GHL

5. **Publish site** and repeat tests on the production URL

