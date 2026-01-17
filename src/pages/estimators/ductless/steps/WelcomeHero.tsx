import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { motion } from "framer-motion";
import { Award, ThermometerSnowflake, Wifi, Zap } from "lucide-react";

export const WelcomeHero = () => {
  const { nextStep } = useQuote();

  const features = [
    { icon: ThermometerSnowflake, label: "No Ductwork Needed" },
    { icon: Zap, label: "Individual Room Control" },
    { icon: Wifi, label: "Smart Wi-Fi Ready" },
    { icon: Award, label: "Rebates Available" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 text-center">
      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f]/10 px-4 py-1.5 text-sm font-medium text-[#1e3a5f] mb-6">
          <Award className="h-4 w-4" />
          Mitsubishi Diamond Contractor
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4 leading-tight">
          Get Your Ductless Mini-Split Estimate
        </h1>

        <p className="text-muted-foreground text-lg mb-8">
          Answer a few quick questions and receive an instant estimate for your ductless comfort system. No commitment required.
        </p>

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
              <f.icon className="h-5 w-5 text-[#d4a84b]" />
              {f.label}
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
          <div>
            <span className="block text-2xl font-bold text-[#1e3a5f]">1,000+</span>
            Installs
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="block text-2xl font-bold text-[#1e3a5f]">4.9★</span>
            Google Rating
          </div>
        </div>
      </motion.div>
    </div>
  );
};
