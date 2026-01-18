import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Snowflake, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function EstimatorLinks() {
  const benefits = [
    "No appointment needed",
    "Instant pricing",
    "Save with rebates"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-lg"
    >
      {/* Badge */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d4a84b]/15 px-4 py-1.5 text-sm font-semibold text-[#d4a84b]">
          <Zap className="h-4 w-4" />
          GET A HASSLE-FREE QUOTE
        </div>
      </div>

      {/* Headline */}
      <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
        Ready for a New System?
      </h3>
      
      {/* Subheadline */}
      <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto">
        Get an instant estimate in <span className="font-semibold text-foreground">under 5 minutes</span>. 
        No salesperson, no pressure — just transparent pricing.
      </p>
      
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Ducted System Card */}
        <Card className="p-5 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-lg">Ducted System</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>~3 min</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Central AC & heat pump options for whole-home comfort.
            </p>
            <Button asChild className="w-full touch-target bg-primary hover:bg-primary/90">
              <Link to="/estimate/ducted">
                Get My Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Ductless System Card */}
        <Card className="p-5 hover:shadow-xl transition-all duration-300 border-2 border-[#d4a84b]/30 hover:border-[#d4a84b]/50 bg-card relative overflow-hidden">
          {/* Popular badge */}
          <div className="absolute top-0 right-0 bg-[#d4a84b] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
            POPULAR
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d4a84b]/15 flex items-center justify-center">
                <Snowflake className="w-6 h-6 text-[#d4a84b]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-lg">Ductless System</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>~4 min</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mini-split & multi-zone solutions without ductwork.
            </p>
            <Button asChild className="w-full touch-target bg-[#d4a84b] hover:bg-[#d4a84b]/90 text-white">
              <Link to="/estimate/ductless">
                Get My Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Trust Strip */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
