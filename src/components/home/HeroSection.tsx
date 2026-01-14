import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-home-office.jpg';

const HeroSection = () => {
  return (
    <section className="bg-muted py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Comfort,<br />
              <span className="text-primary">Our Assurance.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              Maximize Comfort, Minimize Costs – Your Energy-Efficient HVAC Experts in DFW!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8">
                Schedule Service
              </Button>
              <a href="tel:214-238-4349">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage}
                alt="Man working comfortably in home office with energy-efficient mini-split HVAC" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm font-medium text-muted-foreground">Trusted by</div>
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">DFW Homeowners</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
