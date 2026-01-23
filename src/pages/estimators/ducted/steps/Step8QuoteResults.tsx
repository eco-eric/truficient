import { useEffect, useState } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { 
  Loader2, CheckCircle2, Award, Zap, Shield, Snowflake, Flame, Percent,
  ThermometerSun, Wind, Wrench, Box, Mail
} from "lucide-react";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export const Step8QuoteResults = () => {
  const { state, nextStep, prevStep, setTotals, setRecommendedTonnage, setSelectedEquipmentId } = useEstimator();
  const { pricing, isLoading, matchingEquipment } = useDuctedPricing(state);
  
  // Local state for equipment selection in this view
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(state.selectedEquipmentId);
  
  // Email quote state
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailForQuote, setEmailForQuote] = useState("");

  // Update totals in context when pricing changes
  useEffect(() => {
    if (!isLoading && pricing.effectiveTonnage) {
      setRecommendedTonnage(pricing.recommendedTonnage);
      setTotals({
        equipmentCost: pricing.equipmentCost,
        installationCost: pricing.installationCost,
        addonsCost: pricing.addonsCost,
        subtotal: pricing.subtotal,
        taxAmount: pricing.taxAmount,
        finalTotal: pricing.finalTotal,
        monthlyFinancing: pricing.monthlyFinancing,
      });
    }
  }, [pricing, isLoading, setTotals, setRecommendedTonnage]);

  // Set default selected equipment
  useEffect(() => {
    if (!localSelectedId && matchingEquipment.length > 0) {
      const bestValue = matchingEquipment.find((eq) => eq.is_best_value);
      const defaultId = bestValue?.id || matchingEquipment[0]?.id;
      if (defaultId) {
        setLocalSelectedId(defaultId);
        setSelectedEquipmentId(defaultId);
      }
    }
  }, [matchingEquipment, localSelectedId, setSelectedEquipmentId]);

  const handleSelectEquipment = (id: string) => {
    setLocalSelectedId(id);
    setSelectedEquipmentId(id);
  };

  // Build quote raw details text for GHL
  const buildQuoteRawDetails = () => {
    const selectedEq = matchingEquipment.find((eq) => eq.id === localSelectedId) || matchingEquipment[0];
    const selectedPrice = selectedEq 
      ? (selectedEq.equipment_cost + selectedEq.installation_labor)
      : pricing.finalTotal;
    const systemTypeLabel = state.heatingType === "gas_system" ? "Gas Furnace + AC" : "Heat Pump System";
    const tierLabel = pricing.selectedTier?.display_name || "Standard";
    const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
    const homeTypeLabel = HOME_TYPE_OPTIONS.find((o) => o.value === state.homeType)?.label || "N/A";
    const layoutLabel = HOME_LAYOUT_OPTIONS.find((o) => o.value === state.homeLayout)?.label || "N/A";
    const sqftLabel = SQUARE_FOOTAGE_OPTIONS.find((o) => o.value === state.squareFootage)?.label || "N/A";

    const equipmentComponents = state.heatingType === "gas_system"
      ? [
          selectedEq?.condenser_model && `Condenser: ${selectedEq.condenser_model}`,
          selectedEq?.furnace_model && `Furnace: ${selectedEq.furnace_model}`,
          selectedEq?.evap_coil_model && `Evap Coil: ${selectedEq.evap_coil_model}`,
        ].filter(Boolean).join('\n')
      : [
          selectedEq?.heat_pump_model && `Heat Pump: ${selectedEq.heat_pump_model}`,
          selectedEq?.air_handler_model && `Air Handler: ${selectedEq.air_handler_model}`,
          selectedEq?.heat_kit_model && `Heat Kit: ${selectedEq.heat_kit_model}`,
        ].filter(Boolean).join('\n');

    return `DUCTED HVAC ESTIMATE
====================
Date: ${format(new Date(), "MMMM d, yyyy")}
Valid Until: ${validUntil}

SYSTEM CONFIGURATION
--------------------
System Type: ${systemTypeLabel}
Efficiency Tier: ${tierLabel}
System Size: ${pricing.effectiveTonnage} Ton

SELECTED EQUIPMENT
------------------
${selectedEq?.system_name || 'Custom System'}
Brand: ${selectedEq?.brand || 'TBD'}
${selectedEq?.seer2_rating ? `SEER2: ${selectedEq.seer2_rating}` : ''}
${selectedEq?.hspf2_rating && state.heatingType === "heat_pump" ? `HSPF2: ${selectedEq.hspf2_rating}` : ''}
${selectedEq?.eer2_rating ? `EER2: ${selectedEq.eer2_rating}` : ''}
Warranty: ${selectedEq?.warranty_years || 'Standard'} years

System Components:
${equipmentComponents || 'TBD during consultation'}

HOME DETAILS
------------
Home Type: ${homeTypeLabel}
Layout: ${layoutLabel}
Square Footage: ${sqftLabel}

PRICING BREAKDOWN
-----------------
Equipment & Installation: ${formatMoney(selectedPrice)}
Monthly Payment Option: ${formatMoney(Math.round(selectedPrice / 60 * 1.05))}/mo (60 months)`.trim();
  };

  const handleEmailQuote = async (email?: string) => {
    const emailToUse = email || emailForQuote;
    
    if (!emailToUse || !emailToUse.includes("@")) {
      setShowEmailInput(true);
      return;
    }

    setIsSendingQuote(true);

    try {
      const nameParts = emailToUse.split("@")[0].split(/[._-]/);
      const firstName = nameParts[0] || "Homeowner";
      const lastName = nameParts[1] || "";
      
      const systemTypeLabel = state.heatingType === "gas_system" ? "Gas Furnace + AC" : "Heat Pump System";
      const tierLabel = pricing.selectedTier?.display_name || "Standard";
      const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
      
      const selectedEq = matchingEquipment.find((eq) => eq.id === localSelectedId) || matchingEquipment[0];
      const selectedPrice = selectedEq 
        ? (selectedEq.equipment_cost + selectedEq.installation_labor)
        : pricing.finalTotal;

      const homeTypeLabel = HOME_TYPE_OPTIONS.find((o) => o.value === state.homeType)?.label || "N/A";
      const layoutLabel = HOME_LAYOUT_OPTIONS.find((o) => o.value === state.homeLayout)?.label || "N/A";
      const sqftLabel = SQUARE_FOOTAGE_OPTIONS.find((o) => o.value === state.squareFootage)?.label || "N/A";

      const quoteRawDetails = buildQuoteRawDetails();

      await supabase.functions.invoke("sync-ghl-contact", {
        body: {
          firstName,
          lastName,
          email: emailToUse,
          source: "Ducted Estimator - Save Quote",
          tags: ["save-quote-ducted", "ducted-estimator"],
          message: `Quote saved for ${systemTypeLabel} - ${pricing.effectiveTonnage} Ton - ${tierLabel} Tier`,
          quote: {
            systemType: `${systemTypeLabel} - ${tierLabel} Tier`,
            tonnage: `${pricing.effectiveTonnage} Ton`,
            equipment: selectedEq?.system_name || `${selectedEq?.brand || "Custom"} System`,
            price: formatMoney(selectedPrice),
            monthlyPayment: `${formatMoney(Math.round(selectedPrice / 60 * 1.05))}/mo`,
            homeDetails: `${homeTypeLabel}, ${layoutLabel}, ${sqftLabel}`,
            validUntil,
            tier: tierLabel,
            quoteRawDetails,
          },
        },
      });

      toast.success(`Quote sent to ${emailToUse}!`, {
        description: "Check your inbox for the estimate details.",
      });
      setShowEmailInput(false);
      setEmailForQuote("");
    } catch (err) {
      console.error("Error sending quote:", err);
      toast.error("Failed to send quote. Please try again.");
    } finally {
      setIsSendingQuote(false);
    }
  };

  if (isLoading) {
    return (
      <StepContainer className="px-4 py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
          <p className="mt-4 text-muted-foreground">Calculating your estimate...</p>
        </div>
      </StepContainer>
    );
  }

  // Get display values
  const homeTypeLabel = HOME_TYPE_OPTIONS.find((o) => o.value === state.homeType)?.label || "N/A";
  const layoutLabel = HOME_LAYOUT_OPTIONS.find((o) => o.value === state.homeLayout)?.label || "N/A";
  const sqftLabel = SQUARE_FOOTAGE_OPTIONS.find((o) => o.value === state.squareFootage)?.label || "N/A";
  const systemTypeLabel = state.heatingType === "gas_system" ? "Gas Furnace + AC" : "Heat Pump System";
  
  // Get selected equipment for pricing display (tax already included in pricing)
  const selectedEq = matchingEquipment.find((eq) => eq.id === localSelectedId) || matchingEquipment[0];
  const selectedPrice = selectedEq 
    ? (selectedEq.equipment_cost + selectedEq.installation_labor)
    : pricing.finalTotal;

  return (
    <StepContainer className="px-4 py-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <CheckCircle2 className="h-4 w-4" />
            Estimate Ready
          </div>
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
            Your Personalized Estimate
          </h2>
          <p className="text-muted-foreground">
            Based on your home's characteristics and preferences
          </p>
        </div>

        {/* System Summary */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            {state.heatingType === "gas_system" ? (
              <Flame className="h-6 w-6 text-orange-300" />
            ) : (
              <Snowflake className="h-6 w-6 text-cyan-300" />
            )}
            <div>
              <h3 className="font-semibold text-lg">{systemTypeLabel}</h3>
              <p className="text-white/70 text-sm">
                {pricing.effectiveTonnage} Ton • {pricing.selectedTier?.display_name || "Standard"} Tier
              </p>
            </div>
          </div>

          {/* Price display */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-1">Your Investment</p>
            <p className="text-4xl font-bold">{formatMoney(selectedPrice)}</p>
            <p className="text-white/70 text-sm mt-1">
              or {formatMoney(Math.round(selectedPrice / 60 * 1.05))}/month for 60 months
            </p>
          </div>
        </div>

        {/* All Matching Equipment Options */}
        <div className="mb-6">
          <h4 className="font-semibold text-[#1e3a5f] mb-4">
            Available Equipment Options ({matchingEquipment.length})
          </h4>
          
          {matchingEquipment.length > 0 ? (
            <div className="space-y-3">
              {matchingEquipment.map((eq) => {
                const totalPrice = eq.equipment_cost + eq.installation_labor;
                const isSelected = localSelectedId === eq.id;
                
                return (
                  <div 
                    key={eq.id}
                    onClick={() => handleSelectEquipment(eq.id)}
                    className={cn(
                      "rounded-xl p-4 border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-[#d4a84b] bg-[#d4a84b]/5 shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            {eq.system_name || `${eq.brand} ${eq.tonnage}T System`}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-[#d4a84b]" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{eq.brand} • {eq.tonnage} Ton</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-[#1e3a5f]">
                          {formatMoney(totalPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          incl. installation
                        </p>
                      </div>
                    </div>
                    
                    {/* Performance ratings */}
                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      <span className="px-2 py-1 bg-muted rounded-md">SEER2: {eq.seer2_rating || "—"}</span>
                      {eq.eer2_rating && (
                        <span className="px-2 py-1 bg-muted rounded-md">EER2: {eq.eer2_rating}</span>
                      )}
                      {eq.hspf2_rating && state.heatingType === "heat_pump" && (
                        <span className="px-2 py-1 bg-muted rounded-md">HSPF2: {eq.hspf2_rating}</span>
                      )}
                      <span className="px-2 py-1 bg-muted rounded-md">{eq.warranty_years}yr Warranty</span>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-2">
                      {eq.is_best_value && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Award className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                      {eq.is_energy_star && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Energy Star
                        </Badge>
                      )}
                    </div>

                    {/* Equipment Components (collapsed) */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          System Components
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {state.heatingType === "gas_system" ? (
                            <>
                              {eq.condenser_model && (
                                <div className="flex items-center gap-2">
                                  <Wind className="h-3.5 w-3.5 text-cyan-500" />
                                  <span className="text-muted-foreground">
                                    Condenser: <span className="font-medium text-foreground">{eq.condenser_model}</span>
                                  </span>
                                </div>
                              )}
                              {eq.furnace_model && (
                                <div className="flex items-center gap-2">
                                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-muted-foreground">
                                    Furnace: <span className="font-medium text-foreground">{eq.furnace_model}</span>
                                  </span>
                                </div>
                              )}
                              {eq.evap_coil_model && (
                                <div className="flex items-center gap-2">
                                  <Box className="h-3.5 w-3.5 text-blue-500" />
                                  <span className="text-muted-foreground">
                                    Coil: <span className="font-medium text-foreground">{eq.evap_coil_model}</span>
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {eq.heat_pump_model && (
                                <div className="flex items-center gap-2">
                                  <ThermometerSun className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-muted-foreground">
                                    Heat Pump: <span className="font-medium text-foreground">{eq.heat_pump_model}</span>
                                  </span>
                                </div>
                              )}
                              {eq.air_handler_model && (
                                <div className="flex items-center gap-2">
                                  <Wind className="h-3.5 w-3.5 text-cyan-500" />
                                  <span className="text-muted-foreground">
                                    Air Handler: <span className="font-medium text-foreground">{eq.air_handler_model}</span>
                                  </span>
                                </div>
                              )}
                              {eq.heat_kit_model && (
                                <div className="flex items-center gap-2">
                                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-muted-foreground">
                                    Heat Kit: <span className="font-medium text-foreground">{eq.heat_kit_model}</span>
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <p className="text-muted-foreground">
                Custom configuration for {pricing.effectiveTonnage} Ton {systemTypeLabel}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Final equipment selection will be confirmed during your consultation.
              </p>
            </div>
          )}
        </div>

        {/* Home Summary */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-[#1e3a5f] mb-3">Your Home Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home Type:</span>
              <span className="font-medium">{homeTypeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layout:</span>
              <span className="font-medium">{layoutLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{sqftLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Size:</span>
              <span className="font-medium">{pricing.effectiveTonnage} Ton</span>
            </div>
          </div>
        </div>

        {/* Financing callout */}
        <div className="bg-gradient-to-r from-[#a5a983]/20 to-[#a5a983]/10 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="p-3 bg-[#a5a983] rounded-full">
            <Percent className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-[#1e3a5f]">Financing Available</p>
            <p className="text-sm text-muted-foreground">
              As low as {formatMoney(Math.round(selectedPrice / 60 * 1.05))}/mo with approved credit
            </p>
          </div>
        </div>

        {/* Save My Quote */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-[#1e3a5f]" />
            <div>
              <p className="font-medium text-foreground">Save This Quote</p>
              <p className="text-sm text-muted-foreground">Get this estimate emailed to you for future reference</p>
            </div>
          </div>
          
          {showEmailInput ? (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={emailForQuote}
                onChange={(e) => setEmailForQuote(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => handleEmailQuote()}
                disabled={isSendingQuote || !emailForQuote}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
              >
                {isSendingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleEmailQuote()}
              disabled={isSendingQuote}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSendingQuote ? "Sending..." : "Email My Quote"}
            </Button>
          )}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#a5a983]" />
            <span>Licensed & Insured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-[#a5a983]" />
            <span>Expert Installation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#a5a983]" />
            <span>100% Satisfaction Guaranteed</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} className="flex-1">
            Get Your Quote
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};