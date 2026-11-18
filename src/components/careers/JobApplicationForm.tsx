import { useRef, useState } from 'react';
import { CheckCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackJobApplicationSubmission } from '@/utils/conversionTracking';
import { POSITION_OPTIONS } from '@/data/careers';

// Saves into the existing job_applications table and private `resumes` bucket.
// No schema change: answers without their own column are written as labeled
// lines into cover_letter so they are readable in the admin view and by the
// screening routine.

const EXPERIENCE_OPTIONS = ['No experience', 'Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const DUCTLESS_OPTIONS = ['None', 'Some', 'Most of my work'];
const CERTIFICATIONS = ['EPA 608 Universal', 'EPA 608 Type II', 'EPA 608 (other type)', 'TDLR technician registration', 'TDLR Certified Technician', 'NATE'];
const START_OPTIONS = ['Immediately', '2 weeks notice', '1 month', 'Other'];
const HEARD_OPTIONS = ['Indeed', 'Facebook', 'LinkedIn', 'Employee referral', 'Supply house', 'Trade school', 'Workforce Solutions', 'Google', 'Other'];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  position: string;
  experience: string;
  ductless: string;
  certifications: string[];
  otherCertifications: string;
  brands: string;
  ownTools: string;
  availability: string;
  proudOf: string;
  additional: string;
  howDidYouHear: string;
  resume: File | null;
}

type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'position' | 'experience' | 'proudOf', string>>;

interface Props {
  defaultPosition?: string;
}

const JobApplicationForm = ({ defaultPosition = '' }: Props) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'English',
    position: defaultPosition,
    experience: '',
    ductless: '',
    certifications: [],
    otherCertifications: '',
    brands: '',
    ownTools: '',
    availability: '',
    proudOf: '',
    additional: '',
    howDidYouHear: '',
    resume: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleCert = (cert: string, checked: boolean) => {
    set('certifications', checked ? [...form.certifications, cert] : form.certifications.filter((c) => c !== cert));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.position) e.position = 'Please choose a position';
    if (!form.experience) e.experience = 'Please select your experience';
    if (!form.proudOf.trim()) e.proudOf = 'Please tell us a little about your work';
    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setIsSubmitting(true);
    try {
      let resumeUrl: string | null = null;
      if (form.resume) {
        const ext = form.resume.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { data, error } = await supabase.storage.from('resumes').upload(fileName, form.resume);
        if (error) console.error('Resume upload error:', error);
        else resumeUrl = data?.path ?? null;
      }

      const certs = [...form.certifications, form.otherCertifications.trim()].filter(Boolean).join(', ');
      const details = [
        `Preferred language: ${form.language}`,
        `Ductless / mini-split experience: ${form.ductless || 'Not answered'}`,
        `Brands worked on: ${form.brands.trim() || 'Not answered'}`,
        `Own hand tools and meters: ${form.ownTools || 'Not answered'}`,
        `Install or repair they are proud of: ${form.proudOf.trim()}`,
        form.additional.trim() ? `Anything else: ${form.additional.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const { error: insertError } = await supabase.from('job_applications').insert({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        position: form.position,
        experience: form.experience,
        certifications: certs || null,
        availability: form.availability || null,
        resume_url: resumeUrl,
        cover_letter: details,
        how_did_you_hear: form.howDidYouHear || null,
      });
      if (insertError) throw insertError;

      trackJobApplicationSubmission(form.position);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Something went wrong sending your application. Please try again or call 214-238-4349.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-3xl mx-auto bg-card">
        <CardContent className="p-8 text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-card-foreground mb-4">Application received</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thanks for applying to Truficient. We review every application and will reach out if it looks like a fit.
          </p>
        </CardContent>
      </Card>
    );
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] ? <p className="text-sm text-destructive">{errors[key]}</p> : null;

  return (
    <Card className="max-w-3xl mx-auto bg-card">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={errors.firstName ? 'border-destructive' : ''} />
              {fieldError('firstName')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name *</Label>
              <Input id="lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={errors.lastName ? 'border-destructive' : ''} />
              {fieldError('lastName')}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
              {fieldError('phone')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
              {fieldError('email')}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select value={form.position} onValueChange={(v) => set('position', v)}>
                <SelectTrigger id="position" className={errors.position ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Choose a position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('position')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred language</Label>
              <Select value={form.language} onValueChange={(v) => set('language', v)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish / Español</SelectItem>
                  <SelectItem value="English and Spanish">English and Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Years of HVAC experience *</Label>
              <Select value={form.experience} onValueChange={(v) => set('experience', v)}>
                <SelectTrigger id="experience" className={errors.experience ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('experience')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ductless">How much of it was ductless or mini-split?</Label>
              <Select value={form.ductless} onValueChange={(v) => set('ductless', v)}>
                <SelectTrigger id="ductless">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {DUCTLESS_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Certifications you hold</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {CERTIFICATIONS.map((cert) => (
                <label key={cert} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={form.certifications.includes(cert)} onCheckedChange={(c) => toggleCert(cert, c === true)} />
                  {cert}
                </label>
              ))}
            </div>
            <Input aria-label="Other certifications" placeholder="Other certifications (optional)" value={form.otherCertifications} onChange={(e) => set('otherCertifications', e.target.value)} />
          </fieldset>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brands">Brands you have worked on</Label>
              <Input id="brands" placeholder="For example Mitsubishi, Daikin, Fujitsu" value={form.brands} onChange={(e) => set('brands', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownTools">Do you have your own hand tools and meters?</Label>
              <Select value={form.ownTools} onValueChange={(v) => set('ownTools', v)}>
                <SelectTrigger id="ownTools">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Some">Some</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">When could you start?</Label>
            <Select value={form.availability} onValueChange={(v) => set('availability', v)}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {START_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proudOf">Tell us about an install or repair you are proud of *</Label>
            <Textarea id="proudOf" rows={4} placeholder="What was the job, what did you do, and how did it turn out? If you are new to HVAC, tell us about hands-on work you have done." value={form.proudOf} onChange={(e) => set('proudOf', e.target.value)} className={errors.proudOf ? 'border-destructive' : ''} />
            {fieldError('proudOf')}
          </div>

          <div className="space-y-2">
            <Label>Resume (optional)</Label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => set('resume', e.target.files?.[0] ?? null)} />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-sm text-muted-foreground">
                {form.resume ? form.resume.name : 'Tap to upload (PDF, DOC, DOCX). Not required.'}
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Anything else we should know?</Label>
            <Textarea id="additional" rows={3} value={form.additional} onChange={(e) => set('additional', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
            <Select value={form.howDidYouHear} onValueChange={(v) => set('howDidYouHear', v)}>
              <SelectTrigger id="howDidYouHear">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {HEARD_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            By applying, you agree that Truficient may contact you by phone, text or email about this job.
          </p>

          <Button type="submit" size="lg" className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;
