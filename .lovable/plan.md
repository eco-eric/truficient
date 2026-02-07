

# Phase 2: Operations Section Implementation

## Current State

Phase 1 (CRM Core) has been successfully implemented:
- Customer management with import, locations, and interactions
- Lead pipeline with configurable stages
- Lead sources and campaign tags

**Phase 2 (Operations) has NOT been implemented yet.** This includes Jobs, Job Types, Configurable Stages, and the Jobs Board.

---

## What We're Building

The Operations section adds job lifecycle management - tracking work from scheduling through completion. This is the bridge between "lead won in pipeline" and "work done in the field."

### New Navigation Section

```text
Operations (NEW SECTION)
├── Jobs Board        - Kanban + list view of all jobs
├── Teams & Crew      - Technicians, install teams, subcontractors
├── Job Types         - Configure job categories and their stages
└── Calendar          - (Future: Google Calendar integration)
```

---

## Database Schema

### 1. `crm_job_types` - Types of work you do
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| category | text | 'residential' or 'commercial' |
| name | text | e.g., "Service Call", "Installation" |
| slug | text | URL-friendly identifier |
| default_duration_hours | decimal | Estimated time |
| default_priority | text | low/normal/high/urgent |
| requires_permit | boolean | Does this need a permit? |
| icon_name | text | Lucide icon |
| color | text | Display color |

**Default job types seeded:**
- Residential: Service Call, Installation, Inspection, Maintenance, Custom Home Installation
- Commercial: Service Call, Installation, Project Installation, Inspection, Maintenance

### 2. `crm_job_stages` - Workflow stages per job type
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| job_type_id | uuid | Links to job type |
| name | text | Stage name |
| stage_type | text | initial/in_progress/review/completed/cancelled |
| color | text | Badge color |
| sort_order | integer | Sequence position |
| auto_notify_customer | boolean | Send notification on entry |

**Example stages for Residential Installation:**
1. Permit & Planning
2. Materials Ordered
3. Crew Assigned
4. Install Day 1
5. Install Day 2
6. QA Inspection
7. City Inspection
8. Customer Walkthrough
9. Complete
10. Cancelled

### 3. `crm_jobs` - Individual jobs
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| job_number | text | Auto-generated TRU-2026-0001 |
| job_type_id | uuid | Type of job |
| current_stage_id | uuid | Current workflow stage |
| customer_id | uuid | Links to customer |
| location_id | uuid | Service location |
| title | text | Job description |
| priority | text | low/normal/high/urgent |
| scheduled_start | timestamptz | When it's scheduled |
| scheduled_end | timestamptz | Expected end |
| quoted_amount | decimal | Price quoted |
| final_amount | decimal | Actual charged |
| payment_status | text | pending/deposit_received/partial/paid |
| internal_notes | text | Staff notes |
| customer_notes | text | Customer-visible notes |

### 4. `crm_job_stage_history` - Audit trail
Tracks every stage transition for analytics and audit.

### 5. Teams Tables (Phase 3 bundled)
- `crm_teams` - Install Crew A, Service Team, etc.
- `crm_team_members` - Individual technicians with certifications
- `crm_team_assignments` - Who belongs to which team
- `crm_job_assignments` - Who is assigned to each job

---

## UI Pages

### `/admin/jobs` - Jobs Board
Dual view showing all jobs:

