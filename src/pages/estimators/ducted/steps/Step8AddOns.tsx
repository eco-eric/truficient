import { motion } from "framer-motion";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { Loader2, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

const getIcon = (name: string | null) => {
  if (!name) return Icons.Plus;
  const IconComp = (Icons as any)[name];
  return IconComp || Icons.Plus;
};

const AIRZONE_ID = "b1eca69a-d346-4ccf-a664-e81f3e95f44b";
const EWC_ID = "37fe15e5-6bdf-43c7-b2d6-163235a3baa6";

export const Step8AddOns = () => {
  const { state, toggleAddon, nextStep, prevStep } = useEstimator();

  const { addons, isLoading, matchingEquipment } = useDuctedPricing(state);

  // Filter add-ons based on selected equipment brand
  const selectedEq = matchingEquipment.find((eq) => eq.id === state.selectedEquipmentId) || matchingEquipment[0];
  const brand = selectedEq?.brand;
  const filteredAddons = addons.filter((addon) => {
    if (brand === "Mitsubishi" && addon.id === EWC_ID) return false;
    if (["Goodman", "Trane", "Bosch"].includes(brand || "") && addon.id === AIRZONE_ID) return false;
    return true;
  });

  const selectedCount = state.selectedAddonIds.length;

  // Calculate selected add-ons total
  const selectedAddonsTotal = filteredAddons
    .filter((a) => state.selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-[calc(100dvh-200px)] pb-20 md:pb-24 px-4"
    >
      <div className="max-w-lg mx-auto w-full pt-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Enhance Your System</h2>
        <p className="text-muted-foreground mb-6">
          Optional upgrades to maximize comfort and convenience. Skip if you prefer a standard installation.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAddons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No add-ons available at this time.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filteredAddons.map((addon) => {
              const isSelected = state.selectedAddonIds.includes(addon.id);
              const IconComp = getIcon(addon.icon_name);

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
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isSelected ? "bg-[#d4a84b] text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isSelected ? <Check className="h-5 w-5" /> : <IconComp className="h-5 w-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{addon.name}</span>
                      {addon.is_popular && (
                        <span className="text-xs bg-[#d4a84b]/20 text-[#d4a84b] px-2 py-0.5 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    {addon.description && (
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-[#1e3a5f]">{formatMoney(addon.price)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected summary */}
        {selectedCount > 0 && (
          <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-[#1e3a5f]">
                {selectedCount} upgrade{selectedCount !== 1 ? "s" : ""} selected
              </p>
              <p className="text-sm font-bold text-[#1e3a5f]">
                +{formatMoney(selectedAddonsTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={prevStep}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="flex-1 px-6 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#1e3a5f]/90 transition-colors"
          >
            {selectedCount > 0 ? "Continue" : "Skip Add-ons"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
