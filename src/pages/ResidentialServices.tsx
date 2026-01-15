import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Wind, 
  Snowflake, 
  Wrench, 
  Shield, 
  Leaf,
  CheckCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';

const mainServices = [
  {
    icon: Snowflake,
    title: 'AC Repair & Installation',
    description: 'From emergency repairs to energy-efficient AC replacements, we ensure your home stays cool during the Texas heat.',
    link: '/services/ac',
  },
  {
    icon: Thermometer,
    title: 'Heating & Furnace Services',
    description: 'Whether you need a new furnace installation, repairs, or routine maintenance, we help keep your home warm and cozy in the winter.',
    link: '/services/heating',
  },
  {
    icon: Wind,
    title: 'Heat Pump Repair & Installation',
    description: 'Energy-efficient heating and cooling solutions tailored for year-round comfort.',
    link: '/services/heat-pump',
  },
  {
    icon: Wrench,
    title: 'Ductless Mini-Split Systems',
    description: 'Perfect for homes without ductwork, offering efficient heating and cooling with zoned temperature control.',
    link: '/services/ductless',
  },
  {
    icon: Shield,
    title: 'HVAC Maintenance Plans',
    description: 'Preventative maintenance to extend the lifespan of your HVAC system, reduce energy costs, and prevent costly breakdowns.',
    link: '/services/maintenance',
  },
  {
    icon: Leaf,
    title: 'Indoor Air Quality Solutions',
    description: 'Air purifiers, humidifiers, and ventilation systems to improve your home\'s air quality and overall comfort.',
    link: '/services/air-quality',
  },
];

const highEfficiencyBenefits = [
  {
    title: 'Extended Equipment Lifespan',
    description: 'Unlike traditional systems that operate at just one or two speeds, variable-speed compressors adjust based on demand, reducing wear and tear on components.',
  },
  {
    title: 'Enhanced Comfort',
    description: 'Consistent and evenly distributed airflow ensures better temperature regulation and eliminates hot or cold spots in your home.',
  },
  {
    title: 'Lower Energy Costs',
    description: 'High-efficiency HVAC units use less power, helping you reduce energy bills without sacrificing comfort.',
  },
  {
    title: 'Improved Zoning Capabilities',
    description: 'Variable-speed technology allows for precise temperature control in different areas of your home, optimizing energy use.',
  },
  {
    title: 'Quieter Operation',
    description: 'With advanced technology, these systems run more quietly, making them less noticeable while maintaining peak performance.',
  },
];

const detailedServices = [
  {
    title: 'HVAC Replacement Services',
    description: 'No matter what type of HVAC system you choose—a standard AC unit, a ductless mini-split, or an advanced variable-speed system—Truficient HVAC Solutions has the expertise to handle your replacement with precision. Our experienced technicians ensure a seamless installation, maximizing efficiency, performance, and long-term reliability for your home.',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
  },
  {
    title: 'Reliable AC Repair & Maintenance',
    description: 'At Truficient HVAC Solutions, we have extensive experience repairing and servicing all major HVAC brands. Most air conditioning systems operate with similar components, allowing our expert technicians to quickly diagnose and fix any issue—ensuring your home stays cool and comfortable. Our Tru Warranty Plan helps homeowners minimize repairs and maintain efficiency for units under 15 years old.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
  },
  {
    title: 'Duct Replacement',
    description: 'Even the most advanced and energy-efficient HVAC system won\'t perform at its best without a properly designed and installed duct system. Leaky, damaged, or outdated ductwork can lead to uneven temperatures, poor airflow, and higher energy bills. We specialize in professional duct replacement to ensure your heating and cooling system operates at peak efficiency.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
  {
    title: 'Indoor Air Quality (IAQ)',
    description: 'The air inside your home may contain more pollutants, allergens, and airborne microbes than you realize. Dust, pet dander, household chemicals, smoke, and even unsealed ductwork can introduce contaminants. Our expert duct sealing and UV light installations effectively eliminate harmful particles, bacteria, and odors, improving the air you and your family breathe every day.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
  },
  {
    title: 'Expert Mini-Split Installation & Repair',
    description: 'We specialize in the installation and repair of mini-split systems from leading brands like Mitsubishi, Rheem, Lennox, Gree, Carrier, and more. As a Mitsubishi Diamond Contractor, we offer up to 12 years of parts and compressor warranty on Mitsubishi residential mini-split installations, ensuring long-term reliability and peace of mind.',
    image: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4e3?w=600&h=400&fit=crop',
  },
];

const ResidentialServices = () => {
  usePageSEO();
  
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
              Residential Services
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-4">
              Reliable Residential HVAC Services
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Keeping Your Home Comfortable Year-Round with Expert Heating & Cooling Solutions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At <strong className="text-foreground">Truficient HVAC Solutions</strong>, we provide top-quality residential HVAC services to homeowners across the Dallas-Fort Worth Metroplex. Whether you need AC repairs, furnace installations, heat pump maintenance, or a full system upgrade, our expert technicians are dedicated to ensuring your home stays comfortable, energy-efficient, and cost-effective in every season.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              With years of experience in the HVAC industry, Truficient is committed to customer satisfaction, upfront pricing, and expert workmanship. Our licensed and insured technicians ensure every job is completed to the highest standards, providing you with long-term comfort and peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            Our Residential Services
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                      <service.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-card-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Efficiency Systems */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Upgrade to a High-Efficiency HVAC System
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We specialize in high-efficiency HVAC installations, helping homeowners enjoy greater comfort, lower energy bills, and long-lasting system performance with 20+ SEER systems.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highEfficiencyBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
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
              <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                Schedule Service
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            Services We Offer
          </motion.h2>

          <div className="space-y-16 max-w-6xl mx-auto">
            {detailedServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <div className="flex gap-4">
                    <Button className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                      Schedule Service
                    </Button>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TruWarranty Program */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-card">
              <CardContent className="p-8 lg:p-12">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-secondary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4 text-card-foreground">
                    Comprehensive Warranty & Maintenance Program
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    At Truficient HVAC Solutions, we offer a unique warranty program designed to provide peace of mind and long-term protection for your HVAC system. Our <strong className="text-foreground">TruWarranty Program</strong> covers both labor and parts for units 15 years old or newer, ensuring your system stays in top condition without unexpected repair costs.
                  </p>
                  <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                    Learn About TruWarranty
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 lg:py-28 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&h=500&fit=crop')"
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
              It's Time to Take Action.<br />
              Schedule Your HVAC Service Today!
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              At Truficient, your comfort is our priority. We provide five-star HVAC services throughout the Dallas-Fort Worth Metroplex. Call us at 214-238-4349 or schedule your service online!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8"
              >
                Schedule a Service
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call 214-238-4349
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResidentialServices;
