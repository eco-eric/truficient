import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney, getPriceRange } from "../hooks/usePricing";
import { Loader2, CheckCircle, ImageIcon } from "lucide-react";

export const UnitStyleSelector = () => {
  const { state, setUnitTypeId, nextStep, prevStep } = useQuote();

  const { unitTypes, tiers, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const zoneCount = state.selectedRooms.length;

  const handleSelect = (id: string) => {
    setUnitTypeId(id);
  };

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
              
              // Calculate price range for this unit type
              const baseTotal = unit.base_price * zoneCount;
              const priceRange = getPriceRange(baseTotal, tiers);

              return (
                <SelectableCard
                  key={unit.id}
                  selected={state.unitTypeId === unit.id}
                  onClick={() => handleSelect(unit.id)}
                  className="w-full"
                >
                  <div className="flex gap-4 w-full">
                    {/* Unit Image */}
                    {unit.image_url ? (
                      <img
                        src={unit.image_url}
                        alt={unit.display_name}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg">{unit.display_name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-[#1e3a5f]">
                            {formatMoney(priceRange.low)}
                            {priceRange.high !== priceRange.low && (
                              <span className="text-sm font-normal text-muted-foreground">
                                {" "}– {formatMoney(priceRange.high)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatMoney(unit.base_price)}/zone × {zoneCount}
                          </div>
                        </div>
                      </div>

                      {/* Benefits */}
                      {benefits.length > 0 && (
                        <ul className="space-y-1">
                          {benefits.slice(0, 3).map((b, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-[#a5a983] flex-shrink-0" />
                              <span className="line-clamp-1">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
