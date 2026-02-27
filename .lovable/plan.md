
Goal: Make the March landing page lead form reliably appear in Admin → Landing Pages → Lead Capture Forms (and keep it linked going forward).

Implementation steps:
1. Harden the Lead Capture Forms data flow in `src/pages/admin/LandingPageForms.tsx`.
   - Add explicit query error handling for `landing_page_forms` (show error state, not “No forms created yet”).
   - Add a manual “Refresh” action on the Lead Capture Forms card so newly created backend records appear immediately without waiting for cache staleness.

2. Make the campaign/form link durable in backend data.
   - Add an idempotent migration that upserts the March form by slug (`smart-group-march-F-26`) into `landing_page_forms` with active status and correct `fields_config`.
   - Keep this as source-controlled migration so the record is not “manual-only” and survives environment changes.

3. Fix submission payload alignment in `src/pages/landing/SmartGroupMarchLanding.tsx`.
   - Replace non-existent insert fields (`form_type`, `source`, `form_data`) with valid columns (`service_type`, `message`, `custom_fields`).
   - Keep `form_id` attached to this form record.
   - Stop swallowing insert failures silently; only show success after confirmed insert.

4. Verify admin visibility and linkage.
   - Confirm Lead Capture Forms section shows “March Group Buy Lead Capture.”
   - Confirm form row shows submission count updates after a test submit.
   - Confirm submissions in admin resolve `form:landing_page_forms(name, slug)` correctly for this campaign.

Technical details:
- Files to update:
  - `src/pages/admin/LandingPageForms.tsx` (error/loading/refresh behavior for forms query)
  - `src/pages/landing/SmartGroupMarchLanding.tsx` (valid insert schema + stricter success handling)
  - `supabase/migrations/<new_timestamp>_upsert_march_group_buy_form.sql` (idempotent upsert seed)
- Data contract to enforce:
  - `landing_page_forms.slug = 'smart-group-march-F-26'`
  - `landing_page_submissions.form_id` references that form ID
  - custom campaign data stored under `landing_page_submissions.custom_fields`
- Security/RLS:
  - No new public exposure needed; reuse existing policies on `landing_page_forms` and `landing_page_submissions`.
