import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { motion } from "framer-motion";
import { Award, ThermometerSnowflake, Wifi, Zap, Clock, Shield, Star } from "lucide-react";
import { EstimatorFooter } from "@/components/estimators/EstimatorFooter";
import { PricingGuarantee } from "@/components/estimators/PricingGuarantee";

export const WelcomeHero = () => {
  const { nextStep } = useQuote();

  const features = [
    { icon: ThermometerSnowflake, label: "No Ductwork Needed" },
    { icon: Zap, label: "Individual Room Control" },
    { icon: Wifi, label: "Smart Wi-Fi Ready" },
    { icon: Award, label: "Rebates Available" },
  ];

  const benefits = [
    { icon: Zap, text: "Final pricing, not estimates" },
    { icon: Clock, text: "Takes just 2 minutes" },
    { icon: Shield, text: "No appointment required" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto w-full"
        >
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Award className="h-4 w-4" />
            Mitsubishi Diamond Contractor
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4 leading-tight">
            Get Your Final Ductless Price
          </h1>

          <p className="text-muted-foreground text-lg mb-6">
            Answer a few quick questions and lock in your price for a ductless comfort system. What you see is what you pay.
          </p>

          {/* Benefit pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-primary/5 rounded-full px-3 py-1.5 text-sm text-primary"
              >
                <benefit.icon className="w-4 h-4" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Pricing Guarantee */}
          <div className="mb-8">
            <PricingGuarantee variant="compact" />
          </div>

          {/* CTA */}
          <CTAButton onClick={nextStep} fullWidth className="mb-10">
            Start My Free Estimate
          </CTAButton>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 rounded-xl bg-card border p-3 text-sm font-medium text-foreground"
              >
                <f.icon className="h-5 w-5 text-secondary" />
                {f.label}
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <div>
              <span className="block text-2xl font-bold text-primary">1,000+</span>
              Installs
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-primary">4.9</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              Google Rating
            </div>
          </div>
        </motion.div>
      </div>

      <EstimatorFooter />
    </div>
  );
};
