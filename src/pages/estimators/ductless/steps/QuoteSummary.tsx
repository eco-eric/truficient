import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney } from "../hooks/usePricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Mail, Phone, MapPin, User, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const QuoteSummary = () => {
  const { state, setCustomerInfo, prevStep, nextStep } = useQuote();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the pricing engine
  const { pricing, selectedUnit, selectedTier, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const isFormValid =
    state.customerInfo.name.trim().length > 0 &&
    state.customerInfo.email.trim().length > 0 &&
    state.customerInfo.phone.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare the submission data
      const submissionData = {
        customer_name: state.customerInfo.name.trim(),
        customer_email: state.customerInfo.email.trim(),
        customer_phone: state.customerInfo.phone.trim() || null,
        customer_address: state.customerInfo.address.trim() || null,
        zone_count: state.selectedRooms.length,
        selected_rooms: state.selectedRooms.map((room) => ({
          id: room.id,
          label: room.label,
          roomType: room.roomType,
          size: room.size,
          ceilingHeight: room.ceilingHeight,
          sunExposure: room.sunExposure,
          recommendedBtu: room.recommendedBtu,
        })),
        unit_type_id: state.unitTypeId,
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

      toast.success("Estimate submitted successfully!");
      nextStep();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        <p className="text-muted-foreground mb-6">Review your selections and provide your contact info to receive your detailed quote.</p>

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
              <span className="font-medium">{selectedUnit?.display_name || "—"}</span>
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

        {/* Rooms list with BTU */}
        <div className="rounded-xl border p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3">Configured Zones</h4>
          <ul className="space-y-2">
            {state.selectedRooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#a5a983]" />
                  <span>{room.label}</span>
                </div>
                <span className="text-muted-foreground font-medium">
                  {room.recommendedBtu.toLocaleString()} BTU
                </span>
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
                Equipment ({pricing.zoneCount} zones × {formatMoney(selectedUnit?.base_price || 0)})
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

        {/* Lead capture form */}
        <div className="rounded-xl border p-4 mb-8">
          <h4 className="font-semibold text-foreground mb-4">Get Your Detailed Quote</h4>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                value={state.customerInfo.name}
                onChange={(e) => setCustomerInfo({ name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={state.customerInfo.email}
                onChange={(e) => setCustomerInfo({ email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={state.customerInfo.phone}
                onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Installation Address (optional)
              </Label>
              <Input
                id="address"
                value={state.customerInfo.address}
                onChange={(e) => setCustomerInfo({ address: e.target.value })}
                placeholder="123 Main St, Dallas, TX"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} disabled={isSubmitting} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="flex-1">
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
