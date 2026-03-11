# Harold API — Truficient CRM Integration Documentation

**Version:** 1.0  
**Last Updated:** March 11, 2026  
**Access Level:** Full Read/Write (super_admin equivalent)

---

## About Truficient Energy Solutions

Truficient Energy Solutions is a residential and commercial HVAC company serving the Dallas–Fort Worth (DFW) metroplex in Texas. The company specializes in ductless mini-split installations (Mitsubishi Diamond Contractor), ducted system replacements, repairs, and maintenance services. Truficient operates with a small crew-based team structure and uses a custom-built CRM to manage leads, customers, jobs, scheduling, estimates, and pipeline tracking.

The company's internal AI assistant is named **Bach**, who handles CRM operations, daily briefings, lead review, scheduling, and estimate drafting. Harold connects to the same backend infrastructure as Bach, with full unrestricted access.

**Service Area:** DFW Metroplex — Dallas, Fort Worth, Plano, Frisco, McKinney, Allen, Richardson, Garland, Irving, Arlington, and surrounding cities.  
**Timezone:** Central Time (CST/CDT — America/Chicago)  
**Currency:** USD  
**Job Number Format:** `TRU-YYYY-NNNN` (e.g., `TRU-2026-0042`)  
**Estimate Number Format:** `TRU-YYYY-NNNN`

---

## API Overview

The Harold API is a dedicated edge function that gives the Harold (Open Claw) assistant full read/write access to Truficient's CRM, scheduling, pipeline, and operations data. It proxies requests through Bach's AI tool-calling engine with `super_admin` privileges.

### Base URL

```
https://xvsgdzwadxbwpevdezbp.supabase.co/functions/v1/harold-api
```

### Authentication

All requests must include a Bearer token in the `Authorization` header:

```
Authorization: Bearer <HAROLD_API_TOKEN>
```

The token will be provided separately. Requests without a valid token receive a `401 Unauthorized` response.

### Content Type

```
Content-Type: application/json
```

---

## Endpoints

### Health Check

```
GET /harold-api
```

**Response:**
```json
{
  "status": "ok",
  "assistant": "bach",
  "version": "1.0"
}
```

Use this to verify connectivity and auth.

---

### Chat / Command Interface

```
POST /harold-api
```

This is the primary endpoint. Send a natural language message, and Bach will interpret it, call the appropriate tools, and return a structured response.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | ✅ | Natural language command or question |
| `conversationHistory` | array | ❌ | Previous messages for context continuity. Each item: `{ role: "user" \| "assistant", content: "..." }` |
| `context` | object | ❌ | Additional context injected into the system prompt (free-form key/value) |

**Example Request:**
```json
{
  "message": "Find customer Jeff Karr and show me his details",
  "conversationHistory": [],
  "context": {
    "source": "harold-web-ui"
  }
}
```

**Response:**
```json
{
  "message": "Here are the details for Jeff Karr...",
  "toolsUsed": [
    { "tool": "search_customers", "input": { "query": "Jeff Karr" } },
    { "tool": "get_customer_details", "input": { "customer_id": "uuid-here" } }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `message` | string | Bach's natural language response with the data or confirmation |
| `toolsUsed` | array | List of CRM tools that were called, with their inputs (and errors if any) |

---

## Conversation History

To maintain context across multiple exchanges, pass previous messages in `conversationHistory`:

```json
{
  "message": "What jobs does he have?",
  "conversationHistory": [
    { "role": "user", "content": "Find customer Jeff Karr" },
    { "role": "assistant", "content": "I found Jeff Karr (ID: abc-123)..." }
  ]
}
```

The API retains the last 20 messages from history. Harold is responsible for managing conversation state on its side.

---

## Available Tools

Bach exposes the following tools through the Harold API. Harold does **not** call these directly — instead, send a natural language `message` and Bach determines which tools to invoke. However, understanding the tools helps you craft effective prompts.

### 🔍 READ Tools (No confirmation needed)

#### `search_customers`
Search CRM customers by name, email, phone, or address.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Search term |
| `status` | string | ❌ | Filter: `lead`, `prospect`, `active`, `inactive`, `former` |
| `limit` | number | ❌ | Max results (default 10, max 25) |

**Example prompts:** "Find customer Jeff Karr", "Search for customers with phone 214-555-1234", "Show me all active customers named Smith"

---

#### `get_customer_details`
Get full customer profile including locations, interactions, jobs, and linked submissions.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customer_id` | string | ✅ | UUID of the customer |

