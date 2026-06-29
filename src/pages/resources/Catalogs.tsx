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
  badgeStyle?: "solid" | "outline";
  status: "available" | "coming-soon";
  expectedDate?: string;
  href?: string;
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
  {
    slug: "trane",
    name: "Trane",
    tagline: "TruComfort Variable-Speed Lineup",
    description:
      "Trane's residential lineup including XV20i, XV18, XV19 Low Profile, and the 17 Multi-Speed (5TTR7/5TWR7/5TTX7/5TWX7) inverter systems. TruComfort variable-speed comfort with Climatuff compressors, SEET-tested durability, and a 12-year compressor warranty.",
    badge: "Certified Installer",
    badgeStyle: "outline",
    status: "available",
    href: "/equipment/trane",
  },
  {
    slug: "bosch-ids-family",
    name: "Bosch",
    tagline: "IDS Family — Inverter Heat Pumps",
    description:
      "High-efficiency inverter heat pump systems with R-454B refrigerant, sound levels as low as 56 dBA, and a 10-year limited warranty. Available from 15 SEER2 entry tier up to 20 SEER2 connected premium with smart app monitoring.",
    badge: "Inverter Specialist",
    badgeStyle: "outline",
    status: "available",
  },
  {
    slug: "goodman-sd-side-discharge",
    name: "Goodman",
    tagline: "SD Side Discharge Inverter Systems",
    description:
      "The side-discharge inverter line we install — up to 53% lighter and 40% smaller than traditional cube-style units, with R-32 refrigerant and up to 19.0 SEER2. Available as AC, heat pump, or dual fuel in 1.5 to 5 ton capacities.",
    badge: "What We Install",
    badgeStyle: "outline",
    status: "available",
  },
  
  {
    slug: "daikin-one-touch-thermostat",
    name: "Daikin",
    tagline: "ONE Touch Smart Thermostat",
    description:
      "Wi-Fi-enabled smart thermostat with capacitive touchscreen, voice control via Alexa and Google Assistant, geo-fencing, and app control for iOS and Android. Compatible with Daikin's communicating unitary, ductless, SkyAir, and VRV equipment. Includes 1 year of SkyportCare and a 12-year limited warranty.",
    badge: "Smart Controls",
    badgeStyle: "outline",
    status: "available",
  },
  { slug: "gree", name: "Gree", tagline: "Ductless Mini-Split Systems", status: "coming-soon", expectedDate: "July 2026" },
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
                        <Badge
                          className={
                            brand.badgeStyle === "outline"
                              ? "border border-primary text-primary bg-primary/5 hover:bg-primary/5 shrink-0"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary shrink-0"
                          }
                        >
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
                        to={brand.href ?? `/resources/catalogs/${brand.slug}`}
                        onClick={() =>
                          trackButtonClick({
                            buttonName: `${brand.name} Catalog`,
                            buttonLocation: "Catalogs Hub",
                            destinationUrl: brand.href ?? `/resources/catalogs/${brand.slug}`,
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
