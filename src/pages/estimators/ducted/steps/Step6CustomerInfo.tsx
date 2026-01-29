import { useState, useEffect } from "react";
import { StepContainer } from "@/pages/estimators/ductless/components/StepContainer";
import { CTAButton } from "@/pages/estimators/ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Mail, Phone, MapPin, User, Shield, Clock, 
  Loader2, Calendar
} from "lucide-react";

export const Step6CustomerInfo = () => {
  const { state, setCustomerInfo, setPartialSubmissionId, nextStep, prevStep } = useEstimator();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track touched fields for inline validation
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
    streetAddress: false,
    city: false,
    zipCode: false,
  });

  // Auto-populate ZIP and City from initial zip code gate
  useEffect(() => {
    if (state.zipCode && !state.customerInfo.zipCode) {
      setCustomerInfo({ zipCode: state.zipCode });
    }
    if (state.zipCity && !state.customerInfo.city) {
      setCustomerInfo({ city: state.zipCity });
    }
    // Force state to Texas
    if (state.customerInfo.state !== "TX") {
      setCustomerInfo({ state: "TX" });
    }
  }, [state.zipCode, state.zipCity, state.customerInfo.zipCode, state.customerInfo.city, state.customerInfo.state, setCustomerInfo]);

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

  // For testing: only ZIP code is required
  const isFormValid = (state.customerInfo.zipCode?.trim() || "").length === 5;

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

  const handleContinue = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const fullAddress = getFullAddress();
      
      // Create partial submission for abandoned cart tracking
      const submissionData = {
        // Customer info
        customer_name: state.customerInfo.name?.trim() || "",
        customer_email: state.customerInfo.email?.trim() || "",
        customer_phone: state.customerInfo.phone?.trim() || null,
        customer_address: fullAddress?.trim() || null,
        best_time_to_call: state.customerInfo.bestTimeToCall || null,
        
        // Home details collected so far
        home_type: state.homeType || "single_family",
        home_layout: state.homeLayout || "1_story",
        square_footage: state.squareFootage || "1600_2000",
        hot_cold_spots: state.hotColdSpots || null,
        winter_temp: state.winterTemp || null,
        summer_temp: state.summerTemp || null,
        
        // System details collected so far
        heating_type: state.heatingType || "gas_system",
        coverage: state.coverage || "entire_home",
        system_count: state.systemCount || 1,
        
        // Status - partial for abandoned cart tracking
        status: "partial",
        ghl_sync_status: "pending",
      };

      // Check if we already have a partial submission
      if (state.partialSubmissionId) {
        // Update existing partial submission
        const { error } = await supabase
          .from("ducted_estimate_submissions")
          .update(submissionData)
          .eq("id", state.partialSubmissionId);

        if (error) {
          console.error("Failed to update partial submission:", error);
          // Don't block the user, just log the error
        } else {
          console.log("Partial submission updated:", state.partialSubmissionId);
        }
      } else {
        // Create new partial submission
        const { data: insertedData, error } = await supabase
          .from("ducted_estimate_submissions")
          .insert(submissionData)
          .select("id")
          .single();

        if (error) {
          console.error("Failed to create partial submission:", error);
          // Don't block the user, just log the error
        } else if (insertedData) {
          console.log("Partial submission created:", insertedData.id);
          setPartialSubmissionId(insertedData.id);
        }
      }

      // Proceed to next step regardless of submission status
      nextStep();
    } catch (error) {
      console.error("Error saving partial submission:", error);
      // Don't block the user, proceed anyway
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepContainer className="px-4 py-6">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Your Contact Information
        </h2>
        <p className="text-muted-foreground mb-6">
          We'll use this to prepare your personalized estimate and reach out to schedule your free consultation.
        </p>

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
              onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
              placeholder="John Smith"
              autoComplete="name"
              className={touchedFields.name && !state.customerInfo.name.trim() ? "border-destructive" : ""}
            />
            {touchedFields.name && !state.customerInfo.name.trim() && (
              <p className="text-sm text-destructive">Please enter your name</p>
            )}
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
              onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
              placeholder="john@example.com"
              autoComplete="email"
              className={touchedFields.email && !isValidEmail(state.customerInfo.email) ? "border-destructive" : ""}
            />
            {touchedFields.email && !isValidEmail(state.customerInfo.email) && (
              <p className="text-sm text-destructive">Please enter a valid email address</p>
            )}
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
            onClick={handleContinue}
            disabled={!isFormValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </CTAButton>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to receive communications about your estimate. 
          Your information will only be used to provide your quote.
        </p>
      </div>
    </StepContainer>
  );
};
