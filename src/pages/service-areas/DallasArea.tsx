import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Shield, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const serviceAreas = [
  "Downtown Dallas",
  "Uptown Dallas", 
  "Oak Lawn",
  "Highland Park",
  "University Park",
  "Lakewood",
  "East Dallas",
  "Deep Ellum",
  "Design District",
  "Victory Park"
];

const DallasArea = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-secondary font-semibold mb-2">SERVICE AREAS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Dallas Service Areas</h1>
            <p className="text-xl opacity-90">Your Comfort, Our Assurance.</p>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Discover Truficient Advantage</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background p-8 rounded-lg shadow-md">
              <Clock className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Easy to Reach, Quick to Act</h3>
              <p className="text-muted-foreground">Have a problem with your AC? We turn stress into solutions.</p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-md">
              <Shield className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Seasoned Expert Technicians</h3>
              <p className="text-muted-foreground">Our technicians have the experience to get it right the first time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Serving Dallas with Expert HVAC Services</h2>
            <p className="text-lg text-muted-foreground mb-6">
              At <strong>Truficient HVAC Solutions</strong>, we are proud to provide <strong>top-quality heating and cooling services</strong> throughout the <strong>Dallas Area</strong>. Whether you need <strong>AC repair, heating installation, ductless mini-split solutions, or energy-efficient upgrades</strong>, our expert team is ready to keep your home or business comfortable year-round.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              No matter where you are in the <strong>DFW Metroplex</strong>, Truficient is committed to delivering <strong>exceptional HVAC services</strong> backed by our team's extensive expertise and dedication to energy efficiency. We take pride in our <strong>fast response times, transparent pricing, and customer-first approach</strong>, ensuring that every home and business we serve experiences <strong>optimal comfort and long-term savings</strong>.
            </p>

            {/* Service Areas Grid */}
            <h3 className="text-2xl font-bold mb-6">Our Dallas Service Areas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {serviceAreas.map((area) => (
                <div key={area} className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Truficient for HVAC Services in Dallas?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Experienced & Certified HVAC Technicians</h3>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Energy-Efficient Solutions for Lower Utility Bills</h3>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Fast & Reliable Service Across Dallas</h3>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Upfront Pricing with No Hidden Fees</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">Ready to Schedule Service?</h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-2xl mx-auto">
            Contact Truficient today for reliable HVAC services in Dallas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/contact">Schedule Online</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <a href="tel:214-238-4349">
                <Phone className="w-5 h-5 mr-2" />
                214-238-4349
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DallasArea;
