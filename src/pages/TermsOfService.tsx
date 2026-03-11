import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  usePageSEO('/terms-of-service');

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        className="bg-primary text-primary-foreground py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p 
            className="text-primary-foreground/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Last Updated: March 09, 2026
          </motion.p>
        </div>
      </motion.section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-8 md:p-12">
              
              {/* Introduction */}
              <div className="bg-muted border-l-4 border-secondary p-6 mb-8 rounded">
                <p className="text-muted-foreground">
                  These Terms of Service govern your use of the services provided by Truficient Energy Solutions, LLC, including the use of our website and participation in our SMS and email communications programs. By accessing our website, submitting your information through our website opt-in form, or using our services, you agree to these Terms of Service and our{' '}
                  <a href="/privacy-policy" className="text-secondary hover:underline font-medium">Privacy Policy</a>.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-muted border-l-4 border-secondary p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-4">Table of Contents</h2>
                <nav className="space-y-2">
                  <a href="#eligibility" className="block text-primary hover:text-secondary transition-colors">1. Eligibility</a>
                  <a href="#program-description" className="block text-primary hover:text-secondary transition-colors">2. Program Description</a>
                  <a href="#consent" className="block text-primary hover:text-secondary transition-colors">3. Consent to Receive Messages</a>
                  <a href="#frequency" className="block text-primary hover:text-secondary transition-colors">4. Message Frequency</a>
                  <a href="#rates" className="block text-primary hover:text-secondary transition-colors">5. Message and Data Rates</a>
                  <a href="#opt-out" className="block text-primary hover:text-secondary transition-colors">6. Opt-Out Instructions</a>
                  <a href="#help" className="block text-primary hover:text-secondary transition-colors">7. Help and Support</a>
                  <a href="#carrier" className="block text-primary hover:text-secondary transition-colors">8. Carrier Disclaimer</a>
                  <a href="#privacy" className="block text-primary hover:text-secondary transition-colors">9. Privacy</a>
                  <a href="#changes" className="block text-primary hover:text-secondary transition-colors">10. Changes to These Terms</a>
                  <a href="#contact" className="block text-primary hover:text-secondary transition-colors">11. Contact Information</a>
                </nav>
              </div>

              {/* 1. Eligibility */}
              <section id="eligibility" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">1. Eligibility</h2>
                <p className="text-muted-foreground">
                  By using this website and submitting any forms, you confirm that you are at least 18 years of age or have the consent of a parent or legal guardian to use this website and receive communications from Truficient Energy Solutions, LLC. If you do not meet this requirement, please do not use our services or submit your information through our website.
                </p>
              </section>

              {/* 2. Program Description */}
              <section id="program-description" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">2. Program Description</h2>
                <p className="text-muted-foreground mb-4">
                  Truficient Energy Solutions, LLC provides energy consulting and efficiency solutions for homeowners and businesses.
                </p>
                <p className="text-muted-foreground mb-4">
                  Individuals who submit their information through the opt-in form on our website may receive SMS and email communications from us. These communications may include both non-marketing and marketing messages, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Appointment confirmations and reminders</li>
                  <li>Service notifications and updates</li>
                  <li>Account or service related communications</li>
                  <li>Follow-up communications related to your inquiry</li>
                  <li>Promotional messages or special offers related to our services</li>
                </ul>
                <p className="text-muted-foreground">
                  Message frequency may vary depending on your interaction with our services.
                </p>
              </section>

              {/* 2. Consent to Receive Messages */}
              <section id="consent" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">2. Consent to Receive Messages</h2>
                <p className="text-muted-foreground mb-4">
                  By providing your phone number and submitting the opt-in form on our website, you consent to receive text messages from Truficient Energy Solutions, LLC.
                </p>
                <p className="text-muted-foreground mb-4">
                  These messages may include non-marketing and marketing communications related to our services.
                </p>
                <div className="bg-yellow-50 border-l-4 border-secondary p-4 rounded">
                  <p className="text-foreground font-bold">
                    Consent to receive SMS communications is not a condition of purchase.
                  </p>
                </div>
              </section>

              {/* 3. Message Frequency */}
              <section id="frequency" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">3. Message Frequency</h2>
                <p className="text-muted-foreground">
                  Message frequency may vary depending on your interaction with our services, service updates, or marketing communications.
                </p>
              </section>

              {/* 4. Message and Data Rates */}
              <section id="rates" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">4. Message and Data Rates</h2>
                <p className="text-muted-foreground mb-4">
                  Message and data rates may apply for messages sent to you from us and to us from you. Charges depend on your mobile carrier and service plan.
                </p>
                <p className="text-muted-foreground">
                  For questions regarding your messaging or data plan, please contact your wireless provider.
                </p>
              </section>

              {/* 5. Opt-Out Instructions */}
              <section id="opt-out" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">5. Opt-Out Instructions</h2>
                <p className="text-muted-foreground mb-4">
                  You can opt out of receiving SMS messages at any time.
                </p>
                <div className="bg-muted p-6 rounded-lg border-2 border-border mb-4">
                  <p className="text-foreground font-bold mb-2">
                    To stop receiving messages, reply <span className="text-secondary">STOP</span> to any message sent by Truficient Energy Solutions, LLC.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    After sending STOP, you will receive a confirmation message indicating that you have been unsubscribed. After this, you will no longer receive SMS messages unless you choose to opt in again.
                  </p>
                </div>
              </section>

              {/* 6. Help and Support */}
              <section id="help" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">6. Help and Support</h2>
                <p className="text-muted-foreground mb-4">
                  If you are experiencing issues with our messaging program, reply <strong className="text-secondary">HELP</strong> to any SMS message for assistance.
                </p>
                <p className="text-muted-foreground mb-2">You may also contact us directly:</p>
                <ul className="text-muted-foreground space-y-2 ml-4">
                  <li><strong>Email:</strong>{' '}
                    <a href="mailto:info@truficient.com" className="text-secondary hover:underline">info@truficient.com</a>
                  </li>
                  <li><strong>Phone:</strong>{' '}
                    <a href="tel:+12142384349" className="text-secondary hover:underline">+1 214-238-4349</a>
                  </li>
                </ul>
              </section>

              {/* 7. Carrier Disclaimer */}
              <section id="carrier" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">7. Carrier Disclaimer</h2>
                <p className="text-muted-foreground">
                  Wireless carriers are not liable for delayed or undelivered messages.
                </p>
              </section>

              {/* 8. Privacy */}
              <section id="privacy" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">8. Privacy</h2>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Your use of our website and services is also governed by our{' '}
                  <a href="/privacy-policy" className="text-secondary hover:underline font-medium">Privacy Policy</a>.
                </p>
              </section>

              {/* 9. Changes to These Terms */}
              <section id="changes" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">9. Changes to These Terms</h2>
                <p className="text-muted-foreground">
                  Truficient Energy Solutions, LLC may update these Terms of Service from time to time. Updates will be posted on this page with a revised "Last Updated" date.
                </p>
              </section>

              {/* 10. Contact Information */}
              <section id="contact" className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">10. Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  If you have questions regarding these Terms of Service, please contact us:
                </p>

                <div className="bg-primary text-primary-foreground p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-secondary">Truficient Energy Solutions, LLC</h3>
                  <div className="space-y-2">
                    <p>808 Business Pkwy<br />Richardson, Texas 75081<br />United States</p>
                    <p><strong>Phone:</strong>{' '}
                      <a href="tel:+12142384349" className="hover:text-secondary transition-colors">+1 214-238-4349</a>
                    </p>
                    <p><strong>Email:</strong>{' '}
                      <a href="mailto:info@truficient.com" className="hover:text-secondary transition-colors">info@truficient.com</a>
                    </p>
                    <p><strong>Website:</strong>{' '}
                      <a href="https://truficient.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">https://truficient.com</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center pt-8 border-t-2 border-border">
                <p className="text-muted-foreground text-sm">
                  © 2026 Truficient Energy Solutions, LLC. All rights reserved.
                </p>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
