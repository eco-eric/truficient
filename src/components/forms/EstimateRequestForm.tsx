import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Phone } from "lucide-react";
import { trackConversion } from "@/utils/conversionTracking";

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Valid phone required"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "5-digit ZIP required"),
  message: z.string().trim().min(1, "Tell us about your project").max(2000),
});

interface EstimateRequestFormProps {
  systemType: string;
  sourcePage: string;
  heading?: string;
  subheading?: string;
}

export const EstimateRequestForm = ({
  systemType,
  sourcePage,
  heading = "Schedule Your Free Estimate",
  subheading = "Tell us about your project and we'll reach out within 24 hours.",
}: EstimateRequestFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState({ name: "", phone: "", zip: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: name === "phone" ? formatPhoneNumber(value) : value }));
    if (errors[name]) {
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0]?.toString();
        if (k && !fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const [firstName, ...rest] = parsed.data.name.split(" ");
      const lastName = rest.join(" ") || "(not provided)";
      const message = `System Type: ${systemType}\nZIP: ${parsed.data.zip}\nSource Page: ${sourcePage}\n\n${parsed.data.message}`;
      const source = `Estimate Page – ${systemType}`;

      const placeholderEmail = `noemail+${Date.now()}@truficient.com`;

      const { error: insertError } = await supabase.from("contact_submissions").insert({
        first_name: firstName,
        last_name: lastName,
        email: placeholderEmail,
        phone: parsed.data.phone,
        service_type: systemType,
        message,
        status: "new",
      });
      if (insertError) throw insertError;

      // Non-blocking notifications (Resend email + GHL sync — existing pipeline)
      supabase.functions
        .invoke("send-contact-notification", {
          body: {
            firstName,
            lastName,
            email: placeholderEmail,
            phone: parsed.data.phone,
            serviceType: systemType,
            message,
            source,
          },
        })
        .then(({ error }) => error && console.error("Email notify failed:", error));
          body: {
            firstName,
            lastName,
            email: "",
            phone: parsed.data.phone,
            serviceType: systemType,
            message,
            source,
          },
        })
        .then(({ error }) => error && console.error("Email notify failed:", error));

      supabase.functions
        .invoke("sync-ghl-contact", {
          body: {
            firstName,
            lastName,
            phone: parsed.data.phone,
            serviceType: systemType,
            message,
            source,
            tags: [`estimate-page-${sourcePage.replace(/^\//, "")}`, systemType.toLowerCase()],
          },
        })
        .then(({ error }) => error && console.error("GHL sync failed:", error));

      trackConversion("Lead", {
        content_name: "Estimate Request",
        content_category: systemType,
      });

      setSuccess(true);
      toast({ title: "Request received!", description: "We'll be in touch within 24 hours." });
    } catch (err) {
      console.error("Estimate form error:", err);
      toast({
        title: "Submission failed",
        description: "Please call 214-238-4349 and we'll help right away.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div id="estimate-form" className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
        <p className="text-muted-foreground mb-4">
          We've received your estimate request and a Truficient team member will reach out within 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          Need help sooner?{" "}
          <a href="tel:2142384349" className="text-primary font-semibold">
            Call 214-238-4349
          </a>
        </p>
      </div>
    );
  }

  return (
    <div id="estimate-form" className="rounded-xl border bg-card p-6 md:p-8 scroll-mt-24">
      <div className="mb-6 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">{heading}</h3>
        <p className="text-muted-foreground">{subheading}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" name="system_type" value={systemType} />
        <input type="hidden" name="source_page" value={sourcePage} />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ef-name">Name *</Label>
            <Input
              id="ef-name"
              name="name"
              value={data.name}
              onChange={onChange}
              autoComplete="name"
              disabled={submitting}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ef-phone">Phone *</Label>
            <Input
              id="ef-phone"
              name="phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={data.phone}
              onChange={onChange}
              autoComplete="tel"
              disabled={submitting}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ef-zip">ZIP Code *</Label>
          <Input
            id="ef-zip"
            name="zip"
            inputMode="numeric"
            maxLength={5}
            placeholder="75201"
            value={data.zip}
            onChange={onChange}
            autoComplete="postal-code"
            disabled={submitting}
            aria-invalid={!!errors.zip}
          />
          {errors.zip && <p className="text-xs text-destructive">{errors.zip}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ef-message">Tell us about your project *</Label>
          <Textarea
            id="ef-message"
            name="message"
            rows={4}
            placeholder="Number of rooms, current system, comfort issues, timing…"
            value={data.message}
            onChange={onChange}
            disabled={submitting}
            aria-invalid={!!errors.message}
          />
          {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : (
              "Request My Estimate"
            )}
          </Button>
          <Button asChild type="button" size="lg" variant="outline">
            <a href="tel:2142384349">
              <Phone className="w-4 h-4 mr-2" />
              Call 214-238-4349
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree to receive SMS or email responses from Truficient. Message and data rates may apply. Reply STOP to opt out.
        </p>
      </form>
    </div>
  );
};

export default EstimateRequestForm;
