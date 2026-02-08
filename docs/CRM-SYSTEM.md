# CRM & Operations System Documentation

> Last Updated: February 2026

## Overview

The internal CRM system manages the complete customer lifecycle from lead capture through job completion. It is separate from the GoHighLevel (GHL) integration, which handles external CRM sync. This system provides:

- **Customer Management** - Contact records, lifecycle tracking, segmentation
- **Location Management** - Multi-property support with property data enrichment
- **Interaction Logging** - Activity timeline with manual and automated entries
- **Pipeline Management** - Kanban-style lead tracking with conversion metrics
- **Job Management** - Service scheduling, crew assignments, stage workflows
- **Team Management** - Technicians, crews, certifications, availability

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRM SYSTEM ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LEAD SOURCES                                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │    │
│  │  │ Ducted   │  │ Ductless │  │Equipment │  │ Landing Page     │     │    │
│  │  │Estimator │  │Estimator │  │ Scanner  │  │ Forms            │     │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘     │    │
│  └───────┼─────────────┼─────────────┼─────────────────┼───────────────┘    │
│          │             │             │                 │                     │
│          ▼             ▼             ▼                 ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    SUBMISSION CONVERSION                             │    │
│  │  ConvertToCustomerDialog → Creates crm_customers + crm_locations     │    │
│  │                          → Links via crm_submission_links            │    │
│  │                          → Optional pipeline entry                   │    │
│  └──────────────────────────────────┬──────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        CRM CORE TABLES                               │    │
│  │                                                                       │    │
│  │  ┌─────────────────┐      ┌─────────────────┐                        │    │
│  │  │  crm_customers  │◄────►│  crm_locations  │                        │    │
│  │  │  - first_name   │      │  - address      │                        │    │
│  │  │  - last_name    │      │  - city/state   │                        │    │
│  │  │  - email/phone  │      │  - sqft/year    │                        │    │
│  │  │  - status       │      │  - lat/lng      │                        │    │
│  │  │  - lead_source  │      │  - is_primary   │                        │    │
│  │  │  - tags[]       │      └─────────────────┘                        │    │
│  │  └────────┬────────┘                                                 │    │
│  │           │                                                          │    │
│  │           ├──────────────────────────────────────────┐               │    │
│  │           │                                          │               │    │
│  │           ▼                                          ▼               │    │
│  │  ┌─────────────────┐                        ┌─────────────────┐      │    │
│  │  │crm_interactions │                        │crm_pipeline_    │      │    │
│  │  │ - type (call,   │                        │    entries      │      │    │
│  │  │   email, note)  │                        │ - stage_id      │      │    │
│  │  │ - direction     │                        │ - estimated_    │      │    │
│  │  │ - content       │                        │     value       │      │    │
│  │  │ - outcome       │                        │ - probability   │      │    │
│  │  └─────────────────┘                        └─────────────────┘      │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        OPERATIONS MODULE                             │    │
│  │                                                                       │    │
│  │  ┌─────────────────┐      ┌─────────────────┐                        │    │
│  │  │    crm_jobs     │◄────►│crm_job_         │                        │    │
│  │  │  - job_number   │      │  appointments   │                        │    │
│  │  │  - job_type_id  │      │  - start/end    │                        │    │
│  │  │  - customer_id  │      │  - google_cal   │                        │    │
│  │  │  - location_id  │      │  - team_id      │                        │    │
│  │  │  - stage_id     │      └─────────────────┘                        │    │
│  │  └────────┬────────┘                                                 │    │
│  │           │                                                          │    │
│  │           ▼                                                          │    │
│  │  ┌─────────────────┐      ┌─────────────────┐                        │    │
│  │  │crm_job_stage_   │      │  crm_teams /    │                        │    │
│  │  │    history      │      │ crm_team_members│                        │    │
│  │  │ - from_stage    │      │  - role         │                        │    │
│  │  │ - to_stage      │      │  - certifications│                       │    │
│  │  │ - changed_by    │      │  - availability │                        │    │
│  │  └─────────────────┘      └─────────────────┘                        │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core CRM Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `crm_customers` | Customer master records | first_name, last_name, email, phone, customer_status, customer_type, lead_source, tags[], ghl_contact_id |
| `crm_locations` | Service addresses | customer_id, address_line1, city, state, zip_code, square_footage, year_built, stories, latitude, longitude |
| `crm_customer_contacts` | Additional contacts | customer_id, first_name, last_name, email, phone, contact_type |
| `crm_interactions` | Activity log | customer_id, interaction_type, direction, content, outcome, logged_by |
| `crm_submission_links` | Links submissions to customers | customer_id, submission_id, submission_type |

