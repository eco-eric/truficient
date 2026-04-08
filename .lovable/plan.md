

## Plan: Upload SEO Instructions to Knowledge Base

Store the full 553-line SEO instruction document as a single entry in the `knowledge_base` table so it can be referenced by you or any agent at any time without re-uploading.

### What happens

1. **Insert one knowledge base record** via a database migration with:
   - **Title:** "Truficient SEO Location Page System"
   - **Slug:** `seo-location-page-instructions`
   - **Category:** `seo`
   - **Tags:** `seo`, `location-pages`, `content-strategy`, `schema`, `sprint-plan`
   - **Content:** The full markdown document (all 553 lines)
   - **is_active:** true

2. **Add "seo" to the CATEGORIES array** in `KnowledgeBase.tsx` so it appears in the category filter dropdown.

### How to reference it

- In the admin UI: go to `/admin/knowledge-base` and search for "SEO Location Page"
- Via MCP/API: agents call `get_knowledge_doc` with slug `seo-location-page-instructions`
- When you want to reference it in conversation, just say "reference the SEO instructions" and I'll pull it from the knowledge base

### Technical details

- The content will be escaped properly for SQL insertion (single quotes doubled)
- The `knowledge_base` table already exists with the right schema
- No new tables or RLS changes needed
- One file edit (`KnowledgeBase.tsx`) to add the "seo" category

