

# CRM Inbox — Two-Way Email Communication Hub

## Summary
Build a full CRM inbox at `/admin/inbox` with outbound email sending via Resend, inbound Gmail reply sync, AI draft generation, and a real-time two-panel conversation UI. Also add an email templates management page at `/admin/email-templates`.

## Prerequisites — Secrets Needed

You mentioned `RESEND_API_KEY` already exists, but I don't see it in the current secrets. We'll need to add:
- **RESEND_API_KEY** — your Resend API key (truficient.com domain must be verified in Resend)
- **GMAIL_CLIENT_ID** — from Google Cloud Console
- **GMAIL_CLIENT_SECRET** — from Google Cloud Console  
- **GMAIL_REFRESH_TOKEN** — OAuth refresh token for bach@truficient.com

I'll prompt you to enter each of these before proceeding with the edge functions that need them.

---

## Database Changes (1 migration)

**New tables:**
- `crm_email_log` — stores every email sent/received per customer (direction, subject, body, template, status, Gmail IDs, timestamps)
- `crm_email_templates` — stores email templates with trigger events, delays, active toggles

**RLS policies:** Admin/manager full access on both tables via `user_roles` check.

**Realtime:** Enable `crm_email_log` for realtime subscriptions.

---

## Edge Functions (3 new)

### 1. `send-crm-email`
- Sends email via Resend API from `bach@truficient.com`
- Logs to `crm_email_log` (outbound) and `crm_interactions` (type: email)
- Returns message_id on success

### 2. `sync-gmail-replies`
- Polls Gmail API for inbound replies to bach@truficient.com
- Matches sender to `crm_customers.email`
- Inserts into `crm_email_log` (inbound) and `crm_interactions`
- Tracks last sync timestamp in a config row

### 3. `generate-email-draft`
- Accepts customer_id + thread context
- Calls Lovable AI (no external API key needed) with Bach's persona prompt
- Returns drafted subject + body

---

## New Pages (2)

### `/admin/inbox` — CRM Inbox
Two-column layout:
- **Left panel (320px):** Conversation list grouped by customer, search bar, filter tabs (All/Unread/Awaiting Reply/Sent), unread gold dot indicator, relative timestamps
- **Right panel:** Customer header with link to CRM profile, chronological email thread (outbound = navy right-aligned bubbles, inbound = gray left-aligned), reply composer with pre-filled To/Subject, "Draft with AI" button, "Send Email" button
- **Realtime:** Subscribe to `crm_email_log` inserts for live updates
- **Mobile:** Stacked panels with back navigation

### `/admin/email-templates` — Template Management
- Table of all templates with Name, Trigger, Delay, Active toggle, Edit button
- Edit dialog for subject, body, trigger event, delay hours
- HTML preview button

---

## Navigation Updates

- Add "Inbox" to CRM section in `adminNavConfig.ts` with Mail icon and dynamic unread count badge
- Add "Email Templates" to Marketing section
- Add both routes to `App.tsx` with ProtectedRoute wrappers

---

## Files Created/Modified

| File | Action |
|------|--------|
| `supabase/migrations/...` | New tables + RLS + realtime |
| `supabase/functions/send-crm-email/index.ts` | New edge function |
| `supabase/functions/sync-gmail-replies/index.ts` | New edge function |
| `supabase/functions/generate-email-draft/index.ts` | New edge function |
| `src/pages/admin/Inbox.tsx` | New inbox page |
| `src/pages/admin/EmailTemplates.tsx` | New templates page |
| `src/components/admin/adminNavConfig.ts` | Add Inbox + Email Templates nav items |
| `src/App.tsx` | Add routes |

---

## Implementation Order

1. Add secrets (RESEND_API_KEY first, then Gmail credentials)
2. Run database migration
3. Build & deploy all 3 edge functions
4. Build Inbox page with full UI
5. Build Email Templates page
6. Update nav config and routes
7. Test end-to-end

