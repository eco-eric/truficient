import { motion } from 'framer-motion';
import { 
  Building2, 
  Wrench, 
  RefreshCw, 
  Settings,
  Shield,
  CheckCircle,
  Phone,
  Store,
  UtensilsCrossed,
  Warehouse,
  Stethoscope,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';

const commercialServices = [
  {
    icon: Building2,
    title: 'Installation & Replacement',
    description: 'New construction, tenant improvements, and system upgrades. We work with your timeline and minimize disruption to your operations.',
  },
  {
    icon: Wrench,
    title: 'Repair & Emergency Service',
    description: "When your system goes down, you're losing money. We prioritize commercial emergency calls and carry common parts to get you running again fast.",
  },
  {
    icon: RefreshCw,
    title: 'Preventive Maintenance',
    description: 'Regular maintenance prevents expensive breakdowns and extends equipment life. We offer maintenance agreements tailored to your equipment and budget.',
  },
  {
    icon: Settings,
    title: 'Retrofits & Upgrades',
    description: 'Older equipment driving up your utility costs? We can upgrade components or replace systems with high-efficiency units that pay for themselves in energy savings.',
  },
];

const industries = [
  {
    icon: Building2,
    title: 'Office Buildings',
    description: 'Consistent comfort for employee productivity. Zone control for conference rooms, server rooms, and open floor plans with different load requirements.',
  },
  {
    icon: Store,
    title: 'Retail Spaces',
    description: "First impressions matter. We keep your customers comfortable and your front door from fighting your HVAC system.",
  },
  {
    icon: UtensilsCrossed,
    title: 'Restaurants & Food Service',
    description: 'Kitchen ventilation, dining room comfort, and the unique challenges of high-heat cooking equipment. We understand food service HVAC.',
  },
  {
    icon: Warehouse,
    title: 'Warehouses & Light Industrial',
    description: "Large spaces require different solutions. Spot cooling, ventilation, and heating strategies that don't break the bank.",
  },
  {
    icon: Stethoscope,
    title: 'Medical & Dental Offices',
    description: 'Comfort and air quality matter for patient experience. We understand the specific requirements of healthcare environments.',
  },
];

const commercialSystems = [
  {
    title: 'Rooftop Units (RTUs)',
    description: 'The workhorse of commercial HVAC. We install, repair, and maintain all major brands and can help you upgrade aging units.',
  },
  {
    title: 'Split Systems',
    description: "For spaces where rooftop installation isn't practical. Similar to residential systems but sized for commercial loads.",
  },
  {
    title: 'VRF Systems',
    description: 'Variable Refrigerant Flow systems offer precise zone control and excellent efficiency for multi-zone commercial applications.',
  },
  {
    title: 'Ductless Mini-Splits',
    description: 'Perfect for server rooms, add-on spaces, or buildings without existing ductwork. As a Mitsubishi Diamond Contractor, we\'re experts in commercial mini-split applications.',
  },
];

const maintenanceIncludes = [
  'Scheduled seasonal inspections',
  'Filter changes',
  'Coil cleaning',
  'Refrigerant level checks',
  'Electrical connection inspection',
  'Thermostat calibration',
  'Priority scheduling for repairs',
  'Discounted repair rates',
];

const maintenanceMatters = [
  'Equipment lasts longer',
  'Fewer unexpected breakdowns',
  'Lower energy costs',
  'Maintained warranty coverage',
  'Documentation for property management',
];

const CommercialServices = () => {
  usePageSEO();
  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, destinationUrl?: string) => {
    trackButtonClick({
      buttonName,
      buttonLocation: 'Commercial Services Page',
      destinationUrl,
    });
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
              Commercial HVAC for Small & Mid-Sized Businesses
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
              Keep your employees comfortable, your customers happy, and your energy costs under control. Serving offices, retail, restaurants, and light industrial throughout DFW.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" onClick={() => handleTrackClick('Request a Quote', '/contact')}>
                <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8">
                  Request a Quote
                </Button>
              </Link>
              <a href="tel:214-238-4349" onClick={() => handleTrackClick('Call Now', 'tel:214-238-4349')}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-background bg-background text-foreground hover:bg-muted font-semibold text-lg px-8"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 214-238-4349
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 bg-muted scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">What We Do</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Your HVAC system directly impacts your business. Uncomfortable employees are less productive. Hot or stuffy retail spaces drive customers away. We understand commercial needs are different from residential.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {commercialServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card hover-lift">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-card-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-16 lg:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Industries We Serve</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <industry.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-card-foreground">{industry.title}</h3>
                        <p className="text-sm text-muted-foreground">{industry.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Section */}
      <section id="systems" className="py-16 lg:py-24 bg-muted scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Commercial Equipment</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our experienced technicians are trained to work with all major commercial HVAC systems
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commercialSystems.map((system, index) => (
              <motion.div
                key={system.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold mb-2 text-card-foreground">{system.title}</h3>
                        <p className="text-sm text-muted-foreground">{system.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Section */}
      <section id="maintenance" className="py-16 lg:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Preventive Maintenance Plans</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Commercial equipment works hard. Regular maintenance catches small problems before they become expensive emergencies—and keeps your system running efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card">
                <CardContent className="p-8">
                  <h3 className="font-bold text-foreground mb-4">What's Included:</h3>
                  <ul className="space-y-3">
                    {maintenanceIncludes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-8">
                  <h3 className="font-bold text-foreground mb-4">Why It Matters:</h3>
                  <ul className="space-y-3">
                    {maintenanceMatters.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link to="/contact" onClick={() => handleTrackClick('Request maintenance quote', '/contact')}>
                      <Button className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground">
                        Request a maintenance quote for your facility
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section id="quote" className="py-20 lg:py-28 bg-primary scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Discuss Your Business Needs
            </h2>
            <p className="text-lg md:text-xl mb-4 max-w-3xl mx-auto opacity-90">
              Commercial projects require a site visit to provide accurate pricing. Tell us about your space and we'll schedule a time to evaluate your needs.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 text-left">
              <div className="bg-primary-foreground/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What We'll Need to Know:</h4>
                <ul className="text-sm space-y-1 opacity-80">
                  <li>• Type of business</li>
                  <li>• Square footage</li>
                  <li>• Current equipment (if any)</li>
                  <li>• Specific concerns or requirements</li>
                  <li>• Project timeline</li>
                </ul>
              </div>
              <div className="bg-primary-foreground/10 p-4 rounded-lg flex flex-col justify-center">
                <h4 className="font-semibold mb-2">Contact Methods:</h4>
                <p className="text-sm opacity-80">
                  Call us directly at <strong>214-238-4349</strong> or fill out our contact form and we'll get back to you within one business day.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" onClick={() => handleTrackClick('Request a Commercial Quote', '/contact')}>
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Request a Quote
                </Button>
              </Link>
              <a href="tel:214-238-4349" onClick={() => handleTrackClick('Call Now', 'tel:214-238-4349')}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 214-238-4349
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommercialServices;
