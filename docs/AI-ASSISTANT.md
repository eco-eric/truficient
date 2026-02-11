# AI Operations Assistant Documentation

> Last Updated: February 2026

## Overview

The AI Operations Assistant is a natural language interface embedded in the admin dashboard that allows staff to search, query, and interact with CRM data using conversational commands — typed or spoken. It uses the Claude API with tool definitions to interpret requests and execute read operations against Supabase.

**Phase 1 (Current):** Read-only operations — search, lookup, and reporting
**Phase 2 (Planned):** Write operations with confirmation — create jobs, log interactions, update statuses
**Phase 3 (Planned):** Voice input + Google Calendar integration + multi-step workflows
**Phase 4 (Planned):** Proactive suggestions and dashboard intelligence

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                                      │
│  ┌───────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │       Normal Admin UI          │  │       AI Assistant Panel            │ │
│  │  Customers, Jobs, Pipeline     │  │  ┌───────────────────────────────┐ │ │
│  │                                │  │  │  Conversation History         │ │ │
│  │                                │  │  │  (scrollable messages)        │ │ │
│  │                                │  │  ├───────────────────────────────┤ │ │
│  │                                │  │  │  [🎤] [Type a message...]  [→]│ │ │
│  │                                │  │  └───────────────────────────────┘ │ │
│  └───────────────────────────────┘  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────┬──────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              Supabase Edge Function: ai-assistant                            │
│                                                                              │
│  1. Receive user message + conversation history                              │
│  2. Send to Claude API with system prompt + tool definitions                 │
│  3. Claude decides which tools to call                                       │
│  4. Execute tools (Supabase queries, external lookups)                       │
│  5. Return tool results to Claude for natural language response              │
│  6. Stream or return final response to frontend                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/components/admin/assistant/
├── AIAssistantPanel.tsx          # Main slide-out panel component
├── AssistantToggle.tsx           # Floating action button to open panel
├── ChatMessage.tsx               # Individual message bubble
├── ChatInput.tsx                 # Text input + mic button
├── ActionCard.tsx                # Structured result display cards
├── AssistantContext.tsx           # Conversation state management
└── hooks/
    └── useAssistant.ts           # API communication hook

supabase/functions/
└── ai-assistant/
    └── index.ts                  # Edge function with Claude API + tools
```

---

## Edge Function: `ai-assistant`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for tool-use requests |

### Request Payload

```typescript
interface AssistantRequest {
  message: string;                    // User's current message
  conversationHistory: Message[];     // Previous messages for context
  userId: string;                     // Authenticated admin user ID
}

interface Message {
  role: "user" | "assistant";
  content: string;
}
```

### Response Payload

```typescript
interface AssistantResponse {
  message: string;                    // Claude's natural language response
  toolsUsed: ToolExecution[];         // Tools that were called (for transparency)
  structuredData?: StructuredResult;  // Optional structured data for rich display
}

interface ToolExecution {
  tool: string;                       // Tool name
  input: Record<string, any>;         // What was passed to the tool
  summary: string;                    // Human-readable summary of what happened
}

interface StructuredResult {
  type: "customer" | "customers_list" | "job" | "jobs_list" |
        "submissions_list" | "schedule" | "property_data" | "stats";
  data: any;                          // Typed data for the ActionCard component
}
```

---

## Phase 1 Tools (Read-Only)

### Tool Definitions

Each tool maps to a Supabase query. Claude selects and chains tools based on the user's natural language request.

---

### `search_customers`

**Purpose:** Find customers by name, email, phone, address, or status.

```typescript
{
  name: "search_customers",
  description: "Search for customers in the CRM by name, email, phone number, address, or status. Returns matching customer records with their primary location and recent activity summary.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search term - can be a name, email, phone, or partial address"
      },
      status: {
        type: "string",
        enum: ["lead", "prospect", "active", "inactive", "former"],
        description: "Optional filter by customer lifecycle status"
      },
      limit: {
        type: "number",
        description: "Max results to return (default 10)"
      }
    },
    required: ["query"]
  }
}
```

**Supabase Query:**
```typescript
const { data } = await supabase
  .from('crm_customers')
  .select(`
    *,
    crm_locations(address_line1, city, state, zip_code, is_primary),
    crm_submission_links(submission_type, submission_id)
  `)
  .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
  .eq(status ? 'customer_status' : 'id', status || undefined)
  .limit(limit || 10);
