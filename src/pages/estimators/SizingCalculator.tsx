import { motion } from "framer-motion";
import { Ruler, Home, Thermometer, Wind, Phone, CalendarCheck, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";

const sizingFactors = [
  {
    icon: Home,
    title: "Square Footage",
    description: "Your home's total conditioned space is the starting point for proper sizing"
  },
  {
    icon: Thermometer,
    title: "Climate Zone",
    description: "Dallas-Fort Worth's hot summers require specific cooling capacity calculations"
  },
  {
    icon: Wind,
    title: "Insulation & Windows",
    description: "Your home's envelope affects how much heating and cooling you need"
  }
];

const tonageGuide = [
  { sqft: "800-1,200", tons: "1.5 Ton", note: "Small homes, apartments" },
  { sqft: "1,200-1,600", tons: "2 Ton", note: "Average starter homes" },
  { sqft: "1,600-2,100", tons: "2.5 Ton", note: "Most common size" },
  { sqft: "2,100-2,700", tons: "3 Ton", note: "Larger family homes" },
  { sqft: "2,700-3,300", tons: "3.5 Ton", note: "Large homes" },
  { sqft: "3,300-4,000", tons: "4 Ton", note: "Very large homes" },
  { sqft: "4,000+", tons: "5+ Ton", note: "May need multiple systems" },
];

const SizingCalculator = () => {
  usePageSEO("/estimators/sizing");
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
                <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  Free Tool
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                HVAC Sizing Calculator
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Find the right size system for your home. Oversized units waste energy and 
                undersized units can't keep up – get it right the first time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Ruler className="relative h-20 w-20 text-primary" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sizing Factors */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Determines System Size?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Proper HVAC sizing involves more than just square footage
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {sizingFactors.map((factor, index) => (
                <motion.div
                  key={factor.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                        <factor.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {factor.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {factor.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Reference Guide */}
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
                Quick Sizing Reference
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                General guidelines for Dallas-Fort Worth area homes
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    Tonnage by Square Footage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Sq. Ft.</th>
                          <th className="text-left py-3 px-4 font-semibold">System Size</th>
                          <th className="text-left py-3 px-4 font-semibold">Typical Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tonageGuide.map((row, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-4">{row.sqft}</td>
                            <td className="py-3 px-4 font-medium text-primary">{row.tons}</td>
                            <td className="py-3 px-4 text-muted-foreground">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    These are estimates only. A proper Manual J load calculation is required for accurate sizing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get an Accurate Load Calculation
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our technicians perform Manual J load calculations to determine the exact 
                size system your home needs. No guesswork, no overselling.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Schedule Load Calculation",
                    buttonLocation: "Sizing Calculator CTA",
                    destinationUrl: "/contact"
                  })}
                >
                  <Link to="/contact">
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Schedule Load Calculation
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Call for Sizing Help",
                    buttonLocation: "Sizing Calculator CTA",
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

export default SizingCalculator;
