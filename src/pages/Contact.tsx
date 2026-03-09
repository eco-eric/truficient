import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { trackPhoneCallClick } from '@/utils/conversionTracking';

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    value: '214-238-4349',
    href: 'tel:214-238-4349',
    description: 'Mon-Fri 8am-6pm, Emergency 24/7',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'info@truficient.com',
    href: 'mailto:info@truficient.com',
    description: 'We respond within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: '808 Business Parkway',
    href: 'https://maps.google.com/?q=808+Business+Parkway+Richardson+TX+75081',
    description: 'Richardson, TX 75081',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    value: 'Mon - Fri: 8am - 6pm',
    href: null,
    description: 'Emergency services available 24/7',
  },
];

const Contact = () => {
  usePageSEO();

  // Load GHL form embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-4">
              Your Go-To HVAC Experts for Life
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              DFW's Trusted HVAC Experts – Here When You Need Us
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground text-center max-w-3xl mx-auto"
          >
            At <strong className="text-foreground">Truficient HVAC Solutions</strong>, your comfort is our priority. Whether you need a routine HVAC tune-up, a fast repair, or an energy-efficient system upgrade, our expert technicians are ready to help—day or night, rain or shine.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="font-bold mb-2 text-card-foreground">{info.title}</h3>
                    {info.href ? (
                      <a 
                        href={info.href} 
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-primary font-semibold">{info.value}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-2 text-card-foreground">
                    Have a Question?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                  
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/6b2igF5Olgw32kyyiZnb"
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '3px' }}
                    id="inline-6b2igF5Olgw32kyyiZnb"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Website optin Form"
                    data-height="1008"
                    data-layout-iframe-id="inline-6b2igF5Olgw32kyyiZnb"
                    data-form-id="6b2igF5Olgw32kyyiZnb"
                    title="Website optin Form"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Map Placeholder */}
              <Card className="bg-card overflow-hidden">
                <div className="relative h-[300px] bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3346.5!2d-96.7088!3d32.9567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c1f8e0c0c0c0b%3A0x0!2s808%20Business%20Pkwy%2C%20Richardson%2C%20TX%2075081!5e0!3m2!1sen!2sus!4v1704067200000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Truficient HVAC Location - 808 Business Parkway, Richardson, TX"
                    className="absolute inset-0"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-card-foreground mb-2">Our Location</h3>
                  <p className="text-muted-foreground">
                    808 Business Parkway<br />
                    Richardson, TX 75081
                  </p>
                  <a 
                    href="https://maps.google.com/?q=808+Business+Parkway+Richardson+TX+75081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm font-semibold mt-2 inline-block"
                  >
                    Get Directions →
                  </a>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4">Need Immediate Assistance?</h3>
                  <p className="opacity-90 mb-4">
                    With Truficient Service, you can expect the job to be done right. Our fair, transparent rates help your home or business become more efficient—without breaking the bank.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      asChild
                      className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold"
                    >
                      <a 
                        href="tel:214-238-4349"
                        onClick={() => trackPhoneCallClick('Contact Page')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call 214-238-4349
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-bold text-card-foreground mb-3">Service Areas</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We proudly serve the entire Dallas-Fort Worth Metroplex including: Dallas, Richardson, Plano, Frisco, McKinney, Allen, Garland, Mesquite, Irving, Arlington, Fort Worth, and surrounding areas.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Experience<br />
              5-Star HVAC Service?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join thousands of satisfied DFW homeowners and businesses who trust Truficient for all their heating and cooling needs.
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8"
            >
              Schedule a Service
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
