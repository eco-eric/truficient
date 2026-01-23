import { useState, useEffect } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing, formatMoney } from "../hooks/useDuctedPricing";
import { HOME_TYPE_OPTIONS, HOME_LAYOUT_OPTIONS, SQUARE_FOOTAGE_OPTIONS } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSourceTags } from "@/hooks/useFormSourceTags";
import { addDays, format } from "date-fns";
import { 
  Mail, Phone, MapPin, User, Shield, Clock, 
  Loader2, Calendar, CheckCircle2 
} from "lucide-react";

export const Step9CustomerInfo = () => {
  const { state, setCustomerInfo, nextStep, prevStep } = useEstimator();
  const { pricing } = useDuctedPricing(state);
  const { data: dynamicTags } = useFormSourceTags('ducted');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track touched fields for inline validation
  const [touchedFields, setTouchedFields] = useState({
    phone: false,
    streetAddress: false,
    city: false,
    zipCode: false,
  });

  // Force state to Texas on mount
  useEffect(() => {
    if (state.customerInfo.state !== "TX") {
      setCustomerInfo({ state: "TX" });
    }
  }, []);

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

  // Address validation
  const isAddressComplete = 
    (state.customerInfo.streetAddress?.trim() || "") !== "" &&
    (state.customerInfo.city?.trim() || "") !== "" &&
    (state.customerInfo.zipCode?.trim() || "").length === 5;

  const isFormValid = 
    state.customerInfo.name.trim() !== "" &&
    isValidEmail(state.customerInfo.email) &&
    isValidPhone(state.customerInfo.phone) &&
    isAddressComplete;

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
    console.log("🚀 ========================================");
    console.log("🚀 DUCTED ESTIMATOR SUBMISSION STARTED");
    console.log("🚀 ========================================");
    console.log("📊 Customer Info:", state.customerInfo);
    console.log("📊 Configuration:", {
      homeType: state.homeType,
      homeLayout: state.homeLayout,
      squareFootage: state.squareFootage,
      heatingType: state.heatingType,
      coverage: state.coverage,
      equipmentId: pricing.selectedEquipment?.id,
    });

    // Pre-submission validation for configuration
    console.log("🔍 Step 1: Validating configuration...");
    if (!state.homeType || !state.homeLayout || !state.squareFootage || !state.heatingType) {
      console.error("❌ Missing configuration:", { 
        homeType: state.homeType, 
        homeLayout: state.homeLayout,
        squareFootage: state.squareFootage,
        heatingType: state.heatingType,
      });
      toast.error("Please complete all home configuration steps before submitting.");
      return;
    }
    console.log("✅ Configuration validated");

    // Form validation
    console.log("🔍 Step 2: Validating form fields...");
    if (!isFormValid) {
      console.error("❌ Form validation failed:", {
        hasName: !!state.customerInfo.name.trim(),
        validEmail: isValidEmail(state.customerInfo.email),
        validPhone: isValidPhone(state.customerInfo.phone),
        addressComplete: isAddressComplete,
      });
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    console.log("✅ Form validation passed");
    
    setIsSubmitting(true);

    try {
      // Parse name into first/last
      const nameParts = state.customerInfo.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const fullAddress = getFullAddress();
      console.log("🏠 Step 3: Address built:", fullAddress);

      console.log("📋 Step 4: Preparing submission data...");
      const submissionData = {
        // Customer info
        customer_name: state.customerInfo.name?.trim() || "",
        customer_email: state.customerInfo.email?.trim() || "",
        customer_phone: state.customerInfo.phone?.trim() || null,
        customer_address: fullAddress?.trim() || null,
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
        equipment_cost: pricing.equipmentCost || 0,
        installation_cost: pricing.installationCost || 0,
        addons_cost: pricing.addonsCost || 0,
        tax_amount: pricing.taxAmount || 0,
        final_total: pricing.finalTotal || 0,
        
        // Status
        status: "new",
        ghl_sync_status: "pending",
      };
      console.log("✅ Submission data prepared:", submissionData);

      // Insert to database
      console.log("💾 Step 5: Inserting to database...");
      const { data: insertedData, error } = await supabase
        .from("ducted_estimate_submissions")
        .insert(submissionData)
        .select("id")
        .single();

      if (error) {
        console.error("❌ DATABASE ERROR:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        throw error;
      }

      console.log("✅ DATABASE INSERT SUCCESSFUL!");
      console.log("Submission ID:", insertedData.id);

      // Sync to GoHighLevel (non-blocking)
      console.log("📤 Step 6: Starting GHL sync...");
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
        },
      }).then(async (response) => {
        // Update GHL sync status
        if (response.data?.contactId) {
          console.log("✅ GHL SYNC SUCCESSFUL!");
          console.log("Contact ID:", response.data.contactId);
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
              customerAddress: fullAddress || undefined,
              quoteTotal: formatMoney(pricing.finalTotal),
              quoteDetails: quoteRawDetails,
            },
          }).catch((err) => {
            console.error("⚠️ Notification error (non-blocking):", err);
          });
        } else if (response.error) {
          console.error("⚠️ GHL sync failed (non-blocking):", response.error);
          await supabase
            .from("ducted_estimate_submissions")
            .update({ ghl_sync_status: "failed" })
            .eq("id", insertedData.id);
        }
      }).catch((err) => {
        console.error("⚠️ GHL sync error (non-blocking):", err);
      });

      console.log("🎉 ========================================");
      console.log("🎉 SUBMISSION COMPLETE!");
      console.log("🎉 ========================================");
      
      toast.success("Your estimate request has been submitted!");
      nextStep();
    } catch (error) {
      console.error("❌ ========================================");
      console.error("❌ SUBMISSION FAILED");
      console.error("❌ ========================================");
      console.error("Error object:", error);
      
      // Show specific error message based on error type
      const errorMsg = (error as any)?.message || '';
      
      if (errorMsg.includes('permission denied') || errorMsg.includes('RLS') || errorMsg.includes('policy')) {
        toast.error("Access denied. Please refresh the page and try again.");
      } else if (errorMsg.includes('violates') || errorMsg.includes('constraint')) {
        toast.error("Missing required information. Please go back and complete all steps.");
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to submit. Please try again or call us at (817) 349-8549.");
      }
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
        <div className="bg-[#1e3a5f] text-white rounded-xl p-5 mb-6">
          <div className="text-center mb-4">
            <p className="text-white/80 text-sm mb-1">Your Total Estimated Investment is:</p>
            <p className="text-3xl font-bold">{formatMoney(pricing.finalTotal)}</p>
          </div>
          
          {/* Includes list */}
          <div className="border-t border-white/20 pt-4">
            <p className="text-white/70 text-xs uppercase tracking-wide mb-2">Price Includes:</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Installation Labor
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Equipment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Smart Thermostat
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Taxes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Removal & Disposal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                2-Year Labor Warranty
              </li>
            </ul>
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

          {/* Street Address */}
          <div className="grid gap-2">
            <Label htmlFor="streetAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="streetAddress"
              value={state.customerInfo.streetAddress || ""}
              onChange={(e) => setCustomerInfo({ streetAddress: e.target.value })}
              onBlur={() => setTouchedFields(prev => ({ ...prev, streetAddress: true }))}
              placeholder="123 Main Street"
              autoComplete="street-address"
              className={touchedFields.streetAddress && !state.customerInfo.streetAddress?.trim() ? "border-destructive" : ""}
            />
            {touchedFields.streetAddress && !state.customerInfo.streetAddress?.trim() && (
              <p className="text-sm text-destructive">Please enter your street address</p>
            )}
          </div>

          {/* City | State | ZIP row */}
          <div className="grid grid-cols-6 gap-3">
            {/* City - 3 columns */}
            <div className="col-span-3 grid gap-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                value={state.customerInfo.city || ""}
                onChange={(e) => setCustomerInfo({ city: e.target.value })}
                onBlur={() => setTouchedFields(prev => ({ ...prev, city: true }))}
                placeholder="Dallas"
                autoComplete="address-level2"
                className={touchedFields.city && !state.customerInfo.city?.trim() ? "border-destructive" : ""}
              />
              {touchedFields.city && !state.customerInfo.city?.trim() && (
                <p className="text-sm text-destructive">Required</p>
              )}
            </div>
            
            {/* State - 1 column (locked to Texas) */}
            <div className="col-span-1 grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value="TX"
                disabled
                className="bg-muted/50"
              />
            </div>
            
            {/* ZIP - 2 columns */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="zipCode">ZIP <span className="text-red-500">*</span></Label>
              <Input
                id="zipCode"
                value={state.customerInfo.zipCode || ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setCustomerInfo({ zipCode: digits });
                }}
                onBlur={() => setTouchedFields(prev => ({ ...prev, zipCode: true }))}
                placeholder="75248"
                maxLength={5}
                autoComplete="postal-code"
                className={touchedFields.zipCode && (state.customerInfo.zipCode?.length || 0) !== 5 ? "border-destructive" : ""}
              />
              {touchedFields.zipCode && (state.customerInfo.zipCode?.length || 0) !== 5 && (
                <p className="text-sm text-destructive">5 digits</p>
              )}
            </div>
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