```

**Example Interactions:**
- "Find John Smith" → `search_customers({ query: "John Smith" })`
- "Show me all active customers" → `search_customers({ query: "%", status: "active" })`
- "What's the phone number for the customer on Oak Street?" → `search_customers({ query: "Oak" })`

---

### `get_customer_details`

**Purpose:** Get full details for a specific customer including locations, interactions, jobs, and submissions.

```typescript
{
  name: "get_customer_details",
  description: "Get comprehensive details for a specific customer by their ID. Returns full profile, all locations, recent interactions, active jobs, and linked submissions.",
  input_schema: {
    type: "object",
    properties: {
      customer_id: {
        type: "string",
        description: "The UUID of the customer"
      }
    },
    required: ["customer_id"]
  }
}
```

**Supabase Queries (chained):**
```typescript
// Customer + locations
const customer = await supabase
  .from('crm_customers')
  .select('*, crm_locations(*)')
  .eq('id', customer_id)
  .single();

// Recent interactions
const interactions = await supabase
  .from('crm_interactions')
  .select('*')
  .eq('customer_id', customer_id)
  .order('created_at', { ascending: false })
  .limit(10);

// Active jobs
const jobs = await supabase
  .from('crm_jobs')
  .select('*, crm_job_types(name), crm_job_stages(name)')
  .eq('customer_id', customer_id)
  .order('created_at', { ascending: false })
  .limit(5);
```

---

### `search_jobs`

**Purpose:** Find jobs by job number, customer name, status, type, or date range.

```typescript
{
  name: "search_jobs",
  description: "Search for jobs by job number, customer name, job type, stage, or date range. Returns job details with customer and scheduling info.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Job number (e.g., TRU-2026-0042) or customer name"
      },
      job_type: {
        type: "string",
        description: "Filter by job type slug (e.g., 'ductless-install', 'maintenance')"
      },
      stage: {
        type: "string",
        description: "Filter by current stage name"
      },
      date_from: {
        type: "string",
        description: "Start date filter (ISO format)"
      },
      date_to: {
        type: "string",
        description: "End date filter (ISO format)"
      },
      limit: {
        type: "number",
        description: "Max results (default 10)"
      }
    }
  }
}
```

---

### `get_schedule`

**Purpose:** View upcoming appointments, team availability, and scheduling conflicts.

```typescript
{
  name: "get_schedule",
  description: "Get scheduled appointments for a date range, optionally filtered by team or technician. Shows job details, assigned crews, and time slots.",
  input_schema: {
    type: "object",
    properties: {
      date_from: {
        type: "string",
        description: "Start date (ISO format). Defaults to today."
      },
      date_to: {
        type: "string",
        description: "End date (ISO format). Defaults to 7 days from start."
      },
      team_id: {
        type: "string",
        description: "Optional team ID to filter by specific crew"
      },
      member_id: {
        type: "string",
        description: "Optional team member ID for individual schedule"
      }
    }
  }
}
```

**Supabase Query:**
```typescript
const { data } = await supabase
  .from('crm_job_appointments')
  .select(`
    *,
    crm_jobs(
      job_number,
      crm_customers(first_name, last_name, phone),
      crm_locations(address_line1, city),
      crm_job_types(name)
    ),
    crm_teams(name, color)
  `)
  .gte('start_datetime', date_from)
  .lte('start_datetime', date_to)
  .order('start_datetime');
