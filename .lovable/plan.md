

## Plan: Daily Sitemap Regeneration + Manual Trigger Button

### What We're Building

1. **New Edge Function: `regenerate-sitemap`** — Calls the existing `generate-sitemap` function, takes the XML output, and writes it to the `public/sitemap.xml` content stored in a new `site_config` database table (key-value store). A lightweight approach since we can't write to the filesystem at runtime.

   Actually, the better approach: create a `regenerate-sitemap` edge function that generates the XML (reusing the same logic from `generate-sitemap`) and upserts it into a `site_assets` table. Then serve it from the app's route or keep the static file approach.

   **Simplest approach**: The `regenerate-sitemap` function will call the existing `generate-sitemap` function internally, get the XML, and store it. But since we already have a static `public/sitemap.xml`, the cleanest solution is:

   - Create a `regenerate-sitemap` edge function that fetches from the `generate-sitemap` function and stores the result in a `sitemap_cache` table
   - Update `robots.txt` to point back to the edge function URL... but that was the problem (Google rejects non-domain URLs)

   **Best approach**: Keep `public/sitemap.xml` as the static file. The `regenerate-sitemap` edge function will generate fresh XML and we'll store it. But we can't write to `public/` at runtime.

   **Practical solution**: Since the static sitemap needs to match the domain, and we can't write files at runtime, we should:
   1. Keep the dynamic `generate-sitemap` edge function as the source of truth
   2. Add a **client-side "Regenerate Sitemap" button** on the SEO admin page that calls the edge function and downloads/displays the XML
   3. Set up a **daily cron job** via `pg_cron` that calls the edge function (for logging/monitoring purposes)
   4. The static `public/sitemap.xml` gets regenerated each deploy automatically

   Wait — actually the simplest and most effective approach: since every Lovable deploy regenerates the static files, and the user deploys regularly, the static sitemap stays current with deploys. For the gaps between deploys, we can serve the sitemap dynamically via a catch-all route.

   **Final approach**:
   - Add a React route at `/sitemap.xml` that redirects or serves from the edge function (won't work — React SPA)
   - Best: Add a "Regenerate Sitemap" button that calls `generate-sitemap`, shows the result, and reminds user to redeploy for the static file to update.

   Actually the most practical solution:

### Revised Approach

1. **Edge function `regenerate-sitemap`**: Generates XML and stores it in a `sitemap_snapshots` table with a timestamp.

2. **Daily `pg_cron` job**: Calls `regenerate-sitemap` once per day at 3 AM CST.

3. **Admin UI button**: "Regenerate Sitemap" button on the SEO page that manually triggers the function and shows success/URL count.

4. **Static file stays as fallback**: The `public/sitemap.xml` remains as the file Google crawls. Each time the user publishes/deploys, it gets the latest version. Between deploys, the daily cron keeps a snapshot in the DB for reference.

Since the static `public/sitemap.xml` can only update on deploy, the real value here is:
- The button lets admins preview/verify the sitemap content
- The cron job ensures a fresh snapshot is always available
- On each deploy the static file should be auto-generated from the DB

### Implementation Steps

**Step 1 — Database table for sitemap snapshots**
Create a `sitemap_snapshots` table with columns: `id`, `xml_content` (text), `url_count` (int), `created_at`. This stores the latest generated sitemap for reference and monitoring.

**Step 2 — Create `regenerate-sitemap` edge function**
- Reuses the generation logic from `generate-sitemap`
- Stores the result in `sitemap_snapshots`
- Returns a JSON summary (URL count, timestamp)

**Step 3 — Set up daily `pg_cron` schedule**
- Enable `pg_cron` and `pg_net` extensions
- Schedule a daily call at 3:00 AM CST (8:00 UTC) to invoke `regenerate-sitemap`

**Step 4 — Add "Regenerate Sitemap" button to SEO admin page**
- Place next to the existing "Add Page" button
- Calls the `regenerate-sitemap` function on click
- Shows a toast with the URL count and last regeneration time
- Add a small "Last generated" timestamp indicator

### Technical Details

- The `sitemap_snapshots` table uses RLS with admin-only read access
- The cron job runs as: `SELECT net.http_post(url, headers, body)` targeting the edge function
- The admin button uses `supabase.functions.invoke('regenerate-sitemap')`
- The edge function config: `verify_jwt = false` (needed for cron)

