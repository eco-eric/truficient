import { motion } from 'framer-motion';
import { Star, Facebook } from 'lucide-react';

const testimonial = {
  text: "I can't say enough good things about Truficient. They went above and beyond when our A/C broke down in the middle of a heat wave. Even though they were extremely busy and working long hours, they took care of us. Truficient is building its business the right way by providing excellent service and taking great care of their customers.",
  rating: 5,
};

const platforms = [
  { name: 'Facebook', icon: Facebook, color: 'bg-[#1877f2]' },
  { name: 'Houzz', icon: null, color: 'bg-[#4dbc58]', letter: 'H' },
  { name: 'Yelp', icon: null, color: 'bg-[#d32323]', letter: 'Y' },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Hear From Our Customers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide quality service at a reasonable price, but don't take our word for it. Explore what our satisfied customers have to say.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-muted rounded-xl p-8 mb-12"
        >
          <div className="flex justify-center mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
            ))}
          </div>
          <blockquote className="text-lg text-foreground text-center italic leading-relaxed">
            "{testimonial.text}"
          </blockquote>
        </motion.div>

        {/* Review Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">Find us on:</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {platforms.map((platform) => (
              <div key={platform.name} className="text-center group cursor-pointer">
                <div className={`w-14 h-14 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  {platform.icon ? (
                    <platform.icon className="w-7 h-7 text-primary-foreground" />
                  ) : (
                    <span className="text-primary-foreground font-bold text-xl">{platform.letter}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground">{platform.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5-Star Reviews Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-muted rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Our Customers Give Us 5-Star Reviews
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Truficient is proud to be a trusted HVAC provider in the DFW area. Our customers appreciate our commitment to quality service, energy efficiency, and reliable solutions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
