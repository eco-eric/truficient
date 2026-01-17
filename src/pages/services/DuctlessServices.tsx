import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Zap, 
  VolumeX, 
  Award,
  CheckCircle,
  Phone,
  Home,
  Building2,
  Wrench,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';
import ServiceGallery from '@/components/gallery/ServiceGallery';

const idealApplications = [
  {
    icon: Home,
    title: 'Garage Conversions & Workshops',
    description: 'Converting your garage into a gym, workshop, or hangout space? Running ductwork is expensive and often impractical. A mini-split gives you year-round comfort with minimal construction.',
  },
  {
    icon: Building2,
    title: 'Room Additions',
    description: 'Adding a room to your home? Extending your existing ductwork might overload your current system. A dedicated mini-split is often the smarter choice.',
  },
  {
    icon: Home,
    title: 'Older Homes Without Ductwork',
    description: 'Many older Dallas homes have radiant heat or window units. Mini-splits provide modern comfort without tearing open walls to install ductwork.',
  },
  {
    icon: Thermometer,
    title: 'Hot & Cold Spots',
    description: "That one room that's always too hot in summer or freezing in winter? A mini-split solves the problem without trying to rebalance your entire system.",
  },
  {
    icon: Building2,
    title: 'Home Offices',
    description: 'Working from home? A mini-split lets you keep your office comfortable without heating or cooling the whole house.',
  },
  {
    icon: Home,
    title: 'ADUs & Guest Houses',
    description: "Accessory dwelling units, casitas, or detached guest houses need their own climate control. Mini-splits are the obvious choice.",
  },
];

const mitsubishiBenefits = [
  {
    icon: Zap,
    title: 'Industry-Leading Efficiency',
    description: 'Mitsubishi mini-splits consistently achieve the highest efficiency ratings in the industry. Lower energy bills, smaller environmental footprint.',
  },
  {
    icon: Thermometer,
    title: 'Cold-Climate Performance',
    description: "Mitsubishi's Hyper-Heating (H2i) technology provides full heating capacity down to 5°F and continues operating down to -13°F. Important for those occasional Texas cold snaps.",
  },
  {
    icon: VolumeX,
    title: 'Quiet Operation',
    description: "Indoor units operate as low as 19 decibels—quieter than a whisper. You'll forget it's running.",
  },
  {
    icon: Shield,
    title: 'Reliability & Warranty',
    description: 'Mitsubishi has been making mini-splits longer than anyone. 12-year compressor warranty, 5-year parts warranty when installed by a Diamond Contractor.',
  },
];

const diamondBenefits = [
  'Complete extensive product training',
  'Maintain high customer satisfaction scores',
  'Meet annual installation volume requirements',
  'Participate in continuing education',
];

const installationSteps = [
  {
    step: '1',
    title: 'Consultation & Sizing',
    description: "We visit your space, discuss your needs, and calculate the proper system size. We'll recommend single-zone or multi-zone based on your situation.",
  },
  {
    step: '2',
    title: 'Proposal',
    description: "You'll receive a detailed quote with equipment specifications, installation scope, and pricing. No surprises.",
  },
  {
    step: '3',
    title: 'Installation Day',
    description: 'Most single-zone installations complete in one day. Multi-zone systems may take 1-2 days depending on complexity. We protect your floors and furniture, and clean up when we\'re done.',
  },
  {
    step: '4',
    title: 'Walkthrough',
    description: "We show you how to operate your new system, set up the controls, and answer any questions. You'll also get warranty documentation and maintenance recommendations.",
  },
];

const faqs = [
  {
    question: 'How much does a mini-split cost?',
    answer: 'Single-zone systems typically range from $3,500-$6,000 installed, depending on capacity and installation complexity. Multi-zone systems start around $7,000 and increase with the number of indoor units. Use our estimator for a more specific range.',
  },
  {
    question: 'Are mini-splits energy efficient?',
    answer: "Very. Because there's no ductwork losing energy, and because the system can modulate its output rather than cycling on and off, mini-splits often use 25-50% less energy than traditional systems.",
  },
  {
    question: 'Can a mini-split heat in winter?',
    answer: "Absolutely. Modern mini-splits are heat pumps—they provide both heating and cooling. Mitsubishi's Hyper-Heating models work efficiently even in sub-freezing temperatures.",
  },
  {
    question: 'How long do mini-splits last?',
    answer: 'With proper maintenance, 15-20 years is typical. The outdoor compressor usually determines lifespan.',
  },
  {
    question: 'Are they loud?',
    answer: 'No. Indoor units are extremely quiet (19-32 decibels depending on fan speed). Outdoor units are comparable to or quieter than traditional AC condensers.',
  },
  {
    question: 'Do I need one indoor unit per room?',
    answer: "Not necessarily. One indoor unit can condition a large open space. For separate rooms with doors, you'll generally want separate units for independent temperature control.",
  },
  {
    question: 'What maintenance do they need?',
    answer: "Clean the filters monthly (they slide out—it's easy). We recommend annual professional maintenance to check refrigerant levels, clean coils, and verify operation.",
  },
];

