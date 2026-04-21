# North Texas Water Crisis Blog — Programmatic SEO Build Spec

**Companion to:** `blog-north-texas-water-crisis.md`
**Created:** April 2026
**Applies to:** The published version of the blog on truficient.com + any spoke pages built off it
**Pairs with:** `SEO Scale & Quality Standards — Brand Pages + Mass Publishing.md`, `lovable-fix-stage-2-meta-tags-ctr.md`, `dallas-uhi-seo-expansion.md`

---

## 1. Why this blog deserves a programmatic SEO treatment

This post is not just a news summary — it's a **citation-rich, data-backed research post** on a topic (Texas water crisis, $174B state water plan, DFW growth vs. supply) that:

- Has sustained search demand and will **intensify in volume** across summer 2026 as drought stages escalate
- Has almost **zero HVAC-contractor competition** — most ranking pages are news outlets, TWDB, or city utility PDFs
- Maps cleanly to Truficient's existing topical authority cluster (energy efficiency, grid demand, Dallas climate resilience)
- Has **46 source citations** → real E-E-A-T signal, real schema `citation` field payload
- Contains **per-city conservation rules** that can be forked into a spoke-page cluster (Dallas, Fort Worth, Frisco, McKinney, Richardson, Plano, Allen) — the same pattern the UHI expansion used

**Recommended posture:** Treat this post the same way the UHI report was treated — hub + spokes. This doc is the build sheet.

---

## 2. URL + Page Type

| Field | Value |
|---|---|
| **URL (canonical)** | `https://truficient.com/blog/north-texas-water-crisis-conservation/` |
| **Page type** | Blog post / long-form article (hub) |
| **Canonical** | Self-referential, non-www, trailing slash (matches Stage 1 canonical spec) |
| **Parent section** | `/blog/` (Truficient Conservation Series) |
| **Publish date** | 2026-04-21 |
| **Last modified** | Update `dateModified` whenever copy changes, drought stages change, or a city updates its ordinance |

**Do not** use a dated slug (`/2026/north-texas-water-crisis/`). Treat it as evergreen — update facts in place.

---

## 3. Meta Title + Description (CTR-optimized)

Primary meta stack — follow Stage 2 SSR rule (these MUST be server-rendered, not hydrated client-side):

| Tag | Value | Chars |
|---|---|---|
| `<title>` | `North Texas Water Crisis: $174B Plan & What Homeowners Can Do` | 61 |
| `<meta name="description">` | `Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now.` | 145 |

### A/B alternates (swap in if CTR on primary is flat after 30 days of indexing)

| Variant | Title | Description |
|---|---|---|
| B — urgency | `The $174 Billion North Texas Water Crisis, Explained` (52) | `Texas' 50-year water plan just doubled to $174 billion. Here's what DFW homeowners need to know — and the conservation rules already in force.` (142) |
| C — local rules angle | `Dallas, Fort Worth, Frisco Water Restrictions 2026 Guide` (56) | `Every North Texas city has watering rules — and they're tightening. Full 2026 restrictions for DFW plus the $174B water plan driving them.` (138) |

---

## 4. Open Graph + Twitter card tags

Per Stage 2 fix, these must be server-rendered on this route, not inherited from the homepage.

