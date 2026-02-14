

# Add Google Tag Manager (GTM) to the Site

## What This Does
Adds the GTM container tag (`GTM-TPHS4HT7`) to the site so your web team can manage all tracking tags from Google Tag Manager without needing code changes.

## Approach
Since GTM is a site-wide container that should load as early as possible, we'll add it in two places following Google's official installation instructions:

### 1. Add GTM script to `index.html` (head section)
Insert the GTM snippet right after the opening `<head>` tag — this is the standard placement for fastest loading:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TPHS4HT7');</script>
<!-- End Google Tag Manager -->
```

### 2. Add GTM noscript fallback to `index.html` (body section)
Insert right after the opening `<body>` tag for users with JavaScript disabled:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPHS4HT7"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## Why in `index.html` instead of React?
GTM should load before React boots up to capture the earliest possible page data. Placing it in `index.html` is the Google-recommended approach and ensures your web team's tags fire correctly from the first page load.

## File Modified
- `index.html` — two small additions (head script + body noscript)

## Note on Existing Tracking
Your site already has Google Analytics and Meta Pixel managed through `TrackingScripts.tsx`. Once GTM is live, your web team may want to migrate those into GTM to manage everything in one place — but that's optional and can be done later.

