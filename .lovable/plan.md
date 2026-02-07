

# Phase 6: Automation Engine & AI Assistant with Super Admin Controls

## Overview

This updated phase adds:
1. **Super Admin Role** - New privilege level for system-critical configurations
2. **AI Configuration Dashboard** - Admin-controlled AI model selection and settings
3. **Automation Engine** - Trigger-action workflow system
4. **AI Assistant Widget** - Contextual AI sidebar for customer/job pages

---

## Part 1: Super Admin Role System

### Why Super Admin?

Separates system-level configuration (AI models, API keys, automation rules) from day-to-day admin operations. Only super admins can:
- Configure AI models and providers
- Manage automation rules
- Access integration settings
- Modify system-wide configurations

### Database Changes

**Update app_role enum:**
```sql
ALTER TYPE public.app_role ADD VALUE 'super_admin';
```

**Assign Eric Love as first super admin:**
```sql
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = '4a05ab76-47d3-4523-8042-8bdcf787488f';
```

**Create security definer function for super admin check:**
```sql
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;
```

### Frontend Hook Update

**Update `useUserRole.ts`:**
```typescript
export type AppRole = 'super_admin' | 'admin' | 'manager';

interface UserRoleState {
  role: AppRole | null;
  loading: boolean;
  isSuperAdmin: boolean;  // NEW
  isAdmin: boolean;
  isManager: boolean;
  hasAccess: boolean;
}
```

---

## Part 2: AI Configuration Dashboard

### New Database Table: `ai_config`

Stores AI provider settings in `integration_configs` pattern:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| config_key | text | Unique key (e.g., 'ai_assistant', 'automation_ai') |
| provider | text | 'lovable' / 'openai' / 'anthropic' / 'xai' / 'google' |
| model | text | Model identifier |
| api_key_secret_name | text | Name of secret storing API key (null for Lovable AI) |
| temperature | numeric | Model temperature (0-2) |
| max_tokens | integer | Max response tokens |
| system_prompt | text | Default system prompt |
| is_active | boolean | Enable/disable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Supported Providers & Models

| Provider | Models | API Key Required |
|----------|--------|------------------|
| Lovable AI | gemini-2.5-flash, gemini-2.5-pro, gpt-5, gpt-5-mini | No (built-in) |
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | Yes |
| Anthropic | claude-3-5-sonnet, claude-3-opus, claude-3-haiku | Yes |
| xAI | grok-2, grok-2-mini | Yes |
| Google | gemini-1.5-pro, gemini-1.5-flash | Yes |

### AI Settings Page (`/admin/ai-settings`)

Super admin only page with:

**Provider Selection Card:**
- Radio buttons for provider selection
- Dynamic model dropdown based on provider
- API key input for non-Lovable providers
- Test connection button

**Configuration Cards:**
- Temperature slider (0.0 - 2.0)
- Max tokens input
- System prompt textarea with character count
- Enable/disable toggle

**Usage & Monitoring Card:**
- Recent AI requests log
- Token usage stats
- Error rate display

### Settings Tab Pattern (like WorkEdge)

Following your WorkEdge Projects pattern with tabs:
- **Overview** - Current config and stats
- **Configuration** - Model settings
- **Logs** - AI request history
- **Advanced** - Custom prompts, fallback settings

---

## Part 3: Automation Engine

### Database Schema

**Table: `automations`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Display name |
| description | text | Optional description |
| trigger_type | text | Event type |
| trigger_config | jsonb | Trigger-specific settings |
| conditions | jsonb | Array of condition objects |
| actions | jsonb | Array of action objects |
| is_active | boolean | Enable/disable |
| run_count | integer | Execution count |
| last_run_at | timestamptz | Last execution |
| created_by | uuid | FK to auth.users |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Table: `automation_logs`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| automation_id | uuid | FK to automations |
| trigger_event | jsonb | Event data |
| actions_executed | jsonb | Results per action |
| status | text | success/partial/failed |
| error_message | text | Error details |
| duration_ms | integer | Execution time |
| created_at | timestamptz | |

### Trigger Types

| Trigger | Event | Available Data |
|---------|-------|----------------|
| `new_submission` | Form submitted | submission type, customer data |
| `pipeline_move` | Stage changed | customer, from/to stage |
| `pipeline_won` | Deal won | customer, deal value |
| `job_created` | New job | job, customer, location |
| `job_stage_change` | Job stage moved | job, from/to stage |
| `job_scheduled` | Job scheduled | job, date/time, crew |
| `job_completed` | Job finished | job, final amount |

### Action Types

| Action | Description |
|--------|-------------|
| `create_ghl_task` | Create task in GoHighLevel |
| `add_ghl_tag` | Add tag to GHL contact |
| `update_customer_status` | Change customer status |
| `create_job` | Create new CRM job |
| `move_pipeline` | Move to pipeline stage |
| `send_notification` | Internal notification |
| `log_interaction` | Log activity |
| `webhook` | Call external URL |
| `ai_generate` | Generate content with AI |

### Edge Function: `process-automation`

