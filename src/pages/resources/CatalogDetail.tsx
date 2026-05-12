import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, CheckCircle2, ChevronRight, Info, MapPin, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";

interface CatalogMeta {
  title: string;
  brand: string;
  pdfFile: string;
  pages: string;
  sizeMb: string;
  updated: string;
  badge: string;
  badgeStyle?: "solid" | "outline";
  breadcrumbLabel: string;
}

const KNOWN_CATALOGS: Record<string, CatalogMeta> = {
  "mitsubishi-m-p-series-2026": {
    title: "Mitsubishi Electric — M & P Series",
    brand: "Mitsubishi Electric",
    pdfFile: "mitsubishi-m-p-series-2026.pdf",
    pages: "150 pages",
    sizeMb: "~8 MB",
    updated: "Updated Sept 2025",
    badge: "Diamond Contractor",
    badgeStyle: "solid",
    breadcrumbLabel: "Mitsubishi M & P Series 2026",
  },
  "goodman-sd-side-discharge": {
    title: "Goodman SD — Side Discharge Inverter Systems",
    brand: "Goodman",
    pdfFile: "goodman-sd-side-discharge.pdf",
    pages: "28 pages",
    sizeMb: "~2 MB",
    updated: "2025 Catalog",
    badge: "What We Install",
    badgeStyle: "outline",
    breadcrumbLabel: "Goodman SD Side Discharge",
  },
  "daikin-one-touch-thermostat": {
    title: "Daikin ONE Touch Smart Thermostat",
    brand: "Daikin",
    pdfFile: "daikin-one-touch-thermostat.pdf",
    pages: "2 pages",
    sizeMb: "~1.3 MB",
    updated: "2025 Brochure",
    badge: "Smart Controls",
    badgeStyle: "outline",
    breadcrumbLabel: "Daikin ONE Touch Thermostat",
  },
  "bosch-ids-family": {
    title: "Bosch IDS — Inverter Ducted Split Family",
    brand: "Bosch",
    pdfFile: "bosch-ids-family.pdf",
    pages: "24 pages",
    sizeMb: "~22 MB",
    updated: "2025 Catalog",
    badge: "Inverter Specialist",
    badgeStyle: "outline",
    breadcrumbLabel: "Bosch IDS Family",
  },
};

const MITSUBISHI_SECTIONS = [
  "INVERTER advantage and core technology",
  "intelli-AIR™ ducted solutions",
  "SMART MULTI® (MXZ-SM) multi-zone systems",
  "SVZ ducted air handlers",
  "PEAD low-static commercial ducted units",
  "MSZ residential wall-mounted units (FX, GX, EX, HX, WX, JX series)",
  "MFZ floor-mounted indoor units",
  "EZ FIT® (MLZ) ceiling cassettes",
  "SLZ commercial ceiling cassettes",
  "PKA wall-mounted commercial units",
  "SUZ universal outdoor units",
  "MXZ multi-zone outdoor units",
  "Residential and commercial controls",
  "Piping installation specs and capacity tables",
];

const CatalogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const catalog = slug ? KNOWN_CATALOGS[slug] : undefined;

  usePageSEO(`/resources/catalogs/${slug ?? ""}`, { skipGlobalSchema: true });
  const { trackButtonClick } = useButtonTracking();

  if (!catalog || !slug) {
    return <Navigate to="/resources/catalogs" replace />;
  }

  const pdfUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/catalogs/${catalog.pdfFile}`;

  if (typeof document !== "undefined") {
    if (slug === "goodman-sd-side-discharge") {
      document.title = "Goodman SD Side Discharge Catalog | Truficient HVAC";
    } else if (slug === "daikin-one-touch-thermostat") {
      document.title = "Daikin ONE Touch Smart Thermostat | Truficient HVAC";
    } else if (slug === "bosch-ids-family") {
      document.title = "Bosch IDS Inverter Heat Pump Catalog | Truficient HVAC";
    } else {
      document.title = `${catalog.brand === "Mitsubishi Electric" ? "Mitsubishi M & P Series Catalog 2026" : catalog.title} | Truficient HVAC`;
    }
  }

  const isGoodman = slug === "goodman-sd-side-discharge";
  const isDaikin = slug === "daikin-one-touch-thermostat";
  const isBosch = slug === "bosch-ids-family";

  return (
    <>
      <Header />
      <main>
        {/* Breadcrumb */}
        <nav className="container mx-auto px-4 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <Link to="/" className="hover:text-foreground">Resources</Link>
            </li>
            <ChevronRight className="w-3 h-3" />
            <li>
              <Link to="/resources/catalogs" className="hover:text-foreground">Catalogs</Link>
            </li>
            <ChevronRight className="w-3 h-3" />
            <li className="text-foreground font-medium">{catalog.breadcrumbLabel}</li>
          </ol>
        </nav>

        {isBosch ? (
          <BoschContent pdfUrl={pdfUrl} trackButtonClick={trackButtonClick} catalog={catalog} />
        ) : isGoodman ? (
          <GoodmanContent pdfUrl={pdfUrl} trackButtonClick={trackButtonClick} catalog={catalog} />
        ) : isDaikin ? (
          <DaikinContent pdfUrl={pdfUrl} trackButtonClick={trackButtonClick} catalog={catalog} />
        ) : (
          <MitsubishiContent pdfUrl={pdfUrl} trackButtonClick={trackButtonClick} catalog={catalog} />
        )}
      </main>
      <Footer />
    </>
  );
};

type SectionProps = {
  pdfUrl: string;
  trackButtonClick: ReturnType<typeof useButtonTracking>["trackButtonClick"];
  catalog: CatalogMeta;
};

const MitsubishiContent = ({ pdfUrl, trackButtonClick, catalog }: SectionProps) => (
  <>
    {/* Hero */}
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold tracking-widest text-secondary mb-3">2026 CATALOG</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{catalog.title}</h1>
        <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
          The complete 2026 catalog for Mitsubishi's residential M-Series and commercial P-Series ductless and ducted inverter systems.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">{catalog.badge}</Badge>
          <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
            {catalog.pages}
          </Badge>
          <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
            {catalog.updated}
          </Badge>
        </div>
      </div>
    </section>

    {/* Content */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-10">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">What's Inside</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Mitsubishi's 2026 M & P Series catalog covers their full lineup of inverter-driven heating and cooling equipment, from single-zone wall-mounted ductless units to multi-zone systems and commercial ducted air handlers. It's the same reference our techs use when sizing and specifying equipment for your home.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Sections covered</h3>
            <ul className="space-y-3">
              {MITSUBISHI_SECTIONS.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <DownloadSidebar
            pdfUrl={pdfUrl}
            trackButtonClick={trackButtonClick}
            sizeLabel={`PDF, ${catalog.pages.replace(" pages", "")} pages, ${catalog.sizeMb}`}
            pdfFile={catalog.pdfFile}
            heading="Download the Catalog"
            considerHeading="Need help choosing?"
            trackPrefix="Mitsubishi Catalog"
          />
        </div>
      </div>
    </section>

    {/* PDF embed */}
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Browse the catalog</h2>
        <div className="max-w-5xl mx-auto">
          <div className="aspect-[8.5/11] w-full rounded-lg border shadow-md overflow-hidden bg-background">
            <iframe src={pdfUrl} className="w-full h-full" title="Mitsubishi M & P Series Catalog 2026" />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Having trouble viewing? Download the PDF using the button above.
          </p>
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="bg-primary text-primary-foreground py-12 text-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl font-bold mb-3">Ready to install a Mitsubishi system?</h2>
        <p className="text-primary-foreground/80 mb-8">
          We're a Mitsubishi Diamond Contractor with hundreds of installs across DFW.
        </p>
        <BottomCTAButtons trackButtonClick={trackButtonClick} location="Catalog Detail - Bottom CTA" estimatePath="/estimate/ductless" secondaryLabel="See Our Work" secondaryPath="/gallery" />
      </div>
    </section>
  </>
);

const GoodmanContent = ({ pdfUrl, trackButtonClick, catalog }: SectionProps) => {
  const whereItFits = [
    "Zero-lot-line homes and tight side-yards",
    "Patios, balconies, and rooftop installs",
    "Wall-mount or traditional pad — only 4\" of clearance required",
    "Existing ductwork — designed to work with what's already in the home",
    "Up to 100 linear feet of line set for flexible placement",
  ];

  const keyFeatures = [
    "R-32 refrigerant — current EPA-compliant lower-GWP system",
    "Variable-speed digitally commutated condenser fan",
    "Proprietary swing compressor for higher efficiency and lower wear",
    "Blue Fin corrosion-coated coil with 1000-hour salt spray rating",
    "7mm coil for compact heat exchange",
    "Inverter board cooled by refrigerant circuit (model-specific)",
    "Intelligent Defrost Mode (heat pump models)",
    "Hot Start eliminates cold drafts on heating startup",
    "Quiet Mode for additional acoustical comfort",
    "Compatible with the Goodman GTST connected thermostat (Wi-Fi, Alexa, Google Assistant)",
  ];

  const models = [
    { type: "AC", model: "GXV6S", capacities: "1.5, 2, 2.5, 3, 3.5, 4, 5 ton", upTo: "17.2 SEER2" },
    { type: "AC (premium)", model: "GXV9S", capacities: "2, 3, 4, 5 ton", upTo: "19.0 SEER2" },
    { type: "Heat Pump", model: "GZV6S", capacities: "1.5, 2, 2.5, 3, 3.5, 4, 5 ton", upTo: "19.0 SEER2 / 8.8 HSPF2" },
    { type: "Heat Pump (premium)", model: "GZV7S", capacities: "2, 3, 3.5, 4, 5 ton", upTo: "19.0 SEER2 / 8.8 HSPF2, ENERGY STAR Cold Climate, Most Efficient 2025" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest text-secondary mb-3">THE GOODMAN LINE WE INSTALL</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Goodman SD — Side Discharge Inverter Systems</h1>
          <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
            The side-discharge inverter line we install for Goodman jobs. Smaller footprint, R-32 refrigerant, and up to 19.0 SEER2 — engineered for tight side-yards, zero-lot installs, and homes where a traditional cube unit just doesn't fit.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">{catalog.badge}</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">R-32 Refrigerant</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">Up to 19.0 SEER2</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">1.5 – 5 Ton</Badge>
          </div>
        </div>
      </section>

      {/* About this catalog band */}
      <section className="bg-secondary/10 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-background border-l-4 border-secondary rounded-md p-5 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-primary text-sm md:text-base leading-relaxed">
              <span className="font-semibold">About this catalog:</span> This brochure covers the Goodman SD (Side Discharge) inverter line — the specific equipment Truficient installs for our Goodman customers. Goodman makes other product lines, but the SD series is what we recommend for Texas homes because of its space efficiency, R-32 refrigerant compliance, and inverter performance in DFW summer heat.
            </p>
          </div>
        </div>
      </section>

      {/* Two-column body */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <motion.div
              className="lg:col-span-2 space-y-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* SD difference */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">What's the SD difference?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Most outdoor units blow air straight up out of a cube-shaped cabinet. The Goodman SD blows air out the side from a slimmer, lower profile cabinet. That single design change opens up installation options most cube units can't match.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { stat: "Up to 53% lighter", note: "vs. a traditional 3-ton cube unit" },
                    { stat: "Up to 40% smaller", note: "13¾\" footprint vs. 29\" cube" },
                    { stat: "As quiet as 45 dBA", note: "in Quiet Mode (refrigerator: 50 dBA)" },
                  ].map((s) => (
                    <div key={s.stat} className="bg-card border rounded-lg p-6 text-center">
                      <p className="text-xl font-bold text-primary mb-1">{s.stat}</p>
                      <p className="text-sm text-muted-foreground">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Where it fits */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Where it fits</h3>
                <ul className="space-y-3">
                  {whereItFits.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* System options */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">System options</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  The SD is available three ways depending on heating preference and existing equipment.
                </p>
                <div className="space-y-4">
                  {[
                    { title: "Standard AC", desc: "Pair with a gas furnace, air handler, or blower (GXV6S or GXV9S)" },
                    { title: "Heat Pump", desc: "All-electric heating and cooling from one outdoor unit (GZV6S or GZV7S)" },
                    { title: "Heat Pump with Dual Fuel", desc: "Heat pump efficiency on milder days, gas furnace backup for the coldest stretches" },
                  ].map((opt) => (
                    <div key={opt.title} className="border rounded-md p-5">
                      <p className="font-semibold text-primary mb-1">{opt.title}</p>
                      <p className="text-sm text-foreground/80">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key features */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Key features</h3>
                <ul className="space-y-3">
                  {keyFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Operating range */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Operating range</h3>
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                    <div className="p-5">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Cooling</p>
                      <p className="text-foreground">0°F to 115°F (AC and Heat Pump)</p>
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Heating</p>
                      <p className="text-foreground">-10°F to 70°F (Heat Pump models)</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs italic text-muted-foreground mt-2">Standard residential single-phase 208–230V.</p>
              </div>

              {/* Model lineup */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Model lineup at a glance</h3>
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-muted/50">
                      <tr className="text-left">
                        <th className="p-3 font-semibold text-foreground">Type</th>
                        <th className="p-3 font-semibold text-foreground">Model</th>
                        <th className="p-3 font-semibold text-foreground">Capacities</th>
                        <th className="p-3 font-semibold text-foreground">Up to</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {models.map((m) => (
                        <tr key={m.model}>
                          <td className="p-3 text-foreground/90">{m.type}</td>
                          <td className="p-3 font-mono text-primary font-semibold">{m.model}</td>
                          <td className="p-3 text-foreground/80">{m.capacities}</td>
                          <td className="p-3 text-foreground/80">{m.upTo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Specs sourced from Goodman's published 2025 SD catalog. Final equipment recommendation depends on Manual J load calc and home-specific factors — your Truficient estimate is the source of truth for what's right for your home.
                </p>
              </div>
            </motion.div>

            <DownloadSidebar
              pdfUrl={pdfUrl}
              trackButtonClick={trackButtonClick}
              sizeLabel="PDF, 28 pages, ~2 MB"
              pdfFile={catalog.pdfFile}
              heading="Download the Catalog"
              considerHeading="Considering a Goodman SD?"
              trackPrefix="Goodman SD Catalog"
            />
          </div>
        </div>
      </section>

      {/* PDF embed */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Browse the catalog</h2>
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[8.5/11] w-full rounded-lg border shadow-md overflow-hidden bg-background">
              <iframe src={pdfUrl} className="w-full h-full" title="Goodman SD Side Discharge Catalog" />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Having trouble viewing? Download the PDF using the button above.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground py-12 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Right size, right yard, right system.</h2>
          <p className="text-primary-foreground/80 mb-8">
            If a cube unit doesn't fit your space — or you just want a quieter, smaller-footprint install — the Goodman SD is built for it. We'll size it correctly and install it cleanly.
          </p>
          <BottomCTAButtons trackButtonClick={trackButtonClick} location="Goodman Catalog - Bottom CTA" estimatePath="/estimate/ducted" secondaryLabel="Contact Us" secondaryPath="/contact" />
        </div>
      </section>
    </>
  );
};

const DaikinContent = ({ pdfUrl, trackButtonClick, catalog }: SectionProps) => {
  const features = [
    "Capacitive touchscreen with simple, elegant industrial design",
    "Wi-Fi-enabled with iOS and Android app control via SkyportHome",
    "Voice control through Amazon Alexa and Google Assistant",
    "Away mode and geo-fencing for automatic energy savings",
    "Outdoor temperature, humidity, and weather forecast monitoring",
    "Compatible with Daikin ONE home air monitor for IAQ visualization",
    "Programmable 4-event schedule with adjustable hold function",
    "Multi-language support: English, Spanish, and French",
    "Over-the-air software updates (Wi-Fi required)",
    "Open API compatible with Control4 and Crestron",
    "Title 24 compliant, FCC Certified, and UL Listed",
  ];

  const compatibility = [
    { group: "R-32 Unitary Split Systems", items: "Outdoor (DC_VS, DC7TC, DH_VS, DH_TC), Air Handlers (D_VE, A_VE), Coils (CAPE, CHPE), Modular Blower (MBVK), Gas Furnaces (DR/DD series)" },
    { group: "Ductless Mini & Multi-Split Systems", items: "R-32 12RC (CMXV), R-410A S21 indoor units (CTXS, FTXS, FTXR, FVXS, etc.), R-410A P1/P2 (CDMQ, FDMQ, FFQ)" },
    { group: "SkyAir & VRV Systems", items: "VRV indoor (FXAQ, FXDQ, FXFQ, FXLQ, FXMQ, FXNQ, FXSQ, FXZQ), SkyAir indoor (FAQ, FBQ, FCQ, FHQ, FTQ)" },
  ];

  const specs = [
    { label: "Model Number", value: "DTST-TOU-A" },
    { label: "Dimensions", value: "0.86\"L × 3.4\"W × 4.74\"H" },
    { label: "Weight", value: "6.5 oz" },
    { label: "Operation Temperature", value: "32°F to 120°F" },
    { label: "Compliance", value: "California Title 24 (OCST listed), FCC Certified, UL Listed" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest text-secondary mb-3">DAIKIN ONE ECOSYSTEM</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{catalog.title}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
            A Wi-Fi smart thermostat for Daikin's communicating unitary, ductless, SkyAir, and VRV equipment — with touchscreen control, voice assistants, and geo-fencing built in.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">{catalog.badge}</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">Wi-Fi Smart Thermostat</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">Alexa & Google Assistant</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">12-Year Warranty</Badge>
          </div>
        </div>
      </section>

      {/* About band */}
      <section className="bg-secondary/10 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-background border-l-4 border-secondary rounded-md p-5 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-primary text-sm md:text-base leading-relaxed">
              <span className="font-semibold">About this brochure:</span> The Daikin ONE Touch (model DTST-TOU-A) is the newest addition to the Daikin ONE ecosystem, joining the ONE+ as a control solution for Daikin's communicating equipment. Includes one year of SkyportCare cloud services so we can support your system remotely.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <motion.div
              className="lg:col-span-2 space-y-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">What it does</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Customizable settings and wireless control of heating and cooling from anywhere. The touchscreen interface is friendly when you want to use it manually, and voice control with Amazon and Google devices keeps the panel in your pocket the rest of the time.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Key features</h3>
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Equipment compatibility</h3>
                <div className="space-y-4">
                  {compatibility.map((c) => (
                    <div key={c.group} className="border rounded-md p-5">
                      <p className="font-semibold text-primary mb-1">{c.group}</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{c.items}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs italic text-muted-foreground mt-3">
                  Some ductless and VRV/SkyAir setups require a communication adaptor (DAPT-ONE-VMS or model-specific S21 adaptor). We'll confirm compatibility for your equipment during the quote.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Specifications</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y">
                      {specs.map((s) => (
                        <tr key={s.label}>
                          <td className="p-3 font-semibold text-foreground bg-muted/30 w-1/3">{s.label}</td>
                          <td className="p-3 text-foreground/80">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Backed by a 12-year limited warranty for owner-occupied residences (5 years for multi-family/commercial). Online registration required within 60 days in most states.
                </p>
              </div>
            </motion.div>

            <DownloadSidebar
              pdfUrl={pdfUrl}
              trackButtonClick={trackButtonClick}
              sizeLabel={`PDF, ${catalog.pages.replace(" pages", "")} pages, ${catalog.sizeMb}`}
              pdfFile={catalog.pdfFile}
              heading="Download the Brochure"
              considerHeading="Want this thermostat?"
              trackPrefix="Daikin ONE Touch Brochure"
            />
          </div>
        </div>
      </section>

      {/* PDF embed */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Browse the brochure</h2>
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[8.5/11] w-full rounded-lg border shadow-md overflow-hidden bg-background">
              <iframe src={pdfUrl} className="w-full h-full" title="Daikin ONE Touch Smart Thermostat Brochure" />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Having trouble viewing? Download the PDF using the button above.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground py-12 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Add the ONE Touch to your Daikin system.</h2>
          <p className="text-primary-foreground/80 mb-8">
            We can pair the ONE Touch with new Daikin installs or retrofit it onto compatible existing equipment. Ask us about controls during your estimate.
          </p>
          <BottomCTAButtons trackButtonClick={trackButtonClick} location="Daikin Catalog - Bottom CTA" estimatePath="/estimate/ducted" secondaryLabel="Contact Us" secondaryPath="/contact" />
        </div>
      </section>
    </>
  );
};

interface BoschDoc {
  id: string;
  title: string;
  description: string;
  pages: number;
  sizeMb: number;
  filename: string;
  isPrimary?: boolean;
}

const BOSCH_DOCS: BoschDoc[] = [
  {
    id: "ids-family-overview",
    title: "IDS Family Overview",
    description: "Full lineup brochure covering all IDS tiers, dual-fuel pairings, and air-handler options.",
    pages: 24,
    sizeMb: 22,
    filename: "bosch-ids-family.pdf",
    isPrimary: true,
  },
  {
    id: "ids-light",
    title: "IDS Light Spec Sheet",
    description: "Entry-tier 15 SEER2 inverter system with R-454B. Includes compact wall (BIWA) and ceiling (BICA) air-handler variants.",
    pages: 2,
    sizeMb: 1,
    filename: "bosch-ids-light.pdf",
  },
  {
    id: "ids-premium-connected",
    title: "IDS Premium Connected Spec Sheet",
    description: "Top-tier 20 SEER2 connected system with the Bosch EasyAir app for remote monitoring and diagnostics.",
    pages: 2,
    sizeMb: 1,
    filename: "bosch-ids-premium-connected.pdf",
  },
  {
    id: "bmxf-blower",
    title: "BMXF 115V Blower Spec Sheet",
    description: "All-electric configuration option — pairs the IDS heat pump with a BMAC cased coil and BMXF blower instead of a gas furnace.",
    pages: 2,
    sizeMb: 1,
    filename: "bosch-bmxf-blower.pdf",
  },
];

const boschDocUrl = (filename: string) =>
  `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/catalogs/${filename}`;

const BoschContent = ({ trackButtonClick, catalog }: SectionProps) => {
  const primary = BOSCH_DOCS.find((d) => d.isPrimary)!;
  const secondaries = BOSCH_DOCS.filter((d) => !d.isPrimary);
  const primaryUrl = boschDocUrl(primary.filename);

  const tiers = [
    {
      name: "IDS Light",
      seer: "Up to 16 SEER2",
      desc: "Entry-tier inverter system. Pairs the BOVA15/BOVB15 condenser with the BIVA fixed-speed or BIVB ECM air handler.",
      bestFor: "Best for: budget-conscious upgrades from a standard cube system.",
    },
    {
      name: "IDS Plus",
      seer: "Up to 18.5 SEER2",
      desc: "Mid-tier system — Bosch's most popular IDS configuration. BOVB18 condenser plus BVA20 two-stage ECM air handler.",
      bestFor: "Best for: homeowners who want strong efficiency without going to the top tier.",
    },
    {
      name: "IDS Premium",
      seer: "Up to 20.5 SEER2",
      desc: "Top-tier non-connected system. BOVA20 condenser, BVA20 air handler, qualifies for maximum efficiency rebates.",
      bestFor: "Best for: high-utility-bill homes where lifetime energy savings justify the higher upfront.",
    },
    {
      name: "IDS Premium Connected",
      seer: "Up to 20.5 SEER2",
      desc: "Same premium efficiency as IDS Premium, plus wireless connectivity through the Bosch EasyAir app — remote monitoring, alerts, and faster diagnostics if something ever goes wrong.",
      bestFor: "Best for: customers who want visibility into their system or want their installer to be able to troubleshoot remotely.",
    },
  ];

  const configs = [
    {
      title: "Standard split with gas furnace",
      desc: "IDS condenser + BMAC cased coil + Bosch BGH96 96% AFUE gas furnace. The traditional setup for homes with existing gas service.",
    },
    {
      title: "All-electric with BMXF blower",
      desc: "IDS condenser + BMAC cased coil + BMXF 115V blower. No gas furnace. Best for new construction, decarb-minded homeowners, or homes without gas hookups.",
    },
    {
      title: "Compact wall or ceiling air handler",
      desc: "IDS Light condenser + BIWA (wall-mount) or BICA (ceiling-mount) air handler. Designed for multi-family construction, additions, or any space where a vertical air handler doesn't fit.",
    },
  ];

  const whyInstall = [
    "R-454B low-GWP refrigerant on the entire lineup — already on the 2025+ standard",
    "Inverter modulation as fine as 1% increments for steady comfort",
    "Sound levels as low as 56 dBA outdoor (vs. 70+ dBA for typical cube systems)",
    "10-year residential limited warranty on parts (2 years on gateway connectivity components)",
    "EasyAir app integration on Premium Connected for remote diagnostics",
    "AHRI 1380 compliance on Premium Connected when paired with a compatible Bosch thermostat",
    "Endorsed by Mike Holmes (the contractor — Bosch is his stated brand of choice)",
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold tracking-widest text-secondary mb-3">INVERTER HEAT PUMPS</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bosch IDS — Inverter Ducted Split Family</h1>
          <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
            Bosch's inverter heat pump lineup is one of the quietest and most efficient on the market. Four tiers from 15 SEER2 to 20 SEER2, all on R-454B low-GWP refrigerant, all backed by a 10-year limited warranty.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">Bosch Engineering</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">R-454B Low GWP</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">Up to 20 SEER2</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">As Quiet as 56 dBA</Badge>
            <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">10-Year Warranty</Badge>
          </div>
        </div>
      </section>

      {/* About this catalog set */}
      <section className="bg-primary/5 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-background border-l-4 border-primary rounded-md p-5 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-primary text-sm md:text-base leading-relaxed">
              <span className="font-semibold">About this catalog set:</span> Bosch's IDS Family is a tiered lineup, not a single product. We've included the full family overview plus deeper spec sheets for the three configurations we install most often: IDS Light (the value tier), IDS Premium Connected (the top tier with smart app integration), and the BMXF blower configuration for all-electric installs. Pick the document that matches what you're researching, or download all four.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <motion.div
              className="lg:col-span-2 space-y-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* What makes Bosch different */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">What makes Bosch IDS different</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Most heat pump systems cycle hard between full-on and off. Bosch's inverter compressor adjusts continuously — from as low as 26% capacity up to 130% — matching output to actual demand. The result is a system that's quieter, holds temperature steadier, dehumidifies better in Texas summers, and uses less energy than the on/off systems most homes still run.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { stat: "Down to 56 dBA", note: "outdoor sound level on the BOVB18 condenser; quieter than a normal conversation" },
                    { stat: "26% – 130%", note: "inverter modulation range on the Premium tier; precise capacity matching" },
                    { stat: "R-454B", note: "current low-GWP A2L refrigerant; meets 2025+ EPA standards" },
                  ].map((s) => (
                    <div key={s.stat} className="bg-card border rounded-lg p-6 text-center">
                      <p className="text-xl font-bold text-primary mb-1">{s.stat}</p>
                      <p className="text-sm text-muted-foreground">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Four tiers */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">The four IDS tiers</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Bosch sells the IDS line in four efficiency tiers. We help homeowners pick the right one based on home size, electric rates, and what tradeoffs make sense.
                </p>
                <div className="space-y-4">
                  {tiers.map((t) => (
                    <div key={t.name} className="border rounded-md p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-bold text-primary">{t.name}</h4>
                        <Badge variant="outline" className="border-primary text-primary bg-primary/5 shrink-0">{t.seer}</Badge>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">{t.desc}</p>
                      <p className="text-xs text-muted-foreground italic">{t.bestFor}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration options */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Configuration options</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Beyond the four tiers, the IDS condensers can be paired with different indoor equipment depending on what fits the home.
                </p>
                <div className="space-y-4">
                  {configs.map((c) => (
                    <div key={c.title} className="border rounded-md p-5">
                      <p className="font-semibold text-primary mb-1">{c.title}</p>
                      <p className="text-sm text-foreground/80">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why we install Bosch */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Why we install Bosch</h3>
                <ul className="space-y-3">
                  {whyInstall.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Capacity & performance */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Capacity & performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-md p-5">
                    <p className="font-semibold text-primary mb-3">Capacity range</p>
                    <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                      <li>1.5 ton (18,000 BTU/h) up to 5 ton (60,000 BTU/h) — covers most DFW homes</li>
                      <li>8 air-handler variants and 9 condenser variants for sizing flexibility</li>
                    </ul>
                  </div>
                  <div className="border rounded-md p-5">
                    <p className="font-semibold text-primary mb-3">Compressor modulation by tier</p>
                    <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                      <li>BOVA15 (Light): 33% – 110%</li>
                      <li>BOVB18 (Plus): 26% – 110%</li>
                      <li>BOV*20 (Premium / Connected): 36% – 130%</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs italic text-muted-foreground mt-3">
                  All adjustments in 1% increments — the compressor doesn't step, it slides.
                </p>
              </div>

              {/* Documents grid */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Documents in this catalog set</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BOSCH_DOCS.map((doc) => {
                    const url = boschDocUrl(doc.filename);
                    return (
                      <a
                        key={doc.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.filename}
                        onClick={() =>
                          trackButtonClick({
                            buttonName: `Bosch ${doc.title} Download`,
                            buttonLocation: "Bosch Catalog - Documents Grid",
                            destinationUrl: url,
                          })
                        }
                        className="block bg-background border rounded-md p-5 hover:shadow-md transition-shadow"
                      >
                        <FileText className="w-6 h-6 text-secondary mb-3" />
                        <h4 className="font-bold text-primary mb-1">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{doc.pages} pages · ~{doc.sizeMb} MB</span>
                          <span className="text-secondary font-semibold">Download →</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right rail */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-card border rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">Quick Download</h3>
                  <p className="text-sm text-muted-foreground mb-5">Most homeowners start with the family overview.</p>

                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={primary.filename}
                    onClick={() =>
                      trackButtonClick({
                        buttonName: "Bosch IDS Family Overview Download",
                        buttonLocation: "Bosch Catalog - Sidebar",
                        destinationUrl: primaryUrl,
                      })
                    }
                  >
                    <Button variant="secondary" className="w-full font-semibold mb-3">
                      <Download className="w-4 h-4" />
                      Download IDS Family Overview
                    </Button>
                  </a>

                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackButtonClick({
                        buttonName: "Bosch IDS Family Overview View Online",
                        buttonLocation: "Bosch Catalog - Sidebar",
                        destinationUrl: primaryUrl,
                      })
                    }
                  >
                    <Button variant="outline" className="w-full font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <ExternalLink className="w-4 h-4" />
                      View Online
                    </Button>
                  </a>

                  <hr className="my-6 border-border" />

                  <p className="text-sm font-semibold text-foreground mb-3">More documents</p>
                  <div className="space-y-2 text-sm">
                    {secondaries.map((doc) => {
                      const url = boschDocUrl(doc.filename);
                      return (
                        <a
                          key={doc.id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.filename}
                          onClick={() =>
                            trackButtonClick({
                              buttonName: `Bosch ${doc.title} Download`,
                              buttonLocation: "Bosch Catalog - Sidebar More",
                              destinationUrl: url,
                            })
                          }
                          className="flex items-center gap-2 text-secondary hover:underline font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {doc.title}
                        </a>
                      );
                    })}
                  </div>

                  <hr className="my-6 border-border" />

                  <p className="text-sm font-semibold text-foreground mb-3">Considering a Bosch system?</p>
                  <div className="space-y-2 text-sm">
                    <Link
                      to="/estimate/ducted"
                      className="block text-secondary hover:underline font-medium"
                      onClick={() =>
                        trackButtonClick({
                          buttonName: "Get a free estimate (Bosch sidebar)",
                          buttonLocation: "Bosch Catalog - Sidebar",
                          destinationUrl: "/estimate/ducted",
                        })
                      }
                    >
                      Get a free estimate →
                    </Link>
                    <Link
                      to="/contact"
                      className="block text-secondary hover:underline font-medium"
                      onClick={() =>
                        trackButtonClick({
                          buttonName: "Contact us (Bosch sidebar)",
                          buttonLocation: "Bosch Catalog - Sidebar",
                          destinationUrl: "/contact",
                        })
                      }
                    >
                      Contact us →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF embed */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">Browse the family overview</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            This is the IDS Family overview. Spec sheets for individual tiers are available in the Documents section above.
          </p>
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[8.5/11] w-full rounded-lg border shadow-md overflow-hidden bg-background">
              <iframe src={primaryUrl} className="w-full h-full" title="Bosch IDS Family Overview" />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Having trouble viewing? Use the download buttons above.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground py-12 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Quiet, efficient, and built to last.</h2>
          <p className="text-primary-foreground/80 mb-8">
            If you want a heat pump that runs steadier, sounds quieter, and shows up on your electric bill in a good way — Bosch IDS is one of the best inverter systems on the market. We'll help you pick the right tier for your home.
          </p>
          <BottomCTAButtons trackButtonClick={trackButtonClick} location="Bosch Catalog - Bottom CTA" estimatePath="/estimate/ducted" secondaryLabel="Contact Us" secondaryPath="/contact" />
        </div>
      </section>
    </>
  );
};

const DownloadSidebar = ({
  pdfUrl,
  trackButtonClick,
  sizeLabel,
  pdfFile,
  heading,
  considerHeading,
  trackPrefix,
}: {
  pdfUrl: string;
  trackButtonClick: SectionProps["trackButtonClick"];
  sizeLabel: string;
  pdfFile: string;
  heading: string;
  considerHeading: string;
  trackPrefix: string;
}) => (
  <div className="lg:col-span-1">
    <div className="lg:sticky lg:top-24">
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-foreground mb-1">{heading}</h3>
        <p className="text-sm text-muted-foreground mb-5">{sizeLabel}</p>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={pdfFile}
          onClick={() =>
            trackButtonClick({
              buttonName: `${trackPrefix} Download`,
              buttonLocation: "Catalog Detail - Sidebar",
              destinationUrl: pdfUrl,
            })
          }
        >
          <Button variant="secondary" className="w-full font-semibold mb-3">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </a>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackButtonClick({
              buttonName: `${trackPrefix} View Online`,
              buttonLocation: "Catalog Detail - Sidebar",
              destinationUrl: pdfUrl,
            })
          }
        >
          <Button variant="outline" className="w-full font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <ExternalLink className="w-4 h-4" />
            View Online
          </Button>
        </a>

        <hr className="my-6 border-border" />

        <p className="text-sm font-semibold text-foreground mb-3">{considerHeading}</p>
        <div className="space-y-2 text-sm">
          <Link
            to="/estimate/ducted"
            className="block text-secondary hover:underline font-medium"
            onClick={() =>
              trackButtonClick({
                buttonName: "Get a free estimate (sidebar)",
                buttonLocation: "Catalog Detail - Sidebar",
                destinationUrl: "/estimate/ducted",
              })
            }
          >
            Get a free estimate →
          </Link>
          <Link
            to="/contact"
            className="block text-secondary hover:underline font-medium"
            onClick={() =>
              trackButtonClick({
                buttonName: "Contact us (sidebar)",
                buttonLocation: "Catalog Detail - Sidebar",
                destinationUrl: "/contact",
              })
            }
          >
            Contact us →
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const BottomCTAButtons = ({
  trackButtonClick,
  location,
  estimatePath,
  secondaryLabel,
  secondaryPath,
}: {
  trackButtonClick: SectionProps["trackButtonClick"];
  location: string;
  estimatePath: string;
  secondaryLabel: string;
  secondaryPath: string;
}) => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Link
      to={estimatePath}
      onClick={() =>
        trackButtonClick({
          buttonName: "Get a Free Estimate",
          buttonLocation: location,
          destinationUrl: estimatePath,
        })
      }
    >
      <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
        Get a Free Estimate
      </Button>
    </Link>
    <Link
      to={secondaryPath}
      onClick={() =>
        trackButtonClick({
          buttonName: secondaryLabel,
          buttonLocation: location,
          destinationUrl: secondaryPath,
        })
      }
    >
      <Button
        size="lg"
        variant="outline"
        className="font-semibold w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
      >
        {secondaryLabel}
      </Button>
    </Link>
  </div>
);

export default CatalogDetail;