### Pipeline Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `crm_pipeline_stages` | Stage definitions | name, display_name, color, sort_order, is_won_stage, is_lost_stage |
| `crm_pipeline_entries` | Lead tracking | customer_id, stage_id, estimated_value, probability, expected_close_date |

### Operations Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `crm_job_types` | Job type definitions | name, slug, category, default_duration_hours, requires_permit |
| `crm_job_stages` | Per-type workflow stages | job_type_id, name, stage_type, sort_order, auto_notify_customer |
| `crm_jobs` | Job records | job_number, customer_id, location_id, job_type_id, current_stage_id, scheduled_date |
| `crm_job_appointments` | Timed appointments | job_id, start_datetime, end_datetime, assigned_team_id, google_calendar_event_id |
| `crm_job_stage_history` | Stage transition audit | job_id, from_stage_id, to_stage_id, changed_by, notes |
| `crm_job_assignments` | Crew/tech assignments | job_id, team_id, member_id, role, scheduled_start, scheduled_end |

### Team Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `crm_teams` | Crew definitions | name, color, is_active |
| `crm_team_members` | Technician records | first_name, last_name, role, certifications[], hourly_rate, license_number |
| `crm_team_assignments` | Member-to-team mapping | team_id, member_id, is_lead, role_in_team |

### Configuration Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `lead_sources` | Lead origin tracking | name, slug, description, is_active |
| `crm_campaign_tags` | Marketing segmentation | name, color, description, is_active |

---

## Customer Management

### Admin Route
**Route:** `/admin/customers`
**File:** `src/pages/admin/Customers.tsx`

### Features

#### Customer Table
**Component:** `src/components/admin/customers/CustomerTable.tsx`

- Sortable columns (name, email, status, created date)
- Status filter dropdown (lead, prospect, active, inactive, former)
- Lead source filter
- Campaign tag filter
- Search by name, email, phone
- Pagination with infinite scroll

#### Customer Status Lifecycle

```
┌────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐     ┌────────┐
│  lead  │────▶│ prospect │────▶│ active │────▶│ inactive │────▶│ former │
└────────┘     └──────────┘     └────────┘     └──────────┘     └────────┘
                                     │
                                     ▼
                               (Jobs, Service)
```

| Status | Description |
|--------|-------------|
| `lead` | Initial contact, not yet qualified |
| `prospect` | Qualified, quote sent or scheduled |
| `active` | Has ongoing job or recent service |
| `inactive` | No activity in 12+ months |
| `former` | Relationship ended |

#### Customer Detail Page
**Route:** `/admin/customers/:id`
**File:** `src/pages/admin/CustomerDetail.tsx`

Tabbed interface:
1. **Overview** - Contact info, status, assigned user
2. **Locations** - Property addresses with details
3. **Activity** - Interaction timeline
4. **Jobs** - Associated job records
5. **Submissions** - Linked form submissions

### Customer Form Dialog
**Component:** `src/components/admin/customers/CustomerFormDialog.tsx`

Fields:
- First Name / Last Name
- Email / Phone / Alternate Phone
- Company Name (for commercial)
- Customer Type (residential/commercial)
- Customer Status
- Lead Source (from `lead_sources` table)
- Campaign Tags (multi-select)
- Billing Address fields
- Preferred Contact Method
- Notes

