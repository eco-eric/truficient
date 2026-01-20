import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowRight, Loader2, CheckCircle, AlertCircle, Star, Clock, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEstimator } from "../context/EstimatorContext";
import { isDfwZipCode, isDfwByCity } from "@/pages/scanner/types";
import { validateZipCode } from "@/pages/scanner/utils/validateZipCode";
import { EstimatorHeader } from "@/components/estimators/EstimatorHeader";
import { EstimatorFooter } from "@/components/estimators/EstimatorFooter";
import { PricingGuarantee } from "@/components/estimators/PricingGuarantee";

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

  return (
    <div className="min-h-screen flex flex-col">
      <EstimatorHeader estimatorType="Ducted" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1 flex flex-col"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-10 sm:py-14 px-4">
          <div className="max-w-lg mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
            >
              Get Your Final HVAC Price Online
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/90 text-base sm:text-lg mb-6"
            >
              Answer a few questions about your home and receive accurate, locked-in pricing for your new AC or heat pump system.
            </motion.p>

            {/* Benefit pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-primary-foreground/10 backdrop-blur rounded-full px-3 py-1.5 text-sm"
                >
                  <benefit.icon className="w-4 h-4" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            {/* Pricing Guarantee */}
            <PricingGuarantee />

            <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full h-12 text-base font-semibold"
                disabled={isValidating || showOutOfAreaMessage || localZip.length < 5}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Get My Final Price
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Trust Elements */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.9</span>
                <span>•</span>
                <span>500+ systems installed across DFW this year</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <EstimatorFooter />
    </div>
  );
}
