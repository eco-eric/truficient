import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete, AddressComponents } from "@/components/AddressAutocomplete";
import { MapPreview } from "@/components/MapPreview";
import { isInServiceArea, getServiceAreaDisplay, SERVICE_AREA_COUNTIES } from "../constants/serviceArea";
import { Mail, Phone, MapPin, User, AlertCircle, Shield, Clock, MapPinOff } from "lucide-react";

export const CustomerInfoStep = () => {
  const { state, setCustomerInfo, nextStep, prevStep } = useQuote();
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [continueAnyway, setContinueAnyway] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    county: string;
  } | null>(null);

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

  // All fields optional for testing
  const isFormValid = !addressError || continueAnyway;

  // Format service area counties for display
  const serviceAreaList = SERVICE_AREA_COUNTIES.slice(0, -1).join(", ") + 
    ", and " + SERVICE_AREA_COUNTIES[SERVICE_AREA_COUNTIES.length - 1];

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
            
            {/* Service area error - Enhanced UI */}
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
                  ✓ Address verified – we service your area!
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
