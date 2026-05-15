# Maintenance Contract Tracker — Phase 1 Plan

Module under `/admin/contracts` for tracking residential & commercial maintenance agreements, linked to existing CRM customers, locations, and WorkEdge property records.

## 1. Database (single migration)

**Tables**
- `crm_maintenance_contracts` — full field list per spec (contract_number auto `MNT-YYYY-####`, segment enum, status enum, billing_model enum, dates, pricing, visit cadence, filter rollup fields, notes).
- `crm_contract_filters` — per-contract filter sizes with quantity, MERV, last/next dates.
- `crm_contract_visits` — visit log linked to `crm_jobs` and `crm_team_members`.

**Enums**
- `maintenance_segment` (residential, commercial)
- `maintenance_status` (active, pending, paused, expired, cancelled)
- `maintenance_billing_model` (paid_yearly, paid_monthly, pay_per_visit)
- `maintenance_visit_type` (spring_tune_up, fall_tune_up, quarterly, filter_only, other)

**Functions / Triggers**
- `generate_contract_number()` → `MNT-YYYY-####` (mirrors existing job/estimate generators).
- `set_contract_number()` BEFORE INSERT trigger.
- `update_updated_at_column` reused for updated_at.
- `recalculate_contract_filter_rollup()` trigger on `crm_contract_filters` (insert/update/delete) → updates parent `next_filter_due` = min of children, `last_filter_change` = max.
- `recalculate_contract_next_visit()` trigger on `crm_contract_visits` insert → updates `last_visit_date`, `next_visit_due = last_visit_date + (365/visits_per_year)`.
- Per-row default for `next_visit_due` set in app dialog when no visits yet (`start_date + 30 days`).
- `notify_contract_events()` daily trigger replaced by simple insertion into `admin_notifications` from a future cron — Phase 1 inserts notification when contract is created and when a visit is logged. (T-30/T-14 cron deferred to a follow-up; spec allows hooking into existing center.)

**RLS** — Enable on all 3 tables. Policies use `has_role(auth.uid(), 'admin')` / `'super_admin'` / `'manager'` for full access; `'sales'` and `'tech'` get SELECT. Mirrors patterns already used for `crm_jobs`.

## 2. Routes & Navigation

- Add route `/admin/contracts` and `/admin/contracts/:id` in admin router.
- Add sidebar entry "Maintenance Contracts" (Wrench icon) in admin nav, near Jobs.

## 3. List Page — `src/pages/admin/MaintenanceContracts.tsx`

- Tabs: All / Residential / Commercial
- Search (customer name, address, contract number) + filters (status, billing_model, due-soon ≤30 days)
- "+ New Contract" opens dialog
- KPI strip: Active (residential/commercial split), visits due this month, filters due this month, renewals next 60 days, ARR sum
- Table columns per spec with red/amber badges driven by date math helpers
- Sticky header row using existing opaque-background pattern

## 4. Detail Page — `src/pages/admin/MaintenanceContractDetail.tsx`

Header with customer/address/contract#/status+segment badges, "View on WorkEdge" link if `workedge_property_id` present.

Tabs (Phase 1 only):
1. **Overview** — editable form: dates, billing, price, visits/year, auto-renew toggle, notes
2. **Visits** — table of `crm_contract_visits` + "Schedule next visit" button (creates `crm_jobs` row pre-filled with customer/location/maintenance type)
3. **Filters** — list of filter rows w/ inline "Log filter change" action (sets last_changed=today, next_due=today+interval)

Equipment / Billing tabs render "Coming in Phase 2" placeholders.

## 5. New Contract Dialog — `NewContractDialog.tsx`

Stepper:
1. Customer picker (existing CustomerSelector pattern) or "Create new"
2. Location picker filtered to selected customer (or "Add new" via existing `AddLocationDialog`)
3. Segment toggle — applies defaults:
   - Residential: visits_per_year=2, billing=paid_yearly, price=$189
   - Commercial: visits_per_year=4, billing=paid_yearly, price blank
4. Terms: start/end dates (auto end = start+12mo), billing model, price, visits/year, auto-renew
5. Filters: add rows (size, qty, MERV, interval days)
6. Save → insert contract + filter rows; optionally insert first scheduled `crm_jobs` row

## 6. Hooks & Helpers

- `src/hooks/useMaintenanceContracts.ts` — list query w/ filters, KPI aggregator, single-contract query, mutations (create/update/cancel), invalidates after writes (per project preference).
- `src/lib/maintenance/dueDateUtils.ts` — `computeNextVisitDue`, `computeNextFilterDue`, `getDueBadge(date)` returning `red|amber|none`.
- All date math in CST per project core rule (use existing `cstTimezone` helpers).

## 7. Notifications

On contract insert: admin_notifications row "New maintenance contract created" linking to detail.
On visit logged: "Maintenance visit logged for {customer}".
T-30/T-14/overdue cron is deferred (noted in code TODO).

## 8. Out of Scope (Phase 2)

Equipment-tab WorkEdge live pull, Billing-tab Otto Pay history, Bach tools, bulk renewals, customer portal view, scheduled cron notifications.

## Technical Details

- All new tables prefixed `crm_` and follow `created_at/updated_at` + trigger conventions from existing schema.
- RLS uses `has_role()` (project core rule); no role data on profile tables.
- Type definitions added to `src/types/maintenanceContracts.ts` (mirrors `src/types/crmLocations.ts` style).
- Status auto-flip to `expired` handled via a SQL function called from the list query (cheap) plus a nightly cron later.
- Cache invalidation explicitly awaited after mutations (project core rule).
- UI uses semantic tokens only (Golden Amber #FFB547, Green #A5A983, Navy #002244 already in tokens).