```html
<!-- Canonical -->
<link rel="canonical" href="https://truficient.com/blog/north-texas-water-crisis-conservation/" />

<!-- Primary -->
<title>North Texas Water Crisis: $174B Plan & What Homeowners Can Do</title>
<meta name="description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />

<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Truficient Energy Solutions" />
<meta property="og:title" content="North Texas Water Crisis: $174B Plan & What Homeowners Can Do" />
<meta property="og:description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />
<meta property="og:url" content="https://truficient.com/blog/north-texas-water-crisis-conservation/" />
<meta property="og:image" content="https://truficient.com/images/blog/north-texas-water-crisis-og.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="North Texas reservoir at low conservation pool — cover image for the $174B Texas water plan explainer" />
<meta property="article:published_time" content="2026-04-21T09:00:00-05:00" />
<meta property="article:modified_time" content="2026-04-21T09:00:00-05:00" />
<meta property="article:author" content="Truficient Energy Solutions" />
<meta property="article:section" content="Conservation" />
<meta property="article:tag" content="North Texas water crisis" />
<meta property="article:tag" content="Texas water plan 2027" />
<meta property="article:tag" content="DFW conservation" />

<!-- Twitter (per Stage 2, these must also be page-specific, not homepage defaults) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="North Texas Water Crisis: $174B Plan & What Homeowners Can Do" />
<meta name="twitter:description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />
<meta name="twitter:image" content="https://truficient.com/images/blog/north-texas-water-crisis-og.jpg" />
<meta name="twitter:image:alt" content="North Texas reservoir at low conservation pool — cover image for the $174B Texas water plan explainer" />

<!-- Robots -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

**OG image spec:** 1200×630 JPG, under 200 KB, real photo (not stock). Candidate subjects: Lake Ray Roberts at low pool, an empty reservoir launch ramp in TRWD territory, or a split image showing DFW growth vs. reservoir line decline. Avoid any image that could be mistaken for Corpus Christi — this is a North Texas post.

---

## 5. JSON-LD schema — drop into `<head>` or just before `</body>`

Use a **single `@graph`** envelope so all three schema types (Article, FAQPage, BreadcrumbList) live in one script tag and share `@id` references. Google and Bing both parse `@graph` correctly and it makes maintenance simpler.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://truficient.com/blog/north-texas-water-crisis-conservation/#article",
      "headline": "North Texas Water Crisis: A Deep Dive into the Coming Decades",
      "alternativeHeadline": "What the $174B Texas Water Plan Means for DFW Homeowners",
      "description": "Texas needs at least $174 billion over 50 years to avoid a water crisis. DFW sits at the epicenter — here's the data, the city-by-city rules, and what North Texas homeowners can do now.",
      "image": {
        "@type": "ImageObject",
        "url": "https://truficient.com/images/blog/north-texas-water-crisis-og.jpg",
        "width": 1200,
        "height": 630
      },
      "datePublished": "2026-04-21T09:00:00-05:00",
      "dateModified": "2026-04-21T09:00:00-05:00",
      "inLanguage": "en-US",
      "articleSection": "Conservation Series",
      "wordCount": 2450,
      "keywords": [
        "North Texas water crisis",
        "Texas 2027 state water plan",
        "$174 billion water plan",
        "DFW water shortage",
        "Dallas watering restrictions 2026",
        "Fort Worth water restrictions",
        "Frisco water efficiency plan",
        "NTMWD conservation",
        "TRWD reservoirs",
        "xeriscaping North Texas",
        "Corpus Christi water emergency"
      ],
      "about": [
        { "@type": "Thing", "name": "Water scarcity in Texas" },
        { "@type": "Thing", "name": "Dallas-Fort Worth metroplex" },
        { "@type": "Thing", "name": "Texas Water Development Board" },
        { "@type": "Thing", "name": "Urban water conservation" }
      ],
      "mentions": [
        { "@type": "Place", "name": "Dallas, Texas" },
        { "@type": "Place", "name": "Fort Worth, Texas" },
        { "@type": "Place", "name": "Frisco, Texas" },
        { "@type": "Place", "name": "McKinney, Texas" },
        { "@type": "Place", "name": "Richardson, Texas" },
        { "@type": "Place", "name": "Corpus Christi, Texas" },
        { "@type": "Organization", "name": "North Texas Municipal Water District" },
        { "@type": "Organization", "name": "Tarrant Regional Water District" },
        { "@type": "Organization", "name": "Texas Water Development Board" }
      ],
      "author": {
        "@type": "Organization",
        "@id": "https://truficient.com/#organization",
        "name": "Truficient Energy Solutions",
        "url": "https://truficient.com/"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://truficient.com/#organization",
        "name": "Truficient Energy Solutions",
        "url": "https://truficient.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://truficient.com/images/truficient-logo.png",
          "width": 600,
          "height": 60
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://truficient.com/blog/north-texas-water-crisis-conservation/"
      },
      "citation": [
        { "@type": "CreativeWork", "name": "Texas needs at least $174 billion to avoid water crisis, state says", "url": "https://www.texastribune.org/2026/04/16/texas-water-supply-crisis-corpus-christi-development-board/", "publisher": "The Texas Tribune" },
        { "@type": "CreativeWork", "name": "2027 State Water Plan", "url": "https://www.twdb.texas.gov/waterplanning/swp/2027/index.asp", "publisher": "Texas Water Development Board" },
        { "@type": "CreativeWork", "name": "'Perfect rainless storm': North Texas water planning faces climate change", "url": "https://www.keranews.org/news/2025-05-02/north-texas-water-plans-climate-change-growth-reservoir", "publisher": "KERA News" },
        { "@type": "CreativeWork", "name": "Texas' plan to meet future water demand swells to $174 billion", "url": "https://www.texasstandard.org/stories/texas-state-water-plan-cost-increase-corpus-christi-drought/", "publisher": "Texas Standard" },
        { "@type": "CreativeWork", "name": "Planning for Our Water Future: TRWD's Integrated Water Supply Plan Update", "url": "https://www.trwd.com/planning-for-our-water-future-trwds-integrated-water-supply-plan-update/", "publisher": "Tarrant Regional Water District" },
        { "@type": "CreativeWork", "name": "Planning for the Future", "url": "https://ntmwd.com/316/Planning-for-the-Future", "publisher": "North Texas Municipal Water District" }
      ],
      "isPartOf": {
        "@type": "Blog",
        "@id": "https://truficient.com/blog/#blog",
        "name": "Truficient Blog"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://truficient.com/blog/north-texas-water-crisis-conservation/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much will Texas need to spend on water over the next 50 years?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "According to the 2027 State Water Plan authorized by the Texas Water Development Board in April 2026, Texas communities will need at least $174 billion over the next 50 years to avert a severe water crisis — more than double the $80 billion projected in 2022. Experts note the figure only covers water supply projects, so factoring in aging infrastructure could push the real cost to a quarter of a trillion dollars."
          }
        },
        {
          "@type": "Question",
          "name": "How fast is DFW growing, and what does it mean for water supply?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Dallas–Fort Worth metroplex currently houses roughly 8.3–8.6 million residents and added an estimated 177,922 people between July 2023 and July 2024 — averaging 487 new residents a day. DFW is projected to reach 12 million by 2050 and as many as 14.7 million by 2070. North Texas water demand is expected to increase 86% by 2060, while statewide supply is expected to drop roughly 10% between 2030 and 2080."
          }
        },
        {
          "@type": "Question",
          "name": "What are the 2026 watering restrictions in Dallas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dallas operates under a permanent water conservation ordinance limiting outdoor irrigation to a maximum of twice per week based on address (even or odd). No watering is permitted between 10 a.m. and 6 p.m. from April 1 through October 31. Dallas also uses a tiered water rate — the more water you use, the higher the rate."
          }
        },
        {
          "@type": "Question",
          "name": "What are Fort Worth's water restrictions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Fort Worth enforces year-round outdoor water restrictions. Even-numbered addresses irrigate on Wednesday and Saturday; odd addresses irrigate on Thursday and Sunday. No sprinkler irrigation is allowed on Mondays, and no irrigation between 10 a.m. and 6 p.m. on any day. Violations trigger administrative fees that escalate on repeat offenses."
          }
        },
        {
          "@type": "Question",
          "name": "What are Frisco's watering rules under the Water Efficiency Plan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Frisco's Water Efficiency Plan, approved in May 2024 and in force as of 2025, limits sprinkler or rotor irrigation to once per week — specifically, the same day as your trash and recycling pickup. Watering is prohibited between 10 a.m. and 6 p.m. from April 1 through October 31. This is meaningfully more restrictive than the traditional twice-per-week schedules elsewhere in North Texas."
          }
        },
        {
          "@type": "Question",
          "name": "What does Stage 2 drought response look like in McKinney?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Under McKinney's Stage 2 drought response, even-numbered addresses may irrigate only Monday, Wednesday, and Friday; odd-numbered addresses water Sunday, Tuesday, and Thursday. No irrigation is allowed on Saturday. Each irrigation zone is capped at 30 minutes per day, and all systems must have functional rain and freeze sensors."
          }
        },
        {
          "@type": "Question",
          "name": "Does xeriscaping work in North Texas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. North Texas's climate is well-suited to native and drought-tolerant landscaping. Proven performers include Texas sage (Leucophyllum frutescens), lantana, red yucca (Hesperaloe parviflora), little bluestem, agave and yucca varieties, muhly grass, and feathergrass. Replacing turf with native groundcovers, mulch, or decomposed granite can dramatically cut long-term irrigation needs while also reducing maintenance."
          }
        },
        {
          "@type": "Question",
          "name": "How does water use relate to home energy use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Treating, pumping, and moving water is extremely energy-intensive, and heating hot water is typically the second-largest energy expense in a home. Wasting water wastes energy. Conservation — fixing leaks, shifting to WaterSense fixtures, installing smart irrigation controllers — reduces both water bills and the energy footprint of your home simultaneously."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://truficient.com/blog/north-texas-water-crisis-conservation/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://truficient.com/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://truficient.com/blog/" },
        { "@type": "ListItem", "position": 3, "name": "Conservation", "item": "https://truficient.com/blog/category/conservation/" },
        { "@type": "ListItem", "position": 4, "name": "North Texas Water Crisis" }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://truficient.com/#organization",
      "name": "Truficient Energy Solutions",
      "alternateName": "Truficient",
      "url": "https://truficient.com/",
      "logo": "https://truficient.com/images/truficient-logo.png",
      "telephone": "+1-214-238-4349",
      "areaServed": [
        { "@type": "AdministrativeArea", "name": "Dallas-Fort Worth Metroplex" },
        { "@type": "AdministrativeArea", "name": "Collin County, Texas" },
        { "@type": "AdministrativeArea", "name": "Dallas County, Texas" },
        { "@type": "AdministrativeArea", "name": "Denton County, Texas" },
        { "@type": "AdministrativeArea", "name": "Tarrant County, Texas" }
      ],
      "sameAs": [
        "https://www.facebook.com/truficient",
        "https://www.instagram.com/truficient",
        "https://www.linkedin.com/company/truficient"
      ]
    }
  ]
}
</script>
```

