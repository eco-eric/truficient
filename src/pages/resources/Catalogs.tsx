import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";

interface Brand {
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  badge?: string;
  status: "available" | "coming-soon";
  expectedDate?: string;
}

const brands: Brand[] = [
  {
    slug: "mitsubishi-m-p-series-2026",
    name: "Mitsubishi Electric",
    tagline: "M & P Series — 2026 Catalog",
    description:
      "Ductless and ducted inverter systems. M-Series for residential, P-Series for commercial. Full lineup including MSZ wall-mounts, MLZ ceiling cassettes, SVZ/PVA ducted air handlers, and MXZ multi-zone outdoor units.",
    badge: "Diamond Contractor",
    status: "available",
  },
  { slug: "trane", name: "Trane", tagline: "Residential & Commercial", status: "coming-soon", expectedDate: "May 2026" },
  { slug: "goodman", name: "Goodman", tagline: "Residential Systems", status: "coming-soon", expectedDate: "May 2026" },
  { slug: "bosch", name: "Bosch", tagline: "Inverter Heat Pumps", status: "coming-soon", expectedDate: "May 2026" },
  { slug: "daikin", name: "Daikin", tagline: "Ductless & Ducted", status: "coming-soon", expectedDate: "June 2026" },
  { slug: "carrier", name: "Carrier", tagline: "Residential & Commercial", status: "coming-soon", expectedDate: "June 2026" },
  { slug: "lennox", name: "Lennox", tagline: "Premium Residential", status: "coming-soon", expectedDate: "June 2026" },
  { slug: "rheem", name: "Rheem", tagline: "HVAC & Water Heating", status: "coming-soon", expectedDate: "June 2026" },
];

const Catalogs = () => {
  usePageSEO("/resources/catalogs", { skipGlobalSchema: true });
  const { trackButtonClick } = useButtonTracking();

  // Fallback meta
  if (typeof document !== "undefined") {
    if (!document.title || document.title.includes("Truficient HVAC")) {
      document.title = "Equipment Catalogs | Truficient HVAC";
    }
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20 text-center">
          <div className="container mx-auto px-4">
            <p className="text-sm font-semibold tracking-widest text-secondary mb-3">RESOURCES</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Equipment Catalogs</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Browse the full product catalogs for the brands we install. Specs, features, model lineups, and installation details — straight from the manufacturer.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              We maintain current manufacturer catalogs for the equipment we actively install across DFW. Customers can review the same materials our crews use when sizing systems and choosing equipment — so there's no guesswork about what's going into your home.
            </p>
          </div>
        </section>

        {/* Brand grid */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Manufacturers We Install</h2>
              <p className="text-muted-foreground">
                Click an active brand to view its current catalog. More coming May–June 2026.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand, idx) => {
                const isAvailable = brand.status === "available";
                const card = (
                  <Card
                    className={`h-full p-6 bg-card transition-all ${
                      isAvailable
                        ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        : "opacity-70 cursor-default"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <h3 className={`text-xl font-bold ${isAvailable ? "text-primary" : "text-muted-foreground"}`}>
                        {brand.name}
                      </h3>
                      {brand.badge && (
                        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary shrink-0">
                          {brand.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{brand.tagline}</p>

                    {isAvailable && brand.description && (
                      <p className="text-sm text-foreground/80 mb-5 leading-relaxed">{brand.description}</p>
                    )}

                    {isAvailable ? (
                      <div className="flex items-center gap-2 text-secondary font-semibold mt-auto">
                        View Catalog <ArrowRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <Badge className="bg-secondary/20 text-secondary-foreground border border-secondary/40 mt-2 inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Coming {brand.expectedDate}
                      </Badge>
                    )}
                  </Card>
                );

                return (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                  >
                    {isAvailable ? (
                      <Link
                        to={`/resources/catalogs/${brand.slug}`}
                        onClick={() =>
                          trackButtonClick({
                            buttonName: `${brand.name} Catalog`,
                            buttonLocation: "Catalogs Hub",
                            destinationUrl: `/resources/catalogs/${brand.slug}`,
                          })
                        }
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-primary text-primary-foreground py-16 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Don't see your brand?</h2>
            <p className="text-primary-foreground/80 mb-8">
              We service and install all major HVAC brands. Reach out for catalog requests or equipment questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/estimate/ducted"
                onClick={() =>
                  trackButtonClick({
                    buttonName: "Get a Free Estimate",
                    buttonLocation: "Catalogs Hub - Bottom CTA",
                    destinationUrl: "/estimate/ducted",
                  })
                }
              >
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                  Get a Free Estimate
                </Button>
              </Link>
              <Link
                to="/contact"
                onClick={() =>
                  trackButtonClick({
                    buttonName: "Contact Us",
                    buttonLocation: "Catalogs Hub - Bottom CTA",
                    destinationUrl: "/contact",
                  })
                }
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Contact Us
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

export default Catalogs;
