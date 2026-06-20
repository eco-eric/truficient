# 09 — Post-Migration Editing Workflow (how to make changes after go-live)
How you (and your AI agents) change the site once it's on Vercel. Applies **after** the host migration is live.

## The one rule: GitHub is the single source of truth
`eco-eric/truficient` on GitHub is the master copy. Vercel deploys the frontend from it. Lovable is **two-way synced** with this repo ("changes made via Lovable commit automatically… pushed changes are reflected in Lovable"), so:
- Make changes in **one place only** — your AI agents (Claude Code or Codex) committing to GitHub.
- **Do NOT edit the frontend inside Lovable anymore.** Editing the same files in both Lovable and your agent creates competing commits and merge conflicts.
- Lovable stays as a **mirror** of the repo and as the **backend deploy tool** (see below) — not as a frontend editor.

Claude Code and Codex are interchangeable here — both just edit this repo. Use whichever you prefer; the difference that matters is the **deploy path**, not the tool.

---

## Frontend changes (pages, components, styling, SEO/meta, internal links)
1. Agent edits files in the repo on a branch.
2. Commit → push to GitHub.
3. **Vercel auto-builds and deploys.** Preview deploy for branches; production deploy when merged to `main`.
4. Verify on the Vercel preview URL before merging to `main`.

**Checklist for any frontend change:**
- [ ] Branch off `main`, edit, push (don't commit straight to `main` for anything non-trivial).
- [ ] Check the Vercel **preview** URL renders correctly.
- [ ] If it's a content/SEO page, confirm it still prerenders (real body HTML + self-canonical) — the build runs the prerender step.
- [ ] Merge to `main` → confirm production.
- [ ] Don't open Lovable to edit the same thing.

---

## Backend changes (Supabase schema + the 50 edge functions)
Your database is **Lovable-managed**, so Lovable is currently the deploy mechanism for the backend.

**Near-term (recommended, zero setup):**
1. Agent edits the backend code in the repo — edge functions (`supabase/functions/*`) or a **new** migration file (`supabase/migrations/*.sql`; never edit an already-applied migration).
2. Push to GitHub.
3. **Apply via Lovable** — it owns the managed Supabase project and deploys the functions / runs the migration. Use Lovable as the "deploy backend" button only, not as a code editor.
4. Verify the affected feature (e.g. an admin action, a form, an AI function).

**Checklist for any backend change:**
- [ ] New migration = new timestamped file; never edit applied migrations.
- [ ] Edge-function edits preserve `verify_jwt` settings in `supabase/config.toml`.
- [ ] Push to GitHub first (keeps the source of truth correct), then deploy via Lovable.
- [ ] Test the specific function/endpoint after deploy.
- [ ] Never paste secrets/keys into the agent chat; secrets live in Supabase function settings.

**Optional later (full agent autonomy, no Lovable step):**
Set up a Supabase CLI / GitHub Action to deploy the backend on push (`supabase functions deploy`, `supabase db push`). Requires a **Supabase access token + DB credentials** for the managed project — confirm with Lovable that direct CLI access is available before relying on it. Not needed while you're keeping Lovable.

---

## Avoiding conflicts (because of the two-way sync)
- Work in **one tool per session**. If you used Lovable for a backend deploy, let it finish/commit before your agent pushes more frontend changes (and `git pull` first).
- Always `git pull` before starting an agent session, so you're on top of anything Lovable committed.
- If a conflict ever appears, the GitHub version is authoritative — resolve there, then let Lovable re-sync.

---

## Quick reference
| Change type | Edit with | Deploys via |
|---|---|---|
| Frontend (pages, components, meta, links) | Claude Code / Codex → GitHub | Vercel (auto on push) |
| Backend code (edge functions, migrations) | Claude Code / Codex → GitHub | Lovable (applies to managed Supabase) |
| Backend, fully autonomous (optional later) | Claude Code / Codex → GitHub | Supabase CLI / GitHub Action |
| **Frontend in Lovable** | ❌ don't | — (would conflict) |
