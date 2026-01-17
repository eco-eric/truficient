import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Mail, Phone, MapPin, User } from "lucide-react";
import type { DuctlessUnitType, DuctlessSystemTier, DuctlessAddon } from "../types";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const QuoteSummary = () => {
  const { state, setCustomerInfo, prevStep, nextStep } = useQuote();

  // Fetch data for display
  const { data: unitTypes = [] } = useQuery({
    queryKey: ["ductless_unit_types_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ductless_unit_types").select("*").eq("is_active", true);
      if (error) throw error;
      return data as DuctlessUnitType[];
    },
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["ductless_system_tiers_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ductless_system_tiers").select("*").eq("is_active", true);
      if (error) throw error;
      return data as DuctlessSystemTier[];
    },
  });

  const { data: addons = [] } = useQuery({
    queryKey: ["ductless_addons_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ductless_addons").select("*").eq("is_active", true);
      if (error) throw error;
      return data as DuctlessAddon[];
    },
  });

  const selectedUnit = unitTypes.find((u) => u.id === state.unitTypeId);
  const selectedTier = tiers.find((t) => t.id === state.systemTierId);
  const selectedAddons = addons.filter((a) => state.selectedAddonIds.includes(a.id));

  // Simple placeholder pricing (will be replaced in Phase 3)
  const zoneCount = state.selectedRooms.length;
  const basePrice = (selectedUnit?.base_price || 0) * zoneCount;
  const tierMultiplier = selectedTier?.price_multiplier || 1;
  const equipmentTotal = basePrice * tierMultiplier;

  const addonsTotal = selectedAddons.reduce((sum, a) => {
    return sum + (a.price_type === "per_zone" ? a.price * zoneCount : a.price);
  }, 0);

  const subtotal = equipmentTotal + addonsTotal;
  const taxRate = 0.0825;
  const taxAmount = subtotal * taxRate;
  const rebates = 0; // Placeholder
  const finalTotal = subtotal + taxAmount - rebates;

  const isFormValid =
    state.customerInfo.name.trim().length > 0 &&
    state.customerInfo.email.trim().length > 0 &&
    state.customerInfo.phone.trim().length > 0;

  const handleSubmit = () => {
    // Will be implemented in Phase 5
    nextStep();
  };

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
              <span className="font-medium">{zoneCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Unit Style</span>
              <span className="font-medium">{selectedUnit?.display_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">System Tier</span>
              <span className="font-medium">{selectedTier?.display_name || "—"}</span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Add-ons</span>
                <span className="font-medium">{selectedAddons.length} selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Rooms list */}
        <div className="rounded-xl border p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3">Configured Zones</h4>
          <ul className="space-y-2">
            {state.selectedRooms.map((room) => (
              <li key={room.id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-[#a5a983]" />
                <span>{room.label}</span>
                <span className="text-muted-foreground">
                  • {room.size} • {room.ceilingHeight}ft ceiling
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
              <span className="text-muted-foreground">Equipment & Installation</span>
              <span>{formatMoney(equipmentTotal)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add-ons</span>
                <span>{formatMoney(addonsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax (8.25%)</span>
              <span>{formatMoney(taxAmount)}</span>
            </div>
            {rebates > 0 && (
              <div className="flex justify-between text-[#d4a84b]">
                <span>Available Rebates</span>
                <span>-{formatMoney(rebates)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span>Estimated Total</span>
              <span className="text-[#1e3a5f]">{formatMoney(finalTotal)}</span>
            </div>
          </div>
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
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={handleSubmit} disabled={!isFormValid} className="flex-1">
            Get My Quote
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
