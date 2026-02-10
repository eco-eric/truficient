

# Facebook Scanner Landing Page: `/free-hvac-age-checker-fb-feb-2026`

## Overview
Create a standalone, conversion-optimized landing page for a Facebook ad campaign promoting the free HVAC equipment scanner. The page will have no site header/footer navigation (to minimize exit points), a strong hero section, social proof, benefit highlights, and a clear CTA that routes into the existing `/scanner` flow.

## New File

### `src/pages/landing/FreeHvacAgeCheckerFB.tsx`

A self-contained landing page with these sections:

1. **Minimal Top Bar** -- Truficient logo only (no nav links to reduce bounce)
2. **Hero Section**
   - Headline: "How Old Is Your AC? Find Out in 30 Seconds"
   - Subheadline: "Snap a photo of your data plate and instantly get your system's age, specs, and downloadable manuals -- 100% free."
   - Large CTA button: "Check My System's Age" linking to `/scanner`
   - Trust badges: "Free", "No appointment", "30 seconds"
3. **How It Works** -- 3-step visual (Enter zip, Snap photo, Get results)
4. **Benefits Grid** -- Reuse the same 4 benefits from `ScannerPromo` (instant ID, manufacturing year, SEER rating, manuals)
5. **Coupon Teaser** -- Embed the existing `ScannerCoupon` component (compact variant) to show the exclusive savings offer
6. **Social Proof** -- Star rating, install count (matches existing stats)
7. **Final CTA** -- Repeated CTA button at bottom
8. **Minimal Footer** -- Company name, license number, privacy/terms links only

### Tracking & Analytics
- Fire `fbq('track', 'ViewContent', { content_name: 'FB Scanner Landing - Feb 2026' })` on page load for Meta Pixel attribution
- Fire `gtag` page_view with custom campaign params
- Track CTA clicks via existing `useButtonTracking` hook with `buttonLocation: 'FB Landing Page - Feb 2026'`
- UTM params from Facebook will be preserved in the URL and carried through to the scanner

## Route Registration

### `src/App.tsx`
- Import the new page component
- Add route: `{ path: "/free-hvac-age-checker-fb-feb-2026", element: <FreeHvacAgeCheckerFB /> }`

## Technical Details

- No new dependencies needed -- uses existing Framer Motion, Lucide icons, shadcn/ui components, and the `ScannerCoupon` component
- The page is intentionally **outside** the normal Header/Footer layout to maximize ad conversion (no distracting navigation)
- The CTA links to `/scanner` which preserves the full scanner flow (zip gate, scan, results, email capture)
- Mobile-first responsive design since Facebook traffic is predominantly mobile