### CSV Import
**Component:** `src/components/admin/customers/CustomerImportDialog.tsx`

Features:
- Header mapping to database fields
- Duplicate detection by email
- Batch insert (50 records per batch)
- Progress indicator
- Error reporting per row

---

## Location Management

### Component
**File:** `src/pages/admin/Locations.tsx`
**Also:** `src/components/admin/customers/CustomerLocations.tsx` (embedded in customer detail)

### Features

#### Address Autocomplete
- Google Places integration
- Auto-populates address fields
- Captures coordinates (lat/lng) for map preview
- Extracts county from Google response

#### Property Data Lookup
**Edge Function:** `supabase/functions/lookup-property-data/index.ts`

Automatically fetches property details from county GIS/CAD systems:

| County | Available Data |
|--------|---------------|
| Dallas | SqFt, Year Built, Stories |
| Denton | SqFt, Year Built |
| Collin | Year Built |
| Tarrant | Attom API fallback |

**Fallback:** Attom Data API for unsupported counties

#### Map Preview
**Component:** `src/components/MapPreview.tsx`

- Displays Google Static Map after address selection
- Shows pin at exact coordinates
- Helps verify correct property

### Location Data Model

```typescript
interface Location {
  id: string;
  customer_id: string;
  location_name: string | null;      // "Main Office", "Vacation Home"
  location_type: string;             // "service" | "billing"
  is_primary: boolean;
  
  // Address
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  county: string | null;
  
  // Property Details (auto-populated)
  square_footage: number | null;
  year_built: number | null;
  stories: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_type: string | null;
  
  // Geo Data
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  
  // Property Data Source
  property_data_source: string | null;    // "dcad", "attom", "manual"
  property_data_auto_populated: boolean;
  property_data_verified_at: string | null;
  
  // Access
  gate_code: string | null;
  access_notes: string | null;
}
```

---

## Interaction Logging

### Component
**File:** `src/components/admin/customers/InteractionLog.tsx`

### Interaction Types

| Type | Icon | Description |
|------|------|-------------|
| `call` | Phone | Inbound/outbound phone call |
| `email` | Mail | Email correspondence |
| `text` | MessageSquare | SMS message |
| `meeting` | Calendar | In-person or video meeting |
| `note` | FileText | Internal note |
| `task` | CheckSquare | Follow-up task |

### Direction

| Direction | Description |
|-----------|-------------|
| `inbound` | Customer initiated |
| `outbound` | Staff initiated |
| `null` | System-generated (automated) |

### Automated Logging

The system automatically logs certain events with `direction: null`:

| Event | interaction_type | Content |
|-------|-----------------|---------|
| Submission converted to customer | `system_conversion` | "Converted from [type] submission" |
| Added to pipeline | `system_pipeline_add` | "Added to pipeline: [stage]" |
| Pipeline stage change | `system_pipeline_move` | "Moved from [A] to [B]" |
| Customer status change | `system_status_change` | "Status changed: [old] → [new]" |
| Job created | `system_job` | "Job [number] created" |

### Activity Timeline
**Component:** `src/components/admin/customers/ActivityTimeline.tsx`

- Chronological display grouped by date
- Color-coded by interaction type
- Shows logged_by user name
- Collapsible content for long entries

---

## Pipeline Management

### Admin Route
**Route:** `/admin/pipeline`
**File:** `src/pages/admin/Pipeline.tsx`

### Features

#### Kanban Board
- Drag-and-drop between stages
- Stage change triggers `system_pipeline_move` log
- Visual card with customer name, value, days in stage

#### Pipeline Stages (Default Configuration)

