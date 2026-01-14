import { motion } from 'framer-motion';
import { Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    icon: Home,
    title: 'Residential Services',
    description: 'We bring comfort, efficiency, and reliability to every room in your house. From installations to repairs and everything in between, your home\'s comfort is our priority.',
    cta: 'Learn More',
    link: '/services/residential',
  },
  {
    icon: Building2,
    title: 'Commercial Solutions',
    description: 'Businesses count on us for reliable, energy-efficient HVAC systems. We understand the importance of uptime and offer solutions that keep your operations running smoothly.',
    cta: 'Request a Quote',
    link: '/services/commercial',
  },
];

const ServicesOverview = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          DFW's Premier HVAC Provider
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover-lift bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                    <service.icon className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <Button className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                    {service.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
