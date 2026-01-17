import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { Loader2, CheckCircle } from "lucide-react";
import type { DuctlessUnitType } from "../types";

export const UnitStyleSelector = () => {
  const { state, setUnitTypeId, nextStep, prevStep } = useQuote();

  const { data: unitTypes = [], isLoading } = useQuery({
    queryKey: ["ductless_unit_types_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ductless_unit_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctlessUnitType[];
    },
  });

  const handleSelect = (id: string) => {
    setUnitTypeId(id);
  };

  const selectedUnit = unitTypes.find((u) => u.id === state.unitTypeId);

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Choose Your Indoor Unit Style</h2>
        <p className="text-muted-foreground mb-6">
          Select the indoor unit style that best fits your space and aesthetic preferences.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {unitTypes.map((unit) => {
              const benefits: string[] = Array.isArray(unit.benefits) ? unit.benefits : [];

              return (
                <SelectableCard
                  key={unit.id}
                  selected={state.unitTypeId === unit.id}
                  onClick={() => handleSelect(unit.id)}
                  className="w-full"
                >
                  <div className="w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{unit.display_name}</h3>
                        <p className="text-sm text-muted-foreground">{unit.description}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    {benefits.length > 0 && (
                      <ul className="space-y-1 mt-3">
                        {benefits.slice(0, 4).map((b, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-[#a5a983]" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SelectableCard>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} disabled={!state.unitTypeId} className="flex-1">
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
