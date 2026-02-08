
# Auto-Fill Location from Customer Billing Address

## Overview

Add a "Use Billing Address" button to the location creation dialog that pulls the selected customer's billing address and auto-fills the address fields. This streamlines the workflow since 90% of customers have the same service location as their billing address.

---

## Current Flow

1. User clicks "New Location"
2. User selects a customer from dropdown
3. User manually types the address (often identical to billing address)
4. User fills remaining fields and saves

---

## Proposed Flow

1. User clicks "New Location"
2. User selects a customer from dropdown
3. **NEW**: A "Use Billing Address" button appears (if customer has billing address)
4. Clicking it auto-fills: Address Line 1, City, State, ZIP
5. User can adjust if needed, fill remaining fields, and save

---

## Changes Required

**File:** `src/pages/admin/Locations.tsx`

### 1. Expand Customer Query

Fetch billing address fields along with customer list:

```typescript
const { data: customers } = useQuery({
  queryKey: ['crm_customers_list_with_billing'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('crm_customers')
      .select('id, first_name, last_name, company_name, billing_address, billing_city, billing_state, billing_zip')
      .is('deleted_at', null)
      .order('first_name');
    if (error) throw error;
    return data;
  },
});
```

### 2. Add Helper Function

Find selected customer and check if they have billing info:

```typescript
const selectedCustomer = useMemo(() => 
  customers?.find(c => c.id === selectedCustomerId),
  [customers, selectedCustomerId]
);

const hasBillingAddress = selectedCustomer?.billing_address && 
  selectedCustomer?.billing_city;
```

### 3. Add "Use Billing Address" Button

After customer selector, show button when applicable:

```typescript
{!editingLocation && hasBillingAddress && (
  <Button
    type="button"
    variant="outline"
    size="sm"
    className="w-full"
    onClick={() => {
      setAddressLine1(selectedCustomer.billing_address || '');
      setCity(selectedCustomer.billing_city || '');
      setState(selectedCustomer.billing_state || 'TX');
      setZipCode(selectedCustomer.billing_zip || '');
      setIsPrimary(true); // First location = primary
      toast.success('Billing address applied');
    }}
  >
    <Copy className="h-4 w-4 mr-2" />
    Use Billing Address
  </Button>
)}
```

### 4. Import Copy Icon

```typescript
import { 
  Plus, Search, MapPin, Home, Building2, 
  MoreHorizontal, Edit, Trash2, ExternalLink, Copy 
} from 'lucide-react';
```

---

## UI Preview

```text
┌─────────────────────────────────────────────┐
│ Add Location                                │
├─────────────────────────────────────────────┤
│ Customer *                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ John Smith                            ▼ │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ⧉  Use Billing Address                  │ │ ← NEW BUTTON
│ └─────────────────────────────────────────┘ │
│                                             │
│ Location Name          Type                 │
│ ┌───────────────────┐  ┌───────────────┐   │
│ │ Main Home         │  │ Residential ▼ │   │
│ └───────────────────┘  └───────────────┘   │
│                                             │
│ Address Line 1 *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 123 Main St       (auto-filled)         │ │
│ └─────────────────────────────────────────┘ │
│ ...                                         │
└─────────────────────────────────────────────┘
```

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Customer has no billing address | Button doesn't appear |
| Editing existing location | Button doesn't appear (only for new) |
| No customer selected | Button doesn't appear |
| Partial billing address | Still shows button, fills what's available |

---

## Summary

| Change | Details |
|--------|---------|
| Query update | Add billing fields to customer list query |
| New button | "Use Billing Address" in dialog |
| Auto-fill | Address, city, state, zip from customer |
| Visual feedback | Toast notification on apply |
