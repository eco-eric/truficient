import { useEffect, useState } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { 
  Loader2, CheckCircle2, Award, Zap, Shield, Snowflake, Flame,
  ThermometerSun, Wind, Wrench, Box, User, Mail, Phone, MapPin, Pencil,
  Check, Plus
} from "lucide-react";
import * as Icons from "lucide-react";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinancingOptionsSection } from "@/components/estimators/FinancingOptionsSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSourceTags } from "@/hooks/useFormSourceTags";
import { addDays, format } from "date-fns";

const getIcon = (name: string | null) => {
  if (!name) return Plus;
  const IconComp = (Icons as any)[name];
  return IconComp || Plus;
};

export const Step10QuoteResults = () => {
  const { state, nextStep, prevStep, goToStep, setTotals, setRecommendedTonnage, setSelectedEquipmentId, toggleAddon } = useEstimator();
  const { pricing, isLoading, matchingEquipment, addons } = useDuctedPricing(state);
  const { data: dynamicTags } = useFormSourceTags('ducted');

  // Goodman 20% discount
  const GOODMAN_DISCOUNT = 0.20;
  
  // Local state for equipment selection and submission
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(state.selectedEquipmentId);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Build full address string
  const getFullAddress = () => {
    const street = state.customerInfo.streetAddress?.trim() || "";
    const city = state.customerInfo.city?.trim() || "";
    const zip = state.customerInfo.zipCode?.trim() || "";
    if (street && city && zip) {
      return `${street}, ${city}, TX ${zip}`;
    }
    return "";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const nameParts = state.customerInfo.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const fullAddress = getFullAddress();
      const systemTypeLabel = state.heatingType === "gas_system" ? "Gas Furnace + AC" : "Heat Pump";
      const tierName = pricing.selectedTier?.display_name || "Standard";
      const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");

      // Build tags from dynamic configuration + heating type + save-quote tag
      const tags = [...(dynamicTags || ['ducted-estimator']), state.heatingType || 'hvac', 'save-quote-ducted'];

      // Build detailed labels for raw details
      const homeTypeLabel = HOME_TYPE_OPTIONS.find((o) => o.value === state.homeType)?.label || "N/A";
      const layoutLabel = HOME_LAYOUT_OPTIONS.find((o) => o.value === state.homeLayout)?.label || "N/A";
      const sqftLabel = SQUARE_FOOTAGE_OPTIONS.find((o) => o.value === state.squareFootage)?.label || "N/A";

      // Build equipment components for raw details
      const selectedEq = pricing.selectedEquipment;
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

      const quoteRawDetails = `DUCTED HVAC ESTIMATE REQUEST
============================
Date: ${format(new Date(), "MMMM d, yyyy")}
Valid Until: ${validUntil}

CUSTOMER INFORMATION
--------------------
Name: ${state.customerInfo.name}
Email: ${state.customerInfo.email}
Phone: ${state.customerInfo.phone || 'Not provided'}
Address: ${fullAddress || 'Not provided'}
Best Time to Call: ${state.customerInfo.bestTimeToCall || 'No preference'}

SYSTEM CONFIGURATION
--------------------
System Type: ${systemTypeLabel}
Efficiency Tier: ${tierName}
System Size: ${pricing.recommendedTonnage} Ton

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
Equipment Cost: ${formatMoney(pricing.equipmentCost)}
Installation Cost: ${formatMoney(pricing.installationCost)}
Add-ons: ${formatMoney(pricing.addonsCost)}
Tax: ${formatMoney(pricing.taxAmount)}
-----------------
TOTAL: ${formatMoney(pricing.finalTotal)}

Monthly Payment Option: ${formatMoney(pricing.monthlyFinancing)}/mo with financing`.trim();

      // Update the partial submission with final quote details
      if (state.partialSubmissionId) {
        const { error } = await supabase
          .from("ducted_estimate_submissions")
          .update({
            efficiency_tier_id: state.efficiencyTierId || null,
            equipment_id: pricing.selectedEquipment?.id || null,
            recommended_tonnage: pricing.recommendedTonnage || null,
            selected_addons: state.selectedAddonIds.length > 0 
              ? pricing.addonsBreakdown.map((a) => ({ id: a.id, name: a.name, price: a.price }))
              : null,
            equipment_cost: pricing.equipmentCost || 0,
            installation_cost: pricing.installationCost || 0,
            addons_cost: pricing.addonsCost || 0,
            tax_amount: pricing.taxAmount || 0,
            final_total: pricing.finalTotal || 0,
            status: "new",
            wants_backup_quote: state.customerInfo.wantsBackupQuote || false,
            notes: state.customerInfo.notes?.trim() || null,
          })
          .eq("id", state.partialSubmissionId);

        if (error) {
          console.error("Failed to update submission:", error);
          throw error;
        }

        // Sync to GHL using direct fetch (no auth required for public submissions)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email: state.customerInfo.email,
            phone: state.customerInfo.phone || undefined,
            address: fullAddress || undefined,
            notes: state.customerInfo.notes || undefined,
            source: "Ducted HVAC Estimator",
            tags,
            message: `Ducted HVAC Estimate Request:
• System: ${systemTypeLabel} - ${tierName} Tier
• Size: ${pricing.recommendedTonnage} Ton
• Home: ${state.homeType}, ${state.homeLayout}, ${state.squareFootage} sq ft
• Estimate: $${pricing.finalTotal.toLocaleString()}
• Address: ${fullAddress || "Not provided"}`,
            zipCode: state.customerInfo.zipCode || undefined,
            isDfw: true,
            quote: {
              systemType: `${systemTypeLabel} - ${tierName} Tier`,
              tonnage: `${pricing.recommendedTonnage} Ton`,
              equipment: selectedEq?.system_name || `${selectedEq?.brand || "Custom"} System`,
              price: formatMoney(pricing.finalTotal),
              monthlyPayment: `${formatMoney(pricing.monthlyFinancing)}/mo`,
              homeDetails: `${homeTypeLabel}, ${layoutLabel}, ${sqftLabel}`,
              validUntil,
              tier: tierName,
              quoteRawDetails,
            },
          }),
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.contactId) {
              await supabase
                .from("ducted_estimate_submissions")
                .update({ 
                  ghl_contact_id: data.contactId,
                  ghl_sync_status: "synced" 
                })
                .eq("id", state.partialSubmissionId);

              // Send internal notification
              const notificationUrl = `${supabaseUrl}/functions/v1/send-estimator-notification`;
              fetch(notificationUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  estimatorType: "ducted",
                  customerName: state.customerInfo.name,
                  customerEmail: state.customerInfo.email,
                  customerPhone: state.customerInfo.phone || undefined,
                  customerAddress: fullAddress || undefined,
                  quoteTotal: formatMoney(pricing.finalTotal),
                  quoteDetails: quoteRawDetails,
                }),
              }).catch((err) => {
                console.error("Notification error (non-blocking):", err);
              });
            }
          }
        }).catch((err) => {
          console.error("GHL sync error (non-blocking):", err);
        });
      } else {
        // No partial submission, create new one
        const submissionData = {
          customer_name: state.customerInfo.name?.trim() || "",
          customer_email: state.customerInfo.email?.trim() || "",
          customer_phone: state.customerInfo.phone?.trim() || null,
          customer_address: fullAddress?.trim() || null,
          best_time_to_call: state.customerInfo.bestTimeToCall || null,
          wants_backup_quote: state.customerInfo.wantsBackupQuote || false,
          home_type: state.homeType || "single_family",
          home_layout: state.homeLayout || "1_story",
          square_footage: state.squareFootage || "1600_2000",
          hot_cold_spots: state.hotColdSpots || null,
          winter_temp: state.winterTemp || null,
          summer_temp: state.summerTemp || null,
          heating_type: state.heatingType || "gas_system",
          coverage: state.coverage || "entire_home",
          system_count: state.systemCount || 1,
          efficiency_tier_id: state.efficiencyTierId || null,
          equipment_id: pricing.selectedEquipment?.id || null,
          recommended_tonnage: pricing.recommendedTonnage || null,
          selected_addons: state.selectedAddonIds.length > 0 
            ? pricing.addonsBreakdown.map((a) => ({ id: a.id, name: a.name, price: a.price }))
            : null,
          equipment_cost: pricing.equipmentCost || 0,
          installation_cost: pricing.installationCost || 0,
          addons_cost: pricing.addonsCost || 0,
          tax_amount: pricing.taxAmount || 0,
          final_total: pricing.finalTotal || 0,
          status: "new",
          ghl_sync_status: "pending",
        };

        const { error } = await supabase
          .from("ducted_estimate_submissions")
          .insert(submissionData);

        if (error) {
          console.error("Failed to create submission:", error);
          throw error;
        }
      }

      toast.success("Your estimate request has been submitted!");
      nextStep();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit. Please try again or call us at (214) 238-4349.");
    } finally {
      setIsSubmitting(false);
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
  
  
  // Get selected equipment for display purposes
  const selectedEq = matchingEquipment.find((eq) => eq.id === localSelectedId) || matchingEquipment[0];
  const isGoodmanSelected = selectedEq?.brand === 'Goodman';
  // Raw price from DB (before discount) for strikethrough display
  const rawSelectedPrice = selectedEq 
    ? (selectedEq.equipment_cost + selectedEq.installation_labor)
    : 0;
  // Discounted price comes from pricing engine
  const selectedPrice = pricing.equipmentCost + pricing.installationCost;

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

        {/* System Type Header */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-xl">
          {state.heatingType === "gas_system" ? (
            <Flame className="h-6 w-6 text-orange-500" />
          ) : (
            <Snowflake className="h-6 w-6 text-cyan-500" />
          )}
          <div>
            <h3 className="font-semibold text-lg text-[#1e3a5f]">{systemTypeLabel}</h3>
            <p className="text-muted-foreground text-sm">
              {pricing.effectiveTonnage} Ton • {pricing.selectedTier?.display_name || "Standard"} Tier
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
                const rawTotalPrice = eq.equipment_cost + eq.installation_labor;
                const isGoodman = eq.brand === 'Goodman';
                const totalPrice = isGoodman
                  ? Math.round(rawTotalPrice * (1 - GOODMAN_DISCOUNT))
                  : rawTotalPrice;
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
                        {isGoodman && (
                          <>
                            <p className="text-sm text-muted-foreground line-through">
                              {formatMoney(rawTotalPrice)}
                            </p>
                            <span className="inline-flex items-center bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                              20% Off
                            </span>
                          </>
                        )}
                        <p className={cn(
                          "font-bold text-lg",
                          isGoodman ? "text-green-700" : "text-[#1e3a5f]"
                        )}>
                          {formatMoney(totalPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          incl. Tax
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

        {/* Add-ons Section */}
        {addons.length > 0 && (() => {
          const AIRZONE_ID = "b1eca69a-d346-4ccf-a664-e81f3e95f44b";
          const EWC_ID = "37fe15e5-6bdf-43c7-b2d6-163235a3baa6";
          const brand = selectedEq?.brand;
          const filteredAddons = addons.filter((addon) => {
            if (brand === "Mitsubishi" && addon.id === EWC_ID) return false;
            if (["Goodman", "Trane", "Bosch"].includes(brand || "") && addon.id === AIRZONE_ID) return false;
            return true;
          });
          return filteredAddons.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-[#1e3a5f] mb-2">Enhance Your System</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Optional upgrades to maximize comfort and convenience.
            </p>
            <div className="space-y-2">
              {filteredAddons.map((addon) => {
                const isSelected = state.selectedAddonIds.includes(addon.id);
                const IconComp = getIcon(addon.icon_name);

                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                      isSelected
                        ? "border-[#d4a84b] bg-[#d4a84b]/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isSelected ? "bg-[#d4a84b] text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <IconComp className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{addon.name}</span>
                        {addon.is_popular && (
                          <span className="text-[10px] bg-[#d4a84b]/20 text-[#d4a84b] px-1.5 py-0.5 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      {addon.description && (
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-[#1e3a5f] shrink-0">{formatMoney(addon.price)}</span>
                  </button>
                );
              })}
            </div>
            {state.selectedAddonIds.length > 0 && (
              <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-3 mt-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-[#1e3a5f]">
                    {state.selectedAddonIds.length} upgrade{state.selectedAddonIds.length !== 1 ? "s" : ""} selected
                  </p>
                  <p className="text-sm font-bold text-[#1e3a5f]">
                    +{formatMoney(pricing.addonsCost)}
                  </p>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* Total Investment Summary */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] rounded-2xl p-6 text-white mb-6">
          <p className="text-white/70 text-sm mb-3 text-center">Investment Breakdown</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Equipment – Labor, Installation & Tax</span>
              <span className="font-medium">
                {isGoodmanSelected && (
                  <span className="text-white/50 line-through mr-2">{formatMoney(rawSelectedPrice)}</span>
                )}
                {formatMoney(selectedPrice)}
              </span>
            </div>
            {pricing.addonsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/80">System Add-ons</span>
                <span className="font-medium">{formatMoney(pricing.addonsCost)}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Investment</span>
                <span className="text-3xl font-bold">{formatMoney(selectedPrice + pricing.addonsCost)}</span>
              </div>
            </div>
          </div>
          {isGoodmanSelected && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1 bg-green-400/20 text-green-300 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                March Group Buy · 20% Off
              </div>
            </div>
          )}
        </div>

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

        {/* Customer Contact Summary */}
        <div className="bg-[#1e3a5f]/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[#1e3a5f]">Your Contact Information</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(6)}
              className="text-[#1e3a5f] hover:text-[#1e3a5f]/80 h-8 px-2"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{state.customerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{state.customerInfo.email}</span>
            </div>
            {state.customerInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{state.customerInfo.phone}</span>
              </div>
            )}
            {getFullAddress() && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{getFullAddress()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financing Options Section */}
        <FinancingOptionsSection 
          estimatorType="ducted" 
          finalTotal={selectedPrice + pricing.addonsCost} 
        />

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
          <CTAButton variant="outline" onClick={prevStep} className="flex-1" disabled={isSubmitting}>
            Back
          </CTAButton>
          <CTAButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Quote Request"
            )}
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};