```

**Example Interactions:**
- "What's on the schedule for tomorrow?" → `get_schedule({ date_from: "2026-02-12" })`
- "Is Crew A available Thursday?" → `get_schedule({ date_from: "Thursday", team_id: "..." })`
- "Show me next week's appointments" → `get_schedule({ date_from: "next Monday", date_to: "next Friday" })`

---

### `get_submission_stats`

**Purpose:** Aggregate counts and metrics across all submission types.

```typescript
{
  name: "get_submission_stats",
  description: "Get submission counts and metrics. Can filter by date range, source type, and status. Returns counts per source, conversion rates, and totals.",
  input_schema: {
    type: "object",
    properties: {
      date_from: {
        type: "string",
        description: "Start date for stats period (ISO format)"
      },
      date_to: {
        type: "string",
        description: "End date for stats period (ISO format)"
      },
      source: {
        type: "string",
        enum: ["ducted", "ductless", "scanner", "contact", "landing_page", "all"],
        description: "Filter by submission source (default: all)"
      }
    }
  }
}
```

**Queries (aggregated across tables):**
```typescript
const tables = [
  { name: 'contact_submissions', source: 'contact' },
  { name: 'ducted_estimate_submissions', source: 'ducted' },
  { name: 'ductless_estimate_submissions', source: 'ductless' },
  { name: 'equipment_scans', source: 'scanner' },
  { name: 'landing_page_submissions', source: 'landing_page' },
];

// Count each with date filters
const results = await Promise.all(
  tables.map(t => supabase
    .from(t.name)
    .select('id', { count: 'exact', head: true })
    .gte('created_at', date_from)
    .lte('created_at', date_to)
  )
);
```

---

### `get_recent_submissions`

**Purpose:** Get the latest submissions across all form types.

```typescript
{
  name: "get_recent_submissions",
  description: "Get the most recent form submissions across all types (contact forms, estimates, scanner). Returns customer info, type, and key details for each.",
  input_schema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Number of submissions to return (default 10)"
      },
      source: {
        type: "string",
        enum: ["ducted", "ductless", "scanner", "contact", "landing_page"],
        description: "Optional filter by specific submission type"
      },
      status: {
        type: "string",
        description: "Optional filter by status (new, contacted, reviewed, etc.)"
      }
    }
  }
}
```

---

### `get_pipeline_overview`

**Purpose:** Get pipeline stage counts, values, and recent movement.

```typescript
{
  name: "get_pipeline_overview",
  description: "Get a summary of the sales pipeline showing count and total estimated value per stage, plus recent stage transitions.",
  input_schema: {
    type: "object",
    properties: {
      include_entries: {
        type: "boolean",
        description: "If true, include individual pipeline entries (default false, just counts)"
      }
    }
  }
}
```

---

### `lookup_property_data`

**Purpose:** Look up property information for an address using county GIS data.

```typescript
{
  name: "lookup_property_data",
  description: "Look up property data (square footage, year built, stories) for a specific address using county tax records. Works for Dallas, Denton, Collin, and Tarrant counties.",
  input_schema: {
    type: "object",
    properties: {
      address: {
        type: "string",
        description: "Full street address to look up"
      },
      city: {
        type: "string",
        description: "City name"
      },
      zip_code: {
        type: "string",
        description: "ZIP code"
      }
    },
    required: ["address"]
  }
}
```

**Implementation:** Calls existing `lookup-property-data` edge function.

---

### `get_team_info`

**Purpose:** Look up team/crew information, members, and certifications.

```typescript
{
  name: "get_team_info",
  description: "Get information about teams (crews), their members, certifications, and current assignments. Can search by team name or member name.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Team name or member name to search for"
      },
      team_id: {
        type: "string",
        description: "Specific team ID to get full details"
      }
    }
  }
}
```

---

## System Prompt

The edge function sends this system prompt with every Claude API call:

```
You are Tru, an AI operations assistant for Truficient Energy Solutions, an HVAC company
in the Dallas-Fort Worth area. You help the admin team manage their CRM, look up customer
information, check schedules, and review business metrics.

