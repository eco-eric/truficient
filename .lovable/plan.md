

# WorkEdge Customer and Property Sync

## Overview
Add sync buttons to the Customer Detail page and Location cards so you can push CRM customers and locations (as properties) to WorkEdge with one click. Also update the existing `sync-customer` action to match the actual API field names and add a new `create-property` action.

## What Changes

### 1. Edge Function: `supabase/functions/workedge-sync/index.ts`

**Update `sync-customer` action** to send the correct fields per API docs:
- `name`, `email`, `phone`, `company`, `address`, `contact_type`
- Extract response ID from `response.customer.id` (not `response.id`)

**Add `create-property` action:**
- Accepts `locationId` (required)
- Fetches `crm_locations` record with joined customer
- Sends `POST /api-properties` with:
  - `name` (location_name or customer name + address)
  - `address` (full formatted address)
  - `property_type` (mapped from location_type: residential/commercial)
  - `description` (compiled from sq ft, year built, stories, gate code, access notes)
- Stores returned `property.id` in `crm_locations.workedge_property_id`

**Add `'create-property'` to the action union type.**

### 2. Customer Detail Page: `src/pages/admin/CustomerDetail.tsx`

Add a **"Sync to WorkEdge"** button in the customer header:
- If `workedge_customer_id` is null: show outlined button with upload icon
- If already synced: show green badge with checkmark
- Uses `useMutation` calling the `sync-customer` action
- Invalidates `crm_customer` query on success

### 3. Customer Locations: `src/components/admin/customers/CustomerLocations.tsx`

Add a **"Sync Property"** option to each location card's dropdown menu:
- If `workedge_property_id` is null: show "Sync to WorkEdge" menu item
- If already synced: show a small green badge on the card
- Calls `create-property` action with `locationId`
- Toast notification on success/error

### 4. No database migrations needed
Both `workedge_customer_id` and `workedge_property_id` columns already exist.

## Technical Details

### Property payload mapping (crm_locations to WorkEdge):

```text
name:          location_name || "{customer_name} - {address_line1}"
address:       "{address_line1}, {city}, {state} {zip_code}"
property_type: location_type (residential | commercial)
description:   "Sq ft: X | Year built: Y | Stories: Z | Gate: CODE | Access: NOTES"
```

### Customer payload mapping (already mostly correct, minor fixes):

```text
name:         company_name || "{first_name} {last_name}"
email:        email
phone:        phone
company:      company_name
address:      "{billing_address}, {billing_city}, {billing_state} {billing_zip}"
contact_type: customer_type (residential -> homeowner, commercial -> business)
```

### Response ID extraction fix:

The current `sync-customer` stores `customerData.id` but the API returns `{ customer: { id: "uuid" } }`, so it needs to be `customerData.customer.id`.

Similarly for properties: `propertyData.property.id`.

