# Bulk SEO Location Pages + Enhanced SEO Dashboard

## Part 1: Enhance SEO Center Dashboard
- **DB Migration**: Add 10 new columns to `page_seo` table: `page_type`, `target_keyword`, `cluster`, `index_status`, `gsc_impressions`, `gsc_clicks`, `avg_position`, `internal_links`, `schema_applied`, `last_content_update`
- **UI**: Add filter bar (Page Type, Cluster, Index Status, Schema Applied)
- **UI**: Add sort options (Status, Avg Position, GSC Clicks, Last Content Update)
- **UI**: Expand search to cover Page Name, URL Slug, AND Target Keyword
- **UI**: Update summary cards: Total Location Pages, Indexed vs Not Yet Indexed, Missing Schema, Average Position
- **UI**: Update table to show new columns with proper badges/formatting

## Part 2: Location Page Builder
- **DB Migration**: Create `seo_location_pages` table with all content fields (neighborhood, city, state, zip, cluster, page_type, url_slug, h1_title, meta fields, local content variables, schema settings, template, internal linking options)
- **UI**: Build single page creator form with all fields from the spec
- **UI**: Auto-generate URL slug from service + neighborhood + city
- **UI**: Character counters for meta title (60) and meta description (160)
- **UI**: CSV bulk import with preview table, validation, error highlighting
- **UI**: Downloadable CSV template with headers + example row
- **Logic**: On save → create page_seo entry + location page record + update sitemap
- **UI**: Update "Add Page" button to offer choice: Core Page vs Location Page

## Part 3: Service Areas Hub Page System
- **Frontend**: Create `/service-areas/` hub page listing all clusters with their location pages
- **Frontend**: Create `/service-areas/:cluster-slug/` sub-hub pages
- **Frontend**: Auto-update when new location pages are created
- **Footer**: Add `/service-areas/` link to site footer
- **SEO**: Register hub pages in page_seo tracker

## Part 4: Sitemap Manager Tab
- **UI**: Add "Sitemap" tab in SEO center
- **UI**: Table showing all sitemap entries (URL, Priority, Change Freq, Last Modified)
- **UI**: Export XML button, Copy URL button
- **Logic**: Auto-add new pages to sitemap on creation
- **Logic**: Orphan detection (pages not in sitemap)
- **Edge Function**: Update generate-sitemap function to include location pages

## Part 5: Schema Markup Auto-Generator
- **Logic**: Auto-generate HVACBusiness JSON-LD from location page fields
- **Frontend**: Inject JSON-LD into `<head>` on location page render
- **Fields mapped**: neighborhood → addressLocality, zip → postalCode, primary_service → Service name, schema_description → description
