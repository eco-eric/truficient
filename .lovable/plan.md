

## Plan: Fix Equipment Meta Templates + Update Location Page Counts + Enhance Schemas

### Problem Summary

1. **Equipment meta titles/descriptions are too long** — template produces titles up to 114 chars (limit: 70) and descriptions up to 204 chars (limit: 165), flagging ~82 pages as "Needs Attention"
2. **Location Pages count shows 13 instead of 28** — the dashboard only counts `page_type = 'location'`, missing 15 pages categorized as `Service+City`, `ZIP Code`, `Housing Type`, `Commercial`, `Commercial + Developer`
3. **Schema is only HVACBusiness** — no Service schema or FAQ schema on any page; all 28 location pages have basic `HVACBusiness` JSON-LD only

---

### Step 1 — Shorten Equipment Meta Templates

**Edge function** (`supabase/functions/decode-equipment/index.ts`, line 427-428):

Current:
- Title: `{Brand} {Model} Specifications, Manuals & Documentation | Truficient` (up to 114 chars)
- Description: `Complete specs for {Brand} {Model} including tonnage, refrigerant type, SEER rating, and downloadable manuals. Free resource from Truficient Energy Solutions.` (up to 204 chars)

New:
- Title: `{Brand} {Model} Specs & Docs | Truficient` (≤70 chars)
- Description: `{Brand} {Model} specs — tonnage, SEER, refrigerant & manuals. Free HVAC resource from Truficient.` (≤165 chars)

**Database update**: Bulk-update all 82 existing `page_seo` equipment rows with the shorter template applied to their current brand/model values. Also update the `equipment_pages` table `seo_title` and `seo_description` columns.

### Step 2 — Fix Location Pages Count on Dashboard

In `src/pages/admin/SEOManagement.tsx` (line 206), change:
```
const locationPages = pages.filter(p => p.page_type === 'location');
```
to include all location-related types:
```
const LOCATION_TYPES = ['location', 'Service+City', 'ZIP Code', 'Housing Type', 'Commercial', 'Commercial + Developer'];
const locationPages = pages.filter(p => LOCATION_TYPES.includes(p.page_type || ''));
```

This will correctly show 28 instead of 13.

### Step 3 — Add Service + FAQ Schema to Location Pages

Update `LocationPage.tsx` to inject **multiple JSON-LD schemas** per page:

1. **Keep existing HVACBusiness schema** (already working)
2. **Add Service schema** — generated from the page's `primary_service` field:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Service",
     "serviceType": "{primary_service}",
     "provider": { "@type": "HVACBusiness", "name": "Truficient Energy Solutions" },
     "areaServed": { "@type": "City", "name": "{neighborhood}, {city}, {state}" },
     "url": "https://truficient.com{url_slug}"
   }
   ```
3. **Add FAQPage schema** — parse FAQ sections from the markdown content (look for `## FAQ` or `## Frequently Asked Questions` headings with Q&A pairs) and generate:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } }]
   }
   ```

This will be done dynamically in the `LocationPage.tsx` component so all current and future pages get the schemas automatically — no per-page manual work needed.

### Step 4 — Mark Schema as Applied in SEO Tracker

Bulk-update the `page_seo` table to set `schema_applied = true` for all 28 location page entries.

---

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/decode-equipment/index.ts` | Shorten title/description template |
| `src/pages/admin/SEOManagement.tsx` | Fix location page count filter |
| `src/pages/service-areas/LocationPage.tsx` | Add Service + FAQ JSON-LD injection |
| Database migration (bulk SQL) | Update 82 equipment meta values + mark 28 location schemas |

