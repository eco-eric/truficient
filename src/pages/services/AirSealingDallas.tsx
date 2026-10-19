import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  ArrowRight,
  Wind,
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePageSEO } from '@/hooks/usePageSEO';

const PHONE = '214-238-4349';
const PHONE_TEL = 'tel:2142384349';
const CANONICAL = 'https://truficient.com/air-sealing-dallas-tx/';

// --- Content data ----------------------------------------------------------

const STATS = [
  { value: '15%', label: 'Average savings on heating & cooling from air sealing plus insulation', source: 'ENERGY STAR' },
  { value: '20–30%', label: 'Air in a typical duct system lost to leaks and poor installation', source: 'ENERGY STAR' },
  { value: '130–140°F', label: 'Typical Dallas attic by mid-afternoon in July', source: 'NWS / field readings' },
  { value: '5 ACH50', label: 'Maximum air leakage allowed for new homes under Dallas’s 2021 energy code', source: 'City of Dallas' },
];

// 8 leak points — numbers match the markers in the SVG diagram.
const LEAK_POINTS = [
  { n: 1, point: 'Attic top plates and wall cavities', why: 'Open tops of interior walls connect the 130°F attic to your rooms' },
  { n: 2, point: 'Recessed (can) lights', why: 'Non-airtight cans are chimneys into the attic' },
  { n: 3, point: 'Attic hatch or pull-down stairs', why: 'Usually unweatherstripped and uninsulated' },
  { n: 4, point: 'Plumbing, wiring, and flue penetrations', why: 'Holes drilled through the ceiling and top plates are rarely sealed' },
  { n: 5, point: 'HVAC return platform and plenum', why: 'A leaky return pulls attic or garage air straight into the system' },
  { n: 6, point: 'Duct connections and register boots', why: 'Gaps where the boot meets drywall leak conditioned air into the attic' },
  { n: 7, point: 'Exhaust fans and dryer vents', why: 'Missing or stuck dampers let outside air in' },
  { n: 8, point: 'Doors, windows, and the garage wall', why: 'Worn weatherstripping and unsealed garage-to-house walls' },
];

const STEPS = [
  { title: 'Test-in', body: 'We run a blower door test to measure how leaky the house is and a Minneapolis Duct Blaster test to measure duct leakage, so you get a starting number.' },
  { title: 'Find the leaks', body: 'With the house under pressure, we trace leaks in the attic, at the return, and around ceiling penetrations.' },
  { title: 'Seal the attic floor', body: 'Top plates, penetrations, chases, and the attic hatch get sealed with the right material for each gap.' },
  { title: 'Seal the duct system', body: 'We seal every accessible connection: around the connections at the unit, every duct connection we can reach in the attic, and every boot and register to the drywall.' },
  { title: 'Test-out', body: 'We re-run the Duct Blaster (and the blower door on whole-home jobs) to verify the improvement. You see before-and-after numbers.' },
  { title: 'Check ventilation and safety', body: 'A tighter home needs working exhaust fans, and homes with gas appliances get a combustion safety check after sealing.' },
];

const MATERIALS = [
  { gap: 'Duct seams and joints', material: 'Duct mastic; UL 181 foil or butyl tape' },
  { gap: 'Small gaps under ¼"', material: 'Caulk' },
  { gap: 'Larger penetrations', material: 'Low-expansion spray foam' },
  { gap: 'Flues and chimney chases', material: 'Sheet metal with high-temperature, fire-rated sealant' },
  { gap: 'Attic hatch', material: 'Weatherstripping plus a rigid foam cover' },
  { gap: 'Never', material: 'Cloth “duct tape” — it fails in attic heat' },
];