**Example prompts:** "Show me full details for customer [ID]", "What's the history on Jeff Karr?"

---

#### `search_jobs`
Search jobs by number, customer name, type, stage, or date range.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | ❌ | Job number or customer name |
| `job_type_slug` | string | ❌ | Filter by job type |
| `stage` | string | ❌ | Filter by current stage name |
| `date_from` | string | ❌ | Start date `YYYY-MM-DD` |
| `date_to` | string | ❌ | End date `YYYY-MM-DD` |
| `limit` | number | ❌ | Max results (default 10) |

**Example prompts:** "Find job TRU-2026-0042", "Show all repair jobs this week", "What jobs are in the 'Scheduled' stage?"

---

#### `get_schedule`
Get scheduled job appointments for a date or date range.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | string | ❌ | Date `YYYY-MM-DD` (defaults to today CST) |
| `days` | number | ❌ | Number of days ahead (default 1) |

**Example prompts:** "What's on the schedule today?", "Show me next week's appointments", "What's scheduled for March 15?"

---

#### `get_submission_stats`
Get counts of recent submissions across all form types (contact, ducted, ductless, scanner, landing page).

**Example prompts:** "How many new submissions do we have?", "What's the lead count?"

---

#### `get_recent_submissions`
Get recent form submissions with full details.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | ❌ | `contact`, `ducted`, `ductless`, `scanner`, `landing_page`, or `all` |
| `limit` | number | ❌ | Number to return (default 10) |
| `status` | string | ❌ | Filter by status |

**Example prompts:** "Show me recent ductless submissions", "What are the latest leads?"

---

#### `get_pipeline_overview`
Get sales pipeline summary with stage counts and estimated values.

**Example prompts:** "Show me the pipeline", "What's our sales pipeline look like?", "How much is in the pipeline?"

---

#### `get_team_info`
Get team/crew information and member assignments.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `team_id` | string | ❌ | Specific team UUID |

**Example prompts:** "Show me the install crews", "Who's on Team A?", "List all team members"

---

#### `get_daily_briefing`
Get today's operations briefing — appointments, submission stats, and pipeline summary.

**Example prompts:** "Give me today's briefing", "Morning report", "What's happening today?"

---

### ✏️ WRITE Tools

Write tools modify CRM data. When called through Bach's natural language interface, Bach will process the request directly (Harold has full confirmed access — no double-confirmation needed).

#### `create_customer`
Create a new customer record. Optionally creates a primary location if address is provided.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `first_name` | string | ✅ | First name |
| `last_name` | string | ❌ | Last name |
| `email` | string | ❌ | Email address |
| `phone` | string | ❌ | Phone number |
| `customer_type` | string | ❌ | `residential` or `commercial` (default: residential) |
| `lead_source` | string | ❌ | How acquired (default: `harold-api`) |
| `address` | string | ❌ | Street address (creates location if provided) |
| `city` | string | ❌ | City |
| `state` | string | ❌ | State (default: TX) |
| `zip` | string | ❌ | ZIP code |
| `notes` | string | ❌ | Notes |

**Example prompts:** "Create a new customer: John Doe, 214-555-9876, 123 Main St, Plano TX 75024", "Add a new commercial customer named ABC Corp"

---

