

## Plan: Upload 5 Location Pages + Update SEO Tracker

The previous attempt was cancelled mid-read. All 5 files need to be fully processed.

### Files to Upload

1. `ac-repair-oak-cliff-dallas.md`
2. `ductless-hvac-bishop-arts-dallas.md`
3. `heat-pump-replacement-cockrell-hill-dallas.md`
4. `hvac-75208.md`
5. `hvac-75211.md`

### Steps

**Step 1 — Parse all 5 markdown files**
Read each file, extract frontmatter (title, description, keywords, slug, cluster, neighborhood, primary service), and strip implementation notes.

**Step 2 — Insert into `seo_location_pages`**
Insert 5 new rows with full markdown content, meta fields, cluster assignment, and `published = true`. Slugs will follow the existing pattern (e.g., `/ac-repair-oak-cliff-dallas`).

**Step 3 — Register in `page_seo` tracker**
Add 5 corresponding entries to the SEO tracker table so they appear on the admin SEO dashboard with "Pending" index status.

**Step 4 — Regenerate sitemap**
Trigger the `regenerate-sitemap` edge function to include the new pages in the sitemap snapshot.

**Step 5 — Verify routing**
Confirm the existing `/:locationSlug` catch-all route in `App.tsx` will correctly resolve the new slugs via `LocationPage.tsx`. No code changes expected.

### No Code Changes Required
The dynamic routing system already handles new `seo_location_pages` entries automatically.

