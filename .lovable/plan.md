

## Fix Address Syncing to GoHighLevel from Estimators

### Problem Summary

The address from estimator submissions is not syncing to GoHighLevel (GHL) because:

1. The `sync-ghl-contact` edge function's `ContactData` interface has no `address` field
2. Both estimators (Ducted and Ductless) include address only in the `message` text, not as a structured field
3. No custom field mapping exists for customer address in the GHL payload

### Current vs Required Flow

```
CURRENT:
Customer Address → Embedded in message text → Not extractable in GHL

REQUIRED:
Customer Address → Dedicated address field → customer_address custom field in GHL
```

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/sync-ghl-contact/index.ts` | MODIFY | Add `address` to ContactData interface and map to GHL custom field |
| `src/pages/estimators/ducted/steps/Step10QuoteResults.tsx` | MODIFY | Send address as dedicated field in GHL sync payload |
| `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | MODIFY | Send address as dedicated field in GHL sync payload |

---

### Implementation Details

#### 1. Update sync-ghl-contact Edge Function

Add `address` field to the `ContactData` interface and map it to a GHL custom field:

```typescript
interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;  // NEW: Customer full address
  // ... existing fields
}
```

Add the address to custom fields mapping:

```typescript
// Add customer address
if (contactData.address) {
  customFields.push({
    key: 'customer_address',
    field_value: contactData.address,
  });
}
```

Also set the native GHL address field if available:

```typescript
// Add native address field for GHL contact
if (contactData.address) {
  ghlPayload.address1 = contactData.address;
}
```

#### 2. Update Ducted Estimator (Step10QuoteResults.tsx)

Currently sends address only in message. Update to send as dedicated field:

```typescript
// In the GHL sync payload
const ghlPayload = {
  firstName: state.customerInfo.name.split(' ')[0],
  lastName: state.customerInfo.name.split(' ').slice(1).join(' ') || '',
  email: state.customerInfo.email,
  phone: state.customerInfo.phone,
  address: state.customerInfo.address,  // NEW: Add dedicated address field
  zipCode: state.customerInfo.zipCode,
  isDfw: state.zipValidation?.isValid,
  // ... rest of payload
};
```

#### 3. Update Ductless Estimator (QuoteSummary.tsx)

Same update - send address as dedicated field:

```typescript
// In the GHL sync payload
const ghlPayload = {
  firstName: state.customerInfo.name.split(' ')[0],
  lastName: state.customerInfo.name.split(' ').slice(1).join(' ') || '',
  email: state.customerInfo.email,
  phone: state.customerInfo.phone,
  address: state.customerInfo.formattedAddress || state.customerInfo.address,  // NEW
  zipCode: state.customerInfo.zipCode,
  // ... rest of payload
};
```

---

### GHL Custom Field Requirement

A custom field must exist in your GHL location for this to work:

| Field Key | Field Name | Field Type |
|-----------|------------|------------|
| `customer_address` | Customer Address | Text/Single Line |

If this field doesn't exist in GHL, the sync will still succeed but the address won't be stored in a dedicated field.

---

### Data Flow After Fix

```
Ducted Estimator                    Ductless Estimator
       ↓                                   ↓
state.customerInfo.address    state.customerInfo.formattedAddress
       ↓                                   ↓
       └─────────────┬─────────────────────┘
                     ↓
           sync-ghl-contact Edge Function
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
   ghlPayload.address1    customFields['customer_address']
   (native GHL field)     (custom field backup)
                     ↓
              GHL Contact Created/Updated
              with address in both locations
```

---

### Testing Plan

After implementation:

1. Submit a Ducted estimate with a full address
2. Check GHL contact - verify address appears in native address field
3. Check GHL contact - verify address appears in customer_address custom field
4. Submit a Ductless estimate with address autocomplete
5. Verify same fields are populated in GHL
6. Test with addresses that have apartments/suites

