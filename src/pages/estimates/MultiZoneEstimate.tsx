import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Phone,
  Layers,
  CircleDot,
  PanelTop,
  Wind,
  Gauge,
  Volume2,
  TrendingDown,
  ThermometerSun,
  Award,
} from "lucide-react";
import EstimateRequestForm from "@/components/forms/EstimateRequestForm";

const MultiZoneEstimate = () => {
  usePageSEO("/multi-zone-estimate");

  const unitStyles = [
    {
      icon: Layers,
      name: "Slim Ducted Units",
      text: "Concealed in tight spaces like closets, soffits, and attic knee walls. Fully hidden with short duct runs that can feed one or several rooms — comfort without a unit visible on the wall.",
    },
    {
      icon: CircleDot,
      name: "Ceiling Cassettes",
      text: "Flush-mounted in the ceiling with 360° airflow. Ideal for open living areas, kitchens, and rooms without available wall space where even, quiet distribution matters.",
    },
    {
      icon: PanelTop,
      name: "Low Wall-Mounted Units",
      text: "Installed near the floor with a low-profile, radiator-style footprint. A great fit under windows and in bedrooms, sunrooms, or any space where ceiling-height units aren't preferred.",
    },
    {
      icon: Wind,
      name: "Full Ducted Units",
      text: "Whole-home or large-zone air handlers that work with conventional ductwork. Completely invisible from inside the home — the multi-zone benefits, with the look of a traditional system.",
    },
  ];

  const benefits = [
    { icon: TrendingDown, title: "Higher efficiency", text: "Only condition the rooms you're using — no more cooling empty bedrooms or guest spaces." },
    { icon: ThermometerSun, title: "Room-by-room comfort", text: "Independent setpoints per zone, tuned to how each space is actually used." },
    { icon: Volume2, title: "Quieter operation", text: "Inverter-driven outdoor units and low-profile indoor heads run noticeably quieter than legacy systems." },
    { icon: Gauge, title: "Best long-term value", text: "When designed correctly, multi-zone systems deliver the strongest comfort-per-dollar of any system type." },
  ];

  const brands = [
    { name: "Mitsubishi Electric", tag: "Primary brand — Diamond Contractor", href: "/services/ductless", primary: true },
    { name: "Daikin", tag: "Installed upon request" },
    { name: "Fujitsu", tag: "Installed upon request" },
    { name: "Hitachi", tag: "Installed upon request" },
    { name: "LG", tag: "Installed upon request" },
    { name: "Gree", tag: "Value-engineered option" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* HERO */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Multi-Zone Comfort, Designed Around Your Home
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              One system. Multiple zones. Mix ducted and ductless indoor units to match every space — and only condition the rooms you're using.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <a href="#estimate-form">Schedule an Estimate</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:2142384349"><Phone className="w-4 h-4 mr-2" />214-238-4349</a>
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 1 — Why Multi-Zone */}
        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Multi-Zone</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              A multi-zone system lets you condition your home the way you actually live in it — bedrooms, living areas, a home office, a finished addition, even a garage workshop. Each zone runs on its own setpoint, so the spaces in use get the comfort they need and the rest of the home isn't paying for it. For DFW homeowners — from{" "}
              <Link to="/hvac-preston-hollow-dallas/" className="underline hover:text-primary">Preston Hollow</Link> to{" "}
              <Link to="/hvac-plano-tx/" className="underline hover:text-primary">Plano</Link> and{" "}
              <Link to="/hvac-richardson-tx/" className="underline hover:text-primary">Richardson</Link> — it's the most flexible way to solve uneven temperatures and rising energy use in a single design.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <Card key={title} className="p-5">
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2 — Mix Ducted and Ductless */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Mix Ducted and Ductless</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Multi-zone doesn't have to mean wall units everywhere. A single outdoor condenser can run a combination of indoor unit styles, chosen room-by-room based on layout, aesthetics, and how the space is used.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {unitStyles.map(({ icon: Icon, name, text }) => (
                <Card key={name} className="p-5">
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
            <p className="text-muted-foreground mt-8 max-w-3xl">
              Most major brands offer all of these styles on a single multi-zone outdoor unit. That means one system can run a{" "}
              <Link to="/services/ductless" className="underline hover:text-primary">slim ducted unit</Link> serving the bedrooms, a ceiling cassette in the living room, and a wall-mounted head in the garage gym — all paired with the same condenser. It's a level of design flexibility traditional{" "}
              <Link to="/services/residential" className="underline hover:text-primary">central systems</Link> can't match.
            </p>
          </div>
        </section>

        {/* SECTION 3 — Design Matters */}
        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Design Matters</h2>
            <p className="text-muted-foreground mb-4">
              The difference between a multi-zone system that performs and one that disappoints is design. Real load calculations per zone, line set routing planned to the inch, condensate strategy, branch box placement, and the right indoor unit style chosen for each room — none of this is one-size-fits-all, and none of it can be guessed from a phone call.
            </p>
            <p className="text-muted-foreground mb-6">
              Truficient is a <strong>Mitsubishi Electric Diamond Contractor</strong> — the top tier of training, warranty, and factory support. Our team is <strong>HERS certified</strong> with over <strong>1,000 DFW installations</strong> behind us, serving{" "}
              <Link to="/hvac-garland-tx/" className="underline hover:text-primary">Garland</Link>,{" "}
              <Link to="/hvac-mesquite-tx/" className="underline hover:text-primary">Mesquite</Link>, and the broader Metroplex. This is engineered comfort, not a box swap.
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Award className="w-5 h-5 text-primary" />
              <span>Mitsubishi Diamond Contractor · HERS Certified · TACLB77247C</span>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Brands */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Brands We Install</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              We lead with Mitsubishi Electric — our primary multi-zone brand and the platform we've built our reputation on. We also install other leading brands upon request and offer Gree as a value-engineered option for projects where budget matters most.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((b) => {
                const inner = (
                  <Card className={`p-5 h-full ${b.primary ? "border-primary border-2" : ""}`}>
                    <h3 className="font-semibold text-lg mb-1">{b.name}</h3>
                    <p className="text-sm text-muted-foreground">{b.tag}</p>
                  </Card>
                );
                return b.href ? (
                  <Link key={b.name} to={b.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div key={b.name}>{inner}</div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container px-4 mx-auto max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Every multi-zone system we install starts with a conversation about how you live in your home.
            </h2>
            <p className="text-muted-foreground mb-6">
              Tell us about the spaces that need work, and we'll design a system around them.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">Request a Design Consultation</Link>
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