#### `create_job`
Create a new job for an existing customer.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customer_id` | string | ✅ | UUID of the customer |
| `job_type_slug` | string | ✅ | Job type slug (e.g., `ductless-install`, `repair`, `maintenance`) |
| `title` | string | ✅ | Job title |
| `priority` | string | ❌ | `low`, `medium`, `high`, `urgent` (default: medium) |
| `scheduled_date` | string | ❌ | `YYYY-MM-DD` |
| `notes` | string | ❌ | Internal notes |

**Example prompts:** "Create a ductless install job for Jeff Karr", "Schedule a repair for customer [ID]"

---

#### `update_job_stage`
Move a job to a different workflow stage.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `job_id` | string | ✅ | UUID of the job |
| `stage_name` | string | ✅ | Target stage name |
| `notes` | string | ❌ | Notes about the change |

**Example prompts:** "Move job TRU-2026-0042 to 'In Progress'", "Mark that job as completed"

---

#### `log_interaction`
Log a customer interaction (call, email, text, visit, note) to their timeline.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customer_id` | string | ✅ | UUID of the customer |
| `interaction_type` | string | ✅ | `call`, `email`, `text`, `visit`, `note` |
| `subject` | string | ❌ | Subject line |
| `content` | string | ❌ | Content/summary |
| `direction` | string | ❌ | `inbound` or `outbound` |
| `outcome` | string | ❌ | Outcome description |

**Example prompts:** "Log a call with Jeff Karr — discussed ductless options, he's interested", "Add a note to customer [ID]: warranty expires next month"

---

#### `update_customer_status`
Change a customer's lifecycle status.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customer_id` | string | ✅ | UUID of the customer |
| `status` | string | ✅ | `lead`, `prospect`, `active`, `inactive`, `former` |

**Example prompts:** "Mark Jeff Karr as active", "Change customer [ID] status to prospect"

---

#### `schedule_appointment`
Schedule a job appointment with date/time and optional team assignment.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `job_id` | string | ✅ | UUID of the job |
| `start_datetime` | string | ✅ | ISO 8601 datetime (e.g., `2026-03-15T09:00:00-06:00`) |
| `end_datetime` | string | ✅ | ISO 8601 datetime |
| `title` | string | ❌ | Appointment title |
| `team_id` | string | ❌ | UUID of crew/team |
| `notes` | string | ❌ | Notes |

**Example prompts:** "Schedule job TRU-2026-0042 for March 15 from 9am to 1pm", "Book the install crew for next Tuesday morning"

---

#### `intake_lead`
Full lead intake pipeline — creates customer, location, pipeline entry, logs interaction, and syncs to GoHighLevel in one operation.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `first_name` | string | ✅ | First name |
| `last_name` | string | ✅ | Last name |
| `email` | string | ❌ | Email |
| `phone` | string | ❌ | Phone |
| `address` | string | ❌ | Street address |
| `city` | string | ❌ | City |
| `state` | string | ❌ | State (default TX) |
| `zip` | string | ❌ | ZIP |
| `source` | string | ❌ | Lead source |
| `notes` | string | ❌ | Notes |

**Example prompts:** "Intake a new lead: Jane Smith, 972-555-4321, wants a ductless install, found us on Google"

---

#### `review_submissions`
Scan and classify recent unreviewed submissions as real leads, junk, or unsure.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `hours` | number | ❌ | Lookback period (default 48 hours) |

**Example prompts:** "Review new submissions", "Check for junk leads"

---

#### `scan_watch_list`
Scan equipment scanner database for high-priority leads based on age, R-22 refrigerant, DFW location.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `min_age_years` | number | ❌ | Equipment age threshold (default 15 years) |

**Example prompts:** "Scan the watch list", "Find aging equipment leads"

---

#### `draft_estimate`
Draft a project estimate using system pricing (1.35 margin, 8.25% tax).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `customer_id` | string | ✅ | UUID of customer |
| `job_type` | string | ✅ | Job type for the estimate |
| `items` | array | ❌ | Line items: `[{ name, quantity, unit_cost }]` |
| `notes` | string | ❌ | Job notes |

**Example prompts:** "Draft an estimate for Jeff Karr's ductless install"