**Kanban View** (default):
```text
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Scheduled│ In Prog. │  Review  │ Complete │ Cancelled│
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │          │
│ │Smith │ │ │Jones │ │ │Brown │ │          │          │
│ │$14.8k│ │ │$8.2k │ │ │$22k  │ │          │          │
│ │Install│ │ │Service│ │ │Install│ │          │          │
│ └──────┘ │ └──────┘ │ └──────┘ │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Features:**
- Filter by job type, customer, date range, priority
- Drag-and-drop cards between stages
- Quick-create job button
- Color-coded by priority and job type
- Click card to open job details

### `/admin/jobs/:id` - Job Detail
Full job page with:
- Stage progression bar at top
- Customer & location info card
- Crew assignment panel
- Scheduling section
- Activity timeline
- Financial summary
- Notes section

### `/admin/jobs/types` - Job Type & Stage Manager
Admin configuration page:
```text
┌─────────────────────┬──────────────────────────────────────┐
│ Residential         │ Stages for: Residential Installation │
│ ├─ Service Call     │                                      │
│ ├─ Installation  ←  │  ☰ 1. Permit & Planning      [Edit]  │
│ ├─ Inspection       │  ☰ 2. Materials Ordered      [Edit]  │
│ └─ Maintenance      │  ☰ 3. Crew Assigned          [Edit]  │
│                     │  ☰ 4. Install Day 1          [Edit]  │
│ Commercial          │  ☰ 5. Install Day 2          [Edit]  │
│ ├─ Service Call     │  ☰ 6. QA Inspection          [Edit]  │
│ └─ ...              │  ...                                 │
└─────────────────────┴──────────────────────────────────────┘
```

### `/admin/teams` - Teams & Crew Management
Team overview with member cards, certifications, and job assignments.

---

## File Changes Summary

### New Files
```text
Database Migration:
  - Creates 8 new tables (job_types, job_stages, jobs, job_stage_history, 
    teams, team_members, team_assignments, job_assignments)
  - Seeds default job types and stages
  - Adds job number auto-generation function
  - Sets up RLS policies

UI Pages:
  src/pages/admin/Jobs.tsx              - Jobs board (Kanban + list)
  src/pages/admin/JobDetail.tsx         - Single job view
  src/pages/admin/JobTypesConfig.tsx    - Job type & stage configuration
  src/pages/admin/Teams.tsx             - Team & crew management

Components:
  src/components/admin/jobs/JobCard.tsx           - Kanban card
  src/components/admin/jobs/JobFormDialog.tsx     - Create/edit job
  src/components/admin/jobs/JobStageBar.tsx       - Progress indicator
  src/components/admin/jobs/StageColumn.tsx       - Kanban column
  src/components/admin/teams/TeamCard.tsx         - Team display
  src/components/admin/teams/MemberFormDialog.tsx - Add/edit team member
```

### Modified Files
```text
src/components/admin/adminNavConfig.ts
  - Add "Operations" section with Jobs, Teams, Job Types entries

src/App.tsx
  - Add routes for /admin/jobs, /admin/jobs/:id, /admin/jobs/types, /admin/teams
```

---

## Implementation Order

1. **Database Migration** - Create all 8 tables with RLS, seed default job types and stages
2. **Job Types Config Page** - Admin can configure types and stages
3. **Teams Page** - Basic team and member management
4. **Jobs Board** - Main Kanban view with create/edit/view
5. **Job Detail Page** - Full job view with stage progression
6. **Navigation Update** - Add Operations section to sidebar

---

## Create Job Flow

When creating a job from the Jobs Board or a Customer Detail page:

1. Select customer (auto-filled if from customer profile)
2. Select location (from customer's locations)
3. Select job type (determines available stages)
4. Set schedule (date/time)
5. Set priority
6. Add notes
7. Job created at first stage for that job type
8. Optionally assign team/crew

---

## Key Relationships

```text
Customer
    └─→ Location (where the job happens)
           └─→ Job (the actual work)
                  ├─→ Job Type (what kind of work)
                  │      └─→ Job Stages (workflow steps)
                  ├─→ Current Stage (where in the workflow)
                  └─→ Job Assignments (who's doing it)
                          ├─→ Team
                          └─→ Team Members
```

---

## Outcome

After implementation:
- Admins can create jobs linked to customers and locations
- Jobs flow through configurable workflow stages
- Teams and crew members can be assigned to jobs
- Visual Kanban board shows all active work
- Job history tracks every stage change
- Foundation ready for calendar integration (Phase 5)