**Why a single `@graph`:** One script, one place to edit when a city ordinance changes. Shared `@id`s let Google resolve the Article's `publisher` to the same Organization node the LocalBusiness inherits from.

**Validation before ship:** Paste into [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org). All four types should parse with zero errors. Expect **Article** and **FAQ** rich result eligibility; **Breadcrumb** will surface on the SERP snippet path.

---

## 6. On-page FAQ block (must match FAQPage schema verbatim)

Google will drop FAQ rich results if the on-page Q&A text does not match the schema. Add a visible `<h2>Frequently Asked Questions</h2>` section near the bottom of the post, using `<details>` / `<summary>` or a plain accordion, with the exact same 8 Q&A pairs that are in the schema above. This is the only way Google will treat the FAQ schema as legit after its 2023 policy tightening.

---

## 7. Heading architecture

Preserve H1→H2→H3 hierarchy. Rewrite the in-post headings as follows so each H2 owns one high-intent query:

| Level | Heading (SEO-tuned) |
|---|---|
| H1 | North Texas Water Crisis: A Deep Dive into the Coming Decades |
| H2 | The $174 Billion Texas Water Plan, Explained |
| H2 | DFW Population Growth vs. Water Supply |
| H3 | DFW Growth by the Numbers |
| H3 | Water Demand vs. Supply: A Widening Gap |
| H2 | The "Perfect Rainless Storm": Climate Change + Growth |
| H2 | Corpus Christi: A Present-Tense Warning for North Texas |
| H2 | North Texas Watering Restrictions, City by City (2026) |
| H3 | Dallas Watering Schedule & Rules |
| H3 | Fort Worth Year-Round Water Restrictions |
| H3 | Frisco Water Efficiency Plan |
| H3 | McKinney Drought Response |
| H3 | Richardson Summer Water Conservation |
| H3 | NTMWD Service Area Restrictions |
| H2 | Texas' Strategic Response: Big Projects, Big Price Tags |
| H2 | What North Texas Homeowners Can Do Today |
| H3 | Outdoor Water Conservation (The Biggest Impact) |
| H3 | Xeriscaping: The Long Game |
| H3 | Indoor Water Conservation |
| H3 | Know Your City's Drought Stage Response |
| H2 | Why Water and Home Energy Are the Same Conversation |
| H2 | Frequently Asked Questions |

