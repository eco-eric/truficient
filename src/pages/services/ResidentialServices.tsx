import { motion } from 'framer-motion';
import { 
  Snowflake, 
  Thermometer, 
  Wind, 
  Wrench,
  CheckCircle,
  Phone,
  ArrowRight,
  Shield,
  Award,
  Users,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { EstimateCalculator } from '@/components/calculator/EstimateCalculator';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';

const trustBadges = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Award, label: 'HERS Certified' },
  { icon: Star, label: 'Mitsubishi Diamond Contractor' },
  { icon: Users, label: '5-Star Reviews' },
];

const coolingServices = {
  repair: {
    title: 'AC Repair',
    body: "Is your AC running constantly but not keeping up? Making strange noises? Driving up your electric bill? These are signs something's wrong—but it doesn't always mean you need a new system. We diagnose the actual problem before recommending solutions. Sometimes it's a $200 capacitor, not a $12,000 system. We'll tell you the truth either way.",
    features: [
      'Same-day and next-day appointments available',
      'Upfront pricing before we start work',
      'All brands serviced',
      '90-day warranty on repairs',
    ],
  },
  replacement: {
    title: 'AC Replacement',
    body: "If your system is 15+ years old, requires frequent repairs, or uses R-22 refrigerant, replacement often makes more financial sense than continuing to patch an aging unit. We don't just swap boxes. We calculate your home's actual cooling load, evaluate your ductwork, and recommend a properly-sized system.",
    features: [
      'Manual J load calculations for proper sizing',
      'High-efficiency options (up to 20+ SEER)',
      'Rebate and financing assistance',
      'Quality installation by our own crews—no subcontractors',
    ],
    brands: 'Trane, Amana, Mitsubishi, and other major manufacturers',
  },
};

const heatingServices = {
  heatPump: {
    title: 'Heat Pump Systems',
    body: "Heat pumps are one of the smartest investments for North Texas homes. They provide both heating and cooling from a single system, and modern units work efficiently even when temperatures drop into the 20s. Because they move heat rather than generate it, heat pumps can cut your heating costs significantly.",
    idealFor: [
      'All-electric homes',
      'Homeowners looking to reduce gas dependence',
      'New construction and major renovations',
      'Homes with existing ductwork in good condition',
    ],
  },
  repair: {
    title: 'Heating Repair',
    body: "Your heater quits at the worst possible time—usually during the first cold snap of the season. We prioritize emergency heating calls because we know what it's like to have a cold house with kids or elderly family members. Whether you have a gas furnace, electric heat pump, or dual-fuel system, we can diagnose and repair it.",
    issues: [
      'Ignition and pilot light problems',
      'Blower motor failures',
      'Thermostat malfunctions',
      'Heat exchanger issues',
      'Refrigerant problems (heat pumps)',
    ],
  },
};

const airQualityServices = {
  intro: "Your HVAC system does more than heat and cool—it's also your home's respiratory system. If you're dealing with allergies, dry skin in winter, or stuffy rooms, the solution might be improving your air quality.",
  solutions: [
    {
      title: 'Air Purification',
      description: 'Whole-home air purifiers that work with your ductwork to filter particles and neutralize pathogens. More effective than portable units.',
    },
    {
      title: 'Humidity Control',
      description: 'Humidifiers combat dry winter air. Dehumidifiers reduce excess moisture that leads to mold growth and musty odors.',
    },
    {
      title: 'Ventilation',
      description: 'Fresh air exchangers bring in filtered outdoor air while exhausting stale indoor air—without losing your heated or cooled air.',
    },
  ],
};

const designServices = {
  title: 'Design & Installation Services',
  body: "We don't just install equipment—we design complete comfort systems. This means evaluating your home's construction, insulation levels, window orientation, and how you actually use each space.",
  process: [
    { step: 'Load Calculation', description: 'Manual J calculations determine exactly how much heating and cooling capacity your home needs' },
    { step: 'Equipment Selection', description: 'We match equipment to your specific requirements, not a rule-of-thumb guess' },
    { step: 'Ductwork Design', description: 'Properly sized ducts with balanced airflow to every room' },
    { step: 'Zoning Evaluation', description: 'Multi-zone systems for homes with varying comfort needs' },
  ],
  whenNeeded: [
    'New home construction',
    'Room additions or major renovations',
    'Converting unconditioned spaces (garages, attics)',
    'Homes with persistent hot/cold spots',
    'Complete system replacements in older homes',
  ],
};

const whyChooseUs = [
  {
    title: 'We Specialize in Efficiency',
    description: 'We focus on systems that actually perform—and save you money month after month. Energy efficiency isn\'t a buzzword to us; it\'s how we evaluate every recommendation.',
  },
  {
    title: 'Proper Sizing, Every Time',
    description: 'An oversized system wastes energy and wears out faster. We do the math using Manual J load calculations rather than guessing based on square footage.',
  },
  {
    title: 'Our Own Installation Crews',
    description: 'We don\'t subcontract our installations. The same team that designs your system installs it. This means accountability and consistency.',
  },
];

const testimonials = [
  {
    quote: "I can't say enough good things about Truficient. They went above and beyond when our AC broke down in the middle of a heat wave.",
    author: 'T.A. Smith',
  },
  {
    quote: "Very fast service and at a great price! Highly recommend them.",
    author: 'Tony Tang',
  },
  {
    quote: "I have never had a better purchasing experience in my entire life. Eric and his staff deliver more than what is possible.",
    author: 'Gay R.',
  },
];

