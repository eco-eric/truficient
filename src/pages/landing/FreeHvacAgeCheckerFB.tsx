import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanLine, Calendar, Gauge, FileText, ArrowRight, Camera, MapPin, CheckCircle, Star, Shield, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useButtonTracking } from '@/hooks/useButtonTracking';
import { ScannerCoupon } from '@/pages/scanner/components/ScannerCoupon';
import logo from '@/assets/truficient-logo.webp';

const benefits = [
  { icon: ScanLine, title: 'Instant ID', text: 'Instantly identify your equipment brand, model & tonnage' },
  { icon: Calendar, title: 'Manufacturing Year', text: 'Find out exactly when your system was made' },
  { icon: Gauge, title: 'SEER Rating', text: 'Get your efficiency rating & refrigerant type' },
  { icon: FileText, title: 'Free Manuals', text: 'Download owner manuals & documentation' },
];

const steps = [
  { icon: MapPin, number: '1', title: 'Enter Your Zip', description: 'Confirm you\'re in the DFW service area' },
  { icon: Camera, number: '2', title: 'Snap a Photo', description: 'Take a picture of your data plate' },
  { icon: CheckCircle, number: '3', title: 'Get Results', description: 'Instant age, specs & downloadable manuals' },
];

export default function FreeHvacAgeCheckerFB() {
  const { trackButtonClick } = useButtonTracking();
  const navigate = useNavigate();

  useEffect(() => {
    if ((window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', { content_name: 'FB Scanner Landing - Feb 2026' });
    }
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'FB Scanner Landing - Feb 2026',
        page_location: window.location.href,
        campaign_source: 'facebook',
        campaign_medium: 'paid',
      });
    }
  }, []);

  const handleCTAClick = () => {
    trackButtonClick({
      buttonName: 'Check My System Age',
      buttonLocation: 'FB Landing Page - Feb 2026',
      destinationUrl: '/scanner',
    });
    navigate('/scanner');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Top Bar */}
      <header className="py-4 px-4 border-b border-border/50">
        <div className="container mx-auto flex justify-center">
          <img src={logo} alt="Truficient Energy Solutions" className="h-10" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 mb-6 relative">
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                <ScanLine className="w-10 h-10 text-emerald-500 relative z-10" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                How Old Is Your AC?{' '}
                <span className="text-secondary">Find Out in 30 Seconds</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Snap a photo of your data plate and instantly get your system's age, specs, and downloadable manuals — <strong className="text-foreground">100% free.</strong>
              </p>

              <Button
                size="lg"
                onClick={handleCTAClick}
                className="text-lg px-10 py-7 group bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                Check My System's Age
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {[
                  { icon: Zap, label: 'Free' },
                  { icon: Clock, label: 'No Appointment' },
                  { icon: Shield, label: '30 Seconds' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <badge.icon className="w-4 h-4 text-emerald-500" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 relative">
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
          >
            What You'll Get — <span className="text-secondary">Instantly</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 bg-card rounded-lg p-4 shadow-md border-l-4 border-emerald-500"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-0.5">
                  <benefit.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <span className="font-semibold text-sm">{benefit.title}</span>
                  <p className="text-xs text-muted-foreground">{benefit.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon Teaser */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <ScannerCoupon variant="compact" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
              ))}
            </div>
            <p className="text-lg font-semibold mb-1">Trusted by DFW Homeowners</p>
            <p className="text-sm text-muted-foreground">
              Thousands of systems scanned • Licensed & insured • TACLA142792E
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Find Out How Old Your System Is?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              It's free, takes 30 seconds, and you'll get a full equipment report.
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-7 group bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-xl"
            >
              Check My System's Age
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} Truficient Energy Solutions • TACLA142792E</p>
          <div className="flex justify-center gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
