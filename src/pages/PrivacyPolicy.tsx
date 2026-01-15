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
            Last Updated: January 15, 2026
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
              
              {/* Table of Contents */}
              <div className="bg-muted border-l-4 border-secondary p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-4">Table of Contents</h2>
                <nav className="space-y-2">
                  <a href="#introduction" className="block text-primary hover:text-secondary transition-colors">1. Introduction</a>
                  <a href="#information-collect" className="block text-primary hover:text-secondary transition-colors">2. Information We Collect</a>
                  <a href="#how-use" className="block text-primary hover:text-secondary transition-colors">3. How We Use Your Information</a>
                  <a href="#cookie-policy" className="block text-primary hover:text-secondary transition-colors">4. Cookie Policy</a>
                  <a href="#how-share" className="block text-primary hover:text-secondary transition-colors">5. How We Share Your Information</a>
                  <a href="#data-retention" className="block text-primary hover:text-secondary transition-colors">6. Data Retention</a>
                  <a href="#privacy-rights" className="block text-primary hover:text-secondary transition-colors">7. Your Privacy Rights</a>
                  <a href="#data-security" className="block text-primary hover:text-secondary transition-colors">8. Data Security</a>
                  <a href="#contact" className="block text-primary hover:text-secondary transition-colors">9. Contact Us</a>
                </nav>
              </div>

              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Truficient Energy Solutions ("Truficient," "we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at www.truficient.com (the "Site") or use our HVAC services.
                </p>
                <p className="text-muted-foreground">
                  By using our Site or services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this policy, please do not use our Site or services.
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information-collect" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Information We Collect</h2>
                
                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Personal Information You Provide</h3>
                <p className="text-muted-foreground mb-4">
                  We collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>Request a service estimate or quote</li>
                  <li>Schedule an HVAC service appointment</li>
                  <li>Contact us via phone, email, or contact forms</li>
                  <li>Subscribe to our newsletter or promotional emails</li>
                  <li>Submit reviews or testimonials</li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-primary p-4 mb-4 rounded">
                  <h4 className="font-bold text-primary mb-2">This information may include:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li><strong>Contact Information:</strong> Name, email, phone number, mailing address</li>
                    <li><strong>Service Information:</strong> Property address, service requests, HVAC system details</li>
                    <li><strong>Payment Information:</strong> Billing address (payment processing handled by third-party providers)</li>
                    <li><strong>Communication Records:</strong> Your communications with us</li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Information Collected Automatically</h3>
                <p className="text-muted-foreground mb-4">
                  When you visit our Site, we automatically collect certain information about your device and browsing activity, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Usage Data (pages visited, time spent, links clicked)</li>
                  <li>Device Information (IP address, browser type, operating system)</li>
                  <li>Location Data (general geographic location based on IP)</li>
                  <li>Cookies and Tracking Technologies</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section id="how-use" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">How We Use Your Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted p-6 rounded-lg border-2 border-border">
                    <h3 className="text-lg font-bold text-primary mb-3">Service Delivery</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Provide HVAC services</li>
                      <li>• Process service requests</li>
                      <li>• Schedule appointments</li>
                      <li>• Send service reminders</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-6 rounded-lg border-2 border-border">
                    <h3 className="text-lg font-bold text-primary mb-3">Business Operations</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Improve website experience</li>
                      <li>• Analyze usage patterns</li>
                      <li>• Process payments</li>
                      <li>• Manage customer relationships</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-6 rounded-lg border-2 border-border">
                    <h3 className="text-lg font-bold text-primary mb-3">Marketing & Communications</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Contact you about our services</li>
                      <li>• Send newsletters and promotions</li>
                      <li>• Provide service updates</li>
                      <li>• Send customer surveys</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-6 rounded-lg border-2 border-border">
                    <h3 className="text-lg font-bold text-primary mb-3">Legal & Safety</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Comply with legal obligations</li>
                      <li>• Protect our rights and property</li>
                      <li>• Prevent fraud</li>
                      <li>• Enforce Terms of Service</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-secondary p-4 mt-6 rounded">
                  <h4 className="font-bold text-primary mb-2">Important: Your Consent to Contact</h4>
                  <p className="text-muted-foreground">
                    <strong>By submitting your contact information through our forms, you consent to receive communications from us</strong> regarding HVAC services, promotions, and related offerings. You may opt out at any time by clicking "unsubscribe" in our emails or contacting us directly.
                  </p>
                </div>
              </section>

              {/* Cookie Policy */}
              <section id="cookie-policy" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Cookie Policy</h2>
                
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files stored on your device that help us improve your browsing experience and analyze website traffic.
                </p>

                <h3 className="text-xl font-bold text-primary mt-6 mb-3">Types of Cookies We Use</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-foreground">Essential Cookies</h4>
                    <p className="text-muted-foreground text-sm">Required for basic site functionality (login, navigation, security)</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-foreground">Analytics Cookies</h4>
                    <p className="text-muted-foreground text-sm">Help us understand how visitors use our site (Google Analytics, etc.)</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-foreground">Marketing Cookies</h4>
                    <p className="text-muted-foreground text-sm">Used to deliver relevant advertisements and track campaign effectiveness</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold text-foreground">Preference Cookies</h4>
                    <p className="text-muted-foreground text-sm">Remember your settings and preferences</p>
                  </div>
                </div>

                <p className="text-muted-foreground mt-4">
                  You can control cookies through your browser settings. To learn more, visit{' '}
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                    www.allaboutcookies.org
                  </a>.
                </p>
              </section>

              {/* How We Share Your Information */}
              <section id="how-share" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">How We Share Your Information</h2>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-foreground font-bold">
                    We do NOT sell your personal information.
                  </p>
                </div>

                <p className="text-muted-foreground mb-4">We may share your information in the following circumstances:</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Service Providers</h3>
                    <p className="text-muted-foreground text-sm">
                      We share information with trusted third-party providers who assist with website hosting, payment processing, email marketing, analytics, and CRM systems.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Business Partners</h3>
                    <p className="text-muted-foreground text-sm">
                      HVAC equipment manufacturers (e.g., Mitsubishi) for warranty purposes, financing partners, and review platforms (Facebook, Houzz, Yelp, Angi).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">Legal Requirements</h3>
                    <p className="text-muted-foreground text-sm">
                      We may disclose information if required by law, court order, or government request, or to protect our legal rights and prevent illegal activity.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section id="data-retention" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  We retain your personal information for as long as necessary to provide services and comply with legal requirements.
                </p>
                <div className="bg-muted p-4 rounded">
                  <p className="text-foreground">
                    <strong>Standard Retention Period:</strong> We typically retain customer information for <strong>seven (7) years</strong> after the last service interaction, unless a longer retention period is required by law.
                  </p>
                </div>
              </section>

              {/* Your Privacy Rights */}
              <section id="privacy-rights" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Your Privacy Rights</h2>
                
                <p className="text-muted-foreground mb-4">Depending on your location, you may have the following rights:</p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-bold text-primary mb-2">Access & Portability</h4>
                    <p className="text-muted-foreground text-sm">Request access to your personal information and receive a copy in a portable format</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-bold text-primary mb-2">Correction & Updates</h4>
                    <p className="text-muted-foreground text-sm">Request correction of inaccurate information and update your contact preferences</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-bold text-primary mb-2">Deletion</h4>
                    <p className="text-muted-foreground text-sm">Request deletion of your personal information (subject to legal retention requirements)</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-bold text-primary mb-2">Opt-Out Rights</h4>
                    <p className="text-muted-foreground text-sm">Opt out of marketing communications and certain data collection practices</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded">
                  <h4 className="font-bold text-primary mb-2">California Residents (CCPA/CPRA)</h4>
                  <p className="text-muted-foreground text-sm">
                    California residents have additional rights including the right to know what personal information is collected, whether it's sold or shared, and the right to opt out of sale (we do not sell information).
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-bold text-primary mb-2">Texas Residents</h4>
                  <p className="text-muted-foreground text-sm">
                    Texas residents have rights under applicable Texas privacy laws to access, correct, and delete their personal information.
                  </p>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and data storage systems</li>
                  <li>Limited access on a need-to-know basis</li>
                  <li>Regular security assessments and updates</li>
                </ul>
                <p className="text-muted-foreground text-sm italic">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Contact Us */}
              <section id="contact" className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Contact Us</h2>
                <p className="text-muted-foreground mb-6">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="bg-primary text-primary-foreground p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-secondary">Truficient Energy Solutions</h3>
                  <div className="space-y-2">
                    <p>808 Business Parkway<br />Richardson, TX 75081</p>
                    <p><strong>Phone:</strong> <a href="tel:214-238-4349" className="hover:text-secondary transition-colors">214-238-4349</a></p>
                    <p><strong>Email:</strong> <a href="mailto:info@truficient.com" className="hover:text-secondary transition-colors">info@truficient.com</a></p>
                    <p className="text-sm text-primary-foreground/80 mt-4">
                      <strong>Privacy Inquiries:</strong> Please include "Privacy Request" in the subject line
                    </p>
                    <p className="text-sm text-primary-foreground/80">
                      We will respond to your inquiry within <strong>30 days</strong> of receipt.
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center pt-8 border-t-2 border-border">
                <p className="text-muted-foreground text-sm">
                  © 2026 Truficient Energy Solutions. All rights reserved.
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
