import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete, AddressComponents } from "@/components/AddressAutocomplete";
import { isInServiceArea, getServiceAreaDisplay } from "../constants/serviceArea";
import { Mail, Phone, MapPin, User, AlertCircle, Shield, Clock } from "lucide-react";

export const CustomerInfoStep = () => {
  const { state, setCustomerInfo, nextStep, prevStep } = useQuote();
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [continueAnyway, setContinueAnyway] = useState(false);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      formattedAddress: components.formattedAddress,
      city: components.city,
      county: components.county,
      state: components.state,
      zipCode: components.zipCode,
      placeId: components.placeId,
    });

    setIsAddressValidated(true);
    setContinueAnyway(false);

    // Check service area
    if (!isInServiceArea(components.county)) {
      setAddressError(
        `We currently serve the ${getServiceAreaDisplay()} in the DFW Metroplex. Your address appears to be outside our primary service area.`
      );
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
    }
  };

  // All fields optional for testing
  const isFormValid = !addressError || continueAnyway;

  const handleContinue = () => {
    if (isFormValid) {
      nextStep();
    }
  };

  return (
    <StepContainer className="px-4 py-6">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Get Your Detailed Quote
        </h2>
        <p className="text-muted-foreground mb-6">
          Tell us a bit about yourself and where you'd like your ductless system installed.
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
              Full Name
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
              Email
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
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={state.customerInfo.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
          </div>

          {/* Address with Google Places */}
          <div className="grid gap-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Installation Address
            </Label>
            <AddressAutocomplete
              value={state.customerInfo.address}
              onChange={handleAddressChange}
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing your address..."
            />
            
            {/* Service area error */}
            {addressError && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-2">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p>{addressError}</p>
                    {!continueAnyway && (
                      <button
                        type="button"
                        onClick={() => setContinueAnyway(true)}
                        className="mt-2 text-[#1e3a5f] font-medium underline hover:no-underline"
                      >
                        Continue anyway – I'd like to be contacted
                      </button>
                    )}
                    {continueAnyway && (
                      <p className="mt-2 text-amber-700 font-medium">
                        ✓ We'll reach out to discuss service options for your area.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {isAddressValidated && !addressError && (
              <p className="text-xs text-[#a5a983] flex items-center gap-1">
                ✓ Address verified – we service your area!
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton
            onClick={handleContinue}
            disabled={!isFormValid}
            className="flex-1"
          >
            Continue
          </CTAButton>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          We respect your privacy. Your information will only be used to provide your estimate.
        </p>
      </div>
    </StepContainer>
  );
};
