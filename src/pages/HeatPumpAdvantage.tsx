import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Flame, ArrowRight, Award, Shield, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { usePageSEO } from '@/hooks/usePageSEO';
import { useButtonTracking } from '@/hooks/useButtonTracking';

// Heat Pump Page Components
import GasVsElectricCalculator from '@/components/heat-pump/GasVsElectricCalculator';
import RateTimelineTable from '@/components/heat-pump/RateTimelineTable';
import BenefitsGrid from '@/components/heat-pump/BenefitsGrid';
import HomeownerReports from '@/components/heat-pump/HomeownerReports';
import MythsSection from '@/components/heat-pump/MythsSection';
import ROIComparison from '@/components/heat-pump/ROIComparison';
import DataSourcesSection from '@/components/heat-pump/DataSourcesSection';

const HeatPumpAdvantage = () => {
  usePageSEO();
  const { trackButtonClick } = useButtonTracking();

  const handleEstimateClick = () => {
    trackButtonClick({
      buttonName: 'Get Your Free Estimate',
      buttonLocation: 'Heat Pump Advantage Page - Hero',
      destinationUrl: '/estimate/ducted',
    });
  };

  const handleCalculatorClick = () => {
    trackButtonClick({
      buttonName: 'Calculate Your Savings',
      buttonLocation: 'Heat Pump Advantage Page - Hero',
      destinationUrl: '#calculator',
    });
  };

  const handleCTAEstimateClick = () => {
    trackButtonClick({
      buttonName: 'Get Your Free Estimate',
      buttonLocation: 'Heat Pump Advantage Page - CTA',
      destinationUrl: '/estimate/ducted',
    });
  };

  const handleCTAContactClick = () => {
    trackButtonClick({
      buttonName: 'Talk to an Expert',
      buttonLocation: 'Heat Pump Advantage Page - CTA',
      destinationUrl: '/contact',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-16 md:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-secondary/30 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full mb-6"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">2026 Rate Analysis</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
              >
                Gas Prices Have{' '}
                <span className="text-secondary">Flipped the Script</span>
                <br />
                on Home Heating Economics
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
              >
                Atmos Energy's 420% rate increase has made heat pumps the clear winner 
                for DFW homeowners. See the math.
              </motion.p>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10"
              >
                <div className="bg-destructive/20 rounded-xl p-4 text-center">
                  <Flame className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">$723</div>
                  <div className="text-sm text-primary-foreground/70">Highest Gas Bill (Jan 2026)</div>
                </div>
                <div className="bg-secondary/20 rounded-xl p-4 text-center">
                  <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">$147</div>
                  <div className="text-sm text-primary-foreground/70">Heat Pump Bill (Same Month)</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <a href="#calculator" onClick={handleCalculatorClick}>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8">
                    Calculate Your Savings
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <Link to="/contact" onClick={handleEstimateClick}>
                  <Button size="lg" variant="outline" className="border-2 border-primary bg-white text-primary hover:bg-secondary hover:border-secondary hover:text-secondary-foreground font-semibold text-lg px-8">
                    Talk to an Expert
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Rate Timeline */}
        <RateTimelineTable />

        {/* Calculator */}
        <GasVsElectricCalculator />

        {/* Benefits Grid */}
        <BenefitsGrid />

        {/* Homeowner Reports */}
        <HomeownerReports />

        {/* Myths Section */}
        <MythsSection />

        {/* ROI Comparison */}
        <ROIComparison />

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-primary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready to Stop Paying Atmos Premium Prices?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Get a free, no-pressure estimate from Truficient. We'll show you exactly 
                what a heat pump system would cost for your home — and how much you'll save.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/estimate/ducted" onClick={handleCTAEstimateClick}>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8">
                    Get Your Free Estimate
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact" onClick={handleCTAContactClick}>
                  <Button size="lg" variant="outline" className="border-2 border-primary bg-white text-primary hover:bg-secondary hover:border-secondary hover:text-secondary-foreground font-semibold text-lg px-8">
                    Talk to an Expert
                  </Button>
                </Link>
              </div>

              {/* Credentials */}
              <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span className="text-sm">Mitsubishi Diamond Contractor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-secondary" />
                  <span className="text-sm">HERS Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="text-sm">1,000+ DFW Installations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Data Sources */}
        <DataSourcesSection />
      </main>

      <Footer />
    </div>
  );
};

export default HeatPumpAdvantage;