const COMPARE = [
  { what: 'Air sealing', stops: 'Air moving through gaps', where: 'Attic floor, walls, penetrations', best: 'Drafts, humidity, dust, hot rooms' },
  { what: 'Insulation', stops: 'Heat conducting through surfaces', where: 'Attic floor, walls', best: 'Low or thin attic insulation' },
  { what: 'Duct sealing', stops: 'Conditioned air leaking from ducts', where: 'Ducts, returns, boots', best: 'High bills, weak airflow, dusty house' },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How much can air sealing save in Dallas?',
    a: 'ENERGY STAR estimates an average of 15% on heating and cooling costs when air sealing is paired with insulation, or about 11% of total energy costs. Dallas homes with leaky attics and attic ductwork often see the biggest gains because cooling is the largest share of the bill.',
  },
  {
    q: 'Is air sealing worth it in a hot climate like Dallas?',
    a: 'Yes. In Dallas the leaks pull in 130°F-plus attic air and humid outdoor air for months at a time. Sealing them cuts both the heat and the moisture your AC has to remove.',
  },
  {
    q: 'Can a house be sealed too tight?',
    a: 'Not with proper ventilation. Building scientists summarize it as “build tight, ventilate right.” We check that bath and kitchen exhaust fans work, and homes with gas appliances get a combustion safety check after sealing.',
  },
  {
    q: 'Do I need a blower door test?',
    a: 'It’s the only way to know how leaky a house is and to prove the work made a difference. We test before and after so you see the numbers.',
  },
  {
    q: 'Is there a federal tax credit for air sealing in 2026?',
    a: 'No. The federal Energy Efficient Home Improvement Credit (25C), which covered air sealing materials, does not apply to work placed in service after December 31, 2025, according to the IRS.',
  },
  {
    q: 'How long does air sealing take?',
    a: 'Most single-family homes take one day, including testing. Larger homes or jobs combined with duct repair can take two.',
  },
  {
    q: 'Will air sealing help with humidity?',
    a: 'Yes. Less outside air leaking in means less moisture for your AC to remove. Pair it with a properly sized, variable-speed system for the best humidity control.',
  },
  {
    q: 'Can I air seal my home myself?',
    a: 'You can caulk and weatherstrip doors and windows yourself. Attic work in Dallas summer heat, around wiring and flues, is safer and more effective with a pro, and only testing confirms the result.',
  },
];

const RELATED = [
  { href: '/duct-sealing-assessment-dallas/', title: 'Duct sealing and assessment in Dallas', desc: 'A full evaluation of attic duct leakage and the fix.' },
  { href: '/home-energy-audit-north-dallas/', title: 'Home energy audit in North Dallas', desc: 'Find where your home loses energy, room by room.' },
  { href: '/indoor-air-quality-dallas-tx/', title: 'Indoor air quality in Dallas', desc: 'How a tighter envelope and filtration clean up your air.' },
  { href: '/heat-pump-installation-dallas-tx/', title: 'Heat pump installation in Dallas', desc: 'Pair a sealed home with a right-sized, efficient system.' },
];

// --- JSON-LD @graph --------------------------------------------------------

