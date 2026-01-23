# GoHighLevel (GHL) Integration Documentation

> Last Updated: January 2026

## Overview

This document describes the GoHighLevel (GHL) integration architecture used for lead capture, CRM synchronization, and internal notifications across all forms and estimators.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND FORMS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Contact Form    │  Onsite Estimate  │  Equipment Scanner  │ Estimators │
│  (Contact.tsx)   │  (OnsiteEstimate) │  (EmailCapture.tsx) │ (Ducted/   │
│                  │                    │                     │  Ductless) │
└────────┬─────────┴─────────┬──────────┴─────────┬───────────┴─────┬─────┘
         │                   │                    │                 │
         ▼                   ▼                    ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE EDGE FUNCTIONS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    sync-ghl-contact                             │    │
│  │  - Upserts contact to GHL via LeadConnector API                │    │
│  │  - Maps custom fields (service_type, quote_raw_details, etc.)  │    │
│  │  - Returns contactId on success                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │               send-estimator-notification                       │    │
│  │  - Creates notes on GHL contact                                 │    │
│  │  - Creates follow-up tasks                                      │    │
│  │  - Triggers GHL automation workflows                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                verify-ghl-custom-fields                         │    │
│  │  - Audits GHL location for required custom fields              │    │
│  │  - Reports missing fields for configuration                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GOHIGHLEVEL (LeadConnector)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  - Contacts API (upsert/search)                                         │
│  - Notes API (add submission details)                                   │
│  - Tasks API (create follow-up tasks)                                   │
│  - Custom Fields (quote details, equipment info)                        │
│  - Automation Workflows (triggered by tags/notes)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Edge Functions

### 1. `sync-ghl-contact`

**Purpose:** Primary function for creating/updating contacts in GHL.

**File:** `supabase/functions/sync-ghl-contact/index.ts`

**Configuration:**
```toml
# supabase/config.toml
[functions.sync-ghl-contact]
verify_jwt = false  # Allows unauthenticated estimator submissions
```

**Required Environment Variables:**
| Variable | Description |
|----------|-------------|
| `GHL_API_Key_Contact` | GHL Private Integration API Key |
| `GHL_LOCATION_ID` | GHL Location/Sub-account ID |

**Request Payload:**
```typescript
interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message?: string;
  tags?: string[];
  source?: string;
  equipmentReportUrl?: string;
  zipCode?: string;
  isDfw?: boolean;
  equipment?: {
    brand?: string;
    age?: number;
    tonnage?: string;
    refrigerant?: string;
    seerRating?: number;
    equipmentType?: string;
  };
  quote?: {
    systemType?: string;
    tonnage?: string;
    equipment?: string;
    price?: string;
    monthlyPayment?: string;
    homeDetails?: string;
    validUntil?: string;
    tier?: string;
    zones?: number;
    totalBtu?: number;
    quoteRawDetails?: string;  // Full structured quote text
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  contactId?: string;  // GHL Contact ID
  message?: string;
  error?: string;
}
```

**Custom Fields Mapped:**
| GHL Field Key | Source |
|---------------|--------|
| `service_type` | contactData.serviceType |
| `message` | contactData.message |
| `equipment_report_url` | contactData.equipmentReportUrl |
| `zip_code` | contactData.zipCode |
| `is_dfw` | contactData.isDfw ("Yes"/"No") |
| `equipment_brand` | contactData.equipment.brand |
| `equipment_age` | contactData.equipment.age |
| `equipment_tonnage` | contactData.equipment.tonnage |
| `equipment_refrigerant` | contactData.equipment.refrigerant |
| `equipment_seer` | contactData.equipment.seerRating |
| `equipment_type` | contactData.equipment.equipmentType |
| `quote_system_type` | contactData.quote.systemType |
| `quote_tonnage` | contactData.quote.tonnage |
| `quote_equipment` | contactData.quote.equipment |
| `quote_price` | contactData.quote.price |
| `quote_monthly` | contactData.quote.monthlyPayment |
| `quote_home_details` | contactData.quote.homeDetails |
| `quote_valid_until` | contactData.quote.validUntil |
| `quote_tier` | contactData.quote.tier |
| `quote_zones` | contactData.quote.zones |
| `quote_total_btu` | contactData.quote.totalBtu |
| `quote_raw_details` | contactData.quote.quoteRawDetails |

---

### 2. `send-estimator-notification`

**Purpose:** Creates internal notes and tasks in GHL for staff follow-up.

**File:** `supabase/functions/send-estimator-notification/index.ts`

**Configuration:**
```toml
[functions.send-estimator-notification]
verify_jwt = false  # Called after sync-ghl-contact
```

**Workflow:**
1. Receives notification data from estimator submission
2. Searches for the contact in GHL by email
3. Adds a detailed note to the contact with full quote breakdown
4. Creates a follow-up task assigned to staff

**Request Payload:**
```typescript
interface NotificationData {
  estimatorType: 'ducted' | 'ductless';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  quoteTotal: string;
  quoteDetails: string;  // Full breakdown text
  submittedAt?: string;
}
```

**Internal Notification Email:** `estimator@truficient.com`

---

### 3. `verify-ghl-custom-fields`

**Purpose:** Audit utility for admins to verify GHL configuration.

**File:** `supabase/functions/verify-ghl-custom-fields/index.ts`

**Required Custom Fields:**
- `quote_raw_details`
- `quote_system_type`
- `quote_price`
- `quote_tonnage`
- `quote_valid_until`
- (and others based on integration needs)

**Admin Access:** Settings → GoHighLevel Integration → "Verify Custom Fields"

---

## Form Integration Points

### Forms That Sync to GHL

