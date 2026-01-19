import { motion } from 'framer-motion';
import { ScanLine, Calendar, Gauge, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';

const benefits = [
  { icon: ScanLine, text: 'Instant equipment identification' },
  { icon: Calendar, text: 'Find your system\'s manufacturing year' },
  { icon: Gauge, text: 'Get SEER rating & refrigerant type' },
  { icon: FileText, text: 'Download manuals & documentation' },
];

const ScannerPromo = () => {
  const { trackButtonClick } = useButtonTracking();

  const handleScanClick = () => {
    trackButtonClick({
      buttonName: 'Scan Your Equipment',
      buttonLocation: 'Homepage Scanner Promo',
      destinationUrl: '/scanner',
    });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      {/* Animated scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pulse" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            {/* Hero icon with pulse animation */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-emerald-500/10 mb-6 relative">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 rounded-xl border-2 border-emerald-500/30" />
              <ScanLine className="w-12 h-12 text-emerald-500 relative z-10" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Don't Know Your System's Age?
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Snap a photo of your data plate and get instant specs, age, and documentation for your HVAC equipment.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-md border-l-4 border-emerald-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-foreground">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 group bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
              onClick={handleScanClick}
            >
              <Link to="/scanner">
                Scan Your Equipment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground">
              100% Free • No appointment needed • Takes 30 seconds
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ScannerPromo;
