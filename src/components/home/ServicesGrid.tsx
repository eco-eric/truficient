import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useButtonTracking } from '@/hooks/useButtonTracking';
import heatPumpImage from '@/assets/heat-pump-installation.png';
import acRepairImage from '@/assets/ac-repair.jpg';
import designInstallImage from '@/assets/design-and-install.jpg';

const services = [
  {
    title: 'Heat Pump Installation',
    description: 'Keep your energy bill low in the winter by having Truficient Service install a high-efficiency heat pump system.',
    image: heatPumpImage,
    link: '/residential-services#heating-installation',
  },
  {
    title: 'AC Repair',
    description: 'AC running harder than it should be? Lower your utility costs and avoid further costly repairs by scheduling a service call with Truficient today.',
    image: acRepairImage,
    link: '/residential-services#ac-repair',
  },
  {
    title: 'AC Replacement',
    description: 'Is your heating and air conditioning unit decades old and about to kick the bucket? Call Truficient today and see if AC replacement is right for you.',
    image: 'https://images.unsplash.com/photo-1631545806609-a81784a80d37?w=400&h=300&fit=crop',
    link: '/residential-services#ac-replacement',
  },
  {
    title: 'Design and Install Services',
    description: 'Your HVAC system bit the dust? Truficient offers full HVAC design and installation for all private, commercial, and residential customers.',
    image: designInstallImage,
    link: '/residential-services#ac-installation',
  },
  {
    title: 'Heating Repair',
    description: 'Having your heater go out in the middle of winter is not something we want families to have to go through. Call Truficient to schedule a heating repair appointment today.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    link: '/residential-services#heating-repair',
  },
  {
    title: 'Indoor Air Quality',
    description: 'Our customers\' comfort is one of our top concerns. That\'s why we offer air quality services such as air purification, humidifiers, and dehumidifiers.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    link: '/residential-services#air-quality',
  },
  {
    title: 'Ductless Systems',
    description: 'Our HVAC technicians can repair, replace, or install a ductless air conditioning unit and ductless split systems.',
    image: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4e3?w=400&h=300&fit=crop',
    link: '/residential-services#ductless',
  },
  {
    title: 'Commercial Services',
    description: 'Expert Heating & Cooling Solutions for Small to Mid-Sized Commercial Buildings.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    link: '/commercial-services',
  },
];

const ServicesGrid = () => {
  const { trackButtonClick } = useButtonTracking();

  const handleServiceClick = (serviceTitle: string, link: string) => {
    trackButtonClick({
      buttonName: `Learn More - ${serviceTitle}`,
      buttonLocation: 'Services Grid',
      destinationUrl: link,
    });
  };

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
                    className="w-full h-56 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <Link 
                    to={service.link}
                    onClick={() => handleServiceClick(service.title, service.link)}
                  >
                    <Button
                      variant="default" 
                      className="w-full bg-primary hover:bg-navy-dark text-primary-foreground"
                    >
                      Learn More
                    </Button>
                  </Link>
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
