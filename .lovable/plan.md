
# Comprehensive RLS Policy Update for Super Admin Access

## Problem Summary

The `super_admin` role was added recently but many existing RLS policies only check for `admin` role explicitly using `has_role(auth.uid(), 'admin')`. This causes `super_admin` users to be blocked from accessing admin-only functionality across the application.

We've been fixing these ad-hoc as issues arise, but a systematic update is needed to ensure `super_admin` has full administrative access everywhere.

---

## Analysis of Current State

After reviewing all RLS policies across 73 tables, I identified policies that use one of these patterns:

| Pattern | Issue |
|---------|-------|
| `has_role(auth.uid(), 'admin')` | Excludes `super_admin` |
| `role = 'admin'` (inline check) | Excludes `super_admin` |
| `role = ANY (ARRAY['admin', 'manager'])` | Excludes `super_admin` |

---

## Tables Requiring Updates

### Category 1: Admin-Only Management Tables (34 policies across 22 tables)

These use `has_role(auth.uid(), 'admin')` which excludes `super_admin`:

| Table | Policy | Operation |
|-------|--------|-----------|
| `admin_costs` | Admins can manage admin costs | ALL |
| `author_profiles` | Admins can manage author profiles | ALL |
| `blog_tags` | Admins can manage blog tags | ALL |
| `button_clicks` | Admins can view button clicks | SELECT |
| `crm_campaign_tags` | Admins can manage campaign tags | ALL |
| `crm_job_stages` | Admins can manage job stages | ALL |
| `crm_job_types` | Admins can manage job types | ALL |
| `crm_pipeline_stages` | Admins can manage pipeline stages | ALL |
| `crm_submission_links` | Admins can delete submission links | DELETE |
| `crm_teams` | Admins can manage teams | ALL |
| `crm_team_members` | Admins can delete team members | DELETE |
| `crm_customer_contacts` | Admins can delete contacts | DELETE |
| `documentation_search_log` | Admins can view search logs | SELECT |
| `ducted_addons` | Admins can manage ducted addons | ALL |
| `ducted_efficiency_tiers` | Admins can manage ducted efficiency tiers | ALL |
| `ducted_equipment` | Admins can manage ducted equipment | ALL |
| `ducted_pricing_modifiers` | Admins can manage ducted pricing modifiers | ALL |
| `ducted_tonnage_sizing_rules` | Admins can manage ducted tonnage rules | ALL |
| `ductless_addons` | Admins can manage addons | ALL |
| `ductless_system_tiers` | Admins can manage system tiers | ALL |
| `ductless_unit_size_pricing` | Admins can manage size pricing | ALL |
| `ductless_unit_types` | Admins can manage unit types | ALL |
| `equipment_documentation` | Admins can manage equipment documentation | ALL |
| `equipment_pages` | Admins can manage equipment pages | ALL |
| `equipment_systems` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `estimate_line_items` | Admins can manage estimate line items | ALL |
| `estimate_templates` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `estimate_template_items` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `estimate_versions` | Admins can manage estimate versions | ALL |
| `estimates` | Admins can manage estimates | ALL |
| `financing_options` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `form_source_tags` | Admins can manage form source tags | ALL |
| `gallery_image_tags` | Admins can manage image tags | ALL |
| `gallery_images` | Admins can manage images | ALL |
| `gallery_tags` | Admins can manage tags | ALL |
| `ghl_tags` | Admins can manage ghl_tags | ALL |
| `job_applications` | All CRUD operations | SELECT/UPDATE/DELETE |
| `labor_rates` | Admins can manage labor rates | ALL |
| `landing_page_forms` | Admins can manage landing_page_forms | ALL |
| `landing_page_form_tags` | Admins can manage landing_page_form_tags | ALL |
| `lead_sources` | Admins can manage lead sources | ALL |
| `materials_catalog` | Admins can manage materials | ALL |
| `price_books` | All CRUD operations | SELECT/INSERT/DELETE |
| `social_link_clicks` | Admins can view clicks | SELECT |
| `social_links` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `tracking_settings` | All CRUD operations | INSERT/UPDATE/DELETE |
| `trash_bin` | All CRUD operations | SELECT/INSERT/DELETE |
| `user_roles` | All CRUD operations | SELECT/INSERT/UPDATE/DELETE |
| `workedge_sync_log` | Admins can view sync logs | SELECT |

### Category 2: Admin+Manager Tables Missing super_admin (12 policies across 8 tables)

These check for `['admin', 'manager']` but exclude `super_admin`:

| Table | Policy | Operation |
|-------|--------|-----------|
| `crm_customer_contacts` | Insert/Update | INSERT/UPDATE |
| `crm_job_assignments` | Manage job assignments | ALL |
| `crm_job_stage_history` | Insert job stage history | INSERT |
| `crm_submission_links` | Insert submission links | INSERT |
| `crm_team_assignments` | Manage team assignments | ALL |
| `crm_team_members` | Insert/Update team members | INSERT/UPDATE |
| `equipment_pages` | Update equipment pages | UPDATE |
| `ductless_unit_size_pricing` | Managers can view size pricing | SELECT |
| `google_calendars` | Admin and manager operations | INSERT/UPDATE/DELETE |
| `workedge_project_media` | Manage project media | ALL |

---

## Solution Approach

Create a single comprehensive database migration that:

1. **Drops** all affected policies
2. **Recreates** them with updated role checks that include `super_admin`

### Standardized Role Check Pattern

For admin-only policies:
```sql
EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('super_admin', 'admin')
)
```

For admin+manager policies:
```sql
EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('super_admin', 'admin', 'manager')
)
```

---

## Technical Details

### Tables Already Correct (No Changes Needed)

The following tables already include `super_admin` properly:
- `ai_config` - Uses `is_super_admin()` function
- `ai_request_logs` - Uses `is_super_admin()` function  
- `automation_logs` - Already includes `super_admin`
- `automations` - Already includes `super_admin`
- `contact_submissions` - Already updated
- `crm_customers` - Already updated
- `crm_interactions` - Already updated
- `crm_jobs` - Already updated
- `crm_locations` - Already updated
- `crm_pipeline_entries` - Already updated
- `ducted_estimate_submissions` - Already updated
- `ductless_estimate_submissions` - Already updated
- `integration_configs` - Already updated
- `landing_page_submissions` - Already updated
- `workedge_sync_log` - Already updated (partially)

### Tables With Public Access (No Admin Role Needed)

These tables use public policies (`USING (true)`) for SELECT:
- `blog_posts` (published)
- `equipment_scans`
- Many others with public read access

---

## Database Migration Overview

The migration will update approximately **50+ policies** across **30+ tables**. Key changes:

1. All `has_role(auth.uid(), 'admin')` → Include `super_admin`
2. All inline `role = 'admin'` checks → Include `super_admin`
3. All `['admin', 'manager']` arrays → Include `super_admin`

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing admin access | Using additive changes (IN clause) preserves existing access |
| Policy conflicts | Dropping old policies before creating new ones |
| Long migration | Single atomic transaction ensures consistency |

---

## Testing After Fix

1. Login as `super_admin` (eric@truficient.com)
2. Navigate to each major admin section:
   - `/admin/submissions` - Verify all tabs show data
   - `/admin/customers` - Verify CRUD operations
   - `/admin/workedge` - Verify toggle persists
   - `/admin/settings` - Verify all config pages work
   - `/admin/blog` - Verify blog management
   - `/admin/gallery` - Verify gallery management
   - `/admin/estimates` - Verify estimate operations
   - `/admin/jobs` - Verify job management
3. Create, update, and delete records to verify full access