PERSONALITY:
- Professional but conversational — like a competent office assistant
- Concise — lead with the answer, add detail only if helpful
- Proactive — if a search returns one obvious match, present it directly
- Honest — say when you can't find something or need more info

CAPABILITIES (Phase 1 - Read Only):
- Search and view customer records, locations, and interaction history
- Look up jobs by number, customer, type, or date
- Check team schedules and availability
- View submission counts and pipeline metrics
- Look up property data for DFW addresses
- View team/crew information and assignments

LIMITATIONS:
- You CANNOT create, update, or delete any records yet (coming in Phase 2)
- If asked to modify data, explain this and suggest the admin UI page instead
- You cannot access external systems directly (GHL, Google Calendar) yet

RESPONSE FORMAT:
- For single results: Present key info naturally in conversation
- For lists: Use brief summaries, offer to drill into specifics
- For numbers/stats: Lead with the headline number
- Always include relevant IDs or links when referencing specific records
- If results include phone numbers or addresses, present them clearly

CONTEXT:
- Today's date: {current_date}
- The business serves the Dallas-Fort Worth metroplex
- Job numbers follow format TRU-YYYY-XXXX
- Customer statuses: lead → prospect → active → inactive → former
```

---

## Frontend Component: AIAssistantPanel

### Design Specifications

**Trigger Button:**
- Floating action button, bottom-right of admin layout
- Navy blue (#1B2A4A) background, gold (#C4A962) icon
- Subtle pulse animation when panel is closed
- Badge indicator for any proactive notifications (Phase 4)

**Panel:**
- Slide-out from the right side, 400px wide
- Semi-transparent backdrop on mobile (full overlay)
- Persistent conversation within the session (resets on page refresh)
- Smooth open/close animation (300ms ease-out)

**Message Bubbles:**
- User messages: Navy blue background, white text, right-aligned
- Assistant messages: Light gray background, dark text, left-aligned
- Typing indicator: Three dots animation while waiting for response

**Action Cards (structured results):**
- Customer Card: Name, status badge, phone, email, primary address
- Job Card: Job number, type, stage badge, customer name, scheduled date
- Schedule Card: Timeline view of appointments for a date
- Stats Card: Key metrics with small trend indicators

**Input Area:**
- Text input with placeholder "Ask me anything..."
- Microphone button (Phase 3, shown but disabled with tooltip)
- Send button
- "Escape" key or click outside to close panel

### Component Props

```typescript
interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  structuredData?: StructuredResult;
  toolsUsed?: ToolExecution[];
  timestamp: Date;
  isLoading?: boolean;
}
```

### State Management

```typescript
interface AssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// Hook: useAssistant
function useAssistant() {
  const [state, dispatch] = useReducer(assistantReducer, initialState);

  const sendMessage = async (content: string) => {
    // 1. Add user message to state
    // 2. Set loading
    // 3. Call ai-assistant edge function
    // 4. Add assistant response to state
    // 5. Clear loading
  };

  return { ...state, sendMessage };
}
```

---

## Integration with Admin Layout

The assistant toggle button and panel are added to `AdminLayout.tsx`:

```typescript
// In AdminLayout.tsx
import { AIAssistantPanel } from './assistant/AIAssistantPanel';
import { AssistantToggle } from './assistant/AssistantToggle';

export function AdminLayout() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>
        <AdminHeader />
        <Outlet />
      </main>

      {/* AI Assistant */}
      <AssistantToggle
        onClick={() => setAssistantOpen(true)}
        isOpen={assistantOpen}
      />
      <AIAssistantPanel
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}
```

---

## Example Conversations

### Customer Lookup
```
User: "Find the Martinez customer"
Assistant: I found Maria Martinez (Active customer).
  📞 (214) 555-8901
  📧 maria.martinez@email.com
  📍 4521 Elm Street, Plano, TX 75024
  Last interaction: Phone call on Feb 3, 2026
  Active job: TRU-2026-0038 (Ductless Install - In Progress)
