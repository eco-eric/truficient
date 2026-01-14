import { motion } from 'framer-motion';
import { 
  Building2, 
  Wrench, 
  RefreshCw, 
  Settings, 
  Shield,
  CheckCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ductworkSolutions = [
  {
    title: 'Flex Duct Systems',
    description: 'Lightweight and cost-effective for efficient airflow.',
  },
  {
    title: 'Spiral Ducting',
    description: 'Durable, sleek, and ideal for modern commercial spaces.',
  },
  {
    title: 'Square Ducting',
    description: 'Customizable and efficient for larger commercial projects.',
  },
];

const systemsServiced = [
  {
    title: 'RTU (Rooftop Package Units)',
    description: 'Durable and efficient climate control for commercial buildings.',
  },
  {
    title: 'Split AC Systems',
    description: 'Reliable cooling solutions for various commercial spaces.',
  },
  {
    title: 'VRF (Variable Refrigerant Flow) Systems',
    description: 'Advanced zoning and energy-efficient comfort.',
  },
  {
    title: 'Mini-Split Systems',
    description: 'Flexible and cost-effective heating and cooling.',
  },
];

const commercialServices = [
  {
    icon: Building2,
    title: 'HVAC Installation for New Construction & Remodeling',
    description: 'We specialize in high-quality commercial HVAC installations for new construction and remodeling projects. Our team collaborates with third-party duct design and load calculation experts to ensure optimal comfort, efficiency, and system reliability in every project.',
    details: 'We believe that clear communication is the key to a successful project. That\'s why we work closely with owners, builders, general contractors, and tenants, ensuring every installation is completed to specifications, on time, and within budget.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
  },
  {
    icon: RefreshCw,
    title: 'Retrofit & Replacement HVAC Services',
    description: 'We specialize in fast and efficient HVAC retrofits and replacements to keep your commercial space comfortable and operational. When an air conditioning system fails, it can disrupt business operations, impact employee productivity, and lead to costly downtime.',
    details: 'Unlike residential systems, commercial HVAC equipment runs for longer hours and is exposed to extreme weather conditions, especially when installed on rooftops. As systems age, they become less efficient, more prone to breakdowns, and costly to maintain. Our team provides quick turnaround HVAC replacements, ensuring your business experiences minimal disruption.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
  },
  {
    icon: Wrench,
    title: 'Comprehensive Commercial HVAC Repair Services',
    description: 'Prevent costly breakdowns and downtime with expert repair services from Truficient HVAC Solutions. Many major HVAC issues can be avoided with proper system maintenance, ensuring optimal performance and longevity.',
    details: 'Our experienced technicians can quickly diagnose and repair issues with all types of commercial HVAC equipment, minimizing disruption to your business operations.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
  },
  {
    icon: Shield,
    title: 'Preventative HVAC Maintenance Plans',
    description: 'We offer comprehensive HVAC maintenance plans designed to prevent costly breakdowns and extend the life of your system. Regular maintenance helps improve energy efficiency, system reliability, and overall performance.',
    details: 'Our maintenance plans are tailored to your specific needs. By scheduling routine inspections and tune-ups, we help you minimize downtime, lower energy costs, and ensure your heating and cooling system operates at peak efficiency year-round.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
];

const CommercialServices = () => {
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
              Commercial Services
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-4">
              Expert Heating & Cooling Solutions for Small to Mid-Sized Commercial Buildings
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Reliable, Efficient & Built for Your Business
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
            <p className="text-lg text-muted-foreground leading-relaxed">
              At <strong className="text-foreground">Truficient HVAC Solutions</strong>, we specialize in commercial HVAC services for small to medium-sized buildings throughout the Dallas-Fort Worth Metroplex. Whether you need a new HVAC system for commercial construction, a retrofit, or a remodel, our expert team ensures efficient, high-quality installations tailored to your business's needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ductwork Solutions */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Comprehensive Ductwork Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide professional ductwork solutions tailored to your commercial space
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {ductworkSolutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                      <Settings className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{solution.title}</h3>
                    <p className="text-muted-foreground">{solution.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Services Detailed */}
      <section className="py-16 lg:py-24 bg-muted">
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
            {commercialServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-8 items-center`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.details}</p>
                  <div className="flex gap-4">
                    <Button className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                      Schedule Online
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

      {/* Systems We Service */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Types of Commercial HVAC Systems We Service
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our experienced technicians are trained to work with all major commercial HVAC systems
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {systemsServiced.map((system, index) => (
              <motion.div
                key={system.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-6">
                    <CheckCircle className="w-8 h-8 text-secondary mb-4" />
                    <h3 className="font-bold mb-2 text-card-foreground">{system.title}</h3>
                    <p className="text-sm text-muted-foreground">{system.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us for Commercial */}
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
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-card-foreground">
                      Why Choose Truficient for Commercial HVAC?
                    </h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Fast turnaround to minimize business disruption</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Clear communication with owners, builders & contractors</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Expert installations completed on time & within budget</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Tailored maintenance plans for your business needs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Licensed, insured & experienced technicians</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
                      alt="Commercial building"
                      className="w-full h-[250px] object-cover"
                    />
                  </div>
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
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=500&fit=crop')"
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

export default CommercialServices;
