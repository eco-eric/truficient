
# Step 6: Interaction Logging & Activity Timeline

## Overview
This step enhances the CRM with automatic system event logging and a unified activity timeline. The goal is to provide full visibility into customer journeys by combining manual interactions (calls, emails, notes) with automated system events (conversions, pipeline movements, status changes).

## What Will Be Built

### 1. Expand Interaction Types
Add new system-generated interaction types to track automated events:
- `system_conversion` - Customer created from submission
- `system_pipeline_add` - Added to sales pipeline  
- `system_pipeline_move` - Moved between pipeline stages
- `system_status_change` - Customer status changed

### 2. Automatic Event Logging Helper
Create a utility function that logs system events to `crm_interactions`:
- Reusable across conversion, pipeline, and status change operations
- Captures event context (source, stage names, values)
- Sets `direction` to null for system events (distinguishing from manual logs)

### 3. Integration Points
Update existing components to log events automatically:

**ConvertToCustomerDialog.tsx**
- Log `system_conversion` when a submission becomes a customer
- Include source type and estimated value in the log

**Pipeline.tsx (moveMutation)**
- Log `system_pipeline_move` when dragging cards between stages
- Include "from" and "to" stage names

**AddToPipelineDialog.tsx**
- Log `system_pipeline_add` when initially adding a customer to the pipeline

### 4. Enhanced Activity Timeline Component
Create a new `ActivityTimeline.tsx` component that:
- Displays chronological feed of ALL events (manual + system)
- Uses distinct icons for each interaction type
- Shows linked submissions with source badges
- Groups events by date for readability

### 5. Linked Submissions Display
Update CustomerDetail to show linked estimator/scanner submissions:
- Query `crm_submission_links` for the customer
- Display linked submissions in the Estimates tab
- Provide quick navigation to original submission details

---

## Technical Details

### New Files
```text
src/lib/crm/logInteraction.ts     - Utility for logging system events
src/components/admin/customers/ActivityTimeline.tsx - Enhanced timeline component
src/components/admin/customers/LinkedSubmissions.tsx - Show linked form submissions
```

### Modified Files
```text
src/components/admin/submissions/ConvertToCustomerDialog.tsx
  - Add interaction log after successful customer creation
  
src/pages/admin/Pipeline.tsx  
  - Log stage transitions during drag-and-drop
  
src/components/admin/pipeline/AddToPipelineDialog.tsx
  - Log when customer is first added to pipeline
  
src/components/admin/customers/InteractionLog.tsx
  - Add system event types to the icon mapping
  - Display system events with distinct styling
  
src/pages/admin/CustomerDetail.tsx
  - Replace simple activity display with ActivityTimeline
  - Show LinkedSubmissions in the Estimates tab
```

### Interaction Type Icon Mapping
| Type | Icon | Color |
|------|------|-------|
| call | Phone | default |
| email | Mail | default |
| text | MessageSquare | default |
| note | FileText | default |
| meeting | Activity | default |
| system_conversion | UserPlus | green |
| system_pipeline_add | Kanban | blue |
| system_pipeline_move | ArrowRightLeft | purple |
| system_status_change | RefreshCw | orange |

### Log Interaction Utility Signature
```typescript
interface LogInteractionParams {
  customerId: string;
  type: string;
  subject: string;
  content?: string;
  outcome?: string;
}

async function logSystemInteraction(params: LogInteractionParams): Promise<void>
```

---

## Implementation Sequence

1. **Create `logInteraction.ts` utility** - Reusable function for inserting system events

2. **Update ConvertToCustomerDialog** - Log conversion event after customer creation

3. **Update Pipeline.tsx** - Log stage movements in moveMutation

4. **Update AddToPipelineDialog** - Log initial pipeline addition

5. **Expand InteractionLog icon mapping** - Support new system event types with distinct styling

6. **Create ActivityTimeline component** - Enhanced display with date grouping and system event badges

7. **Create LinkedSubmissions component** - Query and display submissions linked to customer

8. **Update CustomerDetail.tsx** - Integrate new timeline and linked submissions

---

## Outcome
After implementation:
- Every conversion, pipeline movement, and status change will be automatically logged
- Customer profiles will show a complete timeline of all touchpoints
- Admins can see which estimator submissions are linked to each customer
- The Activity tab provides full audit trail for customer interactions
