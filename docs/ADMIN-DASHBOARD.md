# Admin Dashboard Documentation

> Last Updated: January 2026

## Overview

The admin dashboard provides a centralized interface for managing submissions, content, pricing, analytics, and integrations. It uses a role-based access control system with `admin` and `manager` roles.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN LAYOUT                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │            │ │                    AdminHeader                       │ │
│ │            │ ├──────────────────────────────────────────────────────┤ │
│ │ AdminSide  │ │                                                      │ │
│ │   bar      │ │                                                      │ │
│ │            │ │                    Page Content                      │ │
│ │ • Overview │ │                                                      │ │
│ │ • Content  │ │    (Dashboard, Submissions, Blog, etc.)             │ │
│ │ • Estima-  │ │                                                      │ │
│ │   tors     │ │                                                      │ │
│ │ • Finan-   │ │                                                      │ │
│ │   cials    │ │                                                      │ │
│ │ • Market-  │ │                                                      │ │
│ │   ing      │ │                                                      │ │
│ │ • Analyt-  │ │                                                      │ │
│ │   ics      │ │                                                      │ │
│ │ • System   │ │                                                      │ │
│ │            │ │                                                      │ │
│ └────────────┘ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Navigation Structure

**File:** `src/components/admin/adminNavConfig.ts`

### Sections

| Section | Access | Pages |
|---------|--------|-------|
| **Overview** | All roles | Dashboard, Submissions, DFW Watch List* |
| **Content** | Mixed | Blog, Gallery*, Equipment Library* |
| **Estimators** | Admin only | Estimates, Templates, System Pricing, Customer Equipment, Ductless Config |
| **Financials** | Admin only | Materials, Labor Rates, Admin Costs, Financing |
| **Marketing** | Admin only | SEO, Calculators, Landing Pages, GHL Tags, GHL Conversations |
| **Analytics** | Admin only | Scanner Analytics, Button Clicks, Analytics, Social Media |
| **System** | Mixed | Users*, Trash Bin*, Settings |

*Items marked with `*` are admin-only within mixed sections.

---

## Dashboard Components

**File:** `src/pages/admin/Dashboard.tsx`

### Layout Grid

```
┌───────────────────────────────────────────────────────────────┐
│                      STATS CARDS ROW                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ Total   │ │ New     │ │ Reviewed│ │ This    │             │
│  │ Submis- │ │ (count) │ │ (count) │ │ Week    │             │
│  │ sions   │ │         │ │         │ │ (count) │             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│  │     QUICK ACTIONS       │ │      LEAD METRICS           │ │
│  │ [Blog] [Site] [Media]   │ │ Total | Conv% | Week | Src  │ │
│  │ [Submissions] [Settings]│ │  150  | 24%   | +12  | Web  │ │
│  └─────────────────────────┘ └─────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│  │   SUBMISSIONS CHART     │ │    ENGAGEMENT STATS         │ │
│  │   (30-day line chart)   │ │   Button clicks, heatmaps   │ │
│  └─────────────────────────┘ └─────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │
│  │ ACTIVITY FEED │ │ RECENT SUBS   │ │ RECENT CHATS     │   │
│  │ (timeline)    │ │ (table)       │ │ (GHL convos)     │   │
│  └───────────────┘ └───────────────┘ └───────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### Component Details

#### StatsCards
**File:** `src/components/admin/dashboard/StatsCards.tsx`

Displays four key metrics:
- **Total Submissions:** All-time count across all forms
- **New:** Submissions with status `new` or null
- **Reviewed:** Submissions with status `reviewed`, `contacted`, or `closed`
- **This Week:** Submissions from the current week

Data sources aggregated:
- `contact_submissions`
- `landing_page_submissions`
- `ductless_estimate_submissions`
- `equipment_scans` (with email)

---

#### QuickActions
**File:** `src/components/admin/dashboard/QuickActions.tsx`

Quick navigation buttons:
| Action | Route |
|--------|-------|
| New Blog Post | `/admin/blog` |
| View Live Site | External: `https://truficient.lovable.app` |
| Add Media | `/admin/gallery` |
| Submissions | `/admin/submissions` |
| Settings | `/admin/settings` |

---

#### LeadMetrics
**File:** `src/components/admin/dashboard/LeadMetrics.tsx`

Calculated metrics:
| Metric | Calculation |
|--------|-------------|
| Total Leads | Sum of all submissions |
| Conversion Rate | (contacted + closed) / total × 100 |
| This Week | Submissions since week start |
| Week Growth | ((thisWeek - lastWeek) / lastWeek) × 100 |
| Top Source | Most common submission source |

---

#### SubmissionsChart
**File:** `src/components/admin/dashboard/SubmissionsChart.tsx`

- 30-day line chart using Recharts
- Groups submissions by date
- Shows trend over time

---

#### EngagementStats
**File:** `src/components/admin/dashboard/EngagementStats.tsx`

Displays:
- Total button clicks (from `button_clicks` table)
- Click-through rates
- Popular buttons/actions

---

#### ActivityFeed
**File:** `src/components/admin/dashboard/ActivityFeed.tsx`

Chronological timeline of recent activity:
- New submissions
- Equipment scans
- Blog posts published
- Status changes

---

#### RecentSubmissions
**File:** `src/components/admin/dashboard/RecentSubmissions.tsx`

Table of the 5 most recent submissions with:
- Name
- Email
- Service type
- Status badge
- Timestamp

