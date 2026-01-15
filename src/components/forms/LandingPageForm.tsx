import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { trackConversion } from '@/utils/conversionTracking';

interface FieldsConfig {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  phone: boolean;
  serviceType: boolean;
  message: boolean;
}

interface LandingPageFormProps {
  slug: string;
  className?: string;
  onSuccess?: () => void;
}

const serviceTypes = [
  'AC Repair',
  'Heating Repair',
  'AC Installation',
  'Heating Installation',
  'Maintenance',
  'Commercial HVAC',
  'Other',
];

export const LandingPageForm = ({ slug, className, onSuccess }: LandingPageFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    message: '',
  });

  // Fetch form configuration
  const { data: formConfig, isLoading, error } = useQuery({
    queryKey: ['landing-page-form', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch assigned tags for this form
  const { data: formTags } = useQuery({
    queryKey: ['landing-page-form-tags', formConfig?.id],
    queryFn: async () => {
      if (!formConfig?.id) return [];
      const { data, error } = await supabase
        .from('landing_page_form_tags')
        .select(`
          tag_id,
          tag:ghl_tags(tag_value)
        `)
        .eq('form_id', formConfig.id);
      if (error) throw error;
      return data.map((t) => (t.tag as { tag_value: string })?.tag_value).filter(Boolean);
    },
    enabled: !!formConfig?.id,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;

    setIsSubmitting(true);

    try {
      // Save submission to database
      const { data: submission, error: submitError } = await supabase
        .from('landing_page_submissions')
        .insert({
          form_id: formConfig.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          service_type: formData.serviceType || null,
          message: formData.message || null,
          ghl_sync_status: 'pending',
          status: 'new',
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // Get tags for this form
      const tags = formTags && formTags.length > 0 ? formTags : ['website-lead'];

      // Sync to GHL
      try {
        const { error: ghlError } = await supabase.functions.invoke('sync-ghl-contact', {
          body: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            serviceType: formData.serviceType,
            message: formData.message,
            tags,
            source: `Landing Page: ${formConfig.name}`,
          },
        });

        if (ghlError) {
          console.error('GHL sync error:', ghlError);
          await supabase
            .from('landing_page_submissions')
            .update({ ghl_sync_status: 'failed' })
            .eq('id', submission.id);
        } else {
          await supabase
            .from('landing_page_submissions')
            .update({ ghl_sync_status: 'synced' })
            .eq('id', submission.id);
        }
      } catch (ghlErr) {
        console.error('GHL sync failed:', ghlErr);
        await supabase
          .from('landing_page_submissions')
          .update({ ghl_sync_status: 'failed' })
          .eq('id', submission.id);
      }

      // Track conversion
      trackConversion('Lead', {
        content_name: `Form: ${formConfig.name}`,
        content_category: formConfig.form_type,
      });

      setIsSuccess(true);
      onSuccess?.();

      // Handle redirect if configured
      if (formConfig.redirect_url) {
        window.location.href = formConfig.redirect_url;
      }
    } catch (err) {
      console.error('Form submission error:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Form not available</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">{formConfig.success_message}</p>
      </div>
    );
  }

  const fields = (formConfig.fields_config as unknown as FieldsConfig) || {

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {(fields.firstName || fields.lastName) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.firstName && (
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="John"
                />
              </div>
            )}
            {fields.lastName && (
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Doe"
                />
              </div>
            )}
          </div>
        )}

        {fields.email && (
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="john@example.com"
            />
          </div>
        )}

        {fields.phone && (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
            />
          </div>
        )}

        {fields.serviceType && (
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={formData.serviceType} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {fields.message && (
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="How can we help you?"
              rows={4}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </form>
  );
};
