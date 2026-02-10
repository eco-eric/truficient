

# Simplify Company Field in Customer Form

## Overview
Remove the legacy "Company Name" text field from the customer form and keep only the Company Account selector as the single way to associate a company. This avoids confusion from having two company fields.

## Changes

### File: `src/components/admin/customers/CustomerFormDialog.tsx`

- Remove the `company_name` field from the Zod schema (or make it fully unused)
- Remove the "Company Name (legacy)" form field from the JSX
- Keep only the `CompanySelector` dropdown for commercial customers
- In the mutation payload, stop sending `company_name` (or clear it when a `company_id` is set)

### File: `src/pages/admin/CustomerDetail.tsx`

- Where company info is displayed, show only the linked company name (from `crm_companies` via `company_id`)
- Remove any display of the legacy `company_name` field so there is only one company reference shown

### File: `src/components/admin/customers/CustomerTable.tsx`

- If the table currently shows the legacy `company_name` column, replace it with the linked company name from `crm_companies`

No database changes needed -- the `company_name` column stays in the table for backward compatibility but is simply no longer shown or edited in the UI.

