import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, CheckCircle2, ClipboardCheck, Home, Wrench, Award } from "lucide-react";
import EstimateRequestForm from "@/components/forms/EstimateRequestForm";

const MiniSplitEstimate = () => {
  usePageSEO("/mini-split-estimate");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Mini Split Estimate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Single-zone ductless installs depend on details we have to see in person. Here's how we estimate your mini split project the right way.
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

        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What drives a mini split estimate</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Home, title: "Room size & use", text: "Square footage, insulation, sun exposure, and how the space is used all shape the BTU target." },
                { icon: ClipboardCheck, title: "Manual J load calculation", text: "We size the indoor head to the actual room load — oversizing kills humidity control and efficiency." },
                { icon: Wrench, title: "Line set & electrical", text: "Outdoor unit placement, line set routing, and a dedicated circuit drive a big chunk of install scope." },
                { icon: Award, title: "Equipment tier", text: "Hyper-Heat, standard inverter, brand and warranty tier — comfort and longevity vary." },
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
                "Phone consultation to understand the room, goals, and aesthetic preferences.",
                "On-site evaluation: line set routing, condenser placement, electrical capacity, wall structure.",
                "Written estimate with head style options (wall, ceiling cassette, floor), tier comparisons, and financing.",
                "Clean, code-compliant install by certified Truficient technicians.",
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
              Mini splits look simple online, but the install isn't. Line set length, lift, wall penetration, condenser pad or bracket, electrical run, and condensate drainage all change scope. We won't quote sight-unseen — accuracy and a quality install require a certified evaluation.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why homeowners choose Truficient</h2>
            <ul className="space-y-2">
              {[
                "Mitsubishi Diamond Contractor — the highest install certification",
                "HERS Certified",
                "1,000+ DFW installs",
                "Variable-speed and inverter specialists",
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

        <section className="py-12 bg-muted/30">
          <div className="container px-4 mx-auto max-w-3xl text-center">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Ready to get started?</h2>
            <Button asChild size="lg">
              <a href="#estimate-form">Schedule an Estimate</a>
            </Button>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container px-4 mx-auto max-w-2xl">
            <EstimateRequestForm
              systemType="Mini Split"
              sourcePage="/mini-split-estimate"
              heading="Request Your Mini Split Estimate"
              subheading="Free in-home consultation with a Mitsubishi Diamond Contractor."
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MiniSplitEstimate;
