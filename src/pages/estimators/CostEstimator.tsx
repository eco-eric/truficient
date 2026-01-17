import { motion } from "framer-motion";
import { DollarSign, Calculator, Shield, Clock, Phone, CalendarCheck, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { EstimateCalculator } from "@/components/calculator/EstimateCalculator";

const benefits = [
  {
    icon: Calculator,
    title: "Instant Estimates",
    description: "Get accurate pricing estimates in seconds, not days"
  },
  {
    icon: Shield,
    title: "No Hidden Fees",
    description: "Transparent pricing with no surprise charges"
  },
  {
    icon: Clock,
    title: "Available 24/7",
    description: "Get estimates anytime, from any device"
  }
];

const pricingFactors = [
  "System type (AC, heat pump, furnace, ductless)",
  "Efficiency rating (SEER2, HSPF2, AFUE)",
  "Brand and warranty options",
  "Installation complexity",
  "Ductwork modifications needed",
  "Permits and inspections",
];

const CostEstimator = () => {
  usePageSEO("/estimators/cost");
  const { trackButtonClick } = useButtonTracking();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  Free Estimate
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                HVAC Cost Estimator
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Get instant, transparent pricing for your heating and cooling project. 
                No phone calls required – just straightforward costs at your fingertips.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
                  <DollarSign className="relative h-20 w-20 text-secondary" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Calculator */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <EstimateCalculator slug="hvac-estimate" />
              </motion.div>

              {/* Info Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    What Affects Your Price?
                  </h2>
                  <ul className="space-y-3">
                    {pricingFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      Need a More Detailed Quote?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our estimates are based on typical installations. For complex projects 
                      or if you have specific requirements, schedule a free in-home consultation.
                    </p>
                    <Button 
                      asChild 
                      size="sm"
                      onClick={() => trackButtonClick({
                        buttonName: "Schedule Free Consultation",
                        buttonLocation: "Cost Estimator Sidebar",
                        destinationUrl: "/contact"
                      })}
                    >
                      <Link to="/contact">
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Schedule Free Consultation
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Use Our Estimator?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-4">
                        <benefit.icon className="h-7 w-7 text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-secondary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team is standing by to answer questions and provide detailed quotes 
                for your specific situation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Request Detailed Quote",
                    buttonLocation: "Cost Estimator CTA",
                    destinationUrl: "/contact"
                  })}
                >
                  <Link to="/contact">
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Request Detailed Quote
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Call for Quote",
                    buttonLocation: "Cost Estimator CTA",
                    destinationUrl: "tel:+14692251336"
                  })}
                >
                  <a href="tel:+14692251336">
                    <Phone className="mr-2 h-5 w-5" />
                    Call (469) 225-1336
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CostEstimator;
