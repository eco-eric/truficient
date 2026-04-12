import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';

const features = [
  { title: 'Residential & Commercial', subtitle: 'Expertise' },
  { title: 'Single Zone & Multi-Zone', subtitle: 'Solutions' },
  { title: '12-Year Residential Parts', subtitle: 'Warranty' },
  { title: '10-Year Commercial Parts', subtitle: 'Warranty' },
];

const MitsubishiSection = () => {
  const { trackButtonClick } = useButtonTracking();

  const handleContactClick = () => {
    trackButtonClick({
      buttonName: 'Contact Us Today',
      buttonLocation: 'Mitsubishi Section',
      destinationUrl: '/contact',
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          DFW's Trusted Mitsubishi Diamond Contractor
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative favicon grid */}
            <div className="absolute -left-4 -top-4 grid grid-cols-5 gap-2">
              {[...Array(25)].map((_, i) => (
                <img 
                  key={i} 
                  src="/favicon.png" 
                  alt="" 
                  className="w-6 h-6 opacity-10"
                  aria-hidden="true"
                  loading="lazy"
                  width={24}
                  height={24}
                />
              ))}
            </div>
            <div className="relative z-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Looking for a ductless mini-split air conditioner or ductless heating system? Truficient is your go-to expert. As a Mitsubishi Electric Diamond Contractor, we're among the top-tier professionals trusted to deliver unmatched comfort solutions.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                Ductless mini-split systems are an ideal way to add heating and cooling to areas of your home or business where conventional systems can't reach—without the need for ductwork. Experience the future of climate control with Truficient.
              </p>
            </div>
          </motion.div>

          {/* Right - YouTube Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/OFbHUbdlLmo"
                title="Truficient HVAC Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Watch our story</p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link to="/contact" onClick={handleContactClick}>
            <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MitsubishiSection;
