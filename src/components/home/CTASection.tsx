import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section 
      className="py-20 lg:py-28 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=500&fit=crop')"
      }}
    >
      {/* Overlay */}
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
            Don't wait until your HVAC system breaks down. Whether you need routine maintenance, a repair, or a new installation, Truficient is here to help. Contact us today to experience the difference of working with DFW's trusted HVAC experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8"
            >
              Schedule Service Now
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
  );
};

export default CTASection;