The "North Texas Watering Restrictions, City by City (2026)" H2 is the magnet H2 — it targets a cluster of city-level queries in one section and anchors the internal links that will go to the spoke pages in §10.

---

## 8. Image set + alt text

Each image gets a descriptive alt that says what's shown **and** names the place/entity — per the SEO Scale & Quality Standards spec.

| Slot | Subject | Filename | Alt text |
|---|---|---|---|
| Hero / OG | Low-pool reservoir in DFW (Bridgeport or Cedar Creek) | `north-texas-water-crisis-og.jpg` | "North Texas reservoir below conservation pool during the 2026 drought, illustrating the $174 billion Texas water plan" |
| Inline 1 | DFW population growth chart 2000→2070 | `dfw-population-growth-2070.png` | "Chart showing Dallas-Fort Worth metroplex population projected to grow from 8 million today to 14.7 million by 2070" |
| Inline 2 | Map of Region C water planning area | `region-c-water-planning-map.png` | "16-county Region C water planning area covering Collin, Dallas, Denton, Ellis, Kaufman, and Tarrant counties" |
| Inline 3 | Sprinkler + 10am-6pm no-water-window graphic | `north-texas-watering-schedule-2026.png` | "North Texas city watering schedule 2026 showing Dallas, Fort Worth, Frisco, and McKinney restrictions and the 10 a.m. to 6 p.m. no-water window" |
| Inline 4 | Xeriscape garden with Texas sage + red yucca | `xeriscaping-native-plants-north-texas.jpg` | "North Texas xeriscape garden with Texas sage, red yucca, and little bluestem — drought-tolerant native plants" |

