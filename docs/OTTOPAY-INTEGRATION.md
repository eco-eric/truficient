# Truficient × Otto Pay Integration — Project Overview
> Provide this context to Lovable before running the first prompt.

---

## What We're Building

We are integrating **Otto Pay** (a separate invoicing and payments app) directly into the **Truficient admin CRM**. The goal is full Mission Control — the ability to view, manage, and collect payments on all invoices without ever leaving Truficient.

Otto Pay will continue to function as a standalone field app for technicians. This integration adds Truficient as a command layer on top of it.

---

## The Two Apps

### Truficient (this project)
- Internal admin CRM for managing customers, jobs, operations, marketing, and analytics
- Built in React + TypeScript + Supabase + shadcn/ui
- Has an existing admin dashboard, CRM, operations, and estimator sections
- AI assistant named **Bach** handles operational queries

### Otto Pay (separate Lovable project)
- Mobile-first invoicing and payment app built for field service contractors
- Built on the same stack (React + TypeScript + Supabase + Stripe)
- Used by technicians in the field to create invoices and collect payments on-site
- Has its own separate Supabase database and Stripe integration
- We are **not modifying Otto Pay at all** — it stays untouched

---

## How the Integration Works

The two apps live on **separate Supabase databases**. We connect them by adding a secondary Supabase client inside Truficient that points directly to Otto Pay's database using a service role key.

```
Otto Pay Database (read/write via service key)
        ↑↓
Truficient — secondary ottopay client
        ↓
Admin Mission Control pages
```

There is **no sync delay, no webhooks, no duplicate data.** Truficient reads and writes directly to Otto Pay's live database. When a tech creates an invoice in the field, it appears in Truficient instantly.

---

## What Will Be Added to Truficient

### New nav section: "Invoicing & Payments"
- **Mission Control** — revenue metrics, recent invoices, payment activity, charge card
- **Invoices** — full filterable list with status, search, export
- **Payments** — complete payment history with transaction IDs
- **Invoice Customers** — Otto Pay customer list with sync status

### New edge function: `create-invoice-payment`
- Processes Stripe payments using our **direct Stripe keys** (not Otto Pay's Stripe Connect platform)
- No platform fees — charges go straight to our Stripe account
- On success, writes payment back to Otto Pay's database and updates invoice status

### Customer sync (bidirectional)
- Truficient CRM customers can be pushed to Otto Pay with a "Push to Otto Pay" button
- Once pushed, techs can find that customer in Otto Pay and create invoices for them
- Those invoices automatically appear back in Truficient Mission Control

### Dashboard widget
- Invoicing snapshot added to the main admin dashboard
- Shows outstanding balance, paid this month, overdue count
- Links to Mission Control

### Bach AI context update
- Bach gains awareness of Otto Pay data
- Can answer questions like "what's my outstanding balance" or "who hasn't paid this week"

---

## New Environment Variables Required

These need to be added to Truficient's Supabase project and Vite env:

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_OTTOPAY_SUPABASE_URL` | Vite env | Otto Pay's Supabase project URL |
| `VITE_OTTOPAY_SERVICE_KEY` | Vite env (temp) / Edge function secret | Otto Pay service role key for DB access |
| `VITE_OTTOPAY_BUSINESS_ID` | Vite env | Our business UUID in Otto Pay's database |
| `STRIPE_SECRET_KEY` | Supabase edge function secret | Our direct Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Supabase edge function secret | Our direct Stripe publishable key |

---

## New Files Being Created

```
src/
├── integrations/
│   └── ottopay/
│       ├── client.ts         # Secondary Supabase client for Otto Pay DB
│       └── types.ts          # TypeScript interfaces for Otto Pay data
├── hooks/
│   └── useOttoPay.ts         # Data hooks: invoices, payments, customers, metrics
├── components/
│   └── invoicing/
│       └── InvoiceDetailSheet.tsx  # Shared invoice detail side drawer
└── pages/
    └── admin/
        └── invoicing/
            ├── InvoicingMissionControl.tsx
            ├── InvoicesList.tsx
            ├── PaymentsList.tsx
            └── InvoiceCustomers.tsx

supabase/
└── functions/
    └── create-invoice-payment/
        └── index.ts          # Direct Stripe payment edge function
```

---

## Files Being Modified

| File | Change |
|------|--------|
| `src/components/admin/adminNavConfig.ts` | Add "Invoicing & Payments" nav section |
| `src/App.tsx` | Add 4 new admin routes |
| `src/pages/admin/Dashboard.tsx` | Add invoicing snapshot widget |
| `src/pages/admin/customers/[detail]` | Add "Push to Otto Pay" button |
| Bach AI system prompt / edge function | Add Otto Pay financial context |

---

## Important Constraints

- **Do not modify anything in the Otto Pay Lovable project** — all changes are in Truficient only
- **Do not use Otto Pay's Stripe Connect platform fee functions** — we use direct Stripe keys
- **Otto Pay's RLS policies are bypassed** by the service role key — this is intentional and safe because we are the owner of both projects
- The secondary Supabase client (`ottopay`) is completely separate from the primary `supabase` client used for Truficient's own data — never mix them

---

## Build Order

Run these prompts sequentially. Do not start the next until the current one completes without errors.

1. Otto Pay connection layer (data hooks, types, client)
2. Direct Stripe edge function
3. Nav section + routes
4. Mission Control page
5. Invoices list page
6. Payments + Invoice Customers pages
7. Dashboard widget + Bach AI context
8. Bidirectional customer sync
