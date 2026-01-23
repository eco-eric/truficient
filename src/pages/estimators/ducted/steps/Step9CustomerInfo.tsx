import { useState } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete, type AddressComponents } from "@/components/AddressAutocomplete";
import { MapPreview } from "@/components/MapPreview";
import { isInServiceArea, SERVICE_AREA_COUNTIES } from "@/pages/estimators/ductless/constants/serviceArea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSourceTags } from "@/hooks/useFormSourceTags";
import { addDays, format } from "date-fns";
import { 
  Mail, Phone, MapPin, User, Shield, Clock, MapPinOff, 
  Loader2, CheckCircle2, Calendar 
} from "lucide-react";

export const Step9CustomerInfo = () => {
  const { state, setCustomerInfo, nextStep, prevStep } = useEstimator();
  const { pricing } = useDuctedPricing(state);
  const { data: dynamicTags } = useFormSourceTags('ducted');
  
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [continueAnyway, setContinueAnyway] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    county: string;
  } | null>(null);
  
  // Track touched fields for inline validation
  const [touchedFields, setTouchedFields] = useState({
    phone: false,
    address: false,
  });

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation - requires 10 digits
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  // Phone formatting
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setCustomerInfo({ phone: formatted });
  };

  const handleAddressSelect = (components: AddressComponents) => {
    setCustomerInfo({
      address: components.formattedAddress,
      streetAddress: components.streetAddress,
      formattedAddress: components.formattedAddress,
      city: components.city,
      county: components.county,
      state: components.state,
      zipCode: components.zipCode,
      placeId: components.placeId,
    });

    // Set location for map preview
    if (components.lat && components.lng) {
      setSelectedLocation({
        lat: components.lat,
        lng: components.lng,
        address: components.formattedAddress,
        county: components.county,
      });
    }

    setIsAddressValidated(true);
    setContinueAnyway(false);

    // Check service area
    if (!isInServiceArea(components.county)) {
      setAddressError(components.county);
    } else {
      setAddressError(null);
    }
  };

  const handleAddressChange = (value: string) => {
    setCustomerInfo({ address: value });
    // Reset validation when manually typing
    if (isAddressValidated) {
      setIsAddressValidated(false);
      setAddressError(null);
      setContinueAnyway(false);
      setSelectedLocation(null);
    }
  };

  const isFormValid = 
    state.customerInfo.name.trim() !== "" &&
    isValidEmail(state.customerInfo.email) &&
    isValidPhone(state.customerInfo.phone) &&
    isAddressValidated &&
    (!addressError || continueAnyway);

  // Format service area counties for display
  const serviceAreaList = SERVICE_AREA_COUNTIES.slice(0, -1).join(", ") + 
    ", and " + SERVICE_AREA_COUNTIES[SERVICE_AREA_COUNTIES.length - 1];

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);

    try {
      // Parse name into first/last
      const nameParts = state.customerInfo.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const submissionData = {
        // Customer info
        customer_name: state.customerInfo.name,
        customer_email: state.customerInfo.email,
        customer_phone: state.customerInfo.phone || null,
        customer_address: state.customerInfo.formattedAddress || state.customerInfo.address || null,
        best_time_to_call: state.customerInfo.bestTimeToCall || null,
        wants_backup_quote: state.customerInfo.wantsBackupQuote || false,
        
        // Home details
        home_type: state.homeType || "single_family",
        home_layout: state.homeLayout || "1_story",
        square_footage: state.squareFootage || "1600_2000",
        hot_cold_spots: state.hotColdSpots || null,
        winter_temp: state.winterTemp || null,
        summer_temp: state.summerTemp || null,
        
        // System details
        heating_type: state.heatingType || "gas_system",
        coverage: state.coverage || "entire_home",
        system_count: state.systemCount || 1,
        efficiency_tier_id: state.efficiencyTierId || null,
        equipment_id: pricing.selectedEquipment?.id || null,
        recommended_tonnage: pricing.recommendedTonnage || null,
        
        // Add-ons
        selected_addons: state.selectedAddonIds.length > 0 
          ? pricing.addonsBreakdown.map((a) => ({ id: a.id, name: a.name, price: a.price }))
          : null,
        
        // Pricing
        equipment_cost: pricing.equipmentCost,
        installation_cost: pricing.installationCost,
        addons_cost: pricing.addonsCost,
        tax_amount: pricing.taxAmount,
        final_total: pricing.finalTotal,
        
        // Status
        status: "new",
        ghl_sync_status: "pending",
      };

      // Insert to database
      const { data: insertedData, error } = await supabase
        .from("ducted_estimate_submissions")
        .insert(submissionData)
        .select("id")
        .single();

      if (error) throw error;

      // Sync to GoHighLevel (non-blocking)
      const systemTypeLabel = state.heatingType === "gas_system" ? "Gas Furnace + AC" : "Heat Pump";
      const tierName = pricing.selectedTier?.display_name || "Standard";
      const validUntil = format(addDays(new Date(), 30), "MMMM d, yyyy");
      
      // Build tags from dynamic configuration + heating type
      const tags = [...(dynamicTags || ['ducted-estimator']), state.heatingType || 'hvac'];
      
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
Address: ${state.customerInfo.formattedAddress || state.customerInfo.address || 'Not provided'}
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
      
      // Sync to GHL first, then send notification after contact exists
      supabase.functions.invoke("sync-ghl-contact", {
        body: {
          firstName,
          lastName,
          email: state.customerInfo.email,
          phone: state.customerInfo.phone || undefined,
          source: "Ducted HVAC Estimator",
          tags,
          message: `Ducted HVAC Estimate Request:
• System: ${systemTypeLabel} - ${tierName} Tier
• Size: ${pricing.recommendedTonnage} Ton
• Home: ${state.homeType}, ${state.homeLayout}, ${state.squareFootage} sq ft
• Estimate: $${pricing.finalTotal.toLocaleString()}
• Address: ${state.customerInfo.formattedAddress || state.customerInfo.address || "Not provided"}`,
          zipCode: state.customerInfo.zipCode || undefined,
          isDfw: !addressError || continueAnyway,
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
        },
      }).then(async (response) => {
        // Update GHL sync status
        if (response.data?.contactId) {
          await supabase
            .from("ducted_estimate_submissions")
            .update({ 
              ghl_contact_id: response.data.contactId,
              ghl_sync_status: "synced" 
            })
            .eq("id", insertedData.id);

          // Now send internal notification - contact definitely exists in GHL
          supabase.functions.invoke("send-estimator-notification", {
            body: {
              estimatorType: "ducted",
              customerName: state.customerInfo.name,
              customerEmail: state.customerInfo.email,
              customerPhone: state.customerInfo.phone || undefined,
              customerAddress: state.customerInfo.formattedAddress || state.customerInfo.address || undefined,
              quoteTotal: formatMoney(pricing.finalTotal),
              quoteDetails: quoteRawDetails,
            },
          }).catch((err) => {
            console.error("Notification error:", err);
          });
        } else if (response.error) {
          console.error("GHL sync failed:", response.error);
          await supabase
            .from("ducted_estimate_submissions")
            .update({ ghl_sync_status: "failed" })
            .eq("id", insertedData.id);
        }
      }).catch((err) => {
        console.error("GHL sync error:", err);
      });

      toast.success("Your estimate request has been submitted!");
      nextStep();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepContainer className="px-4 py-6">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Complete Your Quote Request
        </h2>
        <p className="text-muted-foreground mb-2">
          We'll prepare a detailed proposal and reach out to schedule your free in-home consultation.
        </p>

        {/* Price summary bar */}
        <div className="bg-[#1e3a5f] text-white rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Your Estimate</p>
            <p className="text-2xl font-bold">{formatMoney(pricing.finalTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Monthly Payment</p>
            <p className="text-lg font-semibold">{formatMoney(pricing.monthlyFinancing)}/mo</p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#a5a983]" />
            <span>Your info is secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#a5a983]" />
            <span>No commitment required</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={state.customerInfo.name}
              onChange={(e) => setCustomerInfo({ name: e.target.value })}
              placeholder="John Smith"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={state.customerInfo.email}
              onChange={(e) => setCustomerInfo({ email: e.target.value })}
              placeholder="john@example.com"
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={state.customerInfo.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
              placeholder="(555) 123-4567"
              autoComplete="tel"
              className={touchedFields.phone && !isValidPhone(state.customerInfo.phone) ? "border-destructive" : ""}
            />
            {touchedFields.phone && !isValidPhone(state.customerInfo.phone) && (
              <p className="text-sm text-destructive">Please enter a valid 10-digit phone number</p>
            )}
          </div>

          {/* Best time to call */}
          <div className="grid gap-2">
            <Label htmlFor="bestTime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Best Time to Call
            </Label>
            <select
              id="bestTime"
              value={state.customerInfo.bestTimeToCall || ""}
              onChange={(e) => setCustomerInfo({ 
                bestTimeToCall: (e.target.value as "morning" | "afternoon" | "evening") || null 
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">No preference</option>
              <option value="morning">Morning (8am - 12pm)</option>
              <option value="afternoon">Afternoon (12pm - 5pm)</option>
              <option value="evening">Evening (5pm - 8pm)</option>
            </select>
          </div>

          {/* Address with Google Places */}
          <div className="grid gap-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Installation Address <span className="text-red-500">*</span>
            </Label>
            <AddressAutocomplete
              value={state.customerInfo.address}
              onChange={handleAddressChange}
              onAddressSelect={handleAddressSelect}
              onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
              placeholder="Start typing your address..."
              className={touchedFields.address && !isAddressValidated ? "border-destructive" : ""}
            />
            {touchedFields.address && !isAddressValidated && (
              <p className="text-sm text-destructive">Please select an address from the dropdown</p>
            )}
            
            {/* Display separated address fields after selection */}
            {isAddressValidated && !addressError && (
              <div className="space-y-3 mt-3">
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    Address
                  </Label>
                  <Input
                    value={state.customerInfo.streetAddress || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3 grid gap-2">
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input
                      value={state.customerInfo.city || ""}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="col-span-1 grid gap-2">
                    <Label className="text-xs text-muted-foreground">St</Label>
                    <Input
                      value={state.customerInfo.state || ""}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="col-span-2 grid gap-2">
                    <Label className="text-xs text-muted-foreground">Zip</Label>
                    <Input
                      value={state.customerInfo.zipCode || ""}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Service area error */}
            {addressError && (
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 mt-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <MapPinOff className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Outside Our Service Area
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Your location ({addressError} County) is outside our primary coverage. 
                      We currently service <span className="font-medium">{serviceAreaList}</span> counties in the DFW Metroplex.
                    </p>
                    
                    {!continueAnyway ? (
                      <button
                        type="button"
                        onClick={() => setContinueAnyway(true)}
                        className="w-full py-2.5 px-4 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#2a4a6f] transition-colors text-sm"
                      >
                        Request a Callback Anyway
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-green-100 rounded-lg text-green-800 text-sm">
                        <span className="text-green-600">✓</span>
                        <span className="font-medium">We'll reach out to discuss service options for your area.</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-amber-700 mt-2 text-center">
                      Or call us directly: <a href="tel:9724020184" className="font-medium underline">(972) 402-0184</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Map preview and success indicator */}
            {isAddressValidated && !addressError && selectedLocation && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-[#a5a983] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Address verified – we service your area!
                </p>
                <MapPreview
                  lat={selectedLocation.lat}
                  lng={selectedLocation.lng}
                  address={selectedLocation.address}
                  county={selectedLocation.county}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1" disabled={isSubmitting}>
            Back
          </CTAButton>
          <CTAButton
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
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

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          By submitting, you agree to receive communications about your estimate. 
          Your information will only be used to provide your quote.
        </p>
      </div>
    </StepContainer>
  );
};