All images: `loading="lazy"` except the hero (use `fetchpriority="high"` and `loading="eager"`). Serve AVIF with JPG fallback. Every image needs explicit `width` and `height` attributes to prevent CLS.

---

## 9. Internal link plan — from this blog OUT

Every internal link below earns its keep by either (a) sending authority to a money page or (b) funneling search traffic to a related hub. No courtesy links.

| Anchor text (in post body) | Target URL | Why |
|---|---|---|
| "Dallas urban heat island effect" | `/dallas-urban-heat-island-effect-energy-hvac/` | Topical cluster sibling — heat × water are the two converging DFW climate stories |
| "the AC feedback loop" | `/ac-feedback-loop-dallas/` | Water treatment is electricity-intensive; this connects water → grid → HVAC |
| "Dallas summer electricity bill" | `/dallas-electricity-bill-summer-hvac/` | Bill reduction is the strongest money-page funnel from a conservation reader |
| "smart irrigation controller" | `/smart-home-energy-efficiency-dallas/` (build if missing) | Natural bridge from water tech to home efficiency tech |
| "WaterSense-labeled fixtures" | Outbound to `epa.gov/watersense` — authority link (not internal) | E-E-A-T signal |
| "home energy audit" | `/energy-audit-dallas/` | Direct service funnel |
| "schedule an efficiency assessment" (final CTA) | `/contact/` or `/schedule/` | Conversion destination |

---

## 10. Programmatic SEO spoke pages (the real lift)

This is the equivalent of what the UHI doc did for neighborhood heat island pages. The water crisis post gives Truficient the cover to build a cluster of **city-level watering restrictions pages** — high search-volume queries with almost no quality content currently ranking.

### Spoke page template (replicate for each city)

