import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Shield, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const serviceAreas = [
  "Frisco",
  "McKinney",
  "Prosper",
  "Celina",
  "Allen",
  "Fairview",
  "Lucas",
  "Princeton",
  "Anna",
  "Melissa"
];

const FriscoMcKinneyArea = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-secondary font-semibold mb-2">SERVICE AREAS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frisco-McKinney Service Areas</h1>
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
            <h2 className="text-3xl font-bold mb-6">Serving Frisco-McKinney with Expert HVAC Services</h2>
            <p className="text-lg text-muted-foreground mb-6">
              At <strong>Truficient HVAC Solutions</strong>, we proudly offer top-quality <strong>heating and cooling services in Frisco and McKinney</strong>. Whether you need <strong>AC repair, heating installation, ductless mini-split solutions, or energy-efficient upgrades</strong>, our expert team is here to keep your home or business comfortable all year round.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Serving the <strong>Frisco-McKinney area</strong>, we are committed to delivering exceptional <strong>HVAC services</strong> with a focus on <strong>energy efficiency, fast response times, and transparent pricing</strong>. Trust Truficient for reliable solutions that ensure long-term comfort and savings.
            </p>

            {/* Service Areas Grid */}
            <h3 className="text-2xl font-bold mb-6">Our Frisco-McKinney Service Areas</h3>
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
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Truficient for HVAC Services in Frisco-McKinney?</h2>
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
              <h3 className="text-xl font-bold mb-2">Fast & Reliable Service Across Frisco-McKinney</h3>
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
            Contact Truficient today for reliable HVAC services in Frisco-McKinney.
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

export default FriscoMcKinneyArea;
