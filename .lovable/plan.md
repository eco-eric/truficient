

# Company Accounts for the CRM

## Overview
Add a new **Company Accounts** entity so you can group multiple customer contacts under a single company (like a GC). Companies are fully optional -- residential customers continue working exactly as they do today. Commercial contacts can optionally be linked to a company account.

## What You'll See

- A new **"Companies"** nav item in the CRM sidebar section
- A **Companies list page** with search, add, and edit -- similar look to the Customers page
- A **Company Detail page** showing company info, linked contacts, locations, and jobs
- On the **Customer Form**, a new optional "Company" dropdown that appears for commercial customers
- On the **Customer Table** and **Customer Detail**, a clickable company name badge when linked

## Database Changes

### New table: `crm_companies`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| name | text (required) | Company/GC name |
| phone | text | Main office phone |
| email | text | Main office email |
| website | text | Company website |
| billing_address | text | |
| billing_city | text | |
| billing_state | text | |
| billing_zip | text | |
| notes | text | Internal notes |
| tags | text[] | Campaign tags |
| lead_source | text | Same lead source options |
| workedge_customer_id | text | For WorkEdge sync |
| deleted_at | timestamptz | Soft delete |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### Alter `crm_customers`

Add one column:
- `company_id` (uuid, nullable, FK to `crm_companies.id`)

This is optional -- residential customers will have `company_id = null`. Commercial contacts can be linked.

### RLS Policies
Same pattern as `crm_customers`: authenticated users get full CRUD access.

## Files to Create

### 1. `src/pages/admin/Companies.tsx`
Company list page with:
- Search bar (name, email, phone)
- "New Company" button opening a form dialog
- Table showing name, phone, email, linked contact count, created date
- Row click navigates to company detail

### 2. `src/pages/admin/CompanyDetail.tsx`
Company detail page with:
- Header: company name, edit button
- Contact info card (phone, email, website, address)
- Tabs: Contacts (linked customers), Locations, Jobs, Notes
- "Add Contact" button to create or link an existing customer

### 3. `src/components/admin/companies/CompanyFormDialog.tsx`
Form dialog for creating/editing companies with fields: name, phone, email, website, billing address, notes, lead source, tags.

### 4. `src/components/admin/companies/CompanySelector.tsx`
A searchable combobox component for selecting a company (used in the customer form). Fetches from `crm_companies`, shows a search input with dropdown results.

## Files to Modify

### 5. `src/components/admin/customers/CustomerFormDialog.tsx`
- Add optional `company_id` field to the schema
- When `customer_type` is "commercial", show a `CompanySelector` dropdown
- Include `company_id` in the insert/update payload

### 6. `src/components/admin/customers/CustomerTable.tsx`
- Join `crm_companies` in the query to get company name
- Show company name as a clickable badge in a new "Company" column (only visible when non-null)

### 7. `src/pages/admin/CustomerDetail.tsx`
- Show linked company name as a clickable link in the contact info card
- Links to `/admin/companies/{companyId}`

### 8. `src/components/admin/adminNavConfig.ts`
- Add "Companies" nav item under CRM section: `{ label: 'Companies', href: '/admin/companies', icon: Building2, permissionKey: 'nav.companies' }`

### 9. `src/App.tsx`
- Import and add routes for `/admin/companies` and `/admin/companies/:id`

## Technical Details

### Company selector query
```text
SELECT id, name FROM crm_companies
WHERE deleted_at IS NULL
  AND name ILIKE '%search%'
ORDER BY name
LIMIT 20
```

### Customer table query update
```text
SELECT *, crm_companies!company_id(id, name)
FROM crm_customers
WHERE deleted_at IS NULL
```

### Contact count on companies list
```text
SELECT crm_companies.*, 
  (SELECT count(*) FROM crm_customers WHERE company_id = crm_companies.id AND deleted_at IS NULL) as contact_count
FROM crm_companies
WHERE deleted_at IS NULL
```

### What stays the same
- Residential customers are unaffected (company_id stays null)
- Existing `company_name` field on `crm_customers` continues to work for backward compatibility
- All existing customer flows, imports, and syncs remain unchanged

