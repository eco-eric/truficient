# Truficient Infrastructure Migration — START HERE
**Created:** June 20, 2026 · **Target go-live:** Sunday June 21, 2026 (night) — *gated, not forced*
**Owner:** Eric · **Executors:** Claude Code agents on the always-on desktop
**Goal:** Move truficient.com off Lovable hosting to **Vercel**, serving real HTML at clean URLs with self-canonicals, so the ~400 SEO pages can finally rank — **without breaking the site or the admin/CRM backend.**

---

## The one-paragraph why
Today every public page is delivered as an empty JavaScript shell, and clean URLs (the ones every internal link uses) serve the homepage to Google. Result: 982 pages not indexed, 206 duplicated URLs, and your exact target searches stuck at position 25–60 with near-zero clicks despite 25,000 impressions. This migration fixes the delivery layer. It does **not** change your domain, your URLs, your content, or your backend logic — so it is an upgrade Google rewards, not a "starting over." Full diagnosis: `../Truficient Website Revamp/Internal Linking Audit — 2026-06-20.md`.

---

## Read these in order
1. **`01_Migration_Brief.md`** — what we're building and the rules it must obey (the "what" and "why").
2. **`02_ClaudeCode_Agent_Runbook.md`** — the step-by-step the agent executes (the "how"), with go/no-go gates.
3. **`03_URL_Redirect_Map.md`** — the URL-preservation guarantee + redirect rules (the safety backbone).
4. **`04_Accounts_and_Access.md`** — every account/login involved and exactly who does what.
5. **`05_Desktop_ClaudeCode_Setup.md`** — set up the always-on desktop to run agents safely.
6. **`06_Rollback_Plan.md`** — how to undo any step in minutes.
7. **`07_Weekend_Schedule.md`** — the plan with decision gates.
8. **`08_Database_and_AI_Migration.md`** — your Supabase DB + 50 edge functions + AI providers. **DEFERRED (June 20):** the Supabase project is Lovable-managed and Eric is keeping Lovable, so the backend stays put and keeps working. This doc is reference-only unless/until you decide to leave Lovable. **The agent must not touch the database or AI during the weekend migration.**
9. **`09_Post_Migration_Editing_Workflow.md`** — how to make changes *after* go-live: GitHub as single source of truth, frontend via agents → Vercel, backend via agents → Lovable. **Key guardrail: stop editing the frontend inside Lovable** (two-way sync = conflicts).
10. **`10_Claude_Code_Launch_Prompts.md`** — copy-paste prompts to run the whole migration with Claude Code, phase by phase, plus getting-started steps. **Start here when you sit down to execute.**

---

## Decisions locked (June 20)
- **Host:** Vercel (directory-index, redirects, preview deploys, one-click rollback).
- **DNS:** Cloudflare (final cutover is a record change you make there).
- **Admin/CRM:** stays a client-rendered app behind login — only public marketing pages get the prerender treatment. Smallest possible blast radius on your backend.
- **Canonical URL form:** clean **trailing-slash** (e.g. `/hvac-garland-tx/`). Chosen because it keeps your highest-impression pages exactly where they are and matches what internal links already use.

---

## Division of labor (important)
**Claude Code agents do:** all code, config, builds, the prerender/SSG, the redirect files, staging deploys, and every verification check.

**Eric does (and only Eric):** anything involving a password, a credential, or an irreversible account action — connecting Vercel to GitHub, adding the domain, and the final DNS change at Cloudflare. The agent hands you the exact values to paste and stands by. **Never paste passwords, API secrets, or Supabase service-role keys into the agent chat.** (Details in `04_Accounts_and_Access.md`.)

---

## The safety model in three sentences
1. **Production stays live and untouched** until a staging copy passes every check — we build alongside, we don't edit the live site.
2. **Every URL that earns impressions today either keeps its address or 301-redirects to its surviving version** — no equity is dropped (`03_URL_Redirect_Map.md`).
3. **The cutover is one DNS change you can reverse**, and any bad deploy is a one-click rollback on Vercel.

---

## Go-live is gated, not forced
Sunday night is the **target**, not a deadline to override safety. The plan has explicit GO/NO-GO gates. If staging hasn't passed every check by the Sunday gate, the correct move is to **hold** — production keeps running exactly as today, you lose nothing, and we finish Monday. A rushed cutover is the only thing that could actually hurt you, so "hold" is designed to be painless.