```

### Schedule Check
```
User: "What do we have going on tomorrow?"
Assistant: Tomorrow (Feb 12) you have 3 appointments:

  8:00 AM - 12:00 PM | TRU-2026-0042
    Ductless Install - Johnson residence
    1847 Oak Lane, Allen, TX
    Crew A assigned

  10:00 AM - 11:30 AM | TRU-2026-0045
    Maintenance - Chen residence
    903 Maple Dr, McKinney, TX
    Mike (solo)

  1:00 PM - 5:00 PM | TRU-2026-0039
    Ducted System Install - Williams
    2204 Pine St, Frisco, TX
    Crew B assigned

Note: The Johnson and Chen jobs overlap by 2 hours.
```

### Submission Stats
```
User: "How many leads came in this week?"
Assistant: This week (Feb 9-11) you've received 7 new submissions:
  • 3 from the Ducted Estimator
  • 2 from the Ductless Estimator
  • 1 Contact Form
  • 1 Equipment Scanner

  That's up from 5 last week. 2 are still in "new" status.
```

### Write Operation Redirect (Phase 1)
```
User: "Create a job for the Martinez install"
Assistant: I can't create jobs yet — that's coming in the next update.
For now, you can create it from Maria Martinez's customer page:
Admin → Customers → Maria Martinez → Jobs tab → New Job

Want me to pull up her details so you have the info handy?
```

---

## Security

### Authentication
- Edge function validates the user's Supabase JWT
- Only authenticated users with `admin` or `manager` roles can access
- All queries respect existing RLS policies

### Rate Limiting
- Max 30 messages per minute per user (prevent API cost runaway)
- Conversation history limited to last 20 messages sent to Claude

### Audit
- All assistant interactions logged to `assistant_logs` table
- Includes: user_id, message, tools_called, response, timestamp
- Available in admin settings for review

---

## Cost Estimates

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Avg Cost Per Interaction |
|-------|----------------------|------------------------|--------------------------|
| Claude Sonnet 4 | $0.003 | $0.015 | ~$0.02-0.05 |

At ~100 interactions/day: **$2-5/day** or **$60-150/month**

---

## Phase 2 Preview: Write Operations

Tools to add in Phase 2 (all with confirmation flow):

| Tool | Purpose |
|------|---------|
| `create_job` | Create new job linked to customer + location |
| `update_job_stage` | Move job to a different stage |
| `log_interaction` | Add call/email/note to customer timeline |
| `update_customer_status` | Change customer lifecycle status |
| `create_pipeline_entry` | Add customer to sales pipeline |
| `schedule_appointment` | Create job appointment (no calendar sync yet) |

### Confirmation Pattern

```typescript
// Phase 2 tool execution with confirmation
if (tool.requiresConfirmation) {
  return {
    message: `I'll create a new ductless install job for Maria Martinez at 4521 Elm St. Ready to proceed?`,
    pendingAction: {
      tool: "create_job",
      params: { customer_id: "...", job_type: "ductless-install", ... },
    },
    awaitingConfirmation: true,
  };
}
```

---

## Phase 3 Preview: Voice + Calendar

- **Voice Input:** Web Speech API for browser-native speech recognition
- **Google Calendar:** Create events via Google Calendar API when scheduling appointments
- **Multi-step Workflows:** "Create a job for Martinez, schedule it for Thursday at 9am with Crew A"

---

## Phase 4 Preview: Proactive Intelligence

- Morning briefing: "Good morning Eric. You have 4 jobs today, 3 new leads, and the Williams install is tomorrow."
- Alerts: "Crew A's EPA certification expires in 30 days"
- Follow-up reminders: "The Chen estimate was sent 5 days ago with no response"

---

## Related Documentation

- [CRM System](./CRM-SYSTEM.md)
- [Admin Dashboard](./ADMIN-DASHBOARD.md)
- [GHL Integration](./GHL-INTEGRATION.md)
