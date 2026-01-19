import { useEffect } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { Loader2, CheckCircle2, Award, Zap, Shield, Snowflake, Flame, Percent } from "lucide-react";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";

export const Step7QuoteResults = () => {
  const { state, nextStep, prevStep, setTotals, setRecommendedTonnage } = useEstimator();
  const { pricing, isLoading, matchingEquipment } = useDuctedPricing(state);

  // Update totals in context when pricing changes
  useEffect(() => {
    if (!isLoading && pricing.recommendedTonnage) {
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
                {pricing.recommendedTonnage} Ton • {pricing.selectedTier?.display_name || "Standard"} Tier
              </p>
            </div>
          </div>

          {/* Selected equipment details */}
          {pricing.selectedEquipment && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{pricing.selectedEquipment.system_name || `${pricing.selectedEquipment.brand} ${pricing.selectedEquipment.tonnage}T System`}</p>
                  <p className="text-sm text-white/70">{pricing.selectedEquipment.brand}</p>
                </div>
                <div className="flex gap-2">
                  {pricing.selectedEquipment.is_best_value && (
                    <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Best Value
                    </span>
                  )}
                  {pricing.selectedEquipment.is_energy_star && (
                    <span className="px-2 py-1 bg-green-500 text-green-900 text-xs font-medium rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Energy Star
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm mt-3">
                <div>
                  <p className="text-white/60">SEER2</p>
                  <p className="font-semibold">{pricing.selectedEquipment.seer2_rating || "—"}</p>
                </div>
                <div>
                  <p className="text-white/60">Tonnage</p>
                  <p className="font-semibold">{pricing.selectedEquipment.tonnage}</p>
                </div>
                <div>
                  <p className="text-white/60">Warranty</p>
                  <p className="font-semibold">{pricing.selectedEquipment.warranty_years} yr</p>
                </div>
              </div>
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
              <span className="text-muted-foreground">Recommended Size:</span>
              <span className="font-medium">{pricing.recommendedTonnage} Ton</span>
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
