# CLAUDE.md — Truficient.com

Guidance for AI agents (Claude Code / Codex) working in this repo. **Read this before making changes.** These rules exist because the site recovered from an indexing crisis; the SEO machinery is load-bearing and easy to break invisibly.

## Project context
- Vite + React SPA with a build-time prerender (`scripts/prerender.mjs`, `seoPrerenderPlugin` in `vite.config.ts`) producing server-rendered HTML. Hosted on **Vercel (SSG)** — migrated off Lovable Hosting (which couldn't do extensionless routing and silently broke prerender deploys).
- Content (location/service/equipment/blog pages, per-page SEO fields) is data-driven from **Supabase** (`page_seo` and related tables); many pages render through `src/pages/admin/LocationPageBuilder.tsx`-style templates, not hand-written files.
- Lovable's GitHub sync is still connected and used for **CRM/backend** work. That's fine. SEO/frontend work goes through this repo via Claude Code on a branch — **never through Lovable's chat editor** (it can make collateral edits to shared SEO files).

## SEO standing rules — DO NOT VIOLATE
1. **Canonical URL form is extensionless trailing-slash** (e.g. `/hvac-lakewood-dallas/`). Never reintroduce `.html` URLs in links, canonicals, sitemap, or prerender output. Every page is **self-canonical**.
2. **Do not change the prerender output shape** (`dist/foo/index.html` directory form) or the sitemap location (`/sitemap.xml`). If you touch prerender/sitemap logic, a human reviews the diff.
3. **Internal links use a single consistent form** (root-relative or absolute, trailing-slash, no `.html`). Descriptive anchor text only — never "click here / learn more".
4. **Money pages are `index, follow` and self-canonical.** `/project/*` pages that render "Page Not Found" must be `noindex` or removed (they are soft-404s).
5. **External links from content** (e.g. `workedge.pro`, manufacturer sites on equipment pages) must be `rel="nofollow sponsored"` if vendor/partner — don't leak internal PageRank sitewide.
6. **Phone number is `214-238-4349` everywhere** (display, `tel:`, schema, OG). Never reintroduce `(214) 974-5338` or `972-598-9154`.
7. **No Oncor rebate references** in any copy, schema, or OG fields.
8. **Verify before promoting:** SEO changes ship on a branch → Vercel preview deploy → re-crawl the preview (orphan count, canonicals, sitemap parity) → only then merge to `main`. The internal-linking crawl/graph tooling is documented in the project's analysis docs.

## Backend / DB standing rules (unchanged from migration plan)
- All schema changes via **Supabase CLI migrations** (`npx supabase migration new …`). Never edit the database through the Supabase dashboard or Lovable.
- Every table: UUID PK `default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz` with update trigger, snake_case names.
- Every write to a core entity (lead, estimate, job, customer) emits an event into the append-only events table.
- No hardcoded Truficient-specific values (company name, service area, branding) — read from a settings/config table.

## Workflow
- Branch off `main`; open a PR; keep `main` clean so it doesn't collide with Lovable's CRM sync.
- Frontend/SEO → Claude Code (this repo). Backend/DB → Supabase CLI migrations. They never touch the same files.

## Deploy discipline (Vercel build budget)
- NEVER push per-commit on feature/SEO branches. Work locally, commit as
  often as needed, but push ONLY when a changeset is complete and verified
  (local prod build passes, routes/canonicals spot-checked).
- Target: one push per verified changeset, max 2-3 pushes per work session.
  Every push triggers a full Vercel preview build including the complete
  prerender of all published routes.
- Exception: pushing to trigger the preview re-crawl gate before merge is
  required workflow — but that should be the SAME single push as the
  verified changeset, not an extra one.
