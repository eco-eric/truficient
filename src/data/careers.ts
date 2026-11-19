// Open roles shown on /careers and their own job pages.
//
// PAY, SCHEDULE AND BENEFITS ARE DELIBERATELY BLANK (null) in this draft.
// Fill them in before this ships. While `pay` is null, the page shows no pay
// line and the JobPosting schema omits baseSalary.

export interface JobOpening {
  slug: string;
  path: string;
  title: string;
  /** Value saved in job_applications.position for the default choice */
  shortTitle: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME';
  badge: string;
  summary: string;
  intro: string[];
  responsibilities: string[];
  requirements: string[];
  pay: string | null;
  schedule: string | null;
  benefits: string | null;
  datePosted: string;
  seoTitle: string;
  seoDescription: string;
}

export const JOB_OPENINGS: JobOpening[] = [
  {
    slug: 'mini-split-installer',
    path: '/careers/mini-split-installer',
    title: 'Mini-Split Installer, Full-Time',
    shortTitle: 'Mini-Split Installer',
    location: 'Dallas-Fort Worth, TX',
    employmentType: 'FULL_TIME',
    badge: 'Up to 4 openings',
    summary:
      'Install ductless mini-splits and multi-zone systems in homes across DFW. Hiring lead installers, mid-level installers and helpers ready to learn.',
    intro: [
      'Truficient is a Mitsubishi Diamond Contractor in Dallas-Fort Worth. We install high-efficiency ductless mini-splits and multi-zone systems in homes: garage conversions, ADUs, bonus rooms, sunrooms, additions and new construction. We have more than 1,000 installs behind us, our schedule is full, and we are hiring up to four full-time installers.',
      'We are hiring at more than one level, from experienced lead installers to helpers who are ready to learn. Installs are quick, usually a few hours each, and we train you on our way of doing them.',
    ],
    responsibilities: [
      'Install ductless mini-split and multi-zone systems in homes across DFW as part of a small crew',
      'Mount indoor heads and outdoor units, run and wrap line sets, and make clean, sealed connections',
      'Torque every flare connection, pressure test with nitrogen, pull a deep vacuum and confirm it holds',
      'Charge systems by weight and record any line-set additions',
      'Take job photos and notes on your phone in our app so every install is documented',
      'Leave the home clean and walk the homeowner through their new system',
    ],
    requirements: [
      'HVAC install experience for lead and mid-level roles. No experience needed for helper roles if you are handy, reliable and want to learn the trade',
      'Pride in neat, careful work. We care about installs that never need a callback',
      'Comfort using a smartphone app for photos, notes and checklists',
      'TDLR air conditioning technician registration, or willingness to register',
      'EPA 608 certification is a plus',
      'Bilingual English and Spanish is a plus',
    ],
    pay: null,
    schedule: null,
    benefits: null,
    datePosted: '2026-11-18',
    seoTitle: 'Mini-Split Installer Jobs in Dallas-Fort Worth | Truficient',
    seoDescription:
      'Full-time mini-split installer jobs in DFW with a Mitsubishi Diamond Contractor. Hiring lead installers, mid-level installers and helpers. Apply online.',
  },
  {
    slug: 'hvac-service-technician',
    path: '/careers/hvac-service-technician',
    title: 'Experienced HVAC Service Technician',
    shortTitle: 'HVAC Service Technician',
    location: 'Dallas-Fort Worth, TX',
    employmentType: 'FULL_TIME',
    badge: 'Interviewing now',
    summary:
      'Diagnose and repair ductless, multi-zone and ducted residential systems, and commission new installs. 3+ years of service experience.',
    intro: [
      'Truficient is a Mitsubishi Diamond Contractor in Dallas-Fort Worth specializing in high-efficiency ductless mini-splits and multi-zone systems. We are growing and adding an experienced service technician to work alongside our senior tech.',
      'We are interviewing now and taking our time to find the right person.',
    ],
    responsibilities: [
      'Diagnose and repair ductless, multi-zone and ducted residential systems',
      'Handle service calls, warranty work and maintenance visits',
      'Commission new installs and fix problems before the crew leaves the job',
      'Back up the install crews when the schedule calls for it',
      'Document each visit on your phone with photos, readings and notes in our app',
      'Explain problems and options to homeowners in plain language',
    ],
    requirements: [
      '3 or more years of residential HVAC service experience',
      'EPA 608 certification (Universal or Type II)',
      'TDLR air conditioning technician registration. TDLR Certified Technician is a plus',
      'Experience with inverter mini-splits and multi-zone systems. Mitsubishi experience is a strong plus',
      'NATE certification is a plus',
      'Able to read wiring diagrams, zone boards and install manuals',
      'Comfort using a smartphone app for documentation',
      'Bilingual English and Spanish is a plus',
    ],
    pay: null,
    schedule: null,
    benefits: null,
    datePosted: '2026-11-18',
    seoTitle: 'HVAC Service Technician Jobs in Dallas-Fort Worth | Truficient',
    seoDescription:
      'Experienced HVAC service technician job in DFW with a Mitsubishi Diamond Contractor. Ductless and multi-zone service, 3+ years experience. Apply online.',
  },
];

/** Options for the application form's position field (saved as job_applications.position). */
export const POSITION_OPTIONS = [
  'Mini-Split Installer - Lead',
  'Mini-Split Installer - Mid-Level',
  'Mini-Split Installer - Helper',
  'HVAC Service Technician',
] as const;

export const HIRING_STEPS = [
  { title: 'Apply online', description: 'A short application. A resume helps but is not required.' },
  { title: 'Phone call', description: 'A quick call about your experience and when you can start.' },
  { title: 'Interview', description: 'Meet with our team and talk through real jobs and how you would handle them.' },
  { title: 'Ride-along or working interview', description: 'Spend part of a day on the job with our crew.' },
];

export const getJobBySlug = (slug: string) => JOB_OPENINGS.find((job) => job.slug === slug);
