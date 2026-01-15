import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, DollarSign, Users, MapPin, CheckCircle, Upload, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackJobApplicationSubmission, trackPhoneCallClick } from '@/utils/conversionTracking';

const benefits = [
  {
    icon: Trophy,
    title: 'Industry Leadership',
    description: 'Work with a Mitsubishi Diamond Contractor and HERS certified company at the forefront of energy-efficient HVAC solutions.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Continuous training opportunities and clear advancement paths to help you reach your professional goals.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'We offer competitive compensation packages that recognize your skills and experience in the industry.',
  },
  {
    icon: Users,
    title: 'Great Team Culture',
    description: 'Join a supportive team environment where your contributions are valued and recognized.',
  },
];

const jobRequirements = [
  '3+ years of HVAC installation and service experience',
  'EPA 608 Certification (Universal preferred)',
  'Strong diagnostic and troubleshooting skills',
  'Experience with mini-split systems a plus',
  'Valid driver\'s license and clean driving record',
  'Excellent customer service skills',
];

const jobResponsibilities = [
  'Install, repair, and maintain HVAC systems',
  'Perform system diagnostics and troubleshooting',
  'Provide excellent customer service',
  'Complete documentation and work orders',
  'Maintain company vehicle and tools',
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  certifications: string;
  availability: string;
  resume: File | null;
  coverLetter: string;
  howDidYouHear: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  experience?: string;
}

const Careers = () => {
  usePageSEO();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: 'Mid to Senior Level HVAC Technician',
    experience: '',
    certifications: '',
    availability: '',
    resume: null,
    coverLetter: '',
    howDidYouHear: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.experience) newErrors.experience = 'Please select your experience level';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeUrl = null;

      // Upload resume if provided
      if (formData.resume) {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${Date.now()}-${formData.firstName}-${formData.lastName}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resume);

        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          // Continue without resume - don't fail the whole submission
        } else {
          resumeUrl = uploadData?.path;
        }
      }

      // Insert application into database
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          experience: formData.experience,
          certifications: formData.certifications || null,
          availability: formData.availability || null,
          resume_url: resumeUrl,
          cover_letter: formData.coverLetter || null,
          how_did_you_hear: formData.howDidYouHear || null,
        });

      if (insertError) {
        throw insertError;
      }

      // Track conversion
      trackJobApplicationSubmission(formData.position);

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Build Your Career with Dallas-Fort Worth's Premier Energy-Efficient HVAC Company
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Work at Truficient */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            Why Work at Truficient?
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-card-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground"
          >
            Current Openings
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-4xl mx-auto bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-card-foreground">Mid to Senior Level HVAC Technician</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      Dallas-Fort Worth, TX
                    </p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                    Now Hiring
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-card-foreground mb-3">Requirements:</h4>
                    <ul className="space-y-2">
                      {jobRequirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-card-foreground mb-3">Responsibilities:</h4>
                    <ul className="space-y-2">
                      {jobResponsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Apply Now</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to join the Truficient team? Fill out the application below and we'll be in touch!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-3xl mx-auto bg-card">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4">Application Submitted!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Thank you for your interest in joining Truficient. We've received your application and will review it shortly. Expect to hear from us within 3-5 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          className={errors.lastName ? 'border-destructive' : ''}
                        />
                        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                      </div>
                    </div>

                    {/* Contact Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 555-5555"
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                      <Label htmlFor="position">Position Applying For</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) => handleSelectChange('position', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mid to Senior Level HVAC Technician">Mid to Senior Level HVAC Technician</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of HVAC Experience *</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => handleSelectChange('experience', value)}
                      >
                        <SelectTrigger className={errors.experience ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="5-10 years">5-10 years</SelectItem>
                          <SelectItem value="10+ years">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (EPA 608, NATE, etc.)</Label>
                      <Input
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleInputChange}
                        placeholder="List your relevant certifications"
                      />
                    </div>

                    {/* Availability */}
                    <div className="space-y-2">
                      <Label htmlFor="availability">When are you available to start?</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => handleSelectChange('availability', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediately">Immediately</SelectItem>
                          <SelectItem value="2 weeks notice">2 weeks notice</SelectItem>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                      <Label>Upload Resume</Label>
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {formData.resume ? formData.resume.name : 'Click to upload (PDF, DOC, DOCX)'}
                        </p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">Cover Letter / Additional Information</Label>
                      <Textarea
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself, your experience, and why you'd like to join Truficient..."
                        rows={5}
                      />
                    </div>

                    {/* How Did You Hear */}
                    <div className="space-y-2">
                      <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
                      <Select
                        value={formData.howDidYouHear}
                        onValueChange={(value) => handleSelectChange('howDidYouHear', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indeed">Indeed</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Employee Referral">Employee Referral</SelectItem>
                          <SelectItem value="Company Website">Company Website</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Questions CTA */}
      <section 
        className="py-20 lg:py-28 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=500&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-primary/85" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Questions?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Have questions about career opportunities at Truficient? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold"
              >
                <a 
                  href="tel:214-238-4349"
                  onClick={() => trackPhoneCallClick('Careers Page')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  214-238-4349
                </a>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
              >
                <a href="mailto:info@truficient.com">
                  <Mail className="w-5 h-5 mr-2" />
                  info@truficient.com
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
