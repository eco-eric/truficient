import { motion } from 'framer-motion';
import { Leaf, Award, MapPin } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Energy-Saving Solutions',
    description: 'Lower utility costs',
  },
  {
    icon: Award,
    title: 'Expert Mini Split Installers',
    description: 'Diamond Contractor certified',
  },
  {
    icon: MapPin,
    title: 'Serving All of DFW',
    description: 'Dallas-Fort Worth Metroplex',
  },
];

const FeaturesBar = () => {
  return (
    <section className="bg-background py-6 md:py-8 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 md:gap-4 justify-center sm:justify-start"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">{feature.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
