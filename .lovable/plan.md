

# Inline Gallery Placement on Location Pages

## Summary
Split the markdown content into sections and interleave gallery photo grids between paragraphs instead of placing all photos at the bottom. First batch of 4 photos appears after paragraph 1; if more photos are available, a second batch of 4 appears after paragraph 3.

## What Changes

### 1. Update `LocationGallery` component
- Add a `maxPhotos` prop (default keeps current behavior of 9)
- Add a `compact` prop to control spacing/heading style for inline use
- The component already handles scoring and sorting; just need to respect the limit

### 2. Split markdown content in `LocationPage.tsx`
Instead of rendering the full markdown in one `<ReactMarkdown>` block, split `location.content` by the **second-level heading** boundaries or by counting top-level paragraphs (lines separated by double newlines that aren't headings/lists).

The approach:
- Parse the markdown string to find paragraph break points (split on `\n\n` and count non-heading, non-list blocks)
- Create 2-3 content chunks: **before paragraph 2**, **paragraphs 2-3**, **rest**
- Render: Chunk 1 → Gallery (4 photos) → Chunk 2 → Gallery (next 4 photos, if available) → Chunk 3 + ToolLinks

### 3. Update `LocationGallery` to support `offset` + `limit`
- Add `offset` prop so the second gallery instance skips the first 4 photos
- First instance: `offset=0, maxPhotos=4`
- Second instance: `offset=4, maxPhotos=4` (only renders if photos exist beyond offset)
- Share the same query via a shared hook or pass photos as props to avoid duplicate fetches

### 4. Refactor to shared query hook
Create a `useLocationGalleryPhotos` hook that both gallery instances share (using the same React Query cache key). Each `LocationGallery` instance slices from the shared result.

### 5. Legacy pages (field-based)
Apply the same pattern: first gallery after the intro paragraph, second gallery after the "Why Choose Truficient" section.

## Technical Detail

**Content splitting logic:**
```text
splitMarkdownByParagraphs(content, [1, 3])
  → [chunk0_paragraphs_0-1, chunk1_paragraphs_1-3, chunk2_rest]
```

A "paragraph" = a block of text between `\n\n` boundaries that starts with a letter or `[` (not `#`, `-`, `*`, `|`, `>`). This avoids counting headings or lists as paragraphs.

**Files modified:**
| File | Change |
|------|--------|
| `src/components/gallery/LocationGallery.tsx` | Add `maxPhotos`, `offset` props; extract query into shared hook |
| `src/pages/service-areas/LocationPage.tsx` | Split markdown into chunks; render two gallery instances inline |

