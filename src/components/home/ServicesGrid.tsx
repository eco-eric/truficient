import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: 'Air Conditioning Repair Services',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
    link: '/services/ac-repair',
  },
  {
    title: 'Air Conditioning Replacement',
    image: 'https://images.unsplash.com/photo-1631545806609-a81784a80d37?w=400&h=300&fit=crop',
    link: '/services/ac-replacement',
  },
  {
    title: 'Air Conditioning Installation',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    link: '/services/ac-installation',
  },
  {
    title: 'Heating Repair',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    link: '/services/heating-repair',
  },
  {
    title: 'Heating Installation',
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400&h=300&fit=crop',
    link: '/services/heating-installation',
  },
  {
    title: 'Indoor Air Quality Solutions',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    link: '/services/air-quality',
  },
  {
    title: 'Ductless Heating & Cooling',
    image: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4e3?w=400&h=300&fit=crop',
    link: '/services/ductless',
  },
  {
    title: 'Commercial Services',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    link: '/services/commercial',
  },
];

const ServicesGrid = () => {
  return (
    <section id="services" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            HVAC Services
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Truficient offers a wide variety of HVAC solutions to residential and commercial customers in the Dallas-Fort Worth area. Our certified technicians bring over a decade of experience to every installation, repair, and maintenance call.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden hover-lift group bg-card h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-card-foreground leading-tight">
                    {service.title}
                  </h3>
                  <Button 
                    variant="default" 
                    className="w-full bg-primary hover:bg-navy-dark text-primary-foreground"
                  >
                    Learn More
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

export default ServicesGrid;
