# 08 — Database & AI Migration (Supabase + edge functions + AI providers)

> ## STATUS (June 20, 2026): DEFERRED — not part of this migration
> Confirmed: the Supabase project is **Lovable Cloud–managed (Case 2)**. **Eric is keeping Lovable** (paid annually, hosts other projects), so the managed Supabase DB, the 50 edge functions, and the Lovable AI gateway all **keep running unchanged**. The weekend host migration (docs 01–07) does **not** require anything in this document.
>
> **Agent: do NOT export the database, change AI providers, or take over edge-function deploys.** Leave the backend exactly as-is. Just ensure Vercel has the same `VITE_SUPABASE_URL` + anon key and verify the admin/backend works from staging.
>
> Keep this doc as the playbook for **if/when Eric ever decides to leave Lovable**. Until then, it's reference only.

## TL;DR
- **The database does not move when you change web hosting.** It's a standalone Supabase project (`xvsgdzwadxbwpevdezbp`), not something "inside" Lovable. Vercel just reuses the same Supabase URL + anon key. The host migration (docs 01–07) can ship **without touching the DB**.
- **Two separate things make you fully independent of Lovable:** (1) owning + deploying the **Supabase project & edge functions** yourself, and (2) moving the **14 AI functions off the Lovable AI gateway** to direct provider APIs.
- **Do NOT cancel Lovable until both are done and verified.** Cancelling Lovable can invalidate `LOVABLE_API_KEY` (breaking 14 AI functions) and, if this is a Lovable-Cloud-managed Supabase project, can put the database itself at risk.

---

## Part A — Supabase ownership (the one thing to verify first)
Your schema is fully in the repo: **207 migrations** in `supabase/migrations/` and **50 edge functions** in `supabase/functions/`. The project ref is `xvsgdzwadxbwpevdezbp`.