---

#### RecentChats
**File:** `src/components/admin/dashboard/RecentChats.tsx`

Displays recent GHL conversations fetched via `get-ghl-conversations` edge function.

---

## Key Admin Pages

### Submissions Management

| Page | Route | Purpose |
|------|-------|---------|
| Unified Submissions | `/admin/submissions` | View all submission types |
| Landing Page Submissions | `/admin/landing-pages/submissions` | Form-specific submissions |
| DFW Watch List | `/admin/dfw-watchlist` | Equipment scans with old equipment |

### Content Management

| Page | Route | Purpose |
|------|-------|---------|
| Blog Posts | `/admin/blog` | Create/edit blog posts |
| Gallery | `/admin/gallery` | Media management |
| Equipment Library | `/admin/equipment-library` | Technical documentation |

### Estimator Configuration

| Page | Route | Purpose |
|------|-------|---------|
| System Pricing | `/admin/system-pricing` | Ducted equipment pricing |
| Ductless Config | `/admin/ductless-config` | Ductless tiers, units, add-ons |
| Financing | `/admin/financing` | Synchrony financing plans |
| Estimates | `/admin/estimates` | Custom estimate builder |

### Marketing & Analytics

| Page | Route | Purpose |
|------|-------|---------|
| GHL Tags | `/admin/ghl-tags` | Manage GHL tag assignments |
| GHL Conversations | `/admin/ghl-conversations` | View CRM conversations |
| Landing Pages | `/admin/landing-pages` | Dynamic form builder |
| SEO | `/admin/seo` | Page meta management |
| Scanner Analytics | `/admin/scanner-analytics` | Equipment scan metrics |
| Button Clicks | `/admin/button-clicks` | UI interaction tracking |

### System

| Page | Route | Purpose |
|------|-------|---------|
| Users | `/admin/users` | Role management |
| Settings | `/admin/settings` | Account & GHL verification |
| Trash Bin | `/admin/trash-bin` | Soft-deleted items |

---

## Role-Based Access Control

### Database Table: `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,  -- 'admin' or 'manager'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Hook: `useUserRole`
**File:** `src/hooks/useUserRole.ts`

```typescript
const { role, isLoading } = useUserRole();
// role: 'admin' | 'manager' | null
```

### Protected Route Component
**File:** `src/components/admin/ProtectedRoute.tsx`

Wraps admin pages to enforce authentication and role requirements.

---

## Data Flow

### Dashboard Data Fetching

```typescript
// src/pages/admin/Dashboard.tsx
useEffect(() => {
  const fetchData = async () => {
    // Parallel fetch from all submission sources
    const [contactResult, landingPageResult, ductlessResult, scannerResult] = 
      await Promise.all([
        supabase.from('contact_submissions').select('...'),
        supabase.from('landing_page_submissions').select('...'),
        supabase.from('ductless_estimate_submissions').select('...'),
        supabase.from('equipment_scans').select('...'),
      ]);
    
    // Normalize and combine
    const allSubs = [...contacts, ...landing, ...ductless, ...scanner];
    
    // Sort by date descending
    allSubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Calculate stats
    const stats = {
      total: allSubs.length,
      new: allSubs.filter(s => !s.status || s.status === 'new').length,
      reviewed: allSubs.filter(s => ['reviewed', 'contacted', 'closed'].includes(s.status)).length,
      thisWeek: allSubs.filter(s => new Date(s.created_at) >= weekStart).length,
    };
  };
}, []);
```

---

## Related Files

### Core Layout
| File | Purpose |
|------|---------|
| `src/components/admin/AdminLayout.tsx` | Main layout wrapper |
| `src/components/admin/AdminSidebar.tsx` | Navigation sidebar |
| `src/components/admin/AdminHeader.tsx` | Top header bar |
| `src/components/admin/MobileAdminNav.tsx` | Mobile navigation |
| `src/components/admin/adminNavConfig.ts` | Navigation structure |

### Dashboard Components
| File | Purpose |
|------|---------|
| `src/components/admin/dashboard/StatsCards.tsx` | Key metric cards |
| `src/components/admin/dashboard/QuickActions.tsx` | Action shortcuts |
| `src/components/admin/dashboard/LeadMetrics.tsx` | Conversion metrics |
| `src/components/admin/dashboard/SubmissionsChart.tsx` | Trend visualization |
| `src/components/admin/dashboard/EngagementStats.tsx` | Click analytics |
| `src/components/admin/dashboard/ActivityFeed.tsx` | Activity timeline |
| `src/components/admin/dashboard/RecentSubmissions.tsx` | Latest submissions |
| `src/components/admin/dashboard/RecentChats.tsx` | GHL conversations |

### Auth & Access
| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Authentication hook |
| `src/hooks/useUserRole.ts` | Role management hook |
| `src/components/admin/ProtectedRoute.tsx` | Route protection |

---

## Database Tables Used

| Table | Dashboard Usage |
|-------|-----------------|
| `contact_submissions` | Stats, recent submissions |
| `landing_page_submissions` | Stats, recent submissions |
| `ductless_estimate_submissions` | Stats, recent submissions |
| `ducted_estimate_submissions` | Stats, recent submissions |
| `equipment_scans` | Stats, activity feed, DFW watch list |
| `blog_posts` | Activity feed |
| `button_clicks` | Engagement stats |
| `user_roles` | Access control |
