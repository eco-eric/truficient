import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Wind, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ductlessImage from '@/assets/ductless-services.webp';
import ductedImage from '@/assets/ducted-air-handler.webp';

const estimators = [
  {
    id: 'ductless',
    title: 'Ductless Systems',
    subtitle: 'Mini-splits for targeted comfort',
    image: ductlessImage,
    badge: 'MOST EFFICIENT',
    badgeColor: 'bg-emerald-500',
    icon: Wind,
    benefits: ['No ductwork needed', 'Zone-by-zone control', 'Up to 40% energy savings'],
    href: '/estimate/ductless',
    cta: 'Get Ductless Quote',
  },
  {
    id: 'ducted',
    title: 'AC | Heat Pump',
    subtitle: 'Central AC & heat pump replacement',
    image: ductedImage,
    badge: 'WHOLE HOME',
    badgeColor: 'bg-blue-600',
    icon: Home,
    benefits: ['Works with existing ducts', 'Even temperature throughout', 'Quiet operation'],
    href: '/estimate/ducted',
    cta: 'Get AC/Heat Pump Quote',
  },
];

const EstimatorCards = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Get Your Instant Estimate
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            No appointment needed. See pricing in under 2 minutes.
          </p>
        </motion.div>

        {/* Estimator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {estimators.map((estimator, index) => (
            <motion.div
              key={estimator.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link to={estimator.href} className="block h-full">
                <Card className="overflow-hidden h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={estimator.image}
                      alt={estimator.title}
                      width={estimator.id === 'ducted' ? 700 : 800}
                      height={estimator.id === 'ducted' ? 438 : 500}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 ${estimator.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
                    >
                      {estimator.badge}
                    </span>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <estimator.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">
                          {estimator.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{estimator.subtitle}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-2 mb-5">
                      {estimator.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      {estimator.cta}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          💡 Instant online pricing • No pressure • Save with rebates
        </motion.p>
      </div>
    </section>
  );
};

export default EstimatorCards;
