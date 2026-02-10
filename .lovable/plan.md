

# Fix: Company Contact Count Not Updating on Companies List

## Problem
The Companies list page shows "0" contacts for "Estate Adu" even though 2 contacts are linked. The Company Detail page correctly shows both contacts.

## Root Cause
The contact count query (`crm_companies_contact_counts`) is never invalidated when a customer is saved or updated. So the cached count stays at 0 until a full page refresh.

## Fix

### File: `src/components/admin/customers/CustomerFormDialog.tsx`
- In the mutation's `onSuccess` callback, add invalidation for `crm_companies_contact_counts` so the Companies list reflects the updated count immediately after saving a customer.

### File: `src/pages/admin/Companies.tsx` (minor improvement)
- Also invalidate `crm_companies_contact_counts` in the delete mutation's `onSuccess`, since deleting a company should refresh counts too.

This is a one-line addition in each file -- just adding `queryClient.invalidateQueries({ queryKey: ['crm_companies_contact_counts'] })` to the success handlers.

