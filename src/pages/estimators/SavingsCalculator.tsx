import { motion } from "framer-motion";
import { PiggyBank, Zap, TrendingDown, Leaf, Phone, CalendarCheck, CheckCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useButtonTracking } from "@/hooks/useButtonTracking";

const savingsFactors = [
  {
    icon: Zap,
    title: "Higher Efficiency",
    description: "Newer systems use 30-50% less energy than units from 10+ years ago"
  },
  {
    icon: TrendingDown,
    title: "Lower Bills",
    description: "SEER2 ratings of 16+ can significantly reduce your monthly costs"
  },
  {
    icon: Leaf,
    title: "Tax Credits",
    description: "Federal incentives up to $2,000 for qualifying heat pump systems"
  }
];

const efficiencyComparison = [
  { seer: "10 SEER", annual: "$1,800", savings: "-", percent: "Baseline (Old Unit)" },
  { seer: "14 SEER2", annual: "$1,285", savings: "$515", percent: "29% savings" },
  { seer: "16 SEER2", annual: "$1,125", savings: "$675", percent: "38% savings" },
  { seer: "18 SEER2", annual: "$1,000", savings: "$800", percent: "44% savings" },
  { seer: "20+ SEER2", annual: "$900", savings: "$900", percent: "50% savings" },
];

const rebatesIncentives = [
  {
    title: "Federal Tax Credit",
    amount: "Up to $2,000",
    description: "For qualifying heat pump systems meeting efficiency requirements"
  },
  {
    title: "Utility Rebates",
    amount: "Varies",
    description: "Oncor, TXU, and other providers offer efficiency rebates"
  },
  {
    title: "Manufacturer Rebates",
    amount: "$200-$1,500",
    description: "Seasonal promotions from Carrier, Mitsubishi, and others"
  }
];

const SavingsCalculator = () => {
  usePageSEO("/estimators/savings");
  const { trackButtonClick } = useButtonTracking();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  Save Money
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                Energy Savings Calculator
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                See how much you could save by upgrading to a high-efficiency system. 
                Plus, learn about available rebates and tax credits.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                  <PiggyBank className="relative h-20 w-20 text-primary" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Savings Factors */}
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
                How You'll Save
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Modern HVAC systems deliver significant cost savings through improved efficiency
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {savingsFactors.map((factor, index) => (
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

        {/* Efficiency Comparison Table */}
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
                Annual Savings by Efficiency
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Based on typical 2,000 sq ft home in Dallas-Fort Worth
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Estimated Annual Cooling Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Efficiency</th>
                          <th className="text-left py-3 px-4 font-semibold">Annual Cost</th>
                          <th className="text-left py-3 px-4 font-semibold">Yearly Savings</th>
                          <th className="text-left py-3 px-4 font-semibold">Comparison</th>
                        </tr>
                      </thead>
                      <tbody>
                        {efficiencyComparison.map((row, index) => (
                          <tr key={index} className={`border-b last:border-0 ${index === 0 ? 'bg-muted/50' : ''}`}>
                            <td className="py-3 px-4 font-medium">{row.seer}</td>
                            <td className="py-3 px-4">{row.annual}</td>
                            <td className="py-3 px-4 text-primary font-semibold">{row.savings}</td>
                            <td className="py-3 px-4 text-muted-foreground">{row.percent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Actual savings vary based on usage, home efficiency, and electricity rates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Rebates & Incentives */}
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
                Available Rebates & Incentives
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take advantage of available programs to reduce your upfront costs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {rebatesIncentives.map((rebate, index) => (
                <motion.div
                  key={rebate.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {rebate.amount}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {rebate.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {rebate.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
                Calculate Your Actual Savings
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a free consultation and we'll analyze your current energy usage 
                to show you exactly how much you could save with a new system.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Get Personalized Savings Analysis",
                    buttonLocation: "Savings Calculator CTA",
                    destinationUrl: "/contact"
                  })}
                >
                  <Link to="/contact">
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Get Personalized Analysis
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  onClick={() => trackButtonClick({
                    buttonName: "Call for Savings Info",
                    buttonLocation: "Savings Calculator CTA",
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

export default SavingsCalculator;
