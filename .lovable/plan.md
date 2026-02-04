

## Sync Abandoned Carts to GoHighLevel

### Problem

The abandoned cart feature saves partial submissions to the database, but never syncs them to GoHighLevel. The existing `sync-ghl-contact` function requires user authentication, which is not available during page unload events (when abandoned carts are captured).

---

### Solution

Enhance the `save-abandoned-cart` Edge Function to directly call the GHL API after saving to the database. This ensures abandoned cart leads appear in your CRM immediately.

---

### File to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/save-abandoned-cart/index.ts` | MODIFY | Add GHL sync logic after database save |

---

### Implementation Details

After successfully inserting/updating the partial submission in the database, the Edge Function will:

1. **Extract contact details** from the submission data
2. **Build GHL payload** with appropriate tags (`abandoned-cart`, `ducted-estimator`)
3. **Call GHL upsert API** to create/update the contact
4. **Update sync status** in the database to reflect success/failure
5. **Return result** without blocking the main save operation

#### Key Changes

```typescript
// After successful database save...

// Build GHL contact data
const nameParts = (data.customer_name || "").split(" ");
const firstName = nameParts[0] || "";
const lastName = nameParts.slice(1).join(" ") || "";

const ghlPayload = {
  firstName,
  lastName,
  email: data.customer_email,
  phone: data.customer_phone || undefined,
  address1: data.customer_address || undefined,
  locationId: GHL_LOCATION_ID,
  source: "Ducted Estimator - Abandoned Cart",
  tags: ["abandoned-cart", "ducted-estimator", "website-lead"],
  customFields: [
    { key: "home_type", field_value: data.home_type },
    { key: "square_footage", field_value: data.square_footage },
    { key: "heating_type", field_value: data.heating_type },
    // ... other available fields
  ]
};

// Call GHL API
const ghlResponse = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${GHL_API_KEY}`,
    "Content-Type": "application/json",
    "Version": "2021-07-28",
  },
  body: JSON.stringify(ghlPayload),
});

// Update sync status in database
await supabaseAdmin
  .from("ducted_estimate_submissions")
  .update({ 
    ghl_sync_status: ghlResponse.ok ? "synced" : "failed" 
  })
  .eq("id", submissionId);
```

---

### GHL Contact Tags

Abandoned cart contacts will be tagged with:
- `abandoned-cart` - Identifies these as incomplete leads
- `ducted-estimator` - Source of the lead
- `website-lead` - General website attribution

This allows filtering and automation in GHL (e.g., automated follow-up sequences for abandoned carts).

---

### Custom Fields Synced

The following data will be synced to GHL custom fields when available:
- Home type
- Square footage
- Home layout
- Heating type
- Customer address
- Best time to call

---

### Error Handling

- GHL sync failures won't block the database save
- Sync status will be set to `failed` if GHL API returns an error
- Errors are logged for debugging
- The function continues to return success if database save worked

---

### Testing

After implementation:
1. Open ducted estimator and complete through Step 8
2. Enter contact info (email and/or phone)
3. Close the tab or navigate away
4. Check GHL for the new contact with `abandoned-cart` tag
5. Verify the submission in admin shows `ghl_sync_status: synced`

