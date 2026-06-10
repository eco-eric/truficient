import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, CheckCircle2, ClipboardCheck, Home, Wrench, Award } from "lucide-react";
import EstimateRequestForm from "@/components/forms/EstimateRequestForm";

const CentralAcEstimate = () => {
  usePageSEO("/central-ac-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Central AC Estimate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We don't quote central AC online — accurate pricing requires an in-person evaluation. Here's how we build a real estimate for your home.
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What drives a central AC estimate</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Home, title: "Home size & layout", text: "Square footage, ceiling height, window orientation, and insulation all change the load." },
                { icon: ClipboardCheck, title: "Manual J load calculation", text: "ACCA-standard heat-load math sizes the system to your actual home — not a rule of thumb." },
                { icon: Wrench, title: "Ductwork & electrical", text: "Existing duct condition, static pressure, and panel capacity affect scope and cost." },
                { icon: Award, title: "Equipment tier", text: "Single-stage, two-stage, or variable-speed — efficiency and comfort vary significantly." },
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
          <div className="container px-4 mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Brands We Install</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Four trusted brands, one specialty: variable-speed and inverter-driven systems built for Texas summers.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Mitsubishi", logo: "/brands/mitsubishi.png", badge: "Variable-Speed Inverter", text: "Diamond Contractor certified. The benchmark for inverter comfort." },
                { name: "Trane", logo: "/brands/trane.png", badge: "Multi-Speed", text: "American-built reliability with proven multi-speed performance." },
                { name: "Bosch", logo: "/brands/bosch.png", badge: "Inverter-Driven", text: "European engineering with quiet, efficient inverter heat pumps." },
                { name: "Goodman", logo: "/brands/goodman.png", badge: "Single-Stage Value", text: "Dependable comfort backed by strong warranties at a budget-friendly tier." },
              ].map((b) => (
                <Card key={b.name} className="p-5 flex flex-col">
                  <div className="h-12 flex items-center justify-center mb-4">
                    <img src={b.logo} alt={`${b.name} logo`} className="max-h-12 max-w-[140px] object-contain" loading="lazy" />
                  </div>
                  <span className="inline-block self-start text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary mb-2">{b.badge}</span>
                  <p className="text-sm text-muted-foreground">{b.text}</p>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6 max-w-3xl">
              For Texas summers, variable-speed systems are our specialty — they hold tighter temperatures, pull more humidity, and run quieter while using less power. It's the tier we install in our own homes.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">

          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What to expect from our process</h2>
            <ol className="space-y-4">
              {[
                "Phone consultation to understand your goals, comfort issues, and timeline.",
                "On-site evaluation: we measure, inspect ductwork, check electrical, and run the load calc.",
                "Written estimate with equipment options, tier comparisons, and financing.",
                "Professional install by our W-2 technicians — no subcontractors.",
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
              Online "instant quotes" guess at conditions they can't see. Static pressure, duct leakage, return sizing, refrigerant line lengths, and electrical capacity all shift the real cost. An in-person assessment from a certified evaluator is the only way to give you a number that holds.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why homeowners choose Truficient</h2>
            <ul className="space-y-2">
              {[
                "Mitsubishi Diamond Contractor",
                "HERS Certified for performance verification",
                "1,000+ DFW installs",
                "Specialists in variable-speed and inverter systems",
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

export default CentralAcEstimate;
