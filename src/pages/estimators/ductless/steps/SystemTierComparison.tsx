import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { Loader2, CheckCircle, Star, Lightbulb } from "lucide-react";
import type { DuctlessSystemTier } from "../types";
import { cn } from "@/lib/utils";

const tierLevelLabel: Record<string, string> = {
  good: "Good",
  better: "Better",
  best: "Best",
};

export const SystemTierComparison = () => {
  const { state, setSystemTierId, nextStep, prevStep } = useQuote();

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["ductless_system_tiers_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ductless_system_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctlessSystemTier[];
    },
  });

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

              return (
                <SelectableCard
                  key={tier.id}
                  selected={state.systemTierId === tier.id}
                  onClick={() => handleSelect(tier.id)}
                  badge={tier.is_featured ? "Best Value" : undefined}
                  className={cn("w-full", tier.is_featured && "mt-4")}
                >
                  <div className="w-full">
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
