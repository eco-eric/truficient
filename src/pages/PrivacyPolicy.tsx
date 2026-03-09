import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  usePageSEO('/privacy-policy');

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
            Privacy Policy
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
                  This Privacy Policy explains how Truficient Energy Solutions, LLC collects, uses, and protects your information when you use our website and services, including SMS communications, email communications, appointment scheduling, and website analytics tools.
                </p>
                <p className="text-muted-foreground mt-3">
                  By using our website or submitting information through our opt-in forms, you agree to this Privacy Policy and our{' '}
                  <a href="/terms-of-service" className="text-secondary hover:underline font-medium">Terms of Service</a>.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-muted border-l-4 border-secondary p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-4">Table of Contents</h2>
                <nav className="space-y-2">
                  <a href="#information-collect" className="block text-primary hover:text-secondary transition-colors">1. Information We Collect</a>
                  <a href="#how-use" className="block text-primary hover:text-secondary transition-colors">2. How We Use Your Information</a>
                  <a href="#cookies" className="block text-primary hover:text-secondary transition-colors">3. Cookies and Tracking Technologies</a>
                  <a href="#how-share" className="block text-primary hover:text-secondary transition-colors">4. How We Share Your Information</a>
                  <a href="#sms" className="block text-primary hover:text-secondary transition-colors">5. SMS Communications</a>
                  <a href="#choices" className="block text-primary hover:text-secondary transition-colors">6. Your Choices</a>
                  <a href="#data-security" className="block text-primary hover:text-secondary transition-colors">7. Data Security</a>
                  <a href="#children" className="block text-primary hover:text-secondary transition-colors">8. Children's Privacy</a>
                  <a href="#updates" className="block text-primary hover:text-secondary transition-colors">9. Updates to This Policy</a>
                  <a href="#contact" className="block text-primary hover:text-secondary transition-colors">10. Contact Us</a>
                </nav>
              </div>

              {/* 1. Information We Collect */}
              <section id="information-collect" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">1. Information We Collect</h2>
                
                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Contact Information</h3>
                <p className="text-muted-foreground mb-4">We may collect personal information including:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Mailing address</li>
                </ul>
                <p className="text-muted-foreground mb-4">This information may be collected when you:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                  <li>Submit a form on our website</li>
                  <li>Request information about our services</li>
                  <li>Schedule an appointment</li>
                  <li>Communicate with our team</li>
                </ul>

                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Communications Data</h3>
                <p className="text-muted-foreground mb-4">If you opt in to receive communications from us, we may collect and maintain:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Messaging preferences</li>
                  <li>SMS consent records</li>
                  <li>Email subscription preferences</li>
                  <li>Records of opt-in and opt-out activity</li>
                </ul>
                <p className="text-muted-foreground mb-6 text-sm italic">
                  These records help us maintain compliance with messaging regulations.
                </p>

                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Usage and Device Information</h3>
                <p className="text-muted-foreground mb-4">
                  We may automatically collect certain information when you visit our website through cookies, analytics tools, and tracking technologies. This information may include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device information</li>
                  <li>Pages visited</li>
                  <li>Interaction with website content</li>
                </ul>

                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Appointment and Service Data</h3>
                <p className="text-muted-foreground">
                  If you request services or schedule appointments, we may collect information related to those interactions to properly provide our services.
                </p>
              </section>

              {/* 2. How We Use Your Information */}
              <section id="how-use" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide requested services</li>
                  <li>Respond to inquiries and support requests</li>
                  <li>Schedule and confirm appointments</li>
                  <li>Send appointment reminders and service updates</li>
                  <li>Send SMS and email communications you have consented to receive</li>
                  <li>Improve website functionality and marketing performance</li>
                  <li>Maintain records of messaging consent and opt-out requests</li>
                </ul>
              </section>

              {/* 3. Cookies and Tracking Technologies */}
              <section id="cookies" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">3. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground mb-4">
                  Our website may use cookies and similar technologies to analyze traffic and improve user experience.
                </p>
                <p className="text-muted-foreground">
                  You can control cookie settings through your browser preferences. Some website features may not function correctly if cookies are disabled.
                </p>
              </section>

              {/* 4. How We Share Your Information */}
              <section id="how-share" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">4. How We Share Your Information</h2>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-foreground font-bold">We do not sell your personal information.</p>
                </div>

                <p className="text-muted-foreground mb-4">We may share information only in the following limited circumstances:</p>

                <h3 className="text-lg font-bold text-primary mb-2 mt-6">Service Providers</h3>
                <p className="text-muted-foreground mb-2">We may share information with trusted service providers that assist us with:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>SMS messaging services</li>
                  <li>Email delivery platforms</li>
                  <li>Customer relationship management systems</li>
                  <li>Appointment scheduling tools</li>
                  <li>Website analytics</li>
                </ul>
                <p className="text-muted-foreground mb-6 text-sm italic">
                  These providers may only use information to perform services on our behalf.
                </p>

                <h3 className="text-lg font-bold text-primary mb-2">Legal Requirements</h3>
                <p className="text-muted-foreground mb-6">
                  We may disclose information when required by law or when necessary to protect the rights, safety, or property of Truficient Energy Solutions, LLC, our customers, or others.
                </p>

                <h3 className="text-lg font-bold text-primary mb-2">Business Transfers</h3>
                <p className="text-muted-foreground mb-6">
                  If Truficient Energy Solutions, LLC is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
                </p>

                <h3 className="text-lg font-bold text-primary mb-2">Mobile Information Protection</h3>
                <div className="bg-yellow-50 border-l-4 border-secondary p-4 rounded">
                  <p className="text-muted-foreground mb-2">
                    <strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</strong>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Information sharing with subcontractors in support services such as customer support or messaging platforms is permitted. All other use case categories exclude text messaging originator opt-in data and consent. This information will not be shared with any third parties.
                  </p>
                </div>
              </section>

              {/* 5. SMS Communications */}
              <section id="sms" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">5. SMS Communications</h2>
                <p className="text-muted-foreground mb-4">
                  If you provide your phone number and consent to receive text messages, Truficient Energy Solutions, LLC may send SMS communications related to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Appointment reminders</li>
                  <li>Service notifications</li>
                  <li>Follow-up communications</li>
                  <li>Promotional messages related to our services</li>
                </ul>
                <div className="bg-muted p-4 rounded border border-border">
                  <p className="text-muted-foreground">
                    Message frequency may vary. Message and data rates may apply.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    You may opt out at any time by replying <strong className="text-secondary">STOP</strong> to any message. For assistance, reply <strong className="text-secondary">HELP</strong>.
                  </p>
                </div>
              </section>

              {/* 6. Your Choices */}
              <section id="choices" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">6. Your Choices</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">SMS Opt-Out</h3>
                    <p className="text-muted-foreground">
                      You may opt out of SMS messages by replying <strong className="text-secondary">STOP</strong> to any text message.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Email Opt-Out</h3>
                    <p className="text-muted-foreground">
                      You may unsubscribe from marketing emails by clicking the unsubscribe link in the email.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Access or Correction</h3>
                    <p className="text-muted-foreground">
                      You may contact us to request access to, correction of, or deletion of your personal information, subject to applicable laws.
                    </p>
                  </div>
                </div>
              </section>

              {/* 7. Data Security */}
              <section id="data-security" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">7. Data Security</h2>
                <p className="text-muted-foreground">
                  We use reasonable administrative, technical, and physical safeguards to protect personal information. However, no method of data transmission or storage is completely secure.
                </p>
              </section>

              {/* 8. Children's Privacy */}
              <section id="children" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">8. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for children under 13 and we do not knowingly collect personal information from children.
                </p>
              </section>

              {/* 9. Updates to This Policy */}
              <section id="updates" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">9. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Last Updated" date.
                </p>
              </section>

              {/* 10. Contact Us */}
              <section id="contact" className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">10. Contact Us</h2>
                <p className="text-muted-foreground mb-6">
                  If you have questions regarding this Privacy Policy, please contact:
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

export default PrivacyPolicy;
