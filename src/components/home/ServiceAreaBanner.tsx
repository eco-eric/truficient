import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ServiceAreaBanner = () => {
  return (
    <section className="bg-secondary py-6">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-secondary-foreground">
              Providing Quality HVAC Services Across Dallas-Fort Worth
            </h2>
          </div>
          <Button 
            className="bg-primary hover:bg-navy-dark text-primary-foreground font-semibold whitespace-nowrap"
          >
            Request an Estimate
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceAreaBanner;
