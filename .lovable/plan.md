# Bulk Upload 7 New SEO Pages

Insert 7 new pages into `seo_location_pages` so they auto-publish, sync to `page_seo` via the existing trigger, appear in the sitemap, and get prerendered.

## Pages

| Slug | Cluster | Page Type |
|---|---|---|
| /mini-split-cost-dallas-tx-2026 | Cost & Pricing | Pricing Pillar |
| /ducted-vs-ductless-mini-split-dallas | Comparison | Comparison |
| /gree-vs-mitsubishi-mini-split-dallas | Brand Comparison | Brand Pillar |
| /daikin-vs-mitsubishi-mini-split-dallas | Brand Comparison | Brand Pillar |
| /mini-split-home-office-dallas | Use Case | Use Case |
| /inverter-hvac-vs-single-stage-dallas | Tech Education | Tech Pillar |
| /mini-split-seer2-ratings-dallas | Tech Education | Tech Pillar |

## What I'll write per row

- `neighborhood` (required NOT NULL) — set to the topical name (e.g. "Mini-Split Cost 2026") so the trigger has something to populate page_seo.page_name
- `url_slug`, `meta_title` (≤60), `meta_description` (≤160), `h1_title`
- `cluster`, `page_type`, `city='Dallas'`, `state='TX'`
- `content` — full article body in HTML (matching existing seo_location_pages content shape)
- `schema_json` — FAQPage / Article JSON-LD per page topic
- `published = true` so the sync trigger fires
- `service_tags`, `geography_tag='Dallas'`

## How it flows

1. INSERT into `seo_location_pages` (one INSERT per row, 7 rows).
2. `sync_seo_location_page_to_page_seo` trigger auto-creates matching `page_seo` rows with canonical `https://truficient.com<slug>`, robots `index, follow`, and the schema_json.
3. Next nightly sitemap rebuild picks them up automatically. No code changes needed.

## Out of scope

- No migrations (data-only).
- No route code changes — these slugs are served by the existing dynamic LocationPage / SEO-page handler.
- No edits to `static-routes-seo.mjs` (DB rows win in prerender).

## Confirmation needed before I implement

1. **Content depth** — should I write full long-form HTML (~1,200-1,800 words each with FAQ block) per page, or shorter ~600-word stubs you'll expand later?
2. **Cluster labels** above — OK as-is, or do you want them aligned to an existing cluster taxonomy you already use?
