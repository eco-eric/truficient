import { useState, useEffect } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, User, Shield, Clock } from "lucide-react";

export const CustomerInfoStep = () => {
  const { state, setCustomerInfo, nextStep, prevStep } = useQuote();
  
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
    isValidPhone(state.customerInfo.phone) &&
    isAddressComplete;

  const handleContinue = () => {
    if (isFormValid) {
      // Build formatted address from components
      const fullAddress = `${state.customerInfo.streetAddress}, ${state.customerInfo.city}, TX ${state.customerInfo.zipCode}`;
      setCustomerInfo({ 
        address: fullAddress,
        formattedAddress: fullAddress 
      });
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
