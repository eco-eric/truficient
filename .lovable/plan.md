

# Update WorkEdge Integration to Match Actual API

## Overview

Update the `workedge-sync` edge function and integration configuration to use the correct WorkEdge API format based on the documented endpoints.

---

## Changes Required

### 1. Update Database Configuration

Update the `integration_configs` table to use the correct API URL:

```sql
UPDATE integration_configs 
SET config = jsonb_set(
  config, 
  '{api_url}', 
  '"https://vesncoasnajcdinipgkv.supabase.co/functions/v1"'
)
WHERE integration_name = 'workedge';
```

---

### 2. Update Edge Function: `workedge-sync/index.ts`

**Authentication Header Change:**
```typescript
// BEFORE
headers: {
  'Authorization': `Bearer ${WORKEDGE_API_KEY}`,
  'Content-Type': 'application/json'
}

// AFTER
headers: {
  'x-api-key': WORKEDGE_API_KEY,
  'Content-Type': 'application/json'
}
```

**Endpoint Path Change:**
```typescript
// BEFORE
const response = await fetch(`${apiUrl}/v1/projects`, { ... });

// AFTER  
const response = await fetch(`${apiUrl}/api-projects`, { ... });
```

**Payload Structure Change (create-project):**
```typescript
// BEFORE
const projectPayload = {
  name: `${job.job_number} - ${job.title}`,
  customer: {
    name: job.customer?.company_name || `${job.customer?.first_name} ${job.customer?.last_name}`,
    email: job.customer?.email,
    phone: job.customer?.phone
  },
  address: {
    street: job.location?.address_line1,
    city: job.location?.city,
    state: job.location?.state,
    zip: job.location?.zip_code
  },
  type: job.job_type?.name || 'Service',
  notes: job.internal_notes,
  scheduled_date: job.scheduled_start
};

// AFTER (matching API docs)
const projectPayload = {
  name: `${job.job_number} - ${job.title}`,
  client_name: job.customer?.company_name || 
               `${job.customer?.first_name} ${job.customer?.last_name}`.trim(),
  property_address: [
    job.location?.address_line1,
    job.location?.city,
    job.location?.state,
    job.location?.zip_code
  ].filter(Boolean).join(', '),
  project_type: job.job_type?.name?.toLowerCase() || 'service'
};
```

---

### 3. Update Webhook Handler: `workedge-webhook/index.ts`

Update the webhook payload interface to match the documented format:
```typescript
interface WorkEdgeWebhookPayload {
  event: 'photo.uploaded' | 'video.uploaded' | 'note.added' | 'report.generated';
  timestamp: string;
  data: {
    id: string;
    project_id: string;
    file_path: string;
    caption?: string;
  };
}
```

---

## Summary of All Changes

| File | Changes |
|------|---------|
| Database: `integration_configs` | Update `api_url` to correct base URL |
| `supabase/functions/workedge-sync/index.ts` | Update auth header (`x-api-key`), endpoint paths (`/api-projects`), payload structure |
| `supabase/functions/workedge-webhook/index.ts` | Update payload interface to match documented webhook format |

---

## Technical Notes

- The `sync-customer`, `get-project-media`, `get-equipment`, and `create-service-record` actions may need additional API documentation to implement correctly. For now, the primary focus is fixing `create-project` which is the action causing the current error.
- The webhook handler will work once the API URL is correct and projects can be created successfully.

