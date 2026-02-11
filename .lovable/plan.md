

# Fix Linked Submissions: Show Estimates + Fix Missing Scanner Link

## Two Problems

1. **Marrianne's scanner submission link is missing** from `crm_submission_links`. The conversion flow should have created it but the row doesn't exist. We need to backfill it and also make the conversion more resilient.

2. **Estimates from the Estimate Builder never appear** because `LinkedSubmissions.tsx` only queries `crm_submission_links`, not the `estimates` table.

## Changes

### 1. Database: Backfill the missing scanner link

Insert the missing `crm_submission_links` row for Marrianne's scanner submission so it shows up immediately.

```sql
INSERT INTO crm_submission_links (customer_id, submission_id, submission_type)
VALUES ('aaafa1dc-afcd-4b74-8486-2b8aa9393a3a', '82889508-28f9-4c7e-b77b-a0f760073e18', 'scanner');
```

### 2. Code: Update `src/components/admin/customers/LinkedSubmissions.tsx`

**a) Add a query for the `estimates` table**
- Fetch all estimates where `customer_id` matches
- Map them into the same `SubmissionDetail` format with type `'estimate'`

**b) Add "estimate" to `sourceConfig`**
- Icon: `FileText` or `Calculator`
- Label: "Estimate"
- Color: teal/cyan theme

**c) Merge and display both sources**
- Combine submission-link results and estimate results
- Sort by date descending
- Update the empty state check to account for both queries
- Navigate to `/admin/estimates/builder?id={estimateId}` when clicking an estimate row

**d) Update the count in the header**
- Show total count from both sources

### 3. Code: Make conversion link insert more resilient in `ConvertToCustomerDialog.tsx`

The link insert at line 256 logs an error but doesn't surface it to the user. Change it to use `upsert` with `onConflict` so duplicate conversions don't silently fail, and add a toast warning if the link fails so the user knows something went wrong.

## Scope

- One migration (backfill data)
- Two files modified:
  - `src/components/admin/customers/LinkedSubmissions.tsx`
  - `src/components/admin/submissions/ConvertToCustomerDialog.tsx`