| Stage | Type | Color | Description |
|-------|------|-------|-------------|
| New Lead | `open` | Blue | Fresh submission, uncontacted |
| Contacted | `open` | Yellow | Initial contact made |
| Estimate Scheduled | `open` | Orange | On-site visit scheduled |
| Proposal Sent | `open` | Purple | Quote delivered |
| Negotiating | `open` | Pink | Active discussions |
| Won | `won` | Green | Deal closed |
| Lost | `lost` | Gray | Deal lost |

#### Pipeline Entry Data

```typescript
interface PipelineEntry {
  id: string;
  customer_id: string;
  stage_id: string;
  estimated_value: number | null;     // Quote total
  probability: number | null;         // 0-100%
  expected_close_date: string | null;
  assigned_to: string | null;         // User ID
  notes: string | null;
  won_date: string | null;
  lost_date: string | null;
  lost_reason: string | null;
}
```

### Conversion Flow

When converting a submission to a customer:

1. **ConvertToCustomerDialog** opens
2. User confirms/edits mapped data
3. System creates:
   - `crm_customers` record
   - `crm_locations` record (from address)
   - `crm_submission_links` record
   - Optional: `crm_pipeline_entries` record
4. Submission status updated to `converted`
5. Automatic interaction logged

**Component:** `src/components/admin/submissions/ConvertToCustomerDialog.tsx`

---

## Job Management

### Admin Routes
- **Job List:** `/admin/jobs` → `src/pages/admin/Jobs.tsx`
- **Job Detail:** `/admin/jobs/:id` → `src/pages/admin/JobDetail.tsx`

### Features

#### Job Number Generation
Auto-generated via PostgreSQL function:
```
Format: TRU-YYYY-XXXX
Example: TRU-2026-0042
```

#### Job Types
**Admin Config:** `/admin/job-types`
**File:** `src/pages/admin/JobTypesConfig.tsx`

| Category | Example Types |
|----------|---------------|
| `service` | Service Call, Maintenance, Repair |
| `installation` | New Install, Replacement, Upgrade |
| `inspection` | Pre-season Check, Warranty Inspection |

Each job type has its own stage workflow.

#### Job Stages (Per Type)

Example for "Installation" job type:

| Stage | Type | Auto-Notify |
|-------|------|-------------|
| Scheduled | `start` | Yes |
| Parts Ordered | `progress` | No |
| In Progress | `progress` | No |
| Inspection Pending | `progress` | Yes |
| Complete | `end` | Yes |

#### Scheduling Model

Jobs use a **two-tier scheduling model**:

1. **Job Level** (`crm_jobs`)
   - `scheduled_date` - Overall job date (DATE)
   - `scheduled_end_date` - Multi-day job end (DATE)

2. **Appointment Level** (`crm_job_appointments`)
   - `start_datetime` - Precise start (TIMESTAMPTZ)
   - `end_datetime` - Precise end (TIMESTAMPTZ)
   - `assigned_team_id` - Crew assignment
   - `google_calendar_event_id` - Calendar sync

This allows multiple appointments per job (e.g., install day 1, install day 2, inspection).

#### Stage History Audit
**Table:** `crm_job_stage_history`

Every stage transition is recorded:
```typescript
{
  job_id: string;
  from_stage_id: string | null;  // null for initial
  to_stage_id: string;
  changed_by: string;            // User ID
  notes: string | null;          // Optional note
  created_at: string;
}
```

### Job Form Dialog
**Component:** `src/components/admin/jobs/JobFormDialog.tsx`

