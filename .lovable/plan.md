
# Add "Create Company" Option in Company Selector

## Overview
When searching for a company in the Company Selector dropdown and no match is found, add a "+ Create [company name]" button that instantly creates the company and selects it -- all without leaving the customer form.

## What Changes

### File: `src/components/admin/companies/CompanySelector.tsx`

- Import `useMutation` and `useQueryClient` from `@tanstack/react-query`, `Plus` icon from lucide-react, and `toast` from sonner
- Add a `createCompanyMutation` that:
  - Inserts a new row into `crm_companies` with just the `name` field set to the current search text
  - On success: invalidates company queries, calls `onChange(newCompanyId)`, closes the popover, clears search, and shows a success toast
- In the dropdown, when `companies?.length === 0` and `search` is not empty, replace the static "No companies found" text with a clickable "+ Create [search text]" button
- Also add the "+ Create" button at the bottom of results even when there ARE results, so users can always create a new one if the search text doesn't exactly match

This keeps it simple -- the company is created with just a name. Users can fill in the rest of the details later from the Companies page.

No other files need changes.