```
URL:                /water-restrictions-{city}-tx-{year}/
H1:                 {City} Water Restrictions {year}: Full Watering Schedule & Rules
Meta Title:         {City} Watering Restrictions 2026 — Days, Hours, Fines | Truficient
Meta Description:   When can you water your lawn in {City}? Full 2026 watering days,
                    hours, drought stages, and fines. Plus how to stay comfortable
                    without blowing your water bill.
Primary Keyword:    {city} water restrictions 2026
Schema:             Article + FAQPage + BreadcrumbList + Organization (this post's @graph, forked)
Hub backlink:       /blog/north-texas-water-crisis-conservation/ (required)
Money-page link:    /energy-audit-{city}/ OR nearest service page
```

### Cities to build (priority order by search volume and Truficient service density)

| # | City | Slug | Primary keyword | Notes |
|---|---|---|---|---|
| 1 | Dallas | `/water-restrictions-dallas-tx-2026/` | `dallas water restrictions 2026` | Highest volume; permanent twice/week ordinance |
| 2 | Fort Worth | `/water-restrictions-fort-worth-tx-2026/` | `fort worth water restrictions 2026` | Year-round schedule is unusual — feature that |
| 3 | Frisco | `/water-restrictions-frisco-tx-2026/` | `frisco water restrictions 2026` | Once-per-week rule is the differentiator |
| 4 | McKinney | `/water-restrictions-mckinney-tx-2026/` | `mckinney stage 2 drought response` | Stage-based; updates frequently — good for repeat visits |
| 5 | Plano | `/water-restrictions-plano-tx-2026/` | `plano water restrictions 2026` | NTMWD customer; may share rules with Allen/Richardson |
| 6 | Richardson | `/water-restrictions-richardson-tx-2026/` | `richardson summer water conservation` | April 1 – October 31 schedule |
| 7 | Allen | `/water-restrictions-allen-tx-2026/` | `allen tx watering days` | Collin County high-growth |
| 8 | Arlington | `/water-restrictions-arlington-tx-2026/` | `arlington tx water restrictions` | TRWD wholesale customer |
| 9 | Irving | `/water-restrictions-irving-tx-2026/` | `irving tx watering schedule` | Dallas County, DWU customer |
| 10 | Garland | `/water-restrictions-garland-tx-2026/` | `garland tx water restrictions` | NTMWD — fills the cluster |
| 11 | Denton | `/water-restrictions-denton-tx-2026/` | `denton tx water restrictions` | Independent utility — distinct rules |

### Supporting explainer spokes (not city-specific)

| Page | URL | Primary keyword |
|---|---|---|
| Texas 2027 State Water Plan Explained | `/texas-2027-state-water-plan-explained/` | `texas 2027 state water plan` |
| NTMWD Conservation Plan Overview | `/ntmwd-water-conservation-plan/` | `ntmwd conservation 2026` |
| TRWD Reservoir Levels Tracker | `/trwd-reservoir-levels/` | `trwd reservoir levels` — update monthly, similar play to UHI Policy Tracker |
| North Texas Xeriscaping Guide | `/north-texas-xeriscaping-guide/` | `xeriscaping north texas` |
| Corpus Christi Water Emergency — Lessons for DFW | `/corpus-christi-water-crisis-north-texas-lessons/` | `corpus christi water crisis` |
| Water and Energy Use at Home | `/water-energy-home-efficiency/` | `water use vs energy use home` — the bridge to HVAC service pages |

### Link discipline for this cluster

- Every spoke links UP to this blog post (the hub) via a single phrase like "full $174B North Texas water crisis breakdown"
- Every spoke links ACROSS to **2 sibling city pages** in the same cluster
- Every spoke links DOWN to **1 money page** (nearest service page for that city)
- The hub (this blog post) links to every city spoke once, inside the "North Texas Watering Restrictions, City by City (2026)" H2 section — **not** in a generic related-posts module

That's the exact 3-point pattern described in the SEO Scale & Quality Standards doc.

---

## 11. The top of the page — server-rendered snippet

