

## Plan: Add 7 New Location Pages with Full Schema

### Pages to Add

| # | Neighborhood | Slug | Page Type | Cluster | ZIP |
|---|---|---|---|---|---|
| 1 | 75206 (Lower Greenville/M Streets) | `/hvac-75206/` | ZIP Code | East Dallas | 75206 |
| 2 | Casa View / East Dallas | `/hvac-casa-view-east-dallas/` | Residential Service + Neighborhood | East Dallas | 75218 |
| 3 | West Dallas / Trinity Groves | `/mini-split-installation-west-dallas/` | Residential Service + Neighborhood | Downtown Dallas | 75212 |
| 4 | Bluffview / Greenway Parks | `/ductless-hvac-bluffview-dallas/` | Residential Service + Neighborhood | North Dallas | 75209 |
| 5 | Preston Hollow | `/hvac-preston-hollow-dallas/` | Residential Service + Neighborhood | North Dallas | 75225 |
| 6 | Highland Park (mini-split focus) | `/mini-split-installation-highland-park-dallas/` | Residential Service + Neighborhood | North Dallas | 75205 |
| 7 | Highland Park & University Park (hub) | `/hvac-highland-park-university-park-dallas/` | Neighborhood Hub | North Dallas | 75205 |

### Step 1 — Insert into `seo_location_pages`

Insert 7 records with:
- Full markdown content (stripped of YAML frontmatter and developer implementation notes)
- JSON-LD schema from each file's embedded JSON block
- Meta title and meta description from frontmatter
- `published = true`, `schema_enabled = true`
- Correct city (Dallas), state (TX), cluster, zip_code, primary_service, neighborhood values

The dynamic schema injection in `LocationPage.tsx` (already implemented) will automatically generate HVACBusiness + Service + FAQPage JSON-LD for each page.

### Step 2 — Register in `page_seo`

Insert 7 rows into `page_seo` with:
- `page_path` matching each URL slug
- `page_type` from frontmatter (e.g., "ZIP Code", "Residential Service + Neighborhood", "Neighborhood Hub")
- `meta_title` and `meta_description` from frontmatter
- `schema_applied = true`
- `index_status = 'Not Indexed'` (new pages)

### Step 3 — Update Dashboard Filter

Add the two new page types to `LOCATION_TYPES` in `src/pages/admin/SEOManagement.tsx`:
- `Residential Service + Neighborhood`
- `Neighborhood Hub`

Updated line:
```typescript
const LOCATION_TYPES = ['location', 'Service+City', 'ZIP Code', 'Housing Type', 'Commercial', 'Commercial + Developer', 'Brand Pillar', 'Residential Service + Neighborhood', 'Neighborhood Hub'];
```

### Files Changed

| File | Change |
|---|---|
| `src/pages/admin/SEOManagement.tsx` | Add 2 new page types to LOCATION_TYPES |
| Database (insert) | 7 rows in `seo_location_pages`, 7 rows in `page_seo` |

### Schema Coverage

Each page gets triple-layer schema automatically via the existing `LocationPage.tsx` logic:
1. **HVACBusiness** — from the embedded JSON-LD in each markdown file (stored in `schema_json`)
2. **Service** — dynamically generated from `primary_service` field
3. **FAQPage** — dynamically parsed from any `## FAQ` sections in the markdown content

No code changes needed for schema injection — it is already handled.

