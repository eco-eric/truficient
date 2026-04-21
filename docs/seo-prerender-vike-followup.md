# Vike (Vite SSR) Migration — Follow-up to Head-Only Prerender

This document captures the acceptance criteria for the planned migration from
the current head-only prerender (`scripts/prerender.mjs`) to a full body
server-render pipeline using Vike.

## Why this exists

The head-only prerender ships in this PR as a stopgap. It satisfies every
verification bullet on the canonical-URL/social-share fix (curl returns
correct `<title>`, `og:*`, `twitter:*` tags per route; Facebook and Twitter
validators see the right preview). It does **not** improve LCP or put body
copy in the initial HTML response.

A separate scoped task should migrate the public site to Vike so that the
rendered React tree (H1, hero copy, neighborhood-specific body content, internal
link anchors) is in the HTML the server returns — not just the head.

## Hard constraint

**The admin app cannot regress.** All `/admin/*` routes, the CRM data layer,
the estimate builder, the inbox, and the SEO dashboard must continue to work
identically after migration. This is the gating constraint on every decision
below.

## Acceptance criteria

1. **All routes (public + admin) rendered via Vike with no functional regression.**
   Every route currently in `src/App.tsx` resolves correctly, including
   `:locationSlug`, `/blog/:slug`, `/equipment/*`, and the entire `/admin/*`
   tree under `<ProtectedRoute>`.

2. **Body HTML is in the initial server response.** Verified by:

   ```bash
   curl -s https://truficient.com/ductless-hvac-oak-cliff-dallas/ \
     | grep -i "Mini-Split Installation in Oak Cliff"
   ```

   Should match a known body string from the page, not just the `<title>`.
   Repeat for at least one equipment page and one blog post.

3. **LCP under 2.5s mobile** on at least three sampled location pages.
   Current baseline: 13.7s. Measured via PageSpeed Insights on:
   - `/ductless-hvac-oak-cliff-dallas/`
   - `/ac-repair-pleasant-grove-dallas/`
   - `/mini-split-installation-preston-hollow-dallas/`

4. **All `useQuery` / client-side data calls audited.** Each call must be
   classified as one of:
   - Ported to a Vike `+data.ts` loader and rendered server-side, or
   - Explicitly marked client-only post-hydration (with a comment explaining
     why), or
   - Confirmed non-critical for first paint and left as-is.

5. **Admin app continues to function with zero regressions.** Smoke-test
   checklist before merge:
   - Login → dashboard loads
   - Create a new SEO location page in `/admin/seo`
   - Edit an estimate in `/admin/estimates/:id`
   - Open an inbox thread in `/admin/inbox`
   - Drag a job between Kanban columns in `/admin/jobs`
   - Send a test SMS from a customer detail page

## Known SSR-compatibility risks to audit before starting

These are libraries currently used in the public route tree that may need
guarding with `import.meta.env.SSR` checks or dynamic imports:

- `framer-motion` (used heavily in `src/components/home/*` and location pages)
- `@tiptap/react` (admin only — should stay client-side)
- `recharts` (admin only)
- `@dnd-kit/core` (admin only)
- Direct `window` / `document` access at module top level — grep for it
  before starting.

If any public-route component genuinely cannot render under Node, fall back
to head-only prerender for that specific route as a documented exception
rather than blocking the whole migration.

## Out of scope for the Vike migration

- Copy/wording changes to existing `<title>` or meta description values.
- Changes to the 301 redirect from www → non-www.
- Homepage `<head>` tags (already correct in `index.html` and skipped by the
  prerender script).
