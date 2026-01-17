import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney } from "../hooks/usePricing";
import { Loader2, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

const getIcon = (name: string | null) => {
  if (!name) return Icons.Plus;
  const IconComp = (Icons as any)[name];
  return IconComp || Icons.Plus;
};

export const AddOnsSelector = () => {
  const { state, toggleAddon, nextStep, prevStep } = useQuote();

  const { addons, pricing, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const selectedCount = state.selectedAddonIds.length;
  const zoneCount = state.selectedRooms.length;

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Enhance Your System</h2>
        <p className="text-muted-foreground mb-6">
          Optional upgrades to maximize comfort and convenience. Skip if you prefer a standard installation.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {addons.map((addon) => {
              const isSelected = state.selectedAddonIds.includes(addon.id);
              const IconComp = getIcon(addon.icon_name);

              const addonTotal =
                addon.price_type === "per_zone"
                  ? addon.price * zoneCount
                  : addon.price;

              const priceDisplay =
                addon.price_type === "per_zone"
                  ? `${formatMoney(addon.price)}/zone`
                  : formatMoney(addon.price);

              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon.id)}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-[#d4a84b] bg-[#d4a84b]/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isSelected ? "bg-[#d4a84b] text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isSelected ? <Check className="h-5 w-5" /> : <IconComp className="h-5 w-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{addon.name}</span>
                      {addon.is_popular && (
                        <span className="text-xs bg-[#a5a983]/20 text-[#a5a983] px-2 py-0.5 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-semibold text-[#1e3a5f]">{priceDisplay}</span>
                    {addon.price_type === "per_zone" && zoneCount > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {formatMoney(addonTotal)} total
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected summary with running total */}
        {selectedCount > 0 && (
          <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-[#1e3a5f]">
                {selectedCount} upgrade{selectedCount !== 1 ? "s" : ""} selected
              </p>
              <p className="text-sm font-bold text-[#1e3a5f]">
                +{formatMoney(pricing.addonsTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} className="flex-1">
            {selectedCount > 0 ? "Continue" : "Skip Add-ons"}
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
