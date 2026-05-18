import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-home-office.webp';
import heroImage400 from '@/assets/hero-home-office-400w.webp';
import heroImage640 from '@/assets/hero-home-office-640w.webp';
import heroImage800 from '@/assets/hero-home-office-800w.webp';
import { useButtonTracking } from '@/hooks/useButtonTracking';
import { buildSrcSet } from '@/utils/responsiveImages';

const heroSrcSet = buildSrcSet({
  '400w': heroImage400,
  '640w': heroImage640,
  '800w': heroImage800,
  '1200w': heroImage,
});

const HeroSection = () => {
  const { trackButtonClick } = useButtonTracking();

  // Preload the LCP hero image with responsive srcset
  useEffect(() => {
    const existing = document.querySelector('link[data-hero-preload]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/webp';
      link.setAttribute('imagesrcset', heroSrcSet);
      link.setAttribute('imagesizes', '(max-width: 768px) 100vw, 50vw');
      link.href = heroImage;
      link.setAttribute('data-hero-preload', '');
      document.head.appendChild(link);
    }
  }, []);

  const handleScheduleClick = () => {
    trackButtonClick({
      buttonName: 'Get Instant Price',
      buttonLocation: 'Hero Section',
      destinationUrl: '/estimate',
    });
  };

  const handleCallClick = () => {
    trackButtonClick({
      buttonName: 'Call Now',
      buttonLocation: 'Hero Section',
      destinationUrl: 'tel:214-238-4349',
    });
  };

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
              <span className="text-primary">Priced Online.</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-lg">
              Transparent HVAC pricing for DFW homeowners. See your price in 2 minutes — no callback required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/estimate" onClick={handleScheduleClick}>
                <Button size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold text-lg px-8">
                  Get Instant Price
                </Button>
              </Link>
              <a href="tel:214-238-4349" onClick={handleCallClick}>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
            <p className="text-sm text-foreground/60 mt-3">Real prices online · 2-minute estimate · No sales call required</p>
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
                srcSet={heroSrcSet}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt="Man working comfortably in home office with energy-efficient mini-split HVAC" 
                className="w-full h-[400px] lg:h-[500px] object-cover"
                fetchPriority="high"
                width={1200}
                height={800}
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
