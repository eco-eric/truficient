import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Calendar, Home, ClipboardList, MapPin } from 'lucide-react';
import { trackConversion } from '@/utils/conversionTracking';
import { useFormSourceTags } from '@/hooks/useFormSourceTags';
import { AddressAutocomplete, AddressComponents } from '@/components/AddressAutocomplete';
import { isInServiceArea, getServiceAreaDisplay } from '@/pages/estimators/ductless/constants/serviceArea';

// Phone formatting utility
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export const OnsiteEstimateForm = () => {
  const { toast } = useToast();
  const { data: dynamicTags } = useFormSourceTags('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressSelect = (components: AddressComponents) => {
    // Check if county is in service area
    if (!isInServiceArea(components.county)) {
      setAddressError(`We currently only serve the DFW metroplex (${getServiceAreaDisplay()}). Please contact us for referrals in your area.`);
      setFormData(prev => ({
        ...prev,
        streetAddress: components.streetAddress,
        city: '',
        state: '',
        zipCode: '',
        county: '',
      }));
      return;
    }
    
    setAddressError(null);
    setFormData(prev => ({
      ...prev,
      streetAddress: components.streetAddress,
      city: components.city,
      state: components.state,
      zipCode: components.zipCode,
      county: components.county,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addressError || !formData.city) {
      toast({
        title: 'Address Required',
        description: 'Please select a valid address within our service area.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Save to contact_submissions table
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          service_type: 'Onsite Estimate',
          message: `Address: ${fullAddress}\nCounty: ${formData.county}\n\n${formData.message}`,
          status: 'new',
        });

      if (submitError) throw submitError;

      // Sync to GHL
      supabase.functions.invoke('sync-ghl-contact', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: fullAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          serviceType: 'Onsite Estimate',
          message: formData.message,
          source: 'HVAC Estimate Page - Onsite Request',
          tags: dynamicTags || ['onsite-estimate-request'],
        },
      }).then(({ error: ghlError }) => {
        if (ghlError) {
          console.error('GHL sync failed (non-critical):', ghlError);
        }
      });

      // Track conversion
      trackConversion('Lead', {
        content_name: 'Onsite Estimate Request',
        content_category: 'Onsite Estimate',
      });

      setIsSuccess(true);
      toast({
        title: 'Request Submitted!',
        description: "We'll contact you shortly to schedule your onsite estimate.",
      });
    } catch (err) {
      console.error('Form submission error:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
          <p className="text-muted-foreground">
            We'll contact you within 24 hours to schedule your free onsite estimate.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Home className="w-5 h-5" />
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>
        <CardTitle className="text-xl md:text-2xl">Request an Onsite Estimate</CardTitle>
        <CardDescription className="text-base">
          Have a unique situation? We'll come to you for a personalized quote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="onsite-firstName">First Name *</Label>
              <Input
                id="onsite-firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onsite-lastName">Last Name *</Label>
              <Input
                id="onsite-lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onsite-email">Email *</Label>
            <Input
              id="onsite-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onsite-phone">Phone Number *</Label>
            <Input
              id="onsite-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="(214) 555-0123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onsite-streetAddress">Street Address *</Label>
            <AddressAutocomplete
              value={formData.streetAddress}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, streetAddress: value }));
                if (addressError) setAddressError(null);
              }}
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing your address..."
              className={addressError ? 'border-destructive' : ''}
            />
            {addressError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {addressError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="onsite-city">City</Label>
              <Input
                id="onsite-city"
                name="city"
                value={formData.city}
                readOnly
                placeholder="Auto-filled"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onsite-state">State</Label>
              <Input
                id="onsite-state"
                name="state"
                value={formData.state}
                readOnly
                placeholder="TX"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onsite-zipCode">ZIP</Label>
              <Input
                id="onsite-zipCode"
                name="zipCode"
                value={formData.zipCode}
                readOnly
                placeholder="Auto-filled"
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onsite-message">Tell us about your situation</Label>
            <Textarea
              id="onsite-message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Describe your HVAC needs, any unique challenges, or questions you have..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
            size="lg"
            disabled={isSubmitting || !!addressError || !formData.city}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule My Free Onsite Estimate
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No obligation • Free estimate • Usually same-week availability
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default OnsiteEstimateForm;
