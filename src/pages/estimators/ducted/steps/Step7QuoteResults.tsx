import { useEffect } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { 
  Loader2, CheckCircle2, Award, Zap, Shield, Snowflake, Flame, Percent,
  ThermometerSun, Wind, Wrench, Box
} from "lucide-react";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";

export const Step7QuoteResults = () => {
  const { state, nextStep, prevStep, setTotals, setRecommendedTonnage } = useEstimator();
  const { pricing, isLoading, matchingEquipment } = useDuctedPricing(state);

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
  const eq = pricing.selectedEquipment;

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

        {/* System Summary Card */}
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

          {/* Selected equipment details */}
          {eq && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">
                    {eq.system_name || `${eq.brand} ${eq.tonnage}T System`}
                  </p>
                  <p className="text-sm text-white/70">{eq.brand}</p>
                </div>
                <div className="flex gap-2">
                  {eq.is_best_value && (
                    <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Best Value
                    </span>
                  )}
                  {eq.is_energy_star && (
                    <span className="px-2 py-1 bg-green-500 text-green-900 text-xs font-medium rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Energy Star
                    </span>
                  )}
                </div>
              </div>

              {/* Performance Ratings */}
              <div className="grid grid-cols-4 gap-3 text-center text-sm mb-4">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs mb-1">SEER2</p>
                  <p className="font-bold text-lg">{eq.seer2_rating || "—"}</p>
                </div>
                {eq.eer2_rating && (
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white/60 text-xs mb-1">EER2</p>
                    <p className="font-bold text-lg">{eq.eer2_rating}</p>
                  </div>
                )}
                {eq.hspf2_rating && state.heatingType === "heat_pump" && (
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white/60 text-xs mb-1">HSPF2</p>
                    <p className="font-bold text-lg">{eq.hspf2_rating}</p>
                  </div>
                )}
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs mb-1">Tonnage</p>
                  <p className="font-bold text-lg">{eq.tonnage}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/60 text-xs mb-1">Warranty</p>
                  <p className="font-bold text-lg">{eq.warranty_years}yr</p>
                </div>
              </div>

              {/* Equipment Components */}
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs text-white/60 uppercase tracking-wide mb-2">
                  System Components
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {state.heatingType === "gas_system" ? (
                    <>
                      {eq.condenser_model && (
                        <div className="flex items-center gap-2">
                          <Wind className="h-3.5 w-3.5 text-cyan-300" />
                          <span className="text-white/80">
                            Condenser: <span className="font-medium text-white">{eq.condenser_model}</span>
                          </span>
                        </div>
                      )}
                      {eq.furnace_model && (
                        <div className="flex items-center gap-2">
                          <Flame className="h-3.5 w-3.5 text-orange-300" />
                          <span className="text-white/80">
                            Furnace: <span className="font-medium text-white">{eq.furnace_model}</span>
                          </span>
                        </div>
                      )}
                      {eq.evap_coil_model && (
                        <div className="flex items-center gap-2">
                          <Box className="h-3.5 w-3.5 text-blue-300" />
                          <span className="text-white/80">
                            Coil: <span className="font-medium text-white">{eq.evap_coil_model}</span>
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {eq.heat_pump_model && (
                        <div className="flex items-center gap-2">
                          <ThermometerSun className="h-3.5 w-3.5 text-amber-300" />
                          <span className="text-white/80">
                            Heat Pump: <span className="font-medium text-white">{eq.heat_pump_model}</span>
                          </span>
                        </div>
                      )}
                      {eq.air_handler_model && (
                        <div className="flex items-center gap-2">
                          <Wind className="h-3.5 w-3.5 text-cyan-300" />
                          <span className="text-white/80">
                            Air Handler: <span className="font-medium text-white">{eq.air_handler_model}</span>
                          </span>
                        </div>
                      )}
                      {eq.heat_kit_model && (
                        <div className="flex items-center gap-2">
                          <Flame className="h-3.5 w-3.5 text-orange-300" />
                          <span className="text-white/80">
                            Heat Kit: <span className="font-medium text-white">{eq.heat_kit_model}</span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No matching equipment fallback */}
          {!eq && (
            <div className="bg-white/10 rounded-xl p-4 mb-4 text-center">
              <p className="text-white/80">
                Custom configuration for {pricing.effectiveTonnage} Ton {systemTypeLabel}
              </p>
              <p className="text-sm text-white/60 mt-1">
                Final equipment selection will be confirmed during your consultation.
              </p>
            </div>
          )}

          {/* Price display */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-1">Your Investment</p>
            <p className="text-4xl font-bold">{formatMoney(pricing.finalTotal)}</p>
            <p className="text-white/70 text-sm mt-1">
              or {formatMoney(pricing.monthlyFinancing)}/month for 60 months
            </p>
          </div>
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

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <h4 className="font-medium text-[#1e3a5f] mb-3">Investment Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equipment</span>
              <span className="font-medium">{formatMoney(pricing.equipmentCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Professional Installation</span>
              <span className="font-medium">{formatMoney(pricing.installationCost)}</span>
            </div>
            {pricing.addonsBreakdown.length > 0 && (
              <>
                <div className="border-t border-border my-2" />
                {pricing.addonsBreakdown.map((addon) => (
                  <div key={addon.id} className="flex justify-between">
                    <span className="text-muted-foreground">{addon.name}</span>
                    <span className="font-medium">{formatMoney(addon.price)}</span>
                  </div>
                ))}
              </>
            )}
            <div className="border-t border-border my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoney(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8.25%)</span>
              <span className="font-medium">{formatMoney(pricing.taxAmount)}</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total Investment</span>
              <span className="text-[#1e3a5f]">{formatMoney(pricing.finalTotal)}</span>
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
              As low as {formatMoney(pricing.monthlyFinancing)}/mo with approved credit
            </p>
          </div>
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