

## Plan: Build March Group Buy Landing Page

Convert the uploaded HTML into a React component at `go.truficient.com/smart-group-march-F-26`.

### Route
- Add route `/smart-group-march-F-26` in `src/App.tsx` pointing to a new `SmartGroupMarchLanding` component

### New Files

1. **`src/pages/landing/SmartGroupMarchLanding.tsx`** — Full React page recreating the HTML:
   - Uses `LandingPageShell` for the outer wrapper (logo header + minimal footer) but overrides footer with the campaign-specific one from the HTML
   - Actually, the HTML has its own nav, announcement bar, and footer that differ from `LandingPageShell` — so this page will be **self-contained** (not using `LandingPageShell`) to match the design exactly
   - Sections: Announcement bar, Nav (logo + phone), Hero with offer card, Trust bar, How It Works steps, Owner section (uses `owner-eric.jpg`), Gallery section (placeholder SVGs for now), Energy Savings stats, Group Buy detail/pricing, Referral $250 card, Lead capture form, Footer
   - Sticky mobile CTA that hides when form is in viewport
   - Form submission saves to a new `landing_page_leads` table (or existing landing page submissions table) and fires Facebook Pixel `Lead` event + GA4 `generate_lead` event
   - All inline CSS from the HTML converted to Tailwind classes where practical, with a small `<style>` block or CSS module for complex custom styles (CSS variables, animations)

2. **`src/pages/landing/smart-group-march.css`** — Campaign-specific styles extracted from the HTML (the custom CSS variables, grid layouts, offer card styles, etc.) since many are too specific for Tailwind

### Form Submission
- On submit, call the existing `sync-ghl-contact` edge function with:
  - `source: 'march_group_buy_landing'`
  - `tags: ['Goodman Group Buy', 'March 2026', 'Facebook Ad']`
  - Custom fields for zip, timeline, referral
- Also insert into `landing_page_submissions` table (existing) with form type `group-buy-march-2026`
- Show success message, hide form

### Tracking
- Facebook Pixel: `ViewContent` on load, `Lead` on form submit
- GA4: `page_view` on load, `generate_lead` on form submit
- Button tracking via existing `useButtonTracking` hook for CTA clicks

### Assets
- Owner photo: already exists at `src/assets/owner-eric.jpg`
- Gallery: keep the SVG placeholders from the HTML (noted as "replace before publishing")
- Logo: use existing `src/assets/truficient-logo.png` in nav

### Key Sections (matching HTML exactly)
1. Announcement bar — orange, "March 2026 Only"
2. Sticky nav — navy, logo + phone
3. Hero — gradient background, h1, badges, CTA buttons, offer summary card
4. Trust bar — horizontal scroll on mobile
5. How It Works — 4 steps
6. Owner message — Eric's photo, blockquote, credentials
7. Gallery — 6 SVG placeholders with captions
8. Energy Savings — big stat card + facts + stats trio
9. Group Buy Detail — conditions, price example, financing note
10. Referral — $250 per referral card
11. Lead Form — name, email, phone, city/zip, timeline, referral field
12. Footer — company info + disclaimers