const DuctlessServices = () => {
  usePageSEO();
  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, destinationUrl?: string) => {
    trackButtonClick({
      buttonName,
      buttonLocation: 'Ductless Services Page',
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
            <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full mb-6">
              <Award className="w-5 h-5 text-secondary" />
              <span className="text-secondary font-semibold">Mitsubishi Diamond Contractor</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ductless Mini-Split Specialists
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-4">
              Expert installation for single-zone and multi-zone systems serving Dallas-Fort Worth
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
              Top-tier certification for installation quality and customer satisfaction
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/hvac-estimate" onClick={() => handleTrackClick('Size Your System', '/hvac-estimate')}>
                <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8">
                  Size Your System
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

      {/* What is Ductless Section */}
      <section id="what-is-ductless" className="py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
              What is a Ductless System?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                A ductless mini-split is a heating and cooling system that doesn't require ductwork. It consists of an outdoor compressor unit connected to one or more indoor air handlers by refrigerant lines and electrical wiring.
              </p>
              <div className="bg-card p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-foreground mb-4">How It Works:</h3>
                <p className="text-muted-foreground">
                  The outdoor unit contains the compressor. Indoor units (mounted on walls or ceilings) deliver heated or cooled air directly into each room. Because there's no ductwork, you don't lose energy to leaky ducts—and you can control each zone independently.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-card-foreground mb-2">Single-Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      One outdoor unit, one indoor unit. Perfect for a single room like a garage, bonus room, or home office.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-card-foreground mb-2">Multi-Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      One outdoor unit, multiple indoor units. Each room has its own thermostat and can be set to different temperatures.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ideal Applications */}
      <section id="ideal-applications" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              When Ductless Makes Sense
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ductless mini-splits are the ideal solution for spaces where traditional ductwork isn't practical
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {idealApplications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                      <app.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-card-foreground">{app.title}</h3>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mitsubishi Section */}
      <section id="why-mitsubishi" className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why We Recommend Mitsubishi
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We're brand-agnostic for most HVAC equipment—we install Trane, Amana, and others based on the application. But for ductless systems, we recommend Mitsubishi. Here's why:
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mitsubishiBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Contractor Section */}
      <section id="diamond-contractor" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-10 h-10 text-secondary" />
                  <h2 className="text-2xl md:text-3xl font-bold text-card-foreground">
                    What "Diamond Contractor" Means for You
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Mitsubishi's Diamond Contractor program isn't just a badge—it's a commitment to installation quality and customer satisfaction.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-foreground mb-4">To Earn Diamond Status:</h3>
                    <ul className="space-y-3">
                      {diamondBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-4">What You Get:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Expert Installation:</strong> Hundreds of mini-split systems installed</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Extended Warranty:</strong> Best warranty terms from Mitsubishi</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Proper Sizing:</strong> Exact load calculations—no guessing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground"><strong className="text-foreground">Clean Installation:</strong> Neat lines, optimal positioning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Installation Process */}
      <section id="installation" className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What to Expect
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our installation process is straightforward and hassle-free
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {installationSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-card-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ductless FAQ
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Common questions about mini-split systems
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Case Study */}
      <section id="case-study" className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Wrench className="w-8 h-8 text-secondary" />
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Real Project: Dallas Garage Conversion
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">The Challenge:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 400 sq ft space with high heat gain</li>
                      <li>• No existing ductwork</li>
                      <li>• Needed both heating and cooling</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Our Solution:</h4>
                    <p className="text-sm text-muted-foreground">
                      Mitsubishi single-zone mini-split (18,000 BTU) with a wall-mounted indoor unit. Added insulation and sealed air leaks.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">The Result:</h4>
                    <p className="text-sm text-muted-foreground">
                      Year-round comfort without affecting the main home's HVAC system. Energy costs ~$30-40/month during peak summer.
                    </p>
                  </div>
                </div>

                <Link to="/contact" onClick={() => handleTrackClick('Have a similar project? Let\'s talk', '/contact')}>
                  <Button className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                    Have a similar project? Let's talk
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="estimate" className="py-20 lg:py-28 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Size Your Ductless System
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Answer a few questions about your space and get a preliminary sizing recommendation and cost range.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/hvac-estimate" onClick={() => handleTrackClick('Use Our Estimator', '/hvac-estimate')}>
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8"
                >
                  Use Our Estimator
                </Button>
              </Link>
              <Link to="/contact" onClick={() => handleTrackClick('Schedule a Site Visit', '/contact')}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Schedule a Site Visit
                </Button>
              </Link>
            </div>
            <p className="mt-6 opacity-80">
              Not sure if ductless is right for your situation?{' '}
              <a 
                href="tel:214-238-4349" 
                className="underline hover:no-underline"
                onClick={() => handleTrackClick('Call with Questions', 'tel:214-238-4349')}
              >
                Call us at 214-238-4349
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <ServiceGallery 
        serviceTag="ductless" 
        title="Ductless Mini-Split Installations"
        subtitle="Expert installations by our Mitsubishi Diamond Contractor team"
      />

      <Footer />
    </div>
  );
};

export default DuctlessServices;