---

## CRM Data Model

### Customer Lifecycle Statuses
| Status | Description |
|---|---|
| `lead` | New unqualified contact |
| `prospect` | Qualified, actively being pursued |
| `active` | Has ongoing or recent service |
| `inactive` | No recent activity |
| `former` | Closed/churned account |

### Customer Types
- `residential` — Homeowner
- `commercial` — Business/commercial property

### Job Types (Common Slugs)
Job types are configurable. Common ones include:
- `ductless-install` — Ductless mini-split installation
- `ducted-replacement` — Ducted system replacement
- `repair` — HVAC repair
- `maintenance` — Preventive maintenance
- `inspection` — System inspection

Use the prompt "What job types are available?" to get the current list.

### Pipeline Stages
The sales pipeline tracks deals from initial contact through close. Stages are configurable and have sort order, color, and win/loss flags. Ask "Show me the pipeline stages" for the current configuration.

### Locations
Each customer can have multiple service locations with:
- Full address (line1, line2, city, state, zip)
- Google Places data (place_id, coordinates)
- Property details (sq ft, year built, stories, beds, baths)
- Access info (gate codes, parking instructions)
- Primary flag

### Interactions
Customer timeline entries with:
- Types: `call`, `email`, `text`, `visit`, `note`, `meeting`, `task`
- Direction: `inbound` or `outbound`
- Content, subject, and outcome fields

### Teams & Scheduling
- **Teams/Crews:** Named groups (e.g., Install Crew A, Service Team) with assigned members
- **Appointments:** Linked to jobs with start/end datetimes, team assignments, and Google Calendar sync
- All scheduling operates in **Central Time (CST/CDT)**

---

## Error Handling

### HTTP Status Codes
| Code | Description |
|---|---|
| `200` | Success |
| `400` | Bad request — missing or invalid `message` |
| `401` | Unauthorized — invalid or missing Bearer token |
| `405` | Method not allowed — use GET (health) or POST (commands) |
| `500` | Internal server error |
| `502` | AI provider error — upstream model failure |

### Error Response Format
```json
{
  "error": "Error type",
  "details": "Detailed error message"
}
```

---

## Logging

All Harold API interactions are logged in the `assistant_logs` table with:
- `user_id`: `null` (system/external)
- `user_message`: Prefixed with `[HAROLD]`
- `assistant_response`: Bach's full response
- `tools_used`: JSON array of tools called with inputs

---

## Rate Limits & Best Practices

1. **No hard rate limit** is enforced, but be reasonable — avoid more than ~60 requests/minute.
2. **Use conversation history** for multi-turn interactions to avoid redundant lookups.
3. **Be specific** in prompts — "Find customer Jeff Karr in Plano" is better than "Find Jeff".
4. **Chain operations naturally** — "Create a customer and schedule their install" works as a single message.
5. **All dates/times are Central Time** — pass ISO 8601 with `-06:00` (CST) or `-05:00` (CDT) offset.

---

## Quick Start Examples

### Search and get details
```json
{ "message": "Find Jeff Karr and show me his full details including jobs" }
```

### Check today's schedule
```json
{ "message": "What's on the schedule for today?" }
```

### Create a new lead
```json
{ "message": "Intake a new lead: Sarah Johnson, 972-555-8765, sarah@email.com, 456 Oak Dr, Frisco TX 75034, found us through Mitsubishi Partner Program, interested in a 3-zone ductless system" }
```

### Multi-turn conversation
```json
{
  "message": "What jobs does he have?",
  "conversationHistory": [
    { "role": "user", "content": "Find customer Jeff Karr" },
    { "role": "assistant", "content": "Found Jeff Karr (ID: abc-123). He is an active residential customer in Plano, TX." }
  ]
}
```

### Get the daily briefing
```json
{ "message": "Morning briefing" }
```

---

*This document is maintained by the Truficient development team. For questions or issues, contact Eric Love (eric@truficient.com).*
