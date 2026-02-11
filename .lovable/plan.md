

## Show Customer Name on Calendar Events

Currently, calendar event tiles display the job number (e.g., "TRU-2026-0005") which is not very readable. The fix is to include the customer name in the data query and use it as the event title instead.

### What Changes

**File: `src/pages/admin/Calendar.tsx`**

1. **Expand the appointments query** to join customer data through the job relation:
   - Change `job:crm_jobs(id, job_number, title)` to `job:crm_jobs(id, job_number, title, customer:crm_customers(first_name, last_name))`

2. **Update the event title construction** in the `combinedEvents` memo:
   - Instead of: `"TRU-2026-0005 - Install AC"`
   - Show: `"John Smith - Install AC"` (customer name + job title)
   - Fall back to job number if no customer is linked

This is a two-line change -- one in the query, one in the title builder. No new tables, no migrations needed.

