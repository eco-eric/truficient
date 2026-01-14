import { motion } from 'framer-motion';
import { CheckCircle, Shield, Award, Clock, Leaf, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const credentials = [
  {
    icon: Shield,
    title: 'Licensed & Insured Professionals',
    description: 'Our team meets all industry standards, giving you peace of mind with every service.',
  },
  {
    icon: Clock,
    title: '50+ Years of Combined Experience',
    description: 'Decades of hands-on expertise mean we\'ve seen it all and can handle any HVAC challenge.',
  },
  {
    icon: Award,
    title: 'Certified Home Energy Raters (HERS Certified)',
    description: 'We specialize in energy efficiency, helping you reduce energy waste and lower utility bills.',
  },
  {
    icon: Leaf,
    title: 'York Affinity Dealer & Trane Comfort Specialist',
    description: 'We work with top-rated brands to deliver cutting-edge HVAC solutions.',
  },
  {
    icon: Users,
    title: 'Energy Management Professionals',
    description: 'We optimize systems for maximum performance and sustainability.',
  },
  {
    icon: Award,
    title: 'Mitsubishi Diamond Contractor',
    description: 'Contact us for expert HVAC solutions tailored to your home\'s unique needs.',
  },
];

const advantages = [
  {
    title: 'Easy to Reach, Quick to Act',
    description: 'Have a problem with your AC? We turn stress into solutions.',
  },
  {
    title: 'Seasoned Expert Technicians',
    description: 'Our technicians have the experience to get it right the first time.',
  },
];

const About = () => {
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
              About Us
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Your Comfort, Our Assurance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Discover Truficient Advantage */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            Discover the Truficient Advantage
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Our Story
              </h2>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                A Commitment to Comfort & Efficiency
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                As energy efficiency becomes a top priority, many homeowners unknowingly spend <strong className="text-foreground">hundreds of extra dollars</strong> each year on inefficient heating and cooling. At Truficient HVAC Solutions, we specialize in optimizing home comfort systems to help you <strong className="text-foreground">lower energy costs</strong> and <strong className="text-foreground">enhance efficiency</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Leaky ducts, poor insulation, and outdated HVAC systems can lead to <strong className="text-foreground">higher utility bills</strong> and unnecessary strain on the energy grid. Our licensed and insured team provides expert AC repair and installation services in Dallas, ensuring your home stays comfortable year-round.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop"
                  alt="HVAC technician at work"
                  className="w-full h-[350px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Truficient */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Choose Truficient HVAC Solutions?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              When you partner with us, you're getting industry-leading expertise and trusted solutions backed by:
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {credentials.map((credential, index) => (
              <motion.div
                key={credential.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <credential.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2 text-card-foreground">{credential.title}</h3>
                    <p className="text-sm text-muted-foreground">{credential.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Our Commitment
            </h2>
            <h3 className="text-xl font-semibold mb-6 text-primary">
              Excellence in Service – Guaranteed
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              At Truficient, we are committed to delivering <strong className="text-foreground">top-tier customer service</strong> and <strong className="text-foreground">high-quality HVAC solutions</strong>. If we can't diagnose your issue, you <strong className="text-foreground">don't pay a cent</strong>—plus, we always offer free estimates for new projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                Schedule Online
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Call 214-238-4349
              </Button>
            </div>
          </motion.div>
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
              It's Time to Take Action.<br />
              Schedule Your HVAC Service Today!
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              At Truficient, your comfort is our priority. We provide five-star HVAC services throughout the Dallas-Fort Worth Metroplex. Call us at 214-238-4349 or schedule your service online to experience the best in DFW HVAC solutions!
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

export default About;