Here's the actual `<head>` block for this post, consolidated so Lovable can ship it as one artifact. Numbers are the final values; this is copy-paste ready once the OG image is uploaded.

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>North Texas Water Crisis: $174B Plan & What Homeowners Can Do</title>
  <meta name="description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />
  <link rel="canonical" href="https://truficient.com/blog/north-texas-water-crisis-conservation/" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Truficient Energy Solutions" />
  <meta property="og:title" content="North Texas Water Crisis: $174B Plan & What Homeowners Can Do" />
  <meta property="og:description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />
  <meta property="og:url" content="https://truficient.com/blog/north-texas-water-crisis-conservation/" />
  <meta property="og:image" content="https://truficient.com/images/blog/north-texas-water-crisis-og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="article:published_time" content="2026-04-21T09:00:00-05:00" />
  <meta property="article:modified_time" content="2026-04-21T09:00:00-05:00" />
  <meta property="article:section" content="Conservation" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="North Texas Water Crisis: $174B Plan & What Homeowners Can Do" />
  <meta name="twitter:description" content="Texas needs $174B to avoid a water crisis as DFW grows to 12M by 2050. See the 2027 state water plan, city-by-city rules, and how to cut use now." />
  <meta name="twitter:image" content="https://truficient.com/images/blog/north-texas-water-crisis-og.jpg" />

  <!-- JSON-LD @graph block from §5 pasted here -->
</head>
```

---

## 12. Pre-publish checklist (use the core Quality Gate plus these adds)

Everything in the `SEO Scale & Quality Standards` Page Quality Checklist (§ Page Quality Checklist) applies. Post-specific additions:

- [ ] Server-rendered `<title>`, meta description, og:*, twitter:* all match the values in §3–§4 — verify with `curl -s https://truficient.com/blog/north-texas-water-crisis-conservation/ | grep -E 'title|description|og:|twitter:'`
- [ ] JSON-LD validates with **zero errors** in Rich Results Test + Schema.org validator
- [ ] FAQ on-page text matches FAQPage schema verbatim (Google will drop rich results if they mismatch)
- [ ] All 8 FAQ items are in a single visible accordion near the bottom of the post
- [ ] Hero image is a real photo (not stock), 1200×630, under 200 KB, `fetchpriority="high"`
- [ ] All images have explicit width + height + descriptive alt text naming the place/entity
- [ ] Internal links: at least 3 links out to Truficient hubs (UHI hub, AC feedback loop, summer electricity bill page)
- [ ] Internal link from the already-indexed UHI hub page INTO this post (added day-of publish — per Indexing Speed protocol §Indexing Speed)
- [ ] At least one money-page CTA above the fold (click-to-call 214-238-4349)
- [ ] Submit URL via GSC URL Inspection on publish day
- [ ] Ping `/sitemap.xml` in GSC
- [ ] Post an Instagram or Facebook story linking this URL on publish day (social crawl signal)
- [ ] `dateModified` date is set, not hard-coded — update on every meaningful copy change

---

## 13. Maintenance cadence (this is a living post)

| Trigger | Update |
|---|---|
| A covered city changes drought stage or ordinance | Update that city's H3 section + `dateModified` + GSC resubmit |
| TWDB publishes new reservoir levels (monthly) | Add a "As of [month]" note in the DFW Growth section with current TRWD / NTMWD pool levels |
| Governor Abbott issues water-related order | Add to the Corpus Christi / Texas Strategic Response H2 |
| Corpus Christi formally declares Level 1 emergency | Update the Corpus Christi H2 in real time — this is the post's news anchor |
| New spoke city page publishes | Add internal link in the "City by City" H2 to the new spoke |

Set a recurring reminder: **1st of every month**, reopen this post, verify city ordinance links still work, refresh reservoir data, bump `dateModified`. This is how the post keeps earning crawl budget and doesn't decay.

---

*This spec is a companion to `blog-north-texas-water-crisis.md` and inherits all content quality rules from `SEO Scale & Quality Standards — Brand Pages + Mass Publishing.md`. If a rule conflicts, the master Standards document wins.*
