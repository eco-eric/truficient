# Blog Category Pages — PoC for `/category/hvac-maintenance`

Rebuilding the old WordPress `/category/{slug}` URLs as real React pages so they stop 404'ing and reactivate their existing crawl/link equity. This first pass ships **one** category end-to-end + the reusable template. Remaining 6 categories ship as a v2 batch after verification.

---

## Step 1 — Database migration: `blog_categories` table

Create `public.blog_categories` with:
- Identity: `slug` (unique), `name`, `status` (published/draft)
- Hero: `hero_eyebrow`, `hero_heading`, `hero_subheading`, `hero_image`
- Body: `intro_html`, `what_we_cover` (jsonb array of `{title, body}`), `faqs` (jsonb array of `{question, answer}`)
- CTA: `cta_heading`, `cta_body`, `cta_button_label`, `cta_button_href`
- Related selectors: `related_post_categories` (text[]), `related_service_links` (jsonb array of `{label, href}`)
- Meta: `display_order`, timestamps

Plus:
- `updated_at` trigger
- RLS enabled — public SELECT for `status='published'`, authenticated full CRUD (mirrors existing `blog_posts` pattern)
- Indexes on `slug` and `status`

Types regenerate automatically post-migration.

## Step 2 — New file: `src/pages/BlogCategory.tsx`

Mirrors conventions from `Blog.tsx` / `BlogPost.tsx`:
- Wrapped in `<Header />` / `<Footer />`
- Uses `usePageSEO()` for meta + global HVACBusiness JSON-LD
- Fetches the category by slug from `blog_categories`
- Fetches related blog posts via `.overlaps('category', related_post_categories)` (handles the multi-category text[] migration)
- Sections: Hero → Intro (HTML) → "What we cover" cards → Articles grid → FAQ (with `data-faq-question` / `data-faq-answer` attrs to satisfy the prerender FAQ-hash check) → Related services → Branded CTA with phone `214-238-4349`
- Loading + 404-style "Category not found" states

## Step 3 — Route wiring in `src/App.tsx`

- Add lazy import next to `Blog` / `BlogPost` (line ~49):
  ```ts
  const BlogCategory = lazy(() => import("./pages/BlogCategory"));
  ```
- Add route **before** the `/:locationSlug` catch-all (line 223), placed at line 208:
  ```tsx
  { path: "/category/:slug", element: <BlogCategory /> },
  ```

## Step 4 — Seed `hvac-maintenance` content

Two upserts (idempotent via `ON CONFLICT`):

1. **`blog_categories`** row for `hvac-maintenance` — full hero copy, 6 "what we cover" cards (coil cleaning, refrigerant verification, static pressure, capacitor/contactor, drain line, honest replacement timing), 4 FAQs, CTA pointing to `/services/residential`, `related_post_categories = ['Maintenance', 'HVAC Tips', 'Seasonal Advice']`, 3 related service links.

2. **`page_seo`** row for `/category/hvac-maintenance` so the build-time prerender script writes proper `<head>` tags (title, description, canonical with trailing slash, og:*, robots `index, follow`).

## Step 5 — Verification (post-deploy)

- Page loads cleanly at `https://truficient.com/category/hvac-maintenance`
- Source view shows page-specific `<title>`, meta description, canonical, og:* tags, JSON-LD
- `prerender-manifest.json` includes the new route (count +1)
- Old WP URL no longer 404s
- Visual parity with `/blog`

---

## Out of scope (v2, after PoC sign-off)

- 6 more category rows (zoning, smart-home-hvac, sustainable-home, hvac-basics-fundamentals, allergies, home-improvement)
- Redirects for junk legacy categories (`/category/daikin`, `/category/trane/feed`, `/category/city/oak-cliff`)
- Sitemap regeneration

## Files touched

- **NEW** `src/pages/BlogCategory.tsx`
- **EDIT** `src/App.tsx` (lazy import + 1 route)
- **MIGRATION** create `blog_categories` table + RLS + trigger + indexes
- **DATA** upsert 1 row into `blog_categories`, 1 row into `page_seo`
