

# Fix: Name Column Showing Company Name Instead of Customer Name

## Problem
The `getDisplayName` helper in `CustomerTable.tsx` prioritizes the linked company name over the customer's first/last name. Since there's already a separate "Company" column, the "Name" column should always show the person's name.

## Fix

### File: `src/components/admin/customers/CustomerTable.tsx`

Update the `getDisplayName` function (around line 131) to always return the customer's personal name:

```typescript
// Before (wrong -- shows company name in the Name column)
const getDisplayName = (customer: any) => {
  if (customer.crm_companies?.name) return customer.crm_companies.name;
  return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed';
};

// After (correct -- always shows customer name)
const getDisplayName = (customer: any) => {
  return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed';
};
```

One line removed, one file changed.
