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

export function EmailCapture() {
  const { state, dispatch } = useScanner();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const scanIds = getAllScanIds();
    if (scanIds.length === 0) {
      toast.error('No scans to save');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update all scan records with the email and contact info
      const { error } = await supabase
        .from('equipment_scans')
        .update({ 
          email,
          customer_name: name || null,
          customer_phone: phone || null,
          customer_address: address || null,
          marketing_opt_in: marketingOptIn
        })
        .in('id', scanIds);

      if (error) throw error;

      dispatch({ type: 'SET_EMAIL', payload: email });
      
      // Build the report URL for GHL
      const scanIdsParam = scanIds.join(',');
      const reportUrl = `${window.location.origin}/scanner/report?scans=${scanIdsParam}&email=${encodeURIComponent(email)}`;
      
      // Sync contact to GHL for email automation
      const nameParts = name?.trim().split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      try {
        await supabase.functions.invoke('sync-ghl-contact', {
          body: {
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            tags: ['equipment-scanner', marketingOptIn ? 'marketing-opted-in' : 'marketing-opted-out'],
            source: 'Equipment Scanner',
            equipmentReportUrl: reportUrl,
          }
        });
      } catch (ghlError) {
        // Don't block navigation if GHL sync fails - just log it
        console.error('GHL sync failed:', ghlError);
      }
      
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
          
          {/* Phone - Optional */}
          <div>
            <Label htmlFor="phone" className="sr-only">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Address - Optional */}
          <div>
            <Label htmlFor="address" className="sr-only">Property address</Label>
            <Input
              id="address"
              type="text"
              placeholder="Property address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
            />
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
