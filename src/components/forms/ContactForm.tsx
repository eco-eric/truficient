import { useState } from 'react';
import { z } from 'zod';
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
import { useFormSourceTags } from '@/hooks/useFormSourceTags';

// Phone formatting utility
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const SERVICE_TYPES = [
  'AC Repair',
  'Heating Repair',
  'New Installation',
  'Maintenance / Tune-Up',
  'Mini-Split / Ductless',
  'Indoor Air Quality',
  'Commercial HVAC',
  'Other / General Question',
] as const;

const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z
    .string()
    .trim()
    .refine((val) => val.replace(/\D/g, '').length >= 10, 'Valid phone required'),
  serviceType: z.string().min(1, 'Please select a service type'),
  message: z.string().trim().min(1, 'Please tell us how we can help').max(2000),
});

interface ContactFormProps {
  /** Optional override for the GHL source/tag context */
  source?: string;
  /** Default service type */
  defaultServiceType?: string;
}

export const ContactForm = ({
  source = 'Website Contact Page',
  defaultServiceType = '',
}: ContactFormProps) => {
  const { toast } = useToast();
  const { data: dynamicTags } = useFormSourceTags('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: defaultServiceType,
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = contactSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({
        title: 'Please fix the errors',
        description: 'Some required fields are missing or invalid.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to contact_submissions (triggers admin notification + auto-task)
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert({
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          service_type: parsed.data.serviceType,
          message: parsed.data.message,
          status: 'new',
        });
      if (submitError) throw submitError;

      // Sync to GHL (non-blocking — don't fail the user if GHL hiccups)
      supabase.functions
        .invoke('sync-ghl-contact', {
          body: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            serviceType: parsed.data.serviceType,
            message: parsed.data.message,
            source,
            tags: dynamicTags || ['website-contact-form'],
          },
        })
        .then(({ error: ghlError }) => {
          if (ghlError) console.error('GHL sync failed (non-critical):', ghlError);
        });

      // Send email notifications (non-blocking — internal alert + customer ack)
      supabase.functions
        .invoke('send-contact-notification', {
          body: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            serviceType: parsed.data.serviceType,
            message: parsed.data.message,
            source,
          },
        })
        .then(({ error: emailError }) => {
          if (emailError) console.error('Email notification failed (non-critical):', emailError);
        });

      // Track conversion
      trackConversion('Lead', {
        content_name: 'Contact Form Submission',
        content_category: parsed.data.serviceType,
      });

      setIsSuccess(true);
      toast({
        title: 'Message sent!',
        description: "We'll get back to you within 24 hours.",
      });
    } catch (err) {
      console.error('Contact form submission error:', err);
      toast({
        title: 'Submission failed',
        description: 'Something went wrong. Please call us at 214-238-4349.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2 text-card-foreground">Thank you!</h3>
        <p className="text-muted-foreground mb-4">
          We've received your message and will respond within 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          Need immediate help? Call{' '}
          <a href="tel:214-238-4349" className="text-primary font-semibold">
            214-238-4349
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          autoComplete="email"
          aria-invalid={!!errors.email}
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          autoComplete="tel"
          placeholder="(555) 555-5555"
          aria-invalid={!!errors.phone}
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="serviceType">How can we help? *</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, serviceType: value }));
            if (errors.serviceType) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.serviceType;
                return next;
              });
            }
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger id="serviceType" aria-invalid={!!errors.serviceType}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p className="text-xs text-destructive">{errors.serviceType}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about what you need..."
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to receive SMS or email responses from Truficient.
        Message and data rates may apply. Reply STOP to opt out.
      </p>
    </form>
  );
};
