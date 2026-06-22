# 05 — Always-On Desktop: Claude Code Setup
Goal: a stable place for agents to do the code work, with you approving the risky steps.

## One-time install
1. **Node.js LTS** (v20+) and **git** installed. Verify: `node -v`, `git -v`.
2. **Claude Code**: `npm install -g @anthropic-ai/claude-code` then run `claude` once and sign in.
3. **Authenticate git/GitHub** so the agent can push the branch:
   - Install GitHub CLI (`gh`) and run `gh auth login`, **or** configure an SSH key / credential helper for `eco-eric/truficient`.
   - Test: `git clone https://github.com/eco-eric/truficient.git` works without prompting.
4. (Optional but handy) **Vercel CLI**: `npm i -g vercel` — lets the agent run local prod-style builds; the dashboard is still where you connect the repo and domain.

## Project layout on the desktop
1. Clone the repo somewhere stable, e.g. `C:\dev\truficient`.
2. Keep this migration folder reachable so the agent can read the briefs. Two options:
   - Point Claude Code at this folder, **or**
   - Copy `00`–`07` into the repo as `migration-docs/` on the working branch.
3. Start Claude Code **inside the repo**: `cd C:\dev\truficient && claude`.

## Kick off the agent
Paste a launch prompt like:
> Read `migration-docs/01_Migration_Brief.md`, `02_ClaudeCode_Agent_Runbook.md`, and `03_URL_Redirect_Map.md`. Execute **Phase 0 only**, then stop and report against Gate 0. Do not touch `main`. Do not perform any step marked 🧑 — list those for me to do.

Drive it **one phase at a time**, approving each gate before the next. This keeps you in control and matches the runbook.

## Permissions / safety settings
- Run Claude Code in its default **review/approve** mode for this work — approve file writes and shell commands rather than full auto-run, at least through Gate 3. The migration is high-stakes; the few extra clicks are worth it.
- Pre-approving safe, repetitive commands (`npm`, `git status/add/commit`, `vite build`, `curl`) is fine. **Do not** pre-approve: `git push` to `main`, force-push, `rm -rf`, Vercel/Cloudflare destructive actions, or anything that prints/handles secrets.
- The agent should **stop at every 🧑 step** and hand it to you.

## Keeping it running while you're away
- Disable sleep/hibernate on the desktop (Windows: Settings → System → Power → Screen & sleep → "Never" while plugged in). Screen can turn off; the machine must stay awake.
- Long builds/prerenders are fine unattended **up to a gate**. Configure the agent to **pause at each ✅ gate** so it never cuts over or pushes to prod without you.
- Never let the agent perform Phase 4 (cutover) unattended — that's a 🧑 step by design.

## If you use a Cowork/Claude Code agent remotely
You can monitor and approve from your phone/laptop, but the **credentialed steps (Vercel connect, Cloudflare DNS, GSC) are still yours to click**. The agent prepares everything and waits.
