# Supplier attribution + price freshness for Individual Equipment Pricing

## What I verified first

- `crm_suppliers` columns: id, name, notes, is_active, created_at, updated_at, company_id (NOT NULL), address, phone, account_number, is_default, sort_order.
- `crm_suppliers` policies today: one `ALL` policy for admin/manager only, plus a SELECT policy for active rows. **`super_admin` is missing** — that is why saving throws a row-level security error for super admins.
- `file_attachments` policies: single `ALL` policy (admin/manager/super_admin). There is **no CHECK constraint** on `entity_type`, so nothing blocks new values.
- `individual_equipment_pricing`: id, brand, model_number, type, size, price, is_active, sort_order, notes, created_at, updated_at. No supplier or price-history fields yet.
- There is **no `crm_events` table** in the database.
- The Add/Edit dialog already has a working Documents tab backed by the typed `equipment_documents` system (submittal, spec sheet, warranty, etc.), correctly disabled until the row is saved.

## Decisions from your answers

- Documents: keep the existing `equipment_documents` panel. Step 5 (extending `FileAttachments` to `'equipment'`) is dropped — no duplicate document systems, `FileAttachments.tsx` is not touched.
- Event log: create `crm_events` exactly as you specified, in its own standalone migration.

## Migrations (three, run separately)

**1. crm_suppliers RLS fix**
Drop both existing policies; recreate four explicit policies `TO authenticated` using `has_role()`:
SELECT / INSERT / UPDATE for super_admin, admin, manager; DELETE for super_admin, admin only.

**2. crm_events (standalone, append-only)**
Table exactly as specified (tenant_id, event_type, entity_type, entity_id, actor_id, actor_label, source, payload, occurred_at, created_at). GRANTs for authenticated + service_role. RLS with INSERT and SELECT policies only (super_admin/admin/manager). A BEFORE UPDATE OR DELETE trigger that raises an exception. Indexes on (entity_type, entity_id), (event_type, occurred_at DESC), (occurred_at DESC), and GIN on payload. No updated_at.
Plus one reusable SECURITY DEFINER helper `public.log_crm_event(_event_type, _entity_type, _entity_id, _payload, _source, _actor_id, _actor_label)` — the single insert path everything future calls.

**3. Equipment pricing schema + trigger**
- Add `supplier_id UUID REFERENCES crm_suppliers(id) ON DELETE SET NULL`, `supplier_url TEXT`, `price_updated_at TIMESTAMPTZ`, `previous_price NUMERIC`; index on supplier_id.
- Backfill `price_updated_at = updated_at` on existing rows.
- BEFORE INSERT trigger: set `price_updated_at = now()`.
- BEFORE UPDATE trigger: only when `NEW.price IS DISTINCT FROM OLD.price`, set `previous_price = OLD.price` and `price_updated_at = now()` (editing notes never resets it).
- AFTER UPDATE trigger on the same condition calls `log_crm_event` with `event_type='equipment.price_changed'`, `entity_type='equipment'`, entity_id = row id, payload `{brand, model_number, old_price, new_price, supplier_id, supplier_name}`, actor from `auth.uid()`.

## Admin UI — `src/pages/admin/IndividualEquipmentPricing.tsx` only

Dialog (Details tab, between Price and Notes):
- **Supplier** — searchable select of active `crm_suppliers` sorted by name; optional, clearable. No hardcoded names.
- **Supplier Product URL** — text input, placeholder `https://supplier.com/product/...`, validated to start with `http`; external-link icon button opens it in a new tab when valid.
- Under Price, when editing: `Price last updated: {date}` and `(was $X)` when `previous_price` exists.

Table:
- New **Supplier** column (joined name, blank when none) and **Price Updated** column (formatted, sortable), amber past 90 days and red past 180 days.
- New **Supplier** filter dropdown next to Type and Brand.

CSV:
- Export gains `Supplier` and `Price Updated` columns.
- Import accepts an optional `Supplier` column, matched case-insensitively to supplier name; unmatched names leave `supplier_id` null and add a line to the existing import errors list instead of failing the batch.

## Verification

- TypeScript typecheck across the app and all edge functions; pre-existing unrelated errors get reported, not worked around.
- Confirm a notes-only edit leaves `price_updated_at` unchanged, and a price edit updates it, sets `previous_price`, and writes one `crm_events` row.

## Scope

Only `src/pages/admin/IndividualEquipmentPricing.tsx` and new files under `supabase/migrations/`. No public/marketing files, no calculator pages, no `FileAttachments.tsx`, no `crm_interactions` changes.
