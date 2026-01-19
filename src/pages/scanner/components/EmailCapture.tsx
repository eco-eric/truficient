import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackEmailCaptured } from '@/utils/conversionTracking';
import { AddressAutocomplete, AddressComponents } from '@/components/AddressAutocomplete';
import { MapPreview } from '@/components/MapPreview';

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

// Validate phone number (must be 10 digits)
const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 0 || digits.length === 10;
};

export function EmailCapture() {
  const { state, dispatch } = useScanner();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState(state.city || '');
  const [addressState, setAddressState] = useState(state.state || '');
  const [zipCode, setZipCode] = useState(state.zipCode || '');
  const [county, setCounty] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Handle address selection from Google Places autocomplete
  const handleAddressSelect = (components: AddressComponents) => {
    setStreetAddress(components.streetAddress);
    setCity(components.city);
    setAddressState(components.state);
    setZipCode(components.zipCode);
    setCounty(components.county);
    
    if (components.lat && components.lng) {
      setCoordinates({ lat: components.lat, lng: components.lng });
    }
  };

  // Get all scan IDs (current result + accumulated results)
  const getAllScanIds = (): string[] => {
    const ids: string[] = [];
    
    // Add accumulated results
    state.results.forEach(scan => {
      if (scan.id) ids.push(scan.id);
    });
    
    // Add current result if not already in results
    if (state.result?.id && !ids.includes(state.result.id)) {
      ids.push(state.result.id);
    }
    
    return ids;
  };

  const totalScans = getAllScanIds().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (phone && !isValidPhone(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    const scanIds = getAllScanIds();
    if (scanIds.length === 0) {
      toast.error('No scans to save');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get equipment data from the first scan for GHL
      const primaryScan = state.result || state.results[0];
      const currentYear = new Date().getFullYear();
      const equipmentAge = primaryScan?.specs?.manufactured_year 
        ? currentYear - primaryScan.specs.manufactured_year 
        : undefined;

      // Build tags based on equipment data
      const tags = ['equipment-scanner', marketingOptIn ? 'marketing-opted-in' : 'marketing-opted-out'];
      if (state.isDfw) {
        tags.push('dfw-lead');
      }
      if (equipmentAge !== undefined) {
        if (equipmentAge >= 20) {
          tags.push('hot-lead');
        } else if (equipmentAge >= 12) {
          tags.push('warm-lead');
        }
      }

      // Update all scan records with the email and contact info
      console.log('Updating scan IDs:', scanIds);
      console.log('Update data:', { email, name, phone, streetAddress, city, addressState, zipCode });
      
      const { data: updateData, error } = await supabase
        .from('equipment_scans')
        .update({ 
          email,
          customer_name: name || null,
          customer_phone: phone || null,
          customer_address: streetAddress || null,
          city: city || state.city || null,
          state: addressState || state.state || null,
          zip_code: zipCode || state.zipCode,
          marketing_opt_in: marketingOptIn,
          ghl_sync_status: 'pending'
        })
        .in('id', scanIds)
        .select();

      console.log('Update result:', { data: updateData, error });
      
      if (error) throw error;
      
      if (!updateData || updateData.length === 0) {
        console.warn('No rows were updated - scan IDs may not exist:', scanIds);
      }

      dispatch({ type: 'SET_EMAIL', payload: email });
      
      // Build the report URL for GHL
      const scanIdsParam = scanIds.join(',');
      const reportUrl = `${window.location.origin}/scanner/report?scans=${scanIdsParam}&email=${encodeURIComponent(email)}`;
      
      // Sync contact to GHL for email automation
      const nameParts = name?.trim().split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      let ghlContactId: string | null = null;
      let ghlSyncStatus = 'failed';

      try {
        const ghlResponse = await supabase.functions.invoke('sync-ghl-contact', {
          body: {
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            address: streetAddress || undefined,
            city: city || state.city || undefined,
            state: addressState || state.state || undefined,
            postalCode: zipCode || state.zipCode || undefined,
            tags,
            source: 'Equipment Scanner',
            equipmentReportUrl: reportUrl,
            zipCode: zipCode || state.zipCode,
            isDfw: state.isDfw,
            equipment: primaryScan?.specs ? {
              brand: primaryScan.specs.brand,
              age: equipmentAge,
              tonnage: primaryScan.specs.tonnage,
              refrigerant: primaryScan.specs.refrigerant,
              seerRating: primaryScan.specs.seer_rating,
              equipmentType: primaryScan.specs.equipment_type,
            } : undefined,
          }
        });

        if (ghlResponse.data?.success && ghlResponse.data?.contactId) {
          ghlContactId = ghlResponse.data.contactId;
          ghlSyncStatus = 'synced';
        }
      } catch (ghlError) {
        // Don't block navigation if GHL sync fails - just log it
        console.error('GHL sync failed:', ghlError);
      }

      // Update scan records with GHL sync status
      await supabase
        .from('equipment_scans')
        .update({ 
          ghl_contact_id: ghlContactId,
          ghl_sync_status: ghlSyncStatus
        })
        .in('id', scanIds);
      
      // Track email capture conversion
      trackEmailCaptured(scanIds.length, state.isDfw || false);
      
      // Navigate to the report page
      navigate(reportUrl.replace(window.location.origin, ''));
      
    } catch (err) {
      console.error('Failed to save email:', err);
      toast.error('Failed to save email. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Get Your Equipment Report</h3>
              <p className="text-sm text-muted-foreground">
                {totalScans > 1 
                  ? `We'll email you a report with all ${totalScans} scanned units`
                  : 'We\'ll email you a copy of this report with downloadable PDFs'
                }
              </p>
            </div>
          </div>
          
          {/* Email - Required */}
          <div>
            <Label htmlFor="email" className="sr-only">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          {/* Name - Optional */}
          <div>
            <Label htmlFor="name" className="sr-only">Your name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Phone - Optional with formatting */}
          <div>
            <Label htmlFor="phone" className="sr-only">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={handlePhoneChange}
              disabled={isSubmitting}
              maxLength={14}
            />
          </div>
          
          {/* Address with Google Places Autocomplete */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="address" className="sr-only">Property address</Label>
              <AddressAutocomplete
                value={streetAddress}
                onChange={setStreetAddress}
                onAddressSelect={handleAddressSelect}
                placeholder="Property address (optional)"
                disabled={isSubmitting}
              />
            </div>
            
            {/* City, State, Zip - Show after address entry or pre-filled from zip gate */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="city" className="sr-only">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="state" className="sr-only">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="zip" className="sr-only">Zip Code</Label>
                <Input
                  id="zip"
                  type="text"
                  placeholder="Zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Map Preview - Shows after address selection with coordinates */}
            {coordinates && (
              <MapPreview
                lat={coordinates.lat}
                lng={coordinates.lng}
                address={streetAddress}
                county={county}
              />
            )}
          </div>
          
          {/* Marketing Opt-in - Pre-checked */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="marketing" 
              checked={marketingOptIn} 
              onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer">
              Send me HVAC tips, maintenance reminders & special offers
            </Label>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !email}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Get My Report
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
