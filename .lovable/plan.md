

# Fix: Edit Customer Popup Showing Blank Fields

## The Problem
When clicking "Edit Customer," all fields appear blank. This is caused by a bug introduced during the Company Accounts update.

## Root Cause
In `src/components/admin/customers/CustomerFormDialog.tsx`, the `useEffect` hook (lines 113-154) has duplicate code. It:
1. Correctly resets the form with customer data (lines 115-131)
2. Then **immediately overwrites** it with blank defaults (lines 134-150), erasing everything

The second block (lines 134-153) should only run when there is NO customer (i.e., the "New Customer" case), but it was accidentally placed inside the `if (customer)` block.

## The Fix
Restructure the `useEffect` to use an `if/else`:
- **If a customer is passed** (editing): populate the form with that customer's data
- **Else** (creating new): reset to blank defaults

### File: `src/components/admin/customers/CustomerFormDialog.tsx`

Replace the `useEffect` (lines 113-154) so that:
- The first `form.reset(...)` with customer data stays inside the `if (customer)` block along with `setSelectedTags` and `setSelectedCompanyId`
- The second `form.reset(...)` with blank defaults moves into an `else` block, along with clearing tags and company

No other files need changes.