| Form | File | Source Tag | Tags Hook |
|------|------|------------|-----------|
| Contact Form | `src/pages/Contact.tsx` | "Website Contact Form" | `useFormSourceTags('contact')` |
| Onsite Estimate | `src/components/forms/OnsiteEstimateForm.tsx` | "HVAC Estimate Page - Onsite Request" | `useFormSourceTags('contact')` |
| Equipment Scanner | `src/pages/scanner/components/EmailCapture.tsx` | "Equipment Scanner" | `useFormSourceTags('scanner')` |
| Ducted Estimator | `src/pages/estimators/ducted/steps/Step9CustomerInfo.tsx` | "Ducted HVAC Estimator" | `useFormSourceTags('ducted')` |
| Ductless Estimator | `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | "Ductless Mini-Split Estimator" | `useFormSourceTags('ductless')` |
| Landing Page Forms | `src/components/forms/LandingPageForm.tsx` | Dynamic per form | Uses form-specific tags |

---

## Dynamic Tag Management

### Database Table: `ghl_tags`

Stores available GHL tags that can be assigned to form sources.

```sql
CREATE TABLE ghl_tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,        -- Display name
  tag_value TEXT NOT NULL,   -- GHL tag identifier
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### Database Table: `form_source_tags`

Maps tags to specific form sources.

```sql
CREATE TABLE form_source_tags (
  id UUID PRIMARY KEY,
  source_type TEXT NOT NULL,  -- 'ducted', 'ductless', 'contact', 'scanner', 'landing_page'
  tag_id UUID REFERENCES ghl_tags(id),
  is_active BOOLEAN DEFAULT true
);
```

### Usage Hook: `useFormSourceTags`

```typescript
// src/hooks/useFormSourceTags.ts
const { data: tags } = useFormSourceTags('ducted');
// Returns: ['hvac-lead', 'ducted-estimator', 'website']

// Used in form submission:
supabase.functions.invoke('sync-ghl-contact', {
  body: {
    ...contactData,
    tags: tags || ['website-lead'],  // Fallback if no tags configured
  }
});
```

**Admin Management:** Admin → Marketing → GHL Tags

---

## Submission Sync Sequence

```
User Submits Form
       │
       ▼
┌─────────────────────────────────────┐
│  1. Insert to Supabase Table        │
│     (contact_submissions,           │
│      ducted_estimate_submissions,   │
│      ductless_estimate_submissions) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Call sync-ghl-contact           │
│     - Upsert contact to GHL         │
│     - Map all custom fields         │
│     - Get contactId                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Update Supabase Record          │
│     - ghl_contact_id = contactId    │
│     - ghl_sync_status = 'synced'    │
└──────────────┬──────────────────────┘
               │
               ▼ (Estimators only)
┌─────────────────────────────────────┐
│  4. Call send-estimator-notification│
│     - Add note to contact           │
│     - Create follow-up task         │
│     - Trigger GHL automations       │
└─────────────────────────────────────┘
```

**Important:** `send-estimator-notification` is only called AFTER `sync-ghl-contact` returns a valid `contactId` to ensure the contact exists in GHL.

---

## GHL Sync Status Tracking

Each submission table includes:
- `ghl_contact_id` - The GHL contact ID (if sync succeeded)
- `ghl_sync_status` - One of: `pending`, `synced`, `failed`

**Admin Features:**
- View sync status in submission details
- Retry failed syncs from admin dashboard
- Filter submissions by sync status

---

## Quote Raw Details Format

The `quote_raw_details` field contains a structured text breakdown sent to GHL for email templates:

```
DUCTLESS MINI-SPLIT ESTIMATE
============================

System Configuration:
• Tier: Premium (26 SEER2)
• Zones: 3
• Total Capacity: 36,000 BTU

Zone Details:
• Living Room - 12,000 BTU Wall Mount
• Master Bedroom - 12,000 BTU Wall Mount
• Guest Room - 12,000 BTU Wall Mount

Pricing Breakdown:
• Equipment & Installation: $12,500
• Add-ons: $850
• Subtotal: $13,350
• Tax (8.25%): $1,101
• TOTAL: $14,451

Financing Options:
• Plan 980: ~$387/mo at 5.99% APR
• Plan 924: ~$803/mo (No Interest for 18 mo)

Quote Valid Until: February 22, 2026
```

---

## Troubleshooting

### Common Issues

1. **GHL Credentials Not Configured**
   - Check Supabase secrets for `GHL_API_Key_Contact` and `GHL_LOCATION_ID`

2. **Custom Fields Not Syncing**
   - Run verification from Admin → Settings → GoHighLevel Integration
   - Ensure custom fields exist in GHL Location Settings

3. **Sync Failed Status**
   - Check edge function logs for API errors
   - Verify GHL API key has correct permissions

4. **Tags Not Applied**
   - Verify tags are active in Admin → Marketing → GHL Tags
   - Check `form_source_tags` assignments

### Debug Logging

All edge functions log to Supabase Edge Function logs:
```
Admin → Supabase → Edge Functions → [function-name] → Logs
```

---

## Related Files

| File | Purpose |
|------|---------|
| `supabase/functions/sync-ghl-contact/index.ts` | Contact sync function |
| `supabase/functions/send-estimator-notification/index.ts` | Internal notifications |
| `supabase/functions/verify-ghl-custom-fields/index.ts` | Field verification |
| `supabase/functions/get-ghl-conversations/index.ts` | Fetch GHL conversations |
| `src/hooks/useFormSourceTags.ts` | Dynamic tag fetching |
| `src/pages/admin/GHLTags.tsx` | Tag management UI |
| `src/pages/admin/GHLConversations.tsx` | Conversation viewer |
| `src/pages/admin/Settings.tsx` | GHL verification UI |
| `supabase/config.toml` | Edge function JWT settings |
