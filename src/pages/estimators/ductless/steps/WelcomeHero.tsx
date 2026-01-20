import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { motion } from "framer-motion";
import { Award, ThermometerSnowflake, Wifi, Zap, Clock, Shield, Star, DollarSign, Calendar, Gift, CheckCircle } from "lucide-react";
import { PricingGuarantee } from "@/components/estimators/PricingGuarantee";
import ductlessWallMount from "@/assets/ductless-wall-mount.png";

export const WelcomeHero = () => {
  const { nextStep } = useQuote();

  const featureCards = [
    { icon: DollarSign, label: "Final pricing, not estimates" },
    { icon: Clock, label: "Takes just 2 minutes" },
    { icon: Calendar, label: "No appointment required" },
    { icon: Gift, label: "Rebates Available" },
  ];

  const whyDuctless = [
    {
      icon: ThermometerSnowflake,
      title: "No Ductwork Needed",
      description: "Perfect for homes without existing ducts or room additions.",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      icon: Zap,
      title: "Individual Room Control",
      description: "Set different temperatures in each zone for personalized comfort.",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      icon: Wifi,
      title: "Smart Wi-Fi Ready",
      description: "Control your comfort from anywhere with smartphone apps.",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                <img
                  src={ductlessWallMount}
                  alt="Ductless mini-split wall unit in modern living room"
                  className="w-full h-48 sm:h-64 md:h-80 object-contain mx-auto"
                />
                {/* Diamond Contractor Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 dark:bg-card/95 rounded-full px-3 py-1.5 shadow-lg">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Certified Diamond Contractor
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                Get Your Final Ductless Price
              </h1>

              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                Answer a few quick questions and lock in your price for a ductless comfort system. What you see is what you pay.
              </p>

              {/* Pricing Guarantee */}
              <div className="mb-6">
                <PricingGuarantee variant="compact" />
              </div>

              {/* CTA Button */}
              <CTAButton onClick={nextStep} fullWidth className="max-w-md mx-auto mb-8">
                Start My Free Estimate
              </CTAButton>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-10">
                {featureCards.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-2 rounded-xl bg-card border p-3 text-sm font-medium text-foreground"
                  >
                    <feature.icon className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-left">{feature.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mb-12">
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-bold text-primary">1,000+</span>
                  <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Installs</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">4.9</span>
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Google Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Ductless Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
                Why Ductless?
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {whyDuctless.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-card rounded-xl border p-5 text-center"
                  >
                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
