import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowRight, Loader2, CheckCircle, AlertCircle, Star, Clock, Shield, Zap, DollarSign, Calendar, Gift, ThermometerSnowflake, Home, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useEstimator } from "../context/EstimatorContext";
import { isDfwZipCode, isDfwByCity } from "@/pages/scanner/types";
import { validateZipCode } from "@/pages/scanner/utils/validateZipCode";
import { PricingGuarantee } from "@/components/estimators/PricingGuarantee";
import ductedHeroFamily from "@/assets/ducted-hero-family.webp";

export function Step0ZipCodeGate() {
  const { state, setZipCode, setZipLocation, setIsInServiceArea, nextStep } = useEstimator();
  const [localZip, setLocalZip] = useState(state.zipCode);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedLocation, setValidatedLocation] = useState<{
    city: string;
    state: string;
    formatted: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanZip = localZip.replace(/\D/g, "");
    if (cleanZip.length < 5) {
      setError("Please enter a valid 5-digit zip code");
      return;
    }

    // Check if user is in service area
    const isInDfw = validatedLocation
      ? isDfwByCity(validatedLocation.city, validatedLocation.state)
      : isDfwZipCode(cleanZip);

    if (!isInDfw) {
      setError("");
      return; // Block submission - message shown below
    }

    setZipCode(cleanZip);
    setZipLocation(validatedLocation?.city || null, validatedLocation?.state || null);
    setIsInServiceArea(true);
    nextStep();
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setLocalZip(value);
    setError("");
    setValidatedLocation(null);

    // Auto-validate when 5 digits entered
    if (value.length === 5) {
      setIsValidating(true);
      try {
        const validation = await validateZipCode(value);
        if (validation.valid && validation.city && validation.state && validation.formatted) {
          setValidatedLocation({
            city: validation.city,
            state: validation.state,
            formatted: validation.formatted,
          });
        } else if (!validation.valid) {
          setError(validation.error || "Please enter a valid US zip code");
        }
      } catch (err) {
        console.error("Zip validation error:", err);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const isInDfw = validatedLocation
    ? isDfwByCity(validatedLocation.city, validatedLocation.state)
    : localZip.length === 5 && isDfwZipCode(localZip);

  const showOutOfAreaMessage = localZip.length === 5 && !isValidating && validatedLocation && !isInDfw;

  const benefits = [
    { icon: Zap, text: "Final pricing, not estimates" },
    { icon: Clock, text: "Takes just 2 minutes" },
    { icon: Shield, text: "No appointment required" },
  ];

  const features = [
    { icon: DollarSign, title: "Transparent Pricing", desc: "See exact costs upfront" },
    { icon: Calendar, title: "Easy Scheduling", desc: "Book at your convenience" },
    { icon: Gift, title: "Special Offers", desc: "Exclusive online discounts" },
    { icon: Shield, title: "Quality Guaranteed", desc: "Licensed & insured pros" },
  ];

  const whyCentralAC = [
    { icon: Home, title: "Whole-Home Comfort", desc: "Even temperatures in every room" },
    { icon: ThermometerSnowflake, title: "Hidden Components", desc: "Discreet, out-of-sight installation" },
    { icon: Leaf, title: "Energy Efficient", desc: "Lower utility bills year-round" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col"
    >
      {/* Hero Section with Background Image */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={ductedHeroFamily}
                alt="Happy family enjoying comfortable temperatures on their couch"
                className="w-full h-56 sm:h-72 md:h-96 object-cover"
              />
              {/* Diamond Contractor Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 dark:bg-card/95 rounded-full px-3 py-1.5 shadow-lg">
                <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✦</span>
                </div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Certified Diamond Contractor
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Get Your Instant HVAC Price Online
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Answer a few questions about your home and receive accurate, locked-in pricing for your new AC or heat pump system.
            </p>
          </motion.div>

          {/* Benefit Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-medium"
              >
                <benefit.icon className="w-4 h-4" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Pricing Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6"
          >
            <PricingGuarantee />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Zip Code Input */}
              <div className="space-y-2">
                <Label htmlFor="zip-code" className="text-base font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Enter your zip code to get started
                </Label>
                <div className="relative">
                  <Input
                    id="zip-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter zip code"
                    value={localZip}
                    onChange={handleZipChange}
                    className="text-lg h-12"
                    autoComplete="postal-code"
                    required
                    disabled={isValidating}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {validatedLocation && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {validatedLocation.formatted}
                  </p>
                )}
                {isInDfw && validatedLocation && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Great! You're in our service area.
                  </p>
                )}
              </div>

              {/* Out of Service Area Message */}
              {showOutOfAreaMessage && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      It looks like that ZIP code is outside our current service area. To ensure
                      accuracy, our estimator is specifically calibrated for the DFW Metroplex,
                      factoring in local labor rates, climate-specific sizing, and regional building
                      codes. At this time, we only provide estimates for projects within our local
                      footprint.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                disabled={isValidating || showOutOfAreaMessage || localZip.length < 5}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Start My Free Estimate
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-6 mb-8 pb-8 border-b"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">1,000+</div>
              <div className="text-sm text-muted-foreground">Installs</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-foreground">4.9</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sm text-muted-foreground">Google Rating</div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-10"
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card border rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Why Central AC Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <h2 className="text-xl font-bold text-foreground text-center mb-4">
              Why Central AC?
            </h2>
            <div className="space-y-3">
              {whyCentralAC.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
                >
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
