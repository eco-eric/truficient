import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
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
              
              {/* Important Notice */}
              <div className="bg-yellow-50 border-l-4 border-secondary p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-2">Important Notice</h2>
                <p className="text-muted-foreground">
                  These Terms of Service govern your use of Truficient's website and services. By using our website or services, you agree to these terms. Please read them carefully.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-muted border-l-4 border-secondary p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-4">Table of Contents</h2>
                <nav className="grid md:grid-cols-2 gap-2">
                  <a href="#agreement" className="block text-primary hover:text-secondary transition-colors">1. Agreement to Terms</a>
                  <a href="#service-area" className="block text-primary hover:text-secondary transition-colors">2. Service Area</a>
                  <a href="#services" className="block text-primary hover:text-secondary transition-colors">3. Services Provided</a>
                  <a href="#licensing" className="block text-primary hover:text-secondary transition-colors">4. Licensing & Certifications</a>
                  <a href="#website-use" className="block text-primary hover:text-secondary transition-colors">5. Use of Our Website</a>
                  <a href="#service-agreements" className="block text-primary hover:text-secondary transition-colors">6. Service Agreements</a>
                  <a href="#warranties" className="block text-primary hover:text-secondary transition-colors">7. Warranties</a>
                  <a href="#disclaimers" className="block text-primary hover:text-secondary transition-colors">8. Disclaimers & Liability</a>
                  <a href="#dispute" className="block text-primary hover:text-secondary transition-colors">9. Dispute Resolution</a>
                  <a href="#contact" className="block text-primary hover:text-secondary transition-colors">10. Contact Information</a>
                </nav>
              </div>

              {/* Agreement to Terms */}
              <section id="agreement" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Agreement to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to Truficient Energy Solutions. These Terms of Service govern your use of our website at www.truficient.com and any HVAC services we provide.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>By accessing or using our Site or Services, you agree to be bound by these Terms.</strong> If you do not agree, you may not use our Site or Services.
                </p>
                
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h3 className="font-bold text-primary mb-2">Eligibility</h3>
                  <p className="text-muted-foreground text-sm">
                    You must be at least <strong>18 years old</strong> to use our Services or enter into service agreements. By using our Site, you represent that you meet this requirement and have the legal capacity to enter into binding contracts.
                  </p>
                </div>
              </section>

              {/* Service Area */}
              <section id="service-area" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Service Area</h2>
                <p className="text-muted-foreground mb-4">
                  Truficient provides HVAC services exclusively in the <strong>Dallas-Fort Worth Metroplex</strong>, including:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">Dallas Area</h4>
                    <p className="text-muted-foreground text-sm">Dallas and surrounding communities</p>
                  </div>
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">North Dallas</h4>
                    <p className="text-muted-foreground text-sm">Plano, Richardson, Allen</p>
                  </div>
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">Frisco-McKinney</h4>
                    <p className="text-muted-foreground text-sm">Frisco, McKinney, Prosper</p>
                  </div>
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">Mid-Cities</h4>
                    <p className="text-muted-foreground text-sm">Irving, Euless, Bedford</p>
                  </div>
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">South Dallas</h4>
                    <p className="text-muted-foreground text-sm">Desoto, Cedar Hill, Lancaster</p>
                  </div>
                  <div className="bg-muted p-4 rounded border border-border">
                    <h4 className="font-bold text-primary mb-2">Arlington-GP</h4>
                    <p className="text-muted-foreground text-sm">Arlington, Grand Prairie</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mt-4 italic">
                  Services outside this area may be considered on a case-by-case basis and are subject to additional fees.
                </p>
              </section>

              {/* Services Provided */}
              <section id="services" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Services Provided</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">HVAC Services</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <h4 className="font-bold text-primary mb-2">Installation</h4>
                        <ul className="text-muted-foreground text-sm space-y-1">
                          <li>• Complete HVAC systems</li>
                          <li>• Mini-split installation</li>
                          <li>• Ductless systems</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded">
                        <h4 className="font-bold text-primary mb-2">Repair</h4>
                        <ul className="text-muted-foreground text-sm space-y-1">
                          <li>• AC repair</li>
                          <li>• Heating repair</li>
                          <li>• Emergency services</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded">
                        <h4 className="font-bold text-primary mb-2">Maintenance</h4>
                        <ul className="text-muted-foreground text-sm space-y-1">
                          <li>• Routine maintenance</li>
                          <li>• Preventive plans</li>
                          <li>• System inspections</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded">
                        <h4 className="font-bold text-primary mb-2">Replacement</h4>
                        <ul className="text-muted-foreground text-sm space-y-1">
                          <li>• AC replacement</li>
                          <li>• Heating systems</li>
                          <li>• Equipment upgrades</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 className="text-lg font-bold text-primary mb-2">Estimates and Quotes</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li><strong>Estimates are not final prices:</strong> Initial estimates are approximate and subject to change based on actual conditions</li>
                      <li><strong>On-site assessments:</strong> Final pricing determined after inspection</li>
                      <li><strong>Written quotes:</strong> Provided before beginning work</li>
                      <li><strong>Quote validity:</strong> Valid for <strong>30 days</strong> from issue date</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Licensing and Certifications */}
              <section id="licensing" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Licensing and Certifications</h2>
                
                <div className="bg-primary text-primary-foreground p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-secondary mb-4">Truficient Energy Solutions is:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-secondary mr-2 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold">Licensed & Insured</p>
                        <p className="text-sm text-primary-foreground/80">Texas HVAC Contractor</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-secondary mr-2 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold">Mitsubishi Diamond Contractor</p>
                        <p className="text-sm text-primary-foreground/80">Specialized training & certification</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-secondary mr-2 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold">HERS Certified</p>
                        <p className="text-sm text-primary-foreground/80">Energy efficiency provider</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-secondary mr-2 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold">Fully Compliant</p>
                        <p className="text-sm text-primary-foreground/80">Texas regulations & building codes</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mt-4">License information available upon request</p>
                </div>
              </section>

              {/* Use of Website */}
              <section id="website-use" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Use of Our Website</h2>
                
                <h3 className="text-xl font-bold text-primary mb-3">Acceptable Use</h3>
                <p className="text-muted-foreground mb-4">You agree to use our Site only for lawful purposes. You agree NOT to:</p>
                
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Violate laws or regulations</span>
                  </div>
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Infringe intellectual property</span>
                  </div>
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Transmit viruses or malware</span>
                  </div>
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Attempt unauthorized access</span>
                  </div>
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Use automated systems (bots)</span>
                  </div>
                  <div className="flex items-start bg-red-50 p-3 rounded">
                    <span className="text-red-500 mr-2">✗</span>
                    <span className="text-muted-foreground text-sm">Submit false information</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-primary mb-3">Intellectual Property</h3>
                <p className="text-muted-foreground mb-4">
                  All content on our Site (text, graphics, logos, images, videos, the Truficient name and branding) is the property of Truficient Energy Solutions and is protected by copyright and trademark laws.
                </p>
                <div className="bg-muted p-4 rounded">
                  <p className="text-muted-foreground text-sm">
                    <strong>You may not:</strong> Copy, reproduce, or distribute Site content without permission • Use our trademarks or logos without authorization • Create derivative works • Use content for commercial purposes without permission
                  </p>
                </div>
              </section>

              {/* Service Agreements */}
              <section id="service-agreements" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Service Agreements and Appointments</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">Scheduling</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start">
                        <span className="text-secondary mr-2">•</span>
                        <span><strong>Appointments not confirmed</strong> until you receive confirmation from Truficient</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2">•</span>
                        <span><strong>Cancellations:</strong> Please provide at least <strong>24 hours notice</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2">•</span>
                        <span><strong>Late cancellations or no-shows</strong> may incur a service fee</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2">•</span>
                        <span><strong>Emergency services</strong> subject to availability and additional charges</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">Payment Terms</h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li><strong>Payment due:</strong> Upon completion of service unless other arrangements made</li>
                        <li><strong>Accepted methods:</strong> Cash, check, credit/debit cards, financing (subject to approval)</li>
                        <li><strong>Deposits:</strong> Major installations may require 50% deposit</li>
                        <li><strong>Late payments:</strong> Subject to interest charges and collection efforts</li>
                        <li><strong>Disputed charges:</strong> Contact within <strong>10 days</strong> of invoice</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Warranties */}
              <section id="warranties" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Warranties</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-2 border-primary rounded-lg p-6">
                    <h3 className="text-lg font-bold text-primary mb-3">Service Warranty</h3>
                    <p className="text-muted-foreground text-sm mb-3">We stand behind our workmanship with labor warranties on installation and repair work.</p>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-xs text-muted-foreground"><strong>Does not cover:</strong> Normal wear and tear, misuse, neglect, unauthorized modifications, or external damage</p>
                    </div>
                  </div>

                  <div className="border-2 border-secondary rounded-lg p-6">
                    <h3 className="text-lg font-bold text-primary mb-3">Manufacturer Warranties</h3>
                    <ul className="text-muted-foreground text-sm space-y-2">
                      <li><strong>Mitsubishi:</strong> Up to 12-year residential, 10-year commercial parts warranty</li>
                      <li><strong>Other equipment:</strong> Varies by manufacturer</li>
                      <li><strong>Registration required</strong> for extended warranties</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 rounded">
                  <h4 className="font-bold text-primary mb-2">Warranty Limitations</h4>
                  <p className="text-muted-foreground text-sm">
                    Warranties are void if equipment is serviced by unauthorized technicians. Regular maintenance may be required. We are not responsible for manufacturer warranty claims.
                  </p>
                </div>
              </section>

              {/* Disclaimers and Limitations */}
              <section id="disclaimers" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Disclaimers and Limitations of Liability</h2>
                
                <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3">IMPORTANT LEGAL DISCLAIMERS</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    TO THE FULLEST EXTENT PERMITTED BY LAW:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li><strong>No guarantees:</strong> We cannot guarantee specific outcomes or energy savings</li>
                    <li><strong>"As-is" basis:</strong> Services provided on "as-is" and "as-available" basis</li>
                    <li><strong>Third-party products:</strong> Not responsible for manufacturer equipment defects</li>
                    <li><strong>Emergency services:</strong> Cannot guarantee immediate availability</li>
                  </ul>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-primary mb-3">Limitation of Liability</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    TRUFICIENT SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Indirect damages (lost profits, data loss, business interruption)</li>
                    <li>• Consequential damages from services or Site use</li>
                    <li>• Damages exceeding fees paid for the specific service</li>
                    <li>• Acts of nature, severe weather, or uncontrollable events</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Some jurisdictions do not allow certain limitations. In such cases, liability is limited to the maximum extent permitted by law.
                  </p>
                </div>
              </section>

              {/* Dispute Resolution */}
              <section id="dispute" className="mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Dispute Resolution</h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h3 className="font-bold text-primary mb-2">Informal Resolution</h3>
                    <p className="text-muted-foreground text-sm">
                      Before filing any legal action, you agree to first contact us at info@truficient.com to attempt informal resolution.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-bold text-primary mb-2">Governing Law</h3>
                    <p className="text-muted-foreground text-sm">
                      These Terms are governed by the laws of the <strong>State of Texas</strong>, without regard to conflict of law principles.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-bold text-primary mb-2">Venue</h3>
                    <p className="text-muted-foreground text-sm">
                      Any legal proceedings shall be brought exclusively in state or federal courts in <strong>Dallas County, Texas</strong>.
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
                    <h3 className="font-bold text-primary mb-2">Class Action Waiver</h3>
                    <p className="text-muted-foreground text-sm">
                      You agree to bring claims against Truficient only in your individual capacity, not as part of any class or representative action.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4 pb-2 border-b-2 border-secondary">Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  For questions, concerns, or notices regarding these Terms of Service:
                </p>

                <div className="bg-primary text-primary-foreground p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-secondary">Truficient Energy Solutions</h3>
                  <div className="space-y-2">
                    <p>808 Business Parkway<br />Richardson, TX 75081</p>
                    <p><strong>Phone:</strong> <a href="tel:214-238-4349" className="hover:text-secondary transition-colors">214-238-4349</a></p>
                    <p><strong>Email:</strong> <a href="mailto:info@truficient.com" className="hover:text-secondary transition-colors">info@truficient.com</a></p>
                    <p><strong>Hours:</strong> Monday-Friday, 8:00 AM - 5:00 PM CST</p>
                    <p className="text-sm text-primary-foreground/80 mt-4">
                      <strong>Legal Inquiries:</strong> Please include "Legal/Terms Inquiry" in the subject line
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center pt-8 border-t-2 border-border">
                <p className="text-muted-foreground text-sm mb-2">
                  © 2026 Truficient Energy Solutions. All rights reserved.
                </p>
                <p className="text-muted-foreground text-xs">
                  Licensed & Insured HVAC Contractor
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
