

# Plan: Add `create_customer` Write Tool to Bach

## What's Already Done
Bach already has **9 write tools** fully implemented with confirmation flows:
`create_job`, `update_job_stage`, `log_interaction`, `update_customer_status`, `add_to_pipeline`, `move_pipeline_entry`, `schedule_appointment`, `reschedule_appointment`, `cancel_appointment`

The **only missing tool** is `create_customer`.

## What We'll Add

### 1. Tool Definition (in the tools array)
Add a `create_customer` tool definition with parameters:
- `first_name` (required), `last_name` (required)
- `email`, `phone` (optional)
- `address_line1`, `city`, `state`, `zip_code` (optional address fields)
- `lead_source`, `customer_type`, `tags` (optional)
- `confirmed` (required, boolean — confirmation flow)

### 2. Execution Function: `executeCreateCustomer`
- Validates required fields (first + last name)
- If `confirmed: false`: returns a confirmation summary showing the customer details about to be created
- If `confirmed: true`:
  - INSERT into `crm_customers`
  - If address provided, INSERT into `crm_locations` with `is_primary: true`
  - Log a `system_conversion` interaction via `crm_interactions`
  - Return the new `customer_id`

### 3. Permission Mapping
Add `create_customer: "can_use_write_tools"` to the `TOOL_PERMISSIONS` map.

### 4. Tool Router
Add `case "create_customer": return executeCreateCustomer(supabase, userId, toolInput);` to the switch statement.

### 5. System Prompt Update
Add "Create new customers" to the write operations list in the system prompt.

## Files Changed
- `supabase/functions/ai-assistant/index.ts` — all changes in this single file

