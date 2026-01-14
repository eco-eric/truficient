import { motion } from 'framer-motion';
import { Leaf, Award, MapPin } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Energy-Saving Solutions',
    description: 'Reduce your energy bills',
  },
  {
    icon: Award,
    title: 'Expert Mini Split Installers',
    description: 'Certified professionals',
  },
  {
    icon: MapPin,
    title: 'Serving All of DFW',
    description: 'Local & reliable service',
  },
];

const FeaturesBar = () => {
  return (
    <section className="bg-background py-8 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
