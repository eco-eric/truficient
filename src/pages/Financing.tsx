import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DollarSign,
  Clock,
  Calendar,
  Sparkles,
  Percent,
  TrendingDown,
  CheckCircle,
  FileText,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  Phone,
} from "lucide-react";

const Financing = () => {
  // Try to fetch SEO from database, fallback to defaults
  usePageSEO("/financing");

  // Set default title if no database SEO exists
  useEffect(() => {
    document.title = "Financing Options | Flexible HVAC Payment Plans | Truficient";
    
    // Set meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', 
      "Make your HVAC upgrade affordable with flexible financing options through Synchrony. Low monthly payments, quick application, and promotional offers available."
    );
  }, []);

  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, destinationUrl?: string) => {
    trackButtonClick({
      buttonName,
      buttonLocation: "Financing Page",
      destinationUrl,
    });
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Low Monthly Payments",
      description:
        "Break up your investment into manageable monthly payments that fit your budget",
    },
    {
      icon: Clock,
      title: "Quick Application",
      description:
        "Simple online application with a decision in minutes—no lengthy paperwork",
    },
    {
      icon: Calendar,
      title: "Flexible Terms",
      description:
        "Choose from a variety of promotional periods to match your financial goals",
    },
    {
      icon: Sparkles,
      title: "Promotional Options",
      description:
        "Special financing offers available based on your installation type and timing",
    },
  ];

  const programTypes = [
    {
      title: "Deferred Interest",
      subtitle: "No Interest if Paid in Full",
      description:
        "Pay no interest if you pay the promotional balance in full within the promotional period. Perfect for homeowners who can pay off the balance before the period ends.",
      icon: Percent,
    },
    {
      title: "Reduced APR",
      subtitle: "Fixed Monthly Payments",
      description:
        "Predictable payments at a reduced interest rate for a defined period. Ideal for larger projects where you want to spread payments over time.",
      icon: TrendingDown,
    },
    {
      title: "Equal Pay",
      subtitle: "No Interest",
      description:
        "Fixed monthly payments with 0% APR for a set period. Great for budgeting with the certainty of no interest charges during the promotional period.",
      icon: CheckCircle,
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Get Your Estimate",
      description:
        "Use our online estimators or schedule an on-site consultation to determine the best system for your home",
    },
    {
      step: 2,
      title: "Apply for Financing",
      description:
        "Complete a quick application during your estimate consultation—approval takes just minutes",
    },
    {
      step: 3,
      title: "Get Approved",
      description:
        "Receive an instant credit decision and learn about the promotional options available to you",
    },
    {
      step: 4,
      title: "Start Your Project",
      description:
        "Once approved, we'll schedule your installation and you can enjoy your new comfort system",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
              <CreditCard className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">
                Powered by Synchrony Financial
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Flexible Financing Options
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Make your comfort upgrade affordable with low monthly payments and
              promotional financing offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/estimate/ducted">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                  onClick={() =>
                    handleTrackClick("Get Your Estimate - Hero", "/estimate/ducted")
                  }
                >
                  Get Your Estimate
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:214-238-4349">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() =>
                    handleTrackClick("Talk to an Expert - Hero", "tel:214-238-4349")
                  }
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Talk to an Expert
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Finance Your HVAC System?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't let upfront costs delay your comfort. Financing lets you
              enjoy a new, energy-efficient system today while paying over time.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Types Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Financing Programs Overview
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer several types of financing programs. Specific promotional
              offers and terms are presented during your estimate consultation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {programTypes.map((program, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <program.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <p className="text-secondary font-medium">{program.subtitle}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with financing is simple and straightforward
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
                Important Information About Deferred Interest Promotions
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
                <p>
                  For deferred interest promotions: Interest accrues (adds up) on
                  your account from the purchase date, but is only charged if you
                  do not pay off your promotional balance within the defined
                  promotional period. If you do not pay the promotional balance in
                  full by the end of the promotional period, all accrued interest
                  will be charged to your account.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Get your personalized estimate today and learn about the financing
              options available for your project
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/estimate/ducted">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                  onClick={() =>
                    handleTrackClick("Get Your Estimate - CTA", "/estimate/ducted")
                  }
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Get Your Estimate
                </Button>
              </Link>
              <a href="tel:214-238-4349">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() =>
                    handleTrackClick("Call 214-238-4349 - CTA", "tel:214-238-4349")
                  }
                >
                  <Phone className="w-5 h-5 mr-2" />
                  214-238-4349
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclosures Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Important Disclosures
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                *Subject to credit approval. Minimum monthly payments required.
                See your Truficient consultant for details. Financing provided by
                Synchrony Bank.
              </p>
              <p>
                Promotional financing programs and terms are subject to change.
                Specific promotional offers vary by installation type and timing.
                Not all applicants will qualify for credit approval or for the
                lowest rates or highest credit limits.
              </p>
              <p>
                Synchrony Bank is an Equal Housing Lender. Equal Opportunity
                Lender.
              </p>
              <p>
                It is important that financing be offered to ALL customers to
                ensure compliance with Fair Lending guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Financing;
