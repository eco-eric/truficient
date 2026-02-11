# AI Assistant — Phase 2: Write Operations

> Addendum to AI-ASSISTANT.md | February 2026

## What Phase 2 Adds

Phase 2 introduces **write operations with a mandatory confirmation flow**. The AI assistant can now create and modify CRM data, but always presents a summary and asks for explicit confirmation before executing any changes.

---

## Confirmation Flow Architecture

Every write tool has a `confirmed` boolean parameter. The flow works like this:

```
User: "Create a job for Martinez"
                │
                ▼
┌─────────────────────────────────┐
│  1. Claude calls create_job     │
│     with confirmed: false       │
│                                 │
│  2. Tool returns:               │
│     needs_confirmation: true    │
│     confirmation_prompt: "..."  │
│     summary: { ... }            │
│                                 │
│  3. Claude presents summary     │
│     to the user and asks to     │
│     confirm                     │
└────────────────┬────────────────┘
                 │
        User says "Yes" or clicks Confirm
                 │
                 ▼
┌─────────────────────────────────┐
│  4. Claude calls create_job     │
│     with confirmed: true        │
│     (same parameters)           │
│                                 │
│  5. Tool executes the write     │
│     and returns success         │
│                                 │
│  6. Claude confirms to user:    │
│     "Created job TRU-2026-0048" │
└─────────────────────────────────┘
```

If the user says "no" or "cancel", Claude acknowledges and does NOT call the tool again.

If the user corrects a detail, Claude calls the tool with updated parameters and `confirmed: false` to show a new summary.

---

## New Tools (Phase 2)

### Write Tools (require confirmation)

| Tool | Purpose | Key Params |
|------|---------|------------|
| `create_job` | Create a new job for a customer | customer_id, job_type_slug, scheduled_date, confirmed |
| `update_job_stage` | Move job to a different stage | job_id, target_stage_name, confirmed |
| `log_interaction` | Add call/email/note/text/meeting/task | customer_id, interaction_type, content, confirmed |
| `update_customer_status` | Change lifecycle status | customer_id, new_status, reason, confirmed |
| `add_to_pipeline` | Add customer to sales pipeline | customer_id, stage_name, estimated_value, confirmed |
| `move_pipeline_entry` | Move between pipeline stages | entry_id, target_stage_name, confirmed |
| `schedule_appointment` | Create timed appointment for a job | job_id, start/end_datetime, team_id, confirmed |

### New Read Tools (no confirmation)

| Tool | Purpose |
|------|---------|
| `get_job_types` | List available job types and slugs |
| `get_pipeline_stages` | List pipeline stage definitions |

---

## Auto-Logging

All write operations automatically create system interactions in `crm_interactions` for audit trail:

- **create_job** → Logs "Job TRU-XXXX-XXXX (Type) created via AI Assistant"
- **update_job_stage** → Logs stage transition in `crm_job_stage_history`
- **update_customer_status** → Logs "Status changed from X to Y (via AI Assistant)"
- **add_to_pipeline** → Logs "Added to pipeline at Stage (via AI Assistant)"
- **move_pipeline_entry** → Logs "Pipeline stage changed from X to Y (via AI Assistant)"

---

## Conflict Detection

The `schedule_appointment` tool checks for scheduling conflicts before confirmation:

- Queries existing appointments for the same team in the proposed time window
- If conflicts found, the confirmation prompt includes a ⚠️ warning with the count
- The user can still confirm despite conflicts (not blocked, just warned)

---

## Job Number Generation

New jobs get auto-generated numbers: `TRU-YYYY-XXXX`

The function queries the highest existing number for the current year and increments by 1, zero-padded to 4 digits.

---

## Multi-Step Workflow Support

The AI handles multi-step requests by breaking them into sequential confirmed actions:

**Example:** "Create a job for Smith and schedule Crew A for Tuesday at 9am"

1. Search for Smith → auto-executed (read, no confirmation)
2. Create job → shows confirmation card → waits for confirm
3. Schedule appointment → shows confirmation card → waits for confirm

Each step completes before the next begins.

---

## Frontend Changes (Phase 2)

### ConfirmationCard Component
- Renders inside assistant message bubbles when a confirmation is pending
- Confirm button sends "Yes, confirmed" as a user message
- Cancel button sends "Cancel that"
- Cards become disabled after action, showing "✓ Confirmed" or "✕ Cancelled"

### Success Indicators
- Messages containing write confirmations get a green ✅ checkmark
- Provides clear visual feedback that the action completed

### Pending Indicator
- Amber bar above input area: "⚡ Awaiting your confirmation above..."
- Only visible when the latest message has a pending confirmation

---

## Error Handling

### Invalid References
If a tool can't find the referenced entity (wrong job type slug, unknown stage name, etc.), it returns an `error` with a list of `available_` options so Claude can suggest corrections:

```json
{
  "error": "Stage \"Done\" not found for this job type.",
  "available_stages": ["New", "Scheduled", "In Progress", "Completed"]
}
```

### Duplicate Prevention
- `add_to_pipeline` checks if the customer is already in the pipeline and returns an error with their current stage
- Suggests using `move_pipeline_entry` instead

### Permission Errors
- All write operations use the authenticated user's Supabase session
- RLS policies enforce role-based access (admin/manager can write, manager cannot delete)

---

## Updated System Prompt Summary

Key additions to the system prompt for Phase 2:
- Confirmation rules: never set `confirmed: true` on first call
- Multi-step workflow instructions: break complex requests into sequential confirmations
- Timezone handling: Central Time for all scheduling
- Error recovery: suggest corrections when entities aren't found

---

## Related Files

| File | Purpose |
|------|---------|
| `supabase/functions/ai-assistant/index.ts` | Edge function (updated with write tools) |
| `src/components/admin/assistant/ConfirmationCard.tsx` | Confirmation UI component |
| `src/components/admin/assistant/ChatMessage.tsx` | Updated message rendering |
| `src/components/admin/assistant/AssistantContext.tsx` | Updated state management |
| `src/components/admin/assistant/AIAssistantPanel.tsx` | Updated panel with pending indicator |