Fields:
- Customer (searchable select)
- Location (from customer's locations)
- Job Type
- Title
- Priority (low/normal/high/urgent)
- Scheduled Date / End Date
- Quoted Amount
- Customer Notes
- Internal Notes

### WorkEdge Integration
**Component:** `src/components/admin/jobs/WorkEdgePanel.tsx`

For jobs synced with WorkEdge:
- Shows sync status
- Displays WorkEdge project ID
- Last sync timestamp
- Media from WorkEdge

---

## Team Management

### Admin Routes
- **Teams:** `/admin/teams` → `src/pages/admin/Teams.tsx`

### Features

#### Team Structure

```
┌─────────────────────────────────────────┐
│                 TEAM                     │
│  "Installation Crew A"                   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ MEMBERS                            │ │
│  │                                    │ │
│  │  ★ John Smith (Lead Installer)    │ │
│  │    - EPA 608 Universal            │ │
│  │    - NATE Certified               │ │
│  │                                    │ │
│  │  • Mike Johnson (Installer)       │ │
│  │    - EPA 608 Type II              │ │
│  │                                    │ │
│  │  • David Lee (Apprentice)         │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Team Member Data

```typescript
interface TeamMember {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;              // "Lead Installer", "Technician"
  member_type: string | null;       // "employee", "contractor"
  
  // Rates
  hourly_rate: number | null;
  overtime_rate: number | null;
  
  // Credentials
  license_number: string | null;
  license_expiry: string | null;
  certifications: string[];         // ["EPA 608", "NATE"]
  specialties: string[];            // ["Ductless", "Commercial"]
  
  // Availability
  default_availability: JSON;       // Weekly schedule
  google_calendar_id: string | null;
  
  // HR
  hire_date: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  
  // Links
  user_id: string | null;           // If has admin access
  workedge_user_id: string | null;  // WorkEdge sync
}
```

#### Team Assignment

Jobs can be assigned to:
- A **Team** (crew) - via `crm_job_assignments.team_id`
- Individual **Members** - via `crm_job_assignments.member_id`

```typescript
interface JobAssignment {
  id: string;
  job_id: string;
  team_id: string | null;
  member_id: string | null;
  assignment_type: string;      // "primary", "support"
  role: string | null;          // Role on this job
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_hours: number | null;
  notes: string | null;
}
```

---

## Lead Sources & Campaign Tags

### Lead Sources
**Admin Config:** `/admin/lead-sources`
**Table:** `lead_sources`

Single acquisition origin assigned to customers:

| Example Sources |
|-----------------|
| Mitsubishi Partner Program |
| Bosch Partner Program |
| Google Ads |
| Facebook Ads |
| Referral |
| Yelp |
| Website Organic |

### Campaign Tags
**Admin Config:** `/admin/campaign-tags`
**Table:** `crm_campaign_tags`

Multiple marketing labels per customer (stored as array on `crm_customers.tags`):

| Example Tags |
|--------------|
| Spring 2025 Campaign |
| Heat Pump Promo |
| Newsletter Subscriber |
| VIP Customer |
| Needs Follow-up |

**Component:** `src/components/admin/customers/CampaignTagSelector.tsx`

---

## Submission Links

### Purpose

Links form submissions to customer records without losing the original submission data.

### Table: `crm_submission_links`

```sql
CREATE TABLE crm_submission_links (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES crm_customers(id),
  submission_id UUID NOT NULL,
  submission_type TEXT NOT NULL,  -- 'ducted', 'ductless', 'scanner', 'landing_page', 'contact'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Usage

```typescript
// When converting a submission to customer:
await supabase.from('crm_submission_links').insert({
  customer_id: newCustomer.id,
  submission_id: submission.id,
  submission_type: 'ducted',
});

// When viewing customer, fetch linked submissions:
const { data: links } = await supabase
  .from('crm_submission_links')
  .select('submission_id, submission_type')
  .eq('customer_id', customerId);
```

**Component:** `src/components/admin/customers/LinkedSubmissions.tsx`

---

## RLS Policies

All CRM tables use standardized RLS policies:

```sql
-- Example: crm_customers
CREATE POLICY "CRM customers viewable by admin roles"
ON crm_customers FOR SELECT
USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid())
  IN ('super_admin', 'admin', 'manager')
);

CREATE POLICY "CRM customers editable by admin roles"
ON crm_customers FOR ALL
USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid())
  IN ('super_admin', 'admin')
);
```

### Role Permissions

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| `super_admin` | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `manager` | ✅ | ✅ | ✅ | ❌ |

---

## Related Files

### Customer Management
| File | Purpose |
|------|---------|
| `src/pages/admin/Customers.tsx` | Customer list page |
| `src/pages/admin/CustomerDetail.tsx` | Customer detail page |
| `src/components/admin/customers/CustomerTable.tsx` | Sortable customer table |
| `src/components/admin/customers/CustomerFormDialog.tsx` | Add/edit dialog |
| `src/components/admin/customers/CustomerImportDialog.tsx` | CSV import |
| `src/components/admin/customers/DeleteCustomerDialog.tsx` | Delete confirmation |
| `src/components/admin/customers/CampaignTagSelector.tsx` | Tag multi-select |

### Location Management
| File | Purpose |
|------|---------|
| `src/pages/admin/Locations.tsx` | Location management page |
| `src/components/admin/customers/CustomerLocations.tsx` | Embedded location list |
| `src/components/AddressAutocomplete.tsx` | Google Places input |
| `src/components/MapPreview.tsx` | Static map display |
| `src/lib/propertyLookup.ts` | Property data API client |
| `supabase/functions/lookup-property-data/index.ts` | County GIS lookups |

### Interaction Logging
| File | Purpose |
|------|---------|
| `src/components/admin/customers/InteractionLog.tsx` | Interaction form |
| `src/components/admin/customers/ActivityTimeline.tsx` | Timeline display |
| `src/lib/crm/logInteraction.ts` | Interaction logging utility |

### Pipeline
| File | Purpose |
|------|---------|
| `src/pages/admin/Pipeline.tsx` | Kanban board |
| `src/components/admin/pipeline/PipelineColumn.tsx` | Stage column |
| `src/components/admin/pipeline/PipelineCard.tsx` | Entry card |
| `src/components/admin/pipeline/AddToPipelineDialog.tsx` | Add entry dialog |
| `src/components/admin/submissions/ConvertToCustomerDialog.tsx` | Conversion flow |

### Job Management
| File | Purpose |
|------|---------|
| `src/pages/admin/Jobs.tsx` | Job list page |
| `src/pages/admin/JobDetail.tsx` | Job detail page |
| `src/pages/admin/JobTypesConfig.tsx` | Job type configuration |
| `src/components/admin/jobs/JobFormDialog.tsx` | Add/edit job dialog |
| `src/components/admin/jobs/JobAppointmentDialog.tsx` | Schedule appointment |
| `src/components/admin/jobs/JobAppointmentsCard.tsx` | Appointment list |
| `src/components/admin/jobs/WorkEdgePanel.tsx` | WorkEdge integration |

### Team Management
| File | Purpose |
|------|---------|
| `src/pages/admin/Teams.tsx` | Team/member management |

### Configuration
| File | Purpose |
|------|---------|
| `src/pages/admin/LeadSourcesConfig.tsx` | Lead source management |
| `src/pages/admin/CampaignTagsConfig.tsx` | Campaign tag management |

---

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useUserRole` | `src/hooks/useUserRole.ts` | Get current user's role |
| `useRolePermissions` | `src/hooks/useRolePermissions.ts` | Check specific permissions |
| `useSoftDelete` | `src/hooks/useSoftDelete.ts` | Soft delete functionality |

---

## Integration Points

### GoHighLevel Sync

When customers are created or updated, they can be synced to GHL:
- `ghl_contact_id` field stores the GHL contact ID
- Sync triggered via `sync-ghl-contact` edge function
- See `docs/GHL-INTEGRATION.md` for details

### WorkEdge Sync

Jobs can be synced with WorkEdge:
- `workedge_project_id` on `crm_jobs`
- `workedge_customer_id` on `crm_customers`
- Sync via `workedge-sync` edge function

### Google Calendar

Appointments sync to Google Calendar:
- `google_calendar_event_id` on appointments
- Calendar selection via `google_calendars` table
- Sync via `google-calendar-sync` edge function
