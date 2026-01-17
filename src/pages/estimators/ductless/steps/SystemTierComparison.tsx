import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney } from "../hooks/usePricing";
import { Loader2, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const tierLevelLabel: Record<string, string> = {
  good: "Good",
  better: "Better",
  best: "Best",
};

export const SystemTierComparison = () => {
  const { state, setSystemTierId, nextStep, prevStep } = useQuote();

  const { tiers, selectedUnit, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const zoneCount = state.selectedRooms.length;
  const baseEquipmentCost = (selectedUnit?.base_price || 0) * zoneCount;

  const handleSelect = (id: string) => {
    setSystemTierId(id);
  };

  const featuredTier = tiers.find((t) => t.is_featured);

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Choose Your System Tier</h2>
        <p className="text-muted-foreground mb-6">
          All systems include professional installation. Select the tier that meets your comfort and efficiency goals.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {tiers.map((tier) => {
              const features: string[] = Array.isArray(tier.features) ? tier.features : [];
              const tierPrice = Math.round(baseEquipmentCost * tier.price_multiplier);

              return (
                <SelectableCard
                  key={tier.id}
                  selected={state.systemTierId === tier.id}
                  onClick={() => handleSelect(tier.id)}
                  badge={tier.is_featured ? "Best Value" : undefined}
                  className={cn("w-full", tier.is_featured && "mt-4")}
                >
                  <div className="w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                            tier.tier_level === "good" && "bg-blue-100 text-blue-700",
                            tier.tier_level === "better" && "bg-amber-100 text-amber-700",
                            tier.tier_level === "best" && "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          {tierLevelLabel[tier.tier_level]}
                        </span>
                        {tier.seer_rating && (
                          <span className="text-xs text-muted-foreground">{tier.seer_rating} SEER</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1e3a5f]">{formatMoney(tierPrice)}</div>
                        {tier.price_multiplier !== 1 && (
                          <div className="text-xs text-muted-foreground">
                            {tier.price_multiplier}× base price
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground text-lg">{tier.display_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="space-y-1">
                        {features.slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-[#a5a983]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Warranty */}
                    <div className="mt-3 text-sm font-medium text-[#1e3a5f]">
                      {tier.warranty_years}-Year Warranty
                    </div>
                  </div>
                </SelectableCard>
              );
            })}
          </div>
        )}

        {/* Expert recommendation */}
        {featuredTier && (
          <div className="rounded-xl bg-[#a5a983]/10 border border-[#a5a983]/30 p-4 mb-8 flex gap-3">
            <Lightbulb className="h-5 w-5 text-[#a5a983] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Expert Analysis</p>
              <p className="text-sm text-muted-foreground">
                We recommend the <strong>{featuredTier.display_name}</strong> for the best balance of performance, efficiency, and long-term value.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} disabled={!state.systemTierId} className="flex-1">
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
