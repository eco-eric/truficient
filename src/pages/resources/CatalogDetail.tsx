import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, CheckCircle2, ChevronRight, Info, MapPin } from "lucide-react";
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
    } else {
      document.title = `${catalog.brand === "Mitsubishi Electric" ? "Mitsubishi M & P Series Catalog 2026" : catalog.title} | Truficient HVAC`;
    }
  }

  const isGoodman = slug === "goodman-sd-side-discharge";
  const isDaikin = slug === "daikin-one-touch-thermostat";

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

        {isGoodman ? (
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