```typescript
// Actions handled
const actions = [
  'list-automations',
  'create-automation', 
  'update-automation',
  'delete-automation',
  'execute-automation',  // Manual trigger
  'process-event'        // Event-driven trigger
];
```

---

## Part 4: AI Assistant Widget

### Edge Function: `ai-assistant`

Reads AI config from database, then calls appropriate provider:

```typescript
// Get AI configuration
const { data: aiConfig } = await supabase
  .from('ai_config')
  .select('*')
  .eq('config_key', 'ai_assistant')
  .single();

// Route to provider
switch (aiConfig.provider) {
  case 'lovable':
    return callLovableAI(aiConfig, messages);
  case 'openai':
    return callOpenAI(apiKey, aiConfig, messages);
  case 'anthropic':
    return callAnthropic(apiKey, aiConfig, messages);
  case 'xai':
    return callXAI(apiKey, aiConfig, messages);
  // ...
}
```

### Assistant Actions

| Action | Description |
|--------|-------------|
| `summarize_customer` | Summarize customer history |
| `draft_followup` | Generate follow-up message |
| `suggest_actions` | Recommend next steps |
| `answer_question` | Answer about customer/equipment |

### Widget Component

Floating sidebar on CustomerDetail and JobDetail pages:
- Chat-style interface with markdown rendering
- Pre-built quick prompts
- Streaming responses
- Context-aware (knows current customer/job)

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/AISettings.tsx` | AI configuration page (super admin only) |
| `src/pages/admin/Automations.tsx` | Automation management page |
| `src/components/admin/ai/AIAssistantWidget.tsx` | Floating AI sidebar |
| `src/components/admin/ai/AIChat.tsx` | Chat interface component |
| `src/components/admin/ai/QuickPrompts.tsx` | Pre-built prompt buttons |
| `src/components/admin/automations/AutomationBuilder.tsx` | Create/edit dialog |
| `src/components/admin/automations/TriggerSelector.tsx` | Trigger picker |
| `src/components/admin/automations/ActionConfigurator.tsx` | Action setup |
| `supabase/functions/ai-assistant/index.ts` | AI assistant edge function |
| `supabase/functions/process-automation/index.ts` | Automation processor |

### Modified Files

| File | Changes |
|------|---------|
| `src/hooks/useUserRole.ts` | Add `isSuperAdmin` flag |
| `src/pages/admin/Users.tsx` | Add super_admin role option |
| `src/pages/admin/CustomerDetail.tsx` | Add AI Assistant widget |
| `src/pages/admin/JobDetail.tsx` | Add AI Assistant widget |
| `src/pages/admin/Pipeline.tsx` | Call automation on stage move |
| `src/components/admin/adminNavConfig.ts` | Add AI Settings, Automations |
| `src/App.tsx` | Add new routes |
| `supabase/config.toml` | Add new edge functions |

---

## Navigation Structure

**System Section (updated):**
```
System
├── Users
├── AI Settings         ← NEW (super_admin only)
├── Automations         ← NEW (super_admin only)
├── Lead Sources
├── Campaign Tags
├── Trash Bin
└── Settings
```

---

## RLS Policies

**ai_config table:**
- SELECT: super_admin only
- INSERT/UPDATE/DELETE: super_admin only

**automations table:**
- SELECT: admin + manager (view rules)
- INSERT/UPDATE/DELETE: super_admin only

**automation_logs table:**
- SELECT: admin + manager
- INSERT: service role only (from edge function)

---

## Implementation Order

1. **Database Migration**
   - Add `super_admin` to app_role enum
   - Update Eric's role to super_admin
   - Create `ai_config` table
   - Create `automations` and `automation_logs` tables
   - Add RLS policies

2. **Frontend Role Updates**
   - Update `useUserRole` hook with `isSuperAdmin`
   - Update Users page to show/assign super_admin
   - Create `SuperAdminRoute` wrapper component

3. **AI Settings Page**
   - Build page following WorkEdge pattern with tabs
   - Provider/model selector
   - Configuration controls
   - Test connection functionality

4. **AI Assistant Edge Function**
   - Multi-provider support
   - Config-driven model selection
   - Streaming responses

5. **AI Assistant Widget**
   - Chat component with markdown
   - Quick prompts
   - Integration with CustomerDetail/JobDetail

6. **Automation Engine**
   - Database tables and edge function
   - Automation builder UI
   - Trigger integration points

7. **Testing & Polish**
   - End-to-end testing
   - Error handling
   - Usage logging

---

## Security Considerations

1. **API Keys** - Stored as Supabase secrets, referenced by name in ai_config
2. **Role Hierarchy** - super_admin > admin > manager
3. **RLS Enforcement** - All sensitive tables protected
4. **Audit Trail** - All AI requests and automation runs logged

---

## API Key Setup (Future)

When you want to use a non-Lovable AI provider:
1. Go to AI Settings
2. Select provider (e.g., "Anthropic")
3. System prompts you to add secret via Lovable
4. Once secret added, select model and save
5. AI Assistant uses new provider

For now, Lovable AI (Gemini) works out of the box with no setup required.

