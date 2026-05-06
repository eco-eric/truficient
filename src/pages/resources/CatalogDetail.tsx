import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, CheckCircle2, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";

const KNOWN_CATALOGS: Record<
  string,
  {
    title: string;
    brand: string;
    pdfFile: string;
    pages: string;
    updated: string;
    badge: string;
  }
> = {
  "mitsubishi-m-p-series-2026": {
    title: "Mitsubishi Electric — M & P Series",
    brand: "Mitsubishi Electric",
    pdfFile: "mitsubishi-m-p-series-2026.pdf",
    pages: "150 pages",
    updated: "Updated Sept 2025",
    badge: "Diamond Contractor",
  },
};

const SECTIONS = [
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

  if (!catalog) {
    return <Navigate to="/resources/catalogs" replace />;
  }

  if (typeof document !== "undefined") {
    document.title = `${catalog.brand === "Mitsubishi Electric" ? "Mitsubishi M & P Series Catalog 2026" : catalog.title} | Truficient HVAC`;
  }

  const pdfUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/catalogs/${catalog.pdfFile}`;

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
            <li className="text-foreground font-medium">Mitsubishi M & P Series 2026</li>
          </ol>
        </nav>

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
              {/* Left */}
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
                  {SECTIONS.map((s) => (
                    <li key={s} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Right - sticky download card */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <div className="bg-card border rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">Download the Catalog</h3>
                    <p className="text-sm text-muted-foreground mb-5">PDF, 150 pages, ~8 MB</p>

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={catalog.pdfFile}
                      onClick={() =>
                        trackButtonClick({
                          buttonName: "Mitsubishi Catalog Download",
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
                          buttonName: "Mitsubishi Catalog View Online",
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

                    <p className="text-sm font-semibold text-foreground mb-3">Need help choosing?</p>
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
            </div>
          </div>
        </section>

        {/* PDF embed */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Browse the catalog</h2>
            <div className="max-w-5xl mx-auto">
              <div className="aspect-[8.5/11] w-full rounded-lg border shadow-md overflow-hidden bg-background">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Mitsubishi M & P Series Catalog 2026"
                />
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/estimate/ductless"
                onClick={() =>
                  trackButtonClick({
                    buttonName: "Get a Free Estimate",
                    buttonLocation: "Catalog Detail - Bottom CTA",
                    destinationUrl: "/estimate/ductless",
                  })
                }
              >
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                  Get a Free Estimate
                </Button>
              </Link>
              <Link
                to="/gallery"
                onClick={() =>
                  trackButtonClick({
                    buttonName: "See Our Work",
                    buttonLocation: "Catalog Detail - Bottom CTA",
                    destinationUrl: "/gallery",
                  })
                }
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  See Our Work
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CatalogDetail;
