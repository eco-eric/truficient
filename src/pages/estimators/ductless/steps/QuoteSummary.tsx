import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney } from "../hooks/usePricing";
import { CheckCircle, Zap, Loader2, User, Mail, Phone, MapPin, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSourceTags } from "@/hooks/useFormSourceTags";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";

export const QuoteSummary = () => {
  const { state, prevStep, nextStep, goToStep } = useQuote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const { data: dynamicTags } = useFormSourceTags('ductless');

  // Use the pricing engine
  const { pricing, selectedUnit, selectedTier, unitTypes, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  // Helper to get unit type name for a room
  const getUnitTypeName = (room: typeof state.selectedRooms[0]) => {
    const unitType = unitTypes.find(u => u.id === room.unitTypeId);
    return unitType?.display_name || selectedUnit?.display_name || "—";
  };

  // Build quote raw details text for GHL
  const buildQuoteRawDetails = () => {
    const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
    
    const roomsDetail = state.selectedRooms.map(room => 
      `• ${room.label}: ${room.recommendedBtu.toLocaleString()} BTU - ${getUnitTypeName(room)}`
    ).join('\n');

    const addonsDetail = pricing.addonsBreakdown.length > 0
      ? `\nADD-ONS\n-------\n${pricing.addonsBreakdown.map(addon => 
          `• ${addon.name}: ${formatMoney(addon.total)}${addon.priceType === 'per_zone' ? ` (${formatMoney(addon.price)} × ${pricing.zoneCount} zones)` : ''}`
        ).join('\n')}\n`
      : '';

    return `DUCTLESS MINI-SPLIT ESTIMATE
============================
Date: ${format(new Date(), "MMMM d, yyyy")}
Valid Until: ${validUntil}

CUSTOMER INFORMATION
--------------------
Name: ${state.customerInfo.name}
Email: ${state.customerInfo.email}
Phone: ${state.customerInfo.phone || 'Not provided'}
Address: ${state.customerInfo.formattedAddress || state.customerInfo.address || 'Not provided'}

SYSTEM CONFIGURATION
--------------------
System Type: Ductless Mini-Split
Tier: ${selectedTier?.display_name || 'Standard'}
Number of Zones: ${pricing.zoneCount}
Total Capacity: ${pricing.totalBtu.toLocaleString()} BTU

CONFIGURED ZONES
----------------
${roomsDetail}
${addonsDetail}
PRICING BREAKDOWN
-----------------
Equipment (${pricing.zoneCount} zone${pricing.zoneCount !== 1 ? 's' : ''}): ${formatMoney(pricing.baseEquipmentCost)}
${pricing.tierMultiplier !== 1 ? `Tier Adjustment (${selectedTier?.display_name} ${pricing.tierMultiplier}×): ${formatMoney(pricing.equipmentTotal)}` : ''}
${pricing.addonsBreakdown.length > 0 ? `Add-ons Total: ${formatMoney(pricing.addonsTotal)}` : ''}
Subtotal: ${formatMoney(pricing.subtotal)}
Tax (8.25%): ${formatMoney(pricing.taxAmount)}
${pricing.rebates > 0 ? `Rebates: -${formatMoney(pricing.rebates)}` : ''}
-----------------
TOTAL: ${formatMoney(pricing.finalTotal)}

Monthly Payment Option: ${formatMoney(pricing.monthlyFinancing)}/mo with financing`.trim();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare the submission data
      const submissionData = {
        customer_name: state.customerInfo.name.trim(),
        customer_email: state.customerInfo.email.trim(),
        customer_phone: state.customerInfo.phone.trim() || null,
        customer_address: state.customerInfo.formattedAddress || state.customerInfo.address.trim() || null,
        customer_city: state.customerInfo.city || null,
        customer_county: state.customerInfo.county || null,
        customer_state: state.customerInfo.state || null,
        customer_zip: state.customerInfo.zipCode || null,
        google_place_id: state.customerInfo.placeId || null,
        zone_count: state.selectedRooms.length,
        selected_rooms: state.selectedRooms.map((room) => ({
          id: room.id,
          label: room.label,
          roomType: room.roomType,
          size: room.size,
          ceilingHeight: room.ceilingHeight,
          sunExposure: room.sunExposure,
          recommendedBtu: room.recommendedBtu,
          unitTypeId: room.unitTypeId,
          unitTypeName: unitTypes.find(u => u.id === room.unitTypeId)?.display_name,
        })),
        unit_type_id: state.selectedRooms[0]?.unitTypeId || state.unitTypeId,
        system_tier_id: state.systemTierId,
        selected_addons: pricing.addonsBreakdown.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          priceType: addon.priceType,
          total: addon.total,
        })),
        subtotal: pricing.subtotal,
        tax_amount: pricing.taxAmount,
        rebates: pricing.rebates,
        final_total: pricing.finalTotal,
        status: "new",
      };

      const { error } = await supabase
        .from("ductless_estimate_submissions")
        .insert(submissionData);

      if (error) {
        console.error("Submission error:", error);
        toast.error("Failed to submit estimate. Please try again.");
        return;
      }

      // Sync to GoHighLevel (non-blocking)
      const nameParts = state.customerInfo.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
      const quoteRawDetails = buildQuoteRawDetails();
      
      supabase.functions.invoke("sync-ghl-contact", {
        body: {
          firstName,
          lastName,
          email: state.customerInfo.email,
          phone: state.customerInfo.phone || undefined,
          source: "Ductless Mini-Split Estimator",
          tags: dynamicTags || ['ductless-estimator'],
          message: `Ductless Estimate Request:
• Zones: ${pricing.zoneCount}
• Total BTU: ${pricing.totalBtu.toLocaleString()}
• Tier: ${selectedTier?.display_name || "Standard"}
• Estimate: $${pricing.finalTotal.toLocaleString()}
• Address: ${state.customerInfo.formattedAddress || state.customerInfo.address || "Not provided"}`,
          zipCode: state.customerInfo.zipCode || undefined,
          isDfw: true,
          quote: {
            systemType: `Ductless Mini-Split - ${selectedTier?.display_name || "Standard"} Tier`,
            zones: pricing.zoneCount,
            totalBtu: pricing.totalBtu,
            price: formatMoney(pricing.finalTotal),
            monthlyPayment: `${formatMoney(pricing.monthlyFinancing)}/mo`,
            validUntil,
            tier: selectedTier?.display_name || "Standard",
            quoteRawDetails,
          },
        },
      }).catch((err) => {
        console.error("GHL sync error:", err);
      });

      toast.success("Estimate submitted successfully!");
      nextStep();
      nextStep();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailQuote = async () => {
    if (!state.customerInfo.email) {
      toast.error("Please enter your email to save the quote.");
      return;
    }

    setIsSendingQuote(true);

    try {
      const nameParts = state.customerInfo.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
      const quoteRawDetails = buildQuoteRawDetails();

      await supabase.functions.invoke("sync-ghl-contact", {
        body: {
          firstName,
          lastName,
          email: state.customerInfo.email,
          phone: state.customerInfo.phone || undefined,
          source: "Ductless Estimator - Save Quote",
          tags: ["save-quote-ductless", "ductless-estimator"],
          message: `Quote saved for ${pricing.zoneCount}-zone ductless system - ${selectedTier?.display_name || "Standard"} Tier`,
          zipCode: state.customerInfo.zipCode || undefined,
          isDfw: true,
          quote: {
            systemType: `Ductless Mini-Split - ${selectedTier?.display_name || "Standard"} Tier`,
            zones: pricing.zoneCount,
            totalBtu: pricing.totalBtu,
            price: formatMoney(pricing.finalTotal),
            monthlyPayment: `${formatMoney(pricing.monthlyFinancing)}/mo`,
            validUntil,
            tier: selectedTier?.display_name || "Standard",
            quoteRawDetails,
          },
        },
      });

      toast.success(`Quote sent to ${state.customerInfo.email}!`, {
        description: "Check your inbox for the estimate details.",
      });
    } catch (err) {
      console.error("Error sending quote:", err);
      toast.error("Failed to send quote. Please try again.");
    } finally {
      setIsSendingQuote(false);
    }
  };

  if (isLoading) {
    return (
      <StepContainer className="px-4 pb-28 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </StepContainer>
    );
  }

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Your Estimate</h2>
        <p className="text-muted-foreground mb-6">Review your selections and submit to receive your detailed quote.</p>

        {/* Customer Info Summary */}
        <div className="rounded-xl border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">Your Information</h4>
            <button
              onClick={() => goToStep(1)}
              className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{state.customerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{state.customerInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{state.customerInfo.phone}</span>
            </div>
            {state.customerInfo.address && (
              <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">{state.customerInfo.formattedAddress || state.customerInfo.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* System summary card */}
        <div className="rounded-xl bg-[#1e3a5f] text-white p-5 mb-6">
          <h3 className="font-semibold text-lg mb-3">System Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Zones</span>
              <span className="font-medium">{pricing.zoneCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Total Capacity</span>
              <span className="font-medium">{pricing.totalBtu.toLocaleString()} BTU</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Unit Style</span>
              <span className="font-medium">
                {state.selectedRooms.length === 1 
                  ? getUnitTypeName(state.selectedRooms[0])
                  : `${new Set(state.selectedRooms.map(r => r.unitTypeId)).size} style(s)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">System Tier</span>
              <span className="font-medium">{selectedTier?.display_name || "—"}</span>
            </div>
            {pricing.addonsBreakdown.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Add-ons</span>
                <span className="font-medium">{pricing.addonsBreakdown.length} selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Rooms list with BTU and unit type */}
        <div className="rounded-xl border p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3">Configured Zones</h4>
          <ul className="space-y-3">
            {state.selectedRooms.map((room) => (
              <li key={room.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#a5a983]" />
                    <span className="font-medium">{room.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {room.recommendedBtu.toLocaleString()} BTU
                  </span>
                </div>
                <div className="ml-6 text-xs text-muted-foreground">
                  {getUnitTypeName(room)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing breakdown */}
        <div className="rounded-xl border p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3">Investment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Equipment ({pricing.zoneCount} zone{pricing.zoneCount !== 1 ? "s" : ""})
              </span>
              <span>{formatMoney(pricing.baseEquipmentCost)}</span>
            </div>
            {pricing.tierMultiplier !== 1 && (
              <div className="flex justify-between text-muted-foreground text-xs">
                <span className="pl-3">× {selectedTier?.display_name} tier ({pricing.tierMultiplier}×)</span>
                <span>{formatMoney(pricing.equipmentTotal)}</span>
              </div>
            )}
            
            {pricing.addonsBreakdown.length > 0 && (
              <>
                <div className="border-t my-2" />
                {pricing.addonsBreakdown.map((addon) => (
                  <div key={addon.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {addon.name}
                      {addon.priceType === "per_zone" && ` (${formatMoney(addon.price)} × ${pricing.zoneCount} zones)`}
                    </span>
                    <span>{formatMoney(addon.total)}</span>
                  </div>
                ))}
              </>
            )}
            
            <div className="border-t my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax (8.25%)</span>
              <span>{formatMoney(pricing.taxAmount)}</span>
            </div>
            {pricing.rebates > 0 && (
              <div className="flex justify-between text-[#d4a84b]">
                <span>Available Rebates</span>
                <span>-{formatMoney(pricing.rebates)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span>Estimated Total</span>
              <span className="text-[#1e3a5f]">{formatMoney(pricing.finalTotal)}</span>
            </div>
          </div>
          
          {/* Financing callout */}
          {pricing.monthlyFinancing > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-[#d4a84b]/10 border border-[#d4a84b]/30 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#d4a84b]" />
              <span className="text-sm">
                Or as low as <strong className="text-[#d4a84b]">{formatMoney(pricing.monthlyFinancing)}/mo</strong> with financing
              </span>
            </div>
          )}
        </div>

        {/* Save My Quote */}
        <div className="rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="h-5 w-5 text-[#1e3a5f]" />
            <div>
              <p className="font-medium text-foreground">Save This Quote</p>
              <p className="text-sm text-muted-foreground">Get this estimate emailed to you for future reference</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleEmailQuote}
            disabled={isSendingQuote || !state.customerInfo.email}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSendingQuote ? "Sending..." : "Email My Quote"}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} disabled={isSubmitting} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Get My Quote"
            )}
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