**Check which situation you're in** — log in at **supabase.com** (directly, not through Lovable):
- **Case 1 — It's your own Supabase project** (you can see `xvsgdzwadxbwpevdezbp` in your org and you're Owner). → *Nothing to move.* You already own the DB. You only need to take over edge-function **deploys** (Part B) and AI (Part C). Lowest effort.
- **Case 2 — It's Lovable Cloud–managed** (you can't see it directly, or it's under a Lovable-owned org). → You'll **migrate the project into your own Supabase org** before fully leaving Lovable:
  1. Create a new Supabase project in your own account.
  2. Apply the repo migrations: `supabase db push` (or restore a `pg_dump` from the current project for data).
  3. Copy **data** via `pg_dump`/`pg_restore` (or Supabase's built-in migrate/export).
  4. Re-create **Storage buckets** + objects (gallery images, etc.).
  5. Re-deploy all 50 edge functions (Part B) and set all secrets (Part D).
  6. Re-point `VITE_SUPABASE_URL` / anon key (and Vercel env) to the new project.
  7. Verify admin + site against the new project on staging before cutover.

> **Action for Eric:** confirm Case 1 vs Case 2 in the Supabase dashboard. This determines whether the DB workstream is "take over deploys" (hours) or "export + restore project" (a more careful, separate task). **Tell the agent which case applies.**

---

## Part B — Take over edge-function deployment
Lovable currently auto-deploys your edge functions. After you leave Lovable you deploy them yourself (they keep running in Supabase until you redeploy, so there's no outage). Set this up:

1. Install Supabase CLI on the desktop; `supabase login`; `supabase link --project-ref <your-project-ref>`.
2. Deploy: `supabase functions deploy <name>` (or all). Respect `config.toml` (several functions set `verify_jwt = false` — preserve that).
3. **Recommended:** add a GitHub Action to deploy changed functions on push, so you have a real CI pipeline instead of Lovable's magic.
4. Verify a few live functions after deploy (e.g. `dashboard-summary`, `global-search`, `send-contact-notification`).

---

## Part C — Move AI off the Lovable gateway to direct API
**14 functions use `LOVABLE_API_KEY`** (the Lovable AI gateway):
`otto-ai`, `ai-assistant`, `generate-email-draft`, `seo-bach-analyst`, `seo-report-followup`, `seo-report-save`, `social-generate`, `social-suggest-ideas`, `social-weekly-ideas`, `kb-translate`, `gallery-ai-describe`, `decode-equipment`, `classify-workedge-media`, `backfill-equipment-descriptions` (+ `generate-sitemap`, `sync-gsc-index-status`, `harold-api` reference it).

**Models in use:** `gemini-2.5-flash` (most), `gemini-2.5-pro`, `gpt-5`/`gpt-5-mini`, `gemini-3-flash-preview`, `gemini-2.5-flash-lite`. Some functions already call **OpenAI** (`social-suggest-ideas`, `ai-assistant`, `seo-bach-analyst`, `harold-api`), **Anthropic** (`ai-assistant`), and **xAI** (`XAI_API_KEY`).

**Recommended conversion (lowest churn):** the Lovable gateway is OpenAI-compatible, so for each function swap the endpoint + key, keeping the request shape and model names:
- **Gemini models → Google Gemini API.** Easiest drop-in: Google's **OpenAI-compatible endpoint** (`https://generativelanguage.googleapis.com/v1beta/openai/`) with a new `GEMINI_API_KEY` — keep `gemini-2.5-flash`/`-pro` model strings, keep the OpenAI-style code. (Or migrate to OpenAI/Anthropic models if you'd rather consolidate vendors.)
- **`gpt-5` / OpenAI calls → OpenAI API** with `OPENAI_API_KEY` (you may already have this set).
- Decide whether to consolidate everything to **one provider** (simpler billing/keys) or keep Gemini-for-cheap + OpenAI-for-heavy. Eric is fine going full direct API; recommend: **Gemini for the high-volume cheap calls, OpenAI for the assistant/heavy reasoning** — minimal output change from today.

**Per-function steps (agent):** for each of the 14, replace the gateway base URL + `Authorization` header with the chosen provider's, set the model, adjust response parsing if needed, redeploy, and test with a real call. Do these **on the branch + against staging/your own keys**, one function at a time, verifying output parity.

**New AI secrets to add (Supabase function secrets):** `GEMINI_API_KEY` (and/or keep `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`). Remove `LOVABLE_API_KEY` only after all 14 are converted and verified.

---

## Part D — Full secrets inventory (must exist in the target Supabase project)
These are read by the edge functions via `Deno.env.get`. They live as **Supabase Edge Function secrets** (not in Vercel, not in the client). If you stay on the same Supabase project (Case 1), they're already there — just confirm. If you migrate projects (Case 2), **all must be re-added.**

**Core (managed by Supabase automatically):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.
> Note: it's correct and safe that **37 server-side edge functions use the service-role key** — that's their job. The rule from doc 04 ("never service-role client-side / never paste to agent") still holds; this is Supabase-side config you set in the dashboard.

**AI:** `LOVABLE_API_KEY` (retire after Part C) → `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `XAI_API_KEY`.
**CRM (GoHighLevel):** `GHL_LOCATION_ID`, `GHL_API_Key_Contact`, `GHL_CONVERSATIONS_API_KEY`.
**Payments:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `OTTOPAY_*` (`OTTOPAY_SUPABASE_URL`, `OTTOPAY_SERVICE_KEY`, `OTTOPAY_SYNC_KEY`, `OTTOPAY_BUSINESS_ID`), `VITE_OTTOPAY_*`.
**Messaging/email:** `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
**Google:** `GSC_PRIVATE_KEY`, `GSC_CLIENT_EMAIL`, `GSC_SITE_URL`, `GA4_PROPERTY_ID`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GBP_*` (Business Profile: `GBP_CLIENT_ID/SECRET/REFRESH_TOKEN/ACCOUNT_ID/LOCATION_ID`).
**Social:** `FACEBOOK_PAGE_TOKEN`, `FB_PAGE_ID`, `IG_USER_ID`, `TIKTOK_ACCESS_TOKEN`.
**Other:** `WORKEDGE_API_KEY`, `RENTCAST_API_KEY`, `FIRECRAWL_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `HAROLD_API_TOKEN`, `HAROLD_MCP_SECRET`.

**Agent task:** generate the authoritative list by running, in the repo:
```
grep -rhoE "Deno\.env\.get\(['\"][^'\"]+['\"]\)" supabase/functions | sed -E "s/.*\(['\"]//;s/['\"]\).*//" | sort -u
```
Then have Eric confirm each exists in the target project (Supabase → Edge Functions → Secrets). Never print the values.

---

## How this fits the weekend (decoupling)
- **Weekend (host migration, docs 01–07):** ships independently. DB + functions + AI keep running on Supabase/Lovable-gateway exactly as today. **This is safe to do first.**
- **Independence from Lovable (this doc):** do as a **fast-follow**, in order — (1) confirm Supabase ownership (Part A), (2) take over function deploys (Part B), (3) convert AI (Part C), (4) verify all secrets (Part D) — **then** stop using/cancel Lovable.
- **Hard rule:** keep the Lovable account active until Parts A–D are verified, so nothing it provides (AI gateway, and possibly the managed Supabase project) disappears mid-transition.
