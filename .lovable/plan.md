

# Add CRM Customer & Location Picker to Estimate Builder

## Overview
Add the ability to select an existing CRM customer on the Estimate Builder form, auto-fill their contact info, and then pick one of their saved locations as the job address.

## Database Changes

### Add columns to `estimates` table
- `customer_id` (UUID, nullable, FK to `crm_customers.id`) -- links estimate to CRM customer
- `location_id` (UUID, nullable, FK to `crm_locations.id`) -- links estimate to a specific location

Both nullable so legacy estimates and manual-entry estimates continue to work.

## Frontend Changes

### `src/pages/admin/EstimateBuilder.tsx`

1. **Add CRM customer search/select** above the manual fields in the Customer Information card:
   - A searchable dropdown (combobox) that queries `crm_customers` by name, email, or phone
   - On selection: auto-populate `customer_name`, `customer_email`, `customer_phone`, and store `customer_id`
   - Include a "Clear" button to deselect and revert to manual entry

2. **Add location picker** (appears after a customer is selected):
   - Fetch locations from `crm_locations` where `customer_id` matches
   - Show as a dropdown with address summaries
   - On selection: populate `customer_address` with the full formatted address and store `location_id`
   - If the customer has no locations, show a note like "No locations on file"

3. **Keep manual fields editable** -- selecting a customer pre-fills the fields but the user can still override them manually

4. **Update save mutation** to include `customer_id` and `location_id` in the insert/update payload

5. **Update load logic** for existing estimates to restore the selected customer and location

### State additions
- `customer_id: string | null` in `formData` (or separate state)
- `location_id: string | null` in `formData`
- New queries: `crm_customers` (with search), `crm_locations` (filtered by selected customer)

## Technical Details

### New queries in EstimateBuilder
```text
1. crm_customers query: SELECT id, first_name, last_name, email, phone
   - Fetched on mount, filtered client-side by search term
   
2. crm_locations query (enabled when customer_id is set):
   SELECT id, location_name, address_line1, city, state, zip_code, is_primary
   WHERE customer_id = selected_customer_id AND is_active = true
```

### UI layout (Customer Information card)
```text
+--------------------------------------------------+
| Customer Information                              |
+--------------------------------------------------+
| [Search CRM Customer...    v]  [Clear]            |
|                                                   |
| Name: [John Smith]     Email: [john@example.com]  |
| Phone: [(555) 123-4567]                           |
|                                                   |
| Location: [123 Main St, Dallas, TX 75001  v]      |
| Address: [123 Main St, Dallas, TX 75001]          |
|                                                   |
| Job Type: [...]         Heating Type: [...]       |
| Job Notes: [...]                                  |
+--------------------------------------------------+
```

### Migration SQL
```sql
ALTER TABLE estimates 
  ADD COLUMN customer_id UUID REFERENCES crm_customers(id),
  ADD COLUMN location_id UUID REFERENCES crm_locations(id);
```

## Files Modified
- `src/pages/admin/EstimateBuilder.tsx` -- add customer/location picker UI and queries
- Database migration -- add `customer_id` and `location_id` columns
