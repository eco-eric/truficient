import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, CheckCircle2, ClipboardCheck, Home, Wrench, Award } from "lucide-react";

const MultiZoneEstimate = () => {
  usePageSEO("/multi-zone-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Multi-Zone Estimate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Multi-zone ductless systems have too many moving parts for an online quote. Here's how we build an accurate estimate for whole-home zoning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">Request a Free Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:2142384349"><Phone className="w-4 h-4 mr-2" />214-238-4349</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What drives a multi-zone estimate</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Home, title: "Zone count & room loads", text: "Each zone gets its own Manual J — total system capacity has to balance against branch limits." },
                { icon: ClipboardCheck, title: "Branch box & condenser sizing", text: "Outdoor unit tonnage, port count, and branch box placement must match the zone plan." },
                { icon: Wrench, title: "Line set routing", text: "Long runs, multi-story routing, and concealed line hides materially affect labor and materials." },
                { icon: Award, title: "Equipment tier & head styles", text: "Mix of wall, ceiling cassette, floor, and concealed-duct heads changes both comfort and cost." },
              ].map(({ icon: Icon, title, text }) => (
                <Card key={title} className="p-5">
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What to expect from our process</h2>
            <ol className="space-y-4">
              {[
                "Phone consultation to understand zoning goals, comfort issues, and aesthetic priorities.",
                "On-site evaluation: per-room load calcs, condenser site survey, line set planning, electrical assessment.",
                "Engineered written estimate with head style options per zone, tier comparisons, and financing.",
                "Coordinated install by certified Truficient technicians — commissioned and tested zone by zone.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="text-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why we assess in person</h2>
            <p className="text-muted-foreground mb-6">
              Multi-zone systems fail when they're guessed at. Undersized condensers short-cycle, oversized heads strip humidity, bad line set routing leaks performance for the life of the system. We size, plan, and price every zone in person — that's the only way the system delivers what you paid for.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why homeowners choose Truficient</h2>
            <ul className="space-y-2">
              {[
                "Mitsubishi Diamond Contractor — top-tier multi-zone certification",
                "HERS Certified",
                "1,000+ DFW installs",
                "Variable-speed, inverter, and zoning specialists",
                "TACLB77247C licensed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container px-4 mx-auto max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready for a real estimate?</h2>
            <p className="text-muted-foreground mb-6">Schedule a free in-home consultation with a certified Truficient technician.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">Request a Free Estimate</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:2142384349"><Phone className="w-4 h-4 mr-2" />Call 214-238-4349</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MultiZoneEstimate;
