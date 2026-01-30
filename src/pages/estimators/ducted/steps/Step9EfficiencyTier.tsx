import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, Lightbulb, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DuctedEfficiencyTier } from "../types";

// Format money helper
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Tier styling based on name
const getTierStyle = (name: string) => {
  switch (name) {
    case "efficient":
      return {
        bgClass: "bg-slate-50",
        labelBg: "bg-slate-100",
        labelText: "text-slate-700",
        icon: null,
      };
    case "efficiency_plus":
      return {
        bgClass: "bg-amber-50/50",
        labelBg: "bg-amber-100",
        labelText: "text-amber-700",
        icon: null,
      };
    case "premium":
      return {
        bgClass: "bg-[#1e3a5f]/5",
        labelBg: "bg-[#1e3a5f]",
        labelText: "text-white",
        icon: Star,
      };
    default:
      return {
        bgClass: "",
        labelBg: "bg-gray-100",
        labelText: "text-gray-700",
        icon: null,
      };
  }
};

// Equipment type interface for pricing calculation
interface DuctedEquipment {
  id: string;
  brand: string;
  system_type: string;
  seer2_rating: number | null;
  tonnage: number;
  equipment_cost: number;
  installation_labor: number;
  is_active: boolean;
  efficiency_tier_id: string | null;
}

export const Step9EfficiencyTier = () => {
  const { state, setEfficiencyTierId, nextStep, prevStep } = useEstimator();

  // Fetch efficiency tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["ducted-efficiency-tiers-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_efficiency_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Parse features JSON
      return (data || []).map((tier) => ({
        ...tier,
        features: Array.isArray(tier.features) ? tier.features : [],
      })) as DuctedEfficiencyTier[];
    },
  });

  // Fetch equipment for real pricing
  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ["ducted-equipment-pricing-v3"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_equipment")
        .select("id, brand, system_type, seer2_rating, tonnage, equipment_cost, installation_labor, is_active, efficiency_tier_id")
        .eq("is_active", true);

      if (error) throw error;
      return data as DuctedEquipment[];
    },
  });

  // Get available tonnages for the selected heating type
  const availableTonnages = (() => {
    if (!state.heatingType || equipment.length === 0) return [];
    
    const tonnages = equipment
      .filter((eq) => eq.system_type === state.heatingType)
      .map((eq) => eq.tonnage);
    
    return [...new Set(tonnages)].sort((a, b) => a - b);
  })();

  // Compute effective tonnage: user-selected or snap to nearest available
  const effectiveTonnage = (() => {
    if (state.selectedTonnage) return state.selectedTonnage;
    if (availableTonnages.length === 0) return null;
    
    // Default to a common tonnage (3) if no selection, snap to nearest available
    const target = 3;
    let closest = availableTonnages[0];
    let minDiff = Math.abs(target - closest);
    
    for (const t of availableTonnages) {
      const diff = Math.abs(target - t);
      if (diff < minDiff || (diff === minDiff && t > closest)) {
        closest = t;
        minDiff = diff;
      }
    }
    
    return closest;
  })();

  // Calculate price RANGE for a tier based on real equipment data
  const getPriceRangeForTier = (tier: DuctedEfficiencyTier) => {
    if (!equipment || equipment.length === 0) {
      return null;
    }

    // Filter equipment using efficiency_tier_id with variable speed rounding
    const matchingEquipment = equipment.filter((eq) => {
      // Match system type based on heating type selection
      const typeMatch = eq.system_type === state.heatingType;
      if (!typeMatch) return false;
      
      // Use tier ID matching
      const tierMatch = eq.efficiency_tier_id === tier.id;
      if (!tierMatch) return false;
      
      // Match effective tonnage with variable speed rounding
      if (effectiveTonnage) {
        // Variable speed brands (Trane, Bosch) only have whole-ton units
        // They can modulate down, so round UP to next whole ton for matching
        const isVariableSpeed = ['Trane', 'Bosch'].includes(eq.brand || '');
        const targetTonnage = isVariableSpeed 
          ? Math.ceil(effectiveTonnage) 
          : effectiveTonnage;
        return eq.tonnage === targetTonnage;
      }
      
      return true;
    });

    console.log(`[Step7 Debug] Tier ${tier.name}: ${matchingEquipment.length} matching equipment for tonnage ${effectiveTonnage}`);

    if (matchingEquipment.length === 0) {
      return null;
    }

    // Calculate prices (equipment + installation)
    const prices = matchingEquipment.map((eq) => 
      (eq.equipment_cost || 0) + (eq.installation_labor || 0)
    );
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: matchingEquipment.length,
    };
  };

  const isLoading = tiersLoading || equipmentLoading;

  const handleSelect = (id: string) => {
    setEfficiencyTierId(id);
  };

  // Find premium tier for recommendation
  const premiumTier = tiers.find((t) => t.name === "premium");

  if (isLoading) {
    return (
      <StepContainer className="px-4 pb-28 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </StepContainer>
    );
  }

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Select Efficiency Level
        </h2>
        <p className="text-muted-foreground mb-6">
          Higher efficiency means lower energy bills and better comfort.
        </p>

        <div className="space-y-4 mb-6">
          {tiers.map((tier) => {
            const style = getTierStyle(tier.name);
            const priceRange = getPriceRangeForTier(tier);
            const features = tier.features || [];
            const TierIcon = style.icon;

            return (
              <SelectableCard
                key={tier.id}
                selected={state.efficiencyTierId === tier.id}
                onClick={() => handleSelect(tier.id)}
                badge={tier.name === "premium" ? "Best Value" : undefined}
                className={cn("w-full", tier.name === "premium" && "mt-4")}
              >
                <div className="w-full">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1",
                          style.labelBg,
                          style.labelText
                        )}
                      >
                        {TierIcon && <TierIcon className="h-3 w-3" />}
                        {tier.display_name}
                      </span>
                    </div>
                    <div className="text-right">
                      {equipmentLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : priceRange ? (
                        <>
                          <div className="text-xs text-muted-foreground">Price Range</div>
                          <div className="text-lg font-bold text-[#1e3a5f]">
                            {priceRange.min === priceRange.max 
                              ? formatMoney(priceRange.min)
                              : `${formatMoney(priceRange.min)} - ${formatMoney(priceRange.max)}`
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {priceRange.count} option{priceRange.count > 1 ? 's' : ''} available
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">Contact for pricing</div>
                      )}
                    </div>
                  </div>

                  {/* SEER range */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {tier.seer_min} - {tier.seer_max} SEER2
                    </span>
                    <span className="text-xs text-muted-foreground">
                      efficiency rating
                    </span>
                  </div>

                  {/* Description */}
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {tier.description}
                    </p>
                  )}

                  {/* Features */}
                  {features.length > 0 && (
                    <ul className="space-y-1.5">
                      {features.slice(0, 4).map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-[#a5a983] flex-shrink-0" />
                          {String(feature)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </SelectableCard>
            );
          })}
        </div>

        {/* Expert recommendation */}
        {premiumTier && (
          <div className="rounded-xl bg-[#a5a983]/10 border border-[#a5a983]/30 p-4 mb-8 flex gap-3">
            <Lightbulb className="h-5 w-5 text-[#a5a983] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Expert Recommendation
              </p>
              <p className="text-sm text-muted-foreground">
                For Texas homes, the{" "}
                <strong>{premiumTier.display_name}</strong> tier offers the best
                long-term value with superior efficiency and comfort during
                extreme temperatures.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton
            onClick={nextStep}
            disabled={!state.efficiencyTierId}
            className="flex-1"
          >
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};