
# Marketing Sources & Campaign Tags for CRM

## Current State Analysis

### Lead Sources (Hardcoded)
The `lead_source` field currently has 7 static options:
- Manual Entry, Ducted Estimator, Ductless Estimator, Equipment Scanner, Contact Form, Phone Call, Referral

### Tags Column (Unused)
The `crm_customers` table already has a `tags` column (text array) that is not currently exposed in the UI.

### GHL Tags System
There's an existing `ghl_tags` table used for GoHighLevel CRM sync - this is a separate system for marketing automation.

---

## Recommendation

**Yes, separate sections for Lead Source and Campaign Tags makes sense:**

| Concept | Purpose | Examples |
|---------|---------|----------|
| **Lead Source** | Where the customer first heard about you | Mitsubishi, Bosch, Facebook, Google, Referral |
| **Campaign Tags** | Multiple labels for segmentation & targeting | "Spring 2025", "Tax Credit Promo", "Heat Pump Upgrade" |

### Why Separate?
- **Lead Source** = single origin (one per customer)
- **Campaign Tags** = multiple labels (many per customer)
- Enables filtering like "Show all Mitsubishi leads tagged with Spring 2025 campaign"

---

## Implementation Plan

### 1. Create `lead_sources` Database Table
Admin-configurable list of marketing sources:
```text
id, name, display_name, category (marketing/partner/organic), color, is_active, sort_order
```
Default seeds: Mitsubishi, Bosch, Facebook, Google, Referral, Phone, etc.

### 2. Create `crm_campaign_tags` Database Table
Reusable campaign labels:
```text
id, name, color, description, is_active, created_at
```
Examples: "Q1 2025 Push", "Federal Tax Credit", "Mitsubishi Rebate"

### 3. Update CustomerFormDialog
- **Lead Source**: Change from hardcoded Select to dynamic dropdown from `lead_sources` table
- **Campaign Tags**: Add multi-select component using the existing `tags` column on `crm_customers`

### 4. Create Admin Management Pages
- **Lead Sources Admin** (`/admin/settings/lead-sources`): Add/edit/toggle sources
- **Campaign Tags Admin** (`/admin/settings/campaign-tags`): Manage campaign tags

### 5. Update CustomerTable & Filters
- Display tags as colored badges
- Add filter by campaign tag

---

## UI Mockup - Customer Form

```text
┌─────────────────────────────────────────────────┐
│ Customer Information                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Lead Source        │  Status                   │
│  [  Mitsubishi  ▼]  │  [  Lead  ▼]              │
│                                                 │
│  Campaign Tags (optional)                       │
│  ┌─────────────────────────────────────────┐   │
│  │ ✕ Spring 2025   ✕ Heat Pump Upgrade     │   │
│  │ + Add tag...                            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## File Changes

### New Files
```text
src/pages/admin/LeadSourcesConfig.tsx      - Admin page for managing lead sources
src/pages/admin/CampaignTagsConfig.tsx     - Admin page for managing campaign tags  
src/components/admin/customers/CampaignTagSelector.tsx - Multi-select tag component
```

### Modified Files
```text
src/components/admin/customers/CustomerFormDialog.tsx
  - Replace hardcoded lead_source Select with dynamic query
  - Add CampaignTagSelector component using tags[] column

src/components/admin/customers/CustomerTable.tsx  
  - Display campaign tags as badges
  - Add tag filter option

src/pages/admin/CustomerDetail.tsx
  - Show campaign tags in customer header

src/components/admin/adminNavConfig.ts
  - Add Settings submenu entries
```

### Database Migration
```sql
-- Lead sources table
CREATE TABLE lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  color TEXT DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign tags table  
CREATE TABLE crm_campaign_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default lead sources
INSERT INTO lead_sources (name, display_name, category, sort_order) VALUES
  ('mitsubishi', 'Mitsubishi', 'partner', 1),
  ('bosch', 'Bosch', 'partner', 2),
  ('facebook', 'Facebook', 'marketing', 3),
  ('google', 'Google', 'marketing', 4),
  ('referral', 'Referral', 'organic', 5),
  ('phone', 'Phone Call', 'organic', 6),
  ('manual', 'Manual Entry', 'other', 99);
```

---

## Outcome

After implementation:
- Admins can add new marketing sources (Mitsubishi, Bosch, etc.) without code changes
- Customers can have multiple campaign tags for segmentation
- Table filtering by source and tags for targeted outreach
- Clean separation between acquisition channel (source) and marketing segments (tags)
