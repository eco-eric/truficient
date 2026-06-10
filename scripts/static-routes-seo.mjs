// Static-route SEO config for the prerender script.
//
// Used as a FALLBACK only — if a row exists in the page_seo table for the same
// path, the DB row wins. This file exists so routes that aren't backed by a
// page_seo row still get correct per-page tags emitted at build time.
//
// Add new static routes here. New DB-driven pages do NOT need entries here —
// they auto-publish on the next build via the four-table pull.
//
// Rules enforced by the prerender script:
//   - title:        REQUIRED. Missing => build error.
//   - description:  Falls back to title.
//   - canonical:    Built from the path with the non-www host.
//   - ogImage:      Falls back to https://truficient.com/og-image.png.

export const STATIC_ROUTES_SEO = [
  // Homepage — left untouched per requirements (canonical & og already correct
  // in index.html). The prerender script SKIPS the homepage so its existing
  // <head> is preserved verbatim.

  // Core marketing
  {
    path: '/about',
    title: 'About Truficient Energy Solutions | Our Story',
    description:
      'Learn about Truficient Energy Solutions, your trusted HVAC partner in Dallas-Fort Worth with certified technicians and quality service.',
  },
  {
    path: '/contact',
    title: 'Contact Us | Truficient Energy Solutions',
    description:
      'Get in touch with Truficient Energy Solutions for HVAC service, quotes, or questions. Serving Dallas-Fort Worth area.',
  },
  {
    path: '/careers',
    title: 'Careers at Truficient Energy Solutions | HVAC Jobs DFW',
    description:
      'Join the Truficient Energy Solutions team. HVAC technician, installer, and support roles open across Dallas-Fort Worth.',
  },
  {
    path: '/financing',
    title: 'HVAC Financing Options | Truficient Energy Solutions',
    description:
      'Affordable financing for HVAC installation and repair. Flexible terms with approved credit. Serving Dallas-Fort Worth.',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Truficient Energy Solutions',
    description: 'How Truficient Energy Solutions collects, uses, and protects your personal information.',
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Truficient Energy Solutions',
    description: 'Terms governing the use of Truficient Energy Solutions services and website.',
  },

  // Services
  {
    path: '/services/residential',
    title: 'Residential HVAC Services Dallas-Fort Worth | Truficient',
    description:
      'Residential AC repair, installation, heating, and maintenance across Dallas-Fort Worth. Certified Truficient technicians.',
  },
  {
    path: '/services/commercial',
    title: 'Commercial HVAC Services Dallas-Fort Worth | Truficient',
    description:
      'Commercial HVAC for offices, retail, restaurants, and warehouses across Dallas-Fort Worth. Service contracts & installation.',
  },
  {
    path: '/services/ductless',
    title: 'Ductless Mini-Split Installation Dallas | Truficient',
    description:
      'Ductless mini-split design and installation for Dallas-Fort Worth homes. Mitsubishi-certified installers.',
  },
  {
    path: '/residential-services',
    title: 'Residential HVAC Services Dallas-Fort Worth | Truficient',
    description:
      'Residential AC repair, installation, heating, and maintenance across Dallas-Fort Worth. Certified Truficient technicians.',
  },
  {
    path: '/commercial-services',
    title: 'Commercial HVAC Services Dallas-Fort Worth | Truficient',
    description:
      'Commercial HVAC for offices, retail, restaurants, and warehouses across Dallas-Fort Worth. Service contracts & installation.',
  },

  // Service-area hubs
  {
    path: '/service-areas',
    title: 'HVAC Service Areas | Dallas-Fort Worth | Truficient',
    description:
      'See every neighborhood and city Truficient Energy Solutions serves across the Dallas-Fort Worth metroplex.',
  },
  {
    path: '/service-areas/dallas-area',
    title: 'Dallas Area HVAC Services | Truficient',
    description: 'HVAC service across the Dallas area — repair, installation, and maintenance by certified technicians.',
  },
  {
    path: '/service-areas/north-dallas-area',
    title: 'North Dallas HVAC Services | Truficient',
    description: 'HVAC service across North Dallas — repair, installation, and maintenance by certified technicians.',
  },
  {
    path: '/service-areas/south-dallas-area',
    title: 'South Dallas HVAC Services | Truficient',
    description: 'HVAC service across South Dallas — repair, installation, and maintenance.',
  },

  // Estimators / tools
  {
    path: '/hvac-estimate',
    title: 'Free HVAC Estimate | Truficient Energy Solutions',
    description: 'Get a free HVAC estimate for your Dallas-Fort Worth home. Ducted or ductless.',
  },
  {
    path: '/central-ac-estimate',
    title: 'Central AC Estimate | How We Quote | Truficient',
    description: 'How Truficient estimates central AC installs in DFW: Manual J load calc, ductwork & electrical review, equipment tiers. Request a free in-home estimate.',
  },
  {
    path: '/mini-split-estimate',
    title: 'Mini Split Estimate | How We Quote | Truficient',
    description: 'How Truficient estimates single-zone mini split installs in DFW: room load, line set, electrical, equipment tier. Request a free in-home estimate.',
  },
  {
    path: '/multi-zone-estimate',
    title: 'Multi-Zone Mini Split Estimate | How We Quote | Truficient',
    description: 'How Truficient estimates multi-zone ductless systems in DFW: per-zone Manual J, branch sizing, line routing. Request a free in-home estimate.',
  },
  {
    path: '/heat-pump-advantage',
    title: 'Heat Pump Advantage Calculator | Truficient',
    description: 'See how much a heat pump can save you over conventional heating in Dallas-Fort Worth.',
  },
  {
    path: '/estimators/sizing',
    title: 'HVAC Sizing Calculator | Truficient',
    description: 'Estimate the BTU/tonnage your home needs. Free Truficient sizing calculator.',
  },
  {
    path: '/estimators/cost',
    title: 'HVAC Cost Estimator | Truficient',
    description: 'Estimate HVAC installation cost for your Dallas-Fort Worth home.',
  },
  {
    path: '/estimators/savings',
    title: 'HVAC Savings Calculator | Truficient',
    description: 'See projected savings from a high-efficiency HVAC upgrade in Dallas-Fort Worth.',
  },
  {
    path: '/estimate/ductless',
    title: 'Free Ductless Mini-Split Estimate | Truficient',
    description: 'Get a free ductless mini-split estimate for your Dallas-Fort Worth home in minutes.',
  },
  {
    path: '/estimate/ducted',
    title: 'Free Ducted HVAC Estimate | Truficient',
    description: 'Get a free ducted HVAC system estimate for your Dallas-Fort Worth home in minutes.',
  },

  // Library / blog hubs (also in DB but kept as defensive fallback)
  { path: '/blog', title: 'HVAC Tips & News | Truficient Energy Solutions Blog', description: 'Read the latest HVAC tips, energy-saving advice, and news from Truficient Energy Solutions.' },
  { path: '/gallery', title: 'Project Gallery | Truficient Energy Solutions', description: 'Photos of recent Truficient HVAC installations and projects across Dallas-Fort Worth.' },
  { path: '/scanner', title: 'HVAC Equipment Scanner | Truficient', description: 'Scan your HVAC nameplate and instantly get specs, age, and replacement guidance.' },
  { path: '/equipment', title: 'HVAC Equipment Library | Truficient', description: 'Browse HVAC equipment specs, manuals, and documentation by brand and model.' },
];