const ResidentialServices = () => {
  usePageSEO();
  const { trackButtonClick } = useButtonTracking();

  const handleTrackClick = (buttonName: string, destinationUrl?: string) => {
    trackButtonClick({
      buttonName,
      buttonLocation: 'Residential Services Page',
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
              Complete Home Comfort Solutions
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
              Energy-efficient heating, cooling, and air quality services for Dallas-Fort Worth homeowners. Licensed, insured, and HERS-certified.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full">
                  <badge.icon className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/hvac-estimate" onClick={() => handleTrackClick('Get a Free Estimate', '/hvac-estimate')}>
                <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8">
                  Get a Free Estimate
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

      {/* Cooling Services Section */}
      <section id="cooling" className="py-16 lg:py-24 bg-muted scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Snowflake className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Cooling Services</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              When Texas heat hits triple digits, your AC isn't a luxury—it's essential. We diagnose problems fast, recommend honest solutions, and install energy-efficient systems sized correctly for your home.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* AC Repair Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{coolingServices.repair.title}</h3>
                  <p className="text-muted-foreground mb-6">{coolingServices.repair.body}</p>
                  <h4 className="font-semibold text-foreground mb-3">What to Expect:</h4>
                  <ul className="space-y-2 mb-6">
                    {coolingServices.repair.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/hvac-estimate" onClick={() => handleTrackClick('Repair vs Replace Calculator', '/hvac-estimate')}>
                    <Button variant="outline" className="w-full">
                      Not sure if it's worth repairing? Try our Calculator <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* AC Replacement Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{coolingServices.replacement.title}</h3>
                  <p className="text-muted-foreground mb-6">{coolingServices.replacement.body}</p>
                  <h4 className="font-semibold text-foreground mb-3">What Sets Us Apart:</h4>
                  <ul className="space-y-2 mb-4">
                    {coolingServices.replacement.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-6">
                    <strong className="text-foreground">Brands We Install:</strong> {coolingServices.replacement.brands}
                  </p>
                  <Link to="/hvac-estimate" onClick={() => handleTrackClick('System Estimator', '/hvac-estimate')}>
                    <Button className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground">
                      Estimate your replacement cost <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Heating Services Section */}
      <section id="heating" className="py-16 lg:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Thermometer className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Heating Services</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Dallas winters are unpredictable. One week it's 70°, the next we're dealing with ice storms. Your heating system needs to be ready—and efficient enough that you're not dreading the gas bill.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Heat Pump Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{heatingServices.heatPump.title}</h3>
                  <p className="text-muted-foreground mb-6">{heatingServices.heatPump.body}</p>
                  <h4 className="font-semibold text-foreground mb-3">Ideal For:</h4>
                  <ul className="space-y-2 mb-6">
                    {heatingServices.heatPump.idealFor.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/hvac-estimate" onClick={() => handleTrackClick('Heat Pump Savings Calculator', '/hvac-estimate')}>
                    <Button className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground">
                      See how much you could save <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Heating Repair Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{heatingServices.repair.title}</h3>
                  <p className="text-muted-foreground mb-6">{heatingServices.repair.body}</p>
                  <h4 className="font-semibold text-foreground mb-3">Common Issues We Fix:</h4>
                  <ul className="space-y-2 mb-6">
                    {heatingServices.repair.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Wrench className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{issue}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" onClick={() => handleTrackClick('Describe your symptoms', '/contact')}>
                    <Button variant="outline" className="w-full">
                      Furnace acting up? Let us help <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Air Quality Section */}
      <section id="air-quality" className="py-16 lg:py-24 bg-muted scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wind className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Indoor Air Quality</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {airQualityServices.intro}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {airQualityServices.solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Wind className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{solution.title}</h3>
                    <p className="text-muted-foreground">{solution.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/contact" onClick={() => handleTrackClick('Schedule an air quality assessment', '/contact')}>
              <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                Schedule an Assessment
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Design & Install Section */}
      <section id="design" className="py-16 lg:py-24 bg-background scroll-mt-20">
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
                <Wrench className="w-8 h-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">{designServices.title}</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {designServices.body}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <Card className="bg-card">
                <CardContent className="p-8">
                  <h3 className="font-bold text-foreground mb-4">Our Design Process:</h3>
                  <div className="space-y-4">
                    {designServices.process.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{item.step}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-8">
                  <h3 className="font-bold text-foreground mb-4">When You Need Design Services:</h3>
                  <ul className="space-y-3">
                    {designServices.whenNeeded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">HERS Certification:</strong> Our team includes HERS-certified professionals who can evaluate and verify your home's energy performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link to="/contact" onClick={() => handleTrackClick('Discuss your design needs', '/contact')}>
                <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                  Planning a project? Let's discuss your design needs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Truficient Section */}
      <section id="why-us" className="py-16 lg:py-24 bg-muted scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Dallas Homeowners Choose Truficient
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-secondary fill-secondary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                    <p className="text-sm font-semibold text-foreground">— {testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Estimate Calculator Section */}
      <section id="estimate" className="py-16 lg:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Improve Your Home Comfort?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get a ballpark price for your project in 2 minutes with our quick estimator
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <EstimateCalculator />
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/contact" onClick={() => handleTrackClick('Schedule Service', '/contact')}>
              <Button size="lg" variant="outline">
                Schedule Service
              </Button>
            </Link>
            <a href="tel:214-238-4349" onClick={() => handleTrackClick('Call for help', 'tel:214-238-4349')}>
              <Button size="lg" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call 214-238-4349
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResidentialServices;