const JSON_LD_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HVACBusiness',
      '@id': 'https://truficient.com/#organization',
      name: 'Truficient Energy Solutions',
      url: 'https://truficient.com',
      telephone: PHONE,
    },
    {
      '@type': 'Service',
      '@id': `${CANONICAL}#service`,
      serviceType: 'Air sealing and weatherization',
      provider: { '@id': 'https://truficient.com/#organization' },
      areaServed: { '@type': 'City', name: 'Dallas, TX' },
      url: CANONICAL,
    },
    {
      '@type': 'FAQPage',
      '@id': `${CANONICAL}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://truficient.com/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://truficient.com/services/residential/' },
        { '@type': 'ListItem', position: 3, name: 'Air Sealing & Weatherization', item: CANONICAL },
      ],
    },
  ],
};

// --- Leak-point diagram (accessible inline SVG) ----------------------------

function LeakPointDiagram() {
  const markers = [
    { n: 1, x: 155, y: 176 }, // top plate / wall cavity (at the ceiling plane)
    { n: 2, x: 230, y: 185 }, // recessed light
    { n: 3, x: 110, y: 120 }, // attic hatch
    { n: 4, x: 185, y: 120 }, // penetrations
    { n: 5, x: 270, y: 210 }, // return platform
    { n: 6, x: 205, y: 215 }, // register boot
    { n: 7, x: 300, y: 150 }, // exhaust / dryer vent
    { n: 8, x: 95, y: 215 },  // doors / garage wall
  ];
  return (
    <svg
      viewBox="0 0 360 300"
      className="w-full h-auto"
      role="img"
      aria-label="Cross-section of a Dallas home showing eight common air-leak points: 1 attic top plates and wall cavities, 2 recessed can lights, 3 attic hatch or pull-down stairs, 4 plumbing, wiring and flue penetrations, 5 HVAC return platform and plenum, 6 duct connections and register boots, 7 exhaust fans and dryer vents, and 8 doors, windows and the garage wall."
    >
      {/* sky */}
      <rect x="0" y="0" width="360" height="300" fill="hsl(var(--muted))" />
      {/* roof */}
      <polygon points="180,20 340,110 20,110" fill="hsl(var(--navy))" />
      {/* attic band */}
      <polygon points="180,20 340,110 20,110" fill="none" />
      <rect x="40" y="110" width="280" height="55" fill="hsl(var(--gold) / 0.25)" stroke="hsl(var(--navy))" strokeWidth="1.5" />
      <text x="180" y="143" textAnchor="middle" fontSize="13" fontWeight="700" fill="hsl(var(--navy))">
        ATTIC · 130–140°F
      </text>
      {/* living space */}
      <rect x="40" y="165" width="280" height="110" fill="hsl(var(--background))" stroke="hsl(var(--navy))" strokeWidth="1.5" />
      <text x="180" y="255" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">
        Living space
      </text>
      {/* garage divider */}
      <line x1="120" y1="165" x2="120" y2="275" stroke="hsl(var(--border))" strokeWidth="1.5" />
      {/* numbered markers */}
      {markers.map((m) => (
        <g key={m.n}>
          <circle cx={m.x} cy={m.y} r="12" fill="hsl(var(--gold))" stroke="hsl(var(--navy))" strokeWidth="1.5" />
          <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(var(--navy))">
            {m.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

// --- Placeholder for a real blower-door job photo (no stock imagery) -------

function BlowerDoorPhotoPlaceholder() {
  // TODO: replace with a real blower-door job photo from a Dallas air-sealing
  // job once one is available. Do NOT use stock imagery here.
  return (
    <div
      className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/40 bg-white/5 p-6 text-center"
      aria-hidden="true"
    >
      <Wind className="h-10 w-10 text-gold" />
      <span className="text-sm font-medium text-white/80">
        Blower-door job photo coming soon
      </span>
    </div>
  );
}

const AirSealingDallas = () => {
  usePageSEO();

  // Page-specific SEO that the SSG prerender's head-rewrite does NOT supply
  // from the static-route config: the robots directive and the JSON-LD @graph.
  // Title / description / canonical / OG come from static-routes-seo.mjs and are
  // written into the prerendered <head> at build time.
  useEffect(() => {
    const prevRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'index, follow, max-image-preview:large');

    const schemaId = 'air-sealing-jsonld';
    document.getElementById(schemaId)?.remove();
    const script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(JSON_LD_GRAPH);
    document.head.appendChild(script);

    return () => {
      document.getElementById(schemaId)?.remove();
      if (prevRobots !== null) {
        document.querySelector('meta[name="robots"]')?.setAttribute('content', prevRobots);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" data-ssg-ready="true">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/services/residential/">Services</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Air Sealing &amp; Weatherization</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero */}
        <section className="bg-navy text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                  Air Sealing &amp; Weatherization in Dallas, TX
                </h1>
                <p className="text-lg text-white/85 mb-6 leading-relaxed">
                  Air sealing closes the hidden gaps between your living space and your attic,
                  walls, and ductwork so Dallas summer heat and humidity stay outside. Truficient
                  finds the leaks, seals them, and proves the result with blower door and Duct
                  Blaster testing.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-dark font-semibold">
                    <Link to="/hvac-estimate">
                      Request an Air Sealing Assessment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-navy font-semibold">
                    <a href={PHONE_TEL}>
                      <Phone className="w-5 h-5 mr-2" />
                      Call {PHONE}
                    </a>
                  </Button>
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /> Tested before and after</li>
                  <li className="flex items-center gap-1.5"><Award className="w-4 h-4 text-gold" /> Mitsubishi Diamond Contractor</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-gold" /> TACLB77247C</li>
                </ul>
              </div>
              <div className="hidden lg:block">
                <BlowerDoorPhotoPlaceholder />
              </div>
            </div>
          </div>
        </section>

        {/* What Is Air Sealing? */}
        <section className="py-14 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">What Is Air Sealing?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Air sealing (the core of home weatherization) means finding and closing the openings
              that let unconditioned air move into and out of your home: gaps around attic
              penetrations, recessed lights, the attic hatch, plumbing and wiring holes, the HVAC
              return, and the ductwork itself.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Insulation slows heat moving through a surface. Air sealing stops air moving through
              the gaps. In Dallas you need both — but sealing comes first, because insulation does
              little when attic air is blowing straight through it.
            </p>
            <div className="border-l-4 border-gold bg-muted rounded-r-lg p-5">
              <p className="text-foreground font-medium">
                ENERGY STAR estimates that all the leaks in a typical home add up to the equivalent
                of <strong>leaving a window open every day of the year</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Why Dallas Summers Make Air Leaks So Expensive */}
        <section className="py-14 md:py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Why Dallas Summers Make Air Leaks So Expensive
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {STATS.map((s) => (
                <Card key={s.value} className="bg-card h-full">
                  <CardContent className="p-5 text-center flex flex-col h-full">
                    <div className="text-2xl md:text-3xl font-bold text-navy mb-2">{s.value}</div>
                    <p className="text-sm text-muted-foreground flex-1">{s.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-3 italic">Source: {s.source}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ul className="space-y-4 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Your attic is an oven.</strong> By mid-afternoon
                in July, a Dallas attic routinely sits at 130–140°F. Every leak in the ceiling plane
                pulls that air toward your living space.
              </li>
              <li>
                <strong className="text-foreground">Summer is long.</strong> DFW’s first 100°F day
                arrives on July 1 on average, and the record is 71 triple-digit days (2011), per the
                National Weather Service.
              </li>
              <li>
                <strong className="text-foreground">Leaks bring in water, not just heat.</strong>{' '}
                Outdoor air in a Dallas summer carries a lot of moisture. Infiltration adds that
                moisture to your home, so your AC has to remove it — one reason a house can feel
                clammy at 73°F. See{' '}
                <Link to="/humidity-dehumidification-dallas-hvac/" className="text-primary font-medium hover:underline">
                  why Dallas homes feel humid even with the AC on
                </Link>.
              </li>
              <li>
                <strong className="text-foreground">Your AC can’t keep up on the hottest days.</strong>{' '}
                A system sized for a sealed house falls behind when it’s also cooling attic air, which
                shows up as{' '}
                <Link to="/hot-spots-home-dallas-tx-summer/" className="text-primary font-medium hover:underline">
                  hot rooms
                </Link>{' '}
                and{' '}
                <Link to="/high-electric-bill-summer-dallas-tx/" className="text-primary font-medium hover:underline">
                  summer bills that spike
                </Link>.
              </li>
              <li>
                <strong className="text-foreground">Heat islands make it worse.</strong> Dense
                neighborhoods with less tree cover stay hotter overnight, so homes never get a
                cool-down break. See{' '}
                <Link to="/hvac-sizing-dallas-heat-island/" className="text-primary font-medium hover:underline">
                  how heat islands affect HVAC sizing in Dallas
                </Link>.
              </li>
            </ul>
          </div>
        </section>

        {/* Where Dallas Homes Leak */}
        <section className="py-14 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Where Dallas Homes Leak</h2>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="rounded-2xl border border-border bg-card p-4">
                <LeakPointDiagram />
              </div>
              <div className="min-w-0 overflow-auto max-h-[460px] rounded-2xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-navy text-white sticky top-0">
                    <tr>
                      <th className="px-3 py-3 font-semibold w-10">#</th>
                      <th className="px-3 py-3 font-semibold">Leak point</th>
                      <th className="px-3 py-3 font-semibold">Why it matters in Dallas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEAK_POINTS.map((row, i) => (
                      <tr key={row.n} className={i % 2 ? 'bg-muted/40' : 'bg-card'}>
                        <td className="px-3 py-3 align-top font-bold text-navy">{row.n}</td>
                        <td className="px-3 py-3 align-top font-medium text-foreground">{row.point}</td>
                        <td className="px-3 py-3 align-top text-muted-foreground">{row.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mt-12 mb-6">By housing era</h3>
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h4 className="font-bold text-foreground mb-2">1950s–60s ranch homes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    (Lakewood, Lake Highlands, Casa View, Oak Cliff): open wall tops, original
                    ceilings with many penetrations, and later-added ductwork.
                  </p>
                  <p className="text-sm">
                    See{' '}
                    <Link to="/hvac-1950s-ranch-home-dallas/" className="text-primary font-medium hover:underline">
                      HVAC for 1950s Dallas ranch homes
                    </Link>{' '}
                    and{' '}
                    <Link to="/east-dallas-lakewood-heat-island-hvac/" className="text-primary font-medium hover:underline">
                      East Dallas and Lakewood heat island conditions
                    </Link>.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h4 className="font-bold text-foreground mb-2">1970s–2000s suburban homes</h4>
                  <p className="text-sm text-muted-foreground">
                    (Richardson, Plano, Garland, Mesquite): flex duct runs in the attic, recessed
                    lights, and platform returns built from framing and drywall.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h4 className="font-bold text-foreground mb-2">Newer homes (2016 and later)</h4>
                  <p className="text-sm text-muted-foreground">
                    Tested at construction, but leaks still open up when other trades cut new holes
                    later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Your Ducts Are Part of the Envelope */}
        <section className="py-14 md:py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">Your Ducts Are Part of the Envelope</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              In most Dallas homes the ductwork runs through the attic. A leaky duct system is an air
              leak, and often the biggest one in the house.
            </p>
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-3">What improperly installed ducts cause</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Comfort problems: rooms that never reach the set temperature</li>
                    <li>Moisture and mold, when cold ducts sweat in a humid attic — especially where insulation has fallen off the duct</li>
                    <li>Noise from undersized ducts</li>
                    <li>A system that works harder and wears out sooner</li>
                    <li>Dust and attic debris pulled into the system and blown through the house</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-3">Return size and sealing</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Without enough airflow, a system can’t deliver its rated SEER2 efficiency or capacity.</li>
                    <li>A leaky return adds load, so the system struggles to cool and runs under more stress.</li>
                    <li>Leaks after the filter pull unfiltered attic dust onto the evaporator coil and blower motor, cutting efficiency.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card h-full">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-3">Metal vs. flex duct</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Sheet-metal duct moves air better. Flex duct’s inner wire coil creates friction, so a flex run behaves like a longer duct.</li>
                    <li>Metal costs more in materials and labor.</li>
                    <li>Flex duct that isn’t pulled fully taut before it’s cut stays compressed, which raises pressure and friction. Every turn and bend adds resistance.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              For a full duct evaluation, see{' '}
              <Link to="/duct-sealing-assessment-dallas/" className="text-primary font-medium hover:underline">
                duct sealing and assessment in Dallas
              </Link>{' '}
              and{' '}
              <Link to="/duct-loss-dallas-hvac-attic/" className="text-primary font-medium hover:underline">
                how much cooling Dallas homes lose through attic ducts
              </Link>.
            </p>
          </div>
        </section>

        {/* How Truficient Seals a Dallas Home */}
        <section className="py-14 md:py-16 bg-navy text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">How Truficient Seals a Dallas Home</h2>
            <ol className="grid md:grid-cols-2 gap-x-8 gap-y-7">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gold text-navy font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Materials + Comparison tables */}
        <section className="py-14 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Materials We Use (and Avoid)</h2>
                <div className="min-w-0 overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-3 py-3 font-semibold">Gap</th>
                        <th className="px-3 py-3 font-semibold">Material</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MATERIALS.map((row, i) => (
                        <tr key={row.gap} className={i % 2 ? 'bg-muted/40' : 'bg-card'}>
                          <td className="px-3 py-3 align-top font-medium text-foreground whitespace-nowrap">{row.gap}</td>
                          <td className="px-3 py-3 align-top text-muted-foreground">{row.material}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Air Sealing vs. Insulation vs. Duct Sealing
                </h2>
                <div className="min-w-0 overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-3 py-3 font-semibold"></th>
                        <th className="px-3 py-3 font-semibold">What it stops</th>
                        <th className="px-3 py-3 font-semibold">Where</th>
                        <th className="px-3 py-3 font-semibold">Best for</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE.map((row, i) => (
                        <tr key={row.what} className={i % 2 ? 'bg-muted/40' : 'bg-card'}>
                          <td className="px-3 py-3 align-top font-bold text-navy whitespace-nowrap">{row.what}</td>
                          <td className="px-3 py-3 align-top text-muted-foreground">{row.stops}</td>
                          <td className="px-3 py-3 align-top text-muted-foreground">{row.where}</td>
                          <td className="px-3 py-3 align-top text-muted-foreground">{row.best}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-8 max-w-3xl">
              Most Dallas homes get the best results doing all three in order: seal, then insulate,
              then confirm the duct system is tight. Read more in our{' '}
              <Link to="/blog/guide-to-insulation-for-your-home-types-benefits-and-costs/" className="text-primary font-medium hover:underline">
                guide to home insulation types and costs
              </Link>.
            </p>
          </div>
        </section>

        {/* When Air Sealing Is the Right Fix — and When It Isn't */}
        <section className="py-14 md:py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              When Air Sealing Is the Right Fix — and When It Isn’t
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">Air sealing is a strong fit when:</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {[
                      'Some rooms are always hotter than others',
                      'The house feels humid or clammy even with the AC running',
                      'Dust builds up quickly after cleaning',
                      'Summer bills are high for the home’s size',
                      'You’re about to replace your AC or heat pump',
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">It won’t solve:</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <span>
                        An AC that’s failing or low on refrigerant — that’s a{' '}
                        <Link to="/ac-repair-dallas-tx/" className="text-primary font-medium hover:underline">repair</Link>{' '}
                        or{' '}
                        <Link to="/hvac-replacement-dallas-tx/" className="text-primary font-medium hover:underline">replacement</Link>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <span>A badly oversized or undersized system on its own</span>
                    </li>
                    <li className="flex gap-2">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <span>Water intrusion from roof or plumbing leaks</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="border-l-4 border-gold bg-card rounded-r-lg p-6">
              <h3 className="font-bold text-foreground mb-2">Seal Before You Replace Your AC</h3>
              <p className="text-muted-foreground leading-relaxed">
                A new high-efficiency system connected to a leaky house and leaky ducts won’t perform
                as rated. Sealing first can also reduce the load — sometimes enough to change the size
                of system you need. If you’re getting a replacement quote from Truficient, ask for an
                air sealing and duct assessment at the same visit.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
                  <AccordionContent forceMount className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-14 md:py-16 bg-muted">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Related Resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {RELATED.map((r) => (
                <Link key={r.href} to={r.href} className="group">
                  <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40">
                    <CardContent className="p-5 flex flex-col h-full">
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary">{r.title}</h3>
                      <p className="text-sm text-muted-foreground flex-1">{r.desc}</p>
                      <span className="text-primary text-sm font-medium mt-3 inline-flex items-center">
                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA band */}
        <section className="py-14 md:py-16 bg-navy text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Get an Air Sealing Assessment</h2>
            <p className="text-white/85 mb-8 leading-relaxed">
              Find your leaks, seal them, and get before-and-after numbers that prove the result.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-dark font-semibold">
                <a href={PHONE_TEL}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-navy font-semibold">
                <Link to="/hvac-estimate">
                  Request an assessment online
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/70">Truficient Energy Solutions · TACLB77247C</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AirSealingDallas;
