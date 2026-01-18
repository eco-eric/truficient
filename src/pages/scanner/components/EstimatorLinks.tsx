import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Snowflake, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ductlessImage from '@/assets/ductless-wall-mount.png';
import ductedImage from '@/assets/ducted-air-handler-svz.png';

const estimators = [
  {
    title: 'Ductless Systems',
    subtitle: 'Mini-splits for targeted comfort',
    image: ductlessImage,
    badge: 'MOST EFFICIENT',
    badgeColor: 'bg-emerald-500',
    icon: Snowflake,
    benefits: ['No ductwork needed', 'Zone-by-zone control', 'Up to 40% energy savings'],
    cta: 'Get Ductless Quote',
    link: '/estimate/ductless',
  },
  {
    title: 'AC | Heat Pump',
    subtitle: 'Central AC & heat pump replacement',
    image: ductedImage,
    badge: 'WHOLE HOME',
    badgeColor: 'bg-blue-600',
    icon: Home,
    benefits: ['Works with existing ducts', 'Even temperature throughout', 'Quiet operation'],
    cta: 'Get AC/Heat Pump Quote',
    link: '/estimate/ducted',
  },
];

export function EstimatorLinks() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-lg"
    >
      {/* Section Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Ready for a New System?
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Get an instant estimate in <span className="font-semibold text-foreground">under 5 minutes</span>. 
          No salesperson, no pressure — just transparent pricing.
        </p>
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {estimators.map((estimator, index) => {
          const Icon = estimator.icon;
          return (
            <motion.div
              key={estimator.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-card h-full flex flex-col group hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                  <img
                    src={estimator.image}
                    alt={estimator.title}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  {/* Badge */}
                  <div className={`absolute top-3 right-3 ${estimator.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                    {estimator.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Title Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg leading-tight">{estimator.title}</h4>
                      <p className="text-sm text-muted-foreground">{estimator.subtitle}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {estimator.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button asChild className="w-full touch-target bg-primary hover:bg-primary/90">
                    <Link to={estimator.link}>
                      {estimator.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
