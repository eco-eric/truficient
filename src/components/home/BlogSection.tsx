import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const posts = [
  {
    title: 'From Discomfort to Energy-Efficient Comfort: A Real Case Study',
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=300&h=200&fit=crop',
    excerpt: 'Learn how we helped a family reduce their energy bills by 40%.',
  },
  {
    title: 'Cooling Down a Garage for the Win!',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    excerpt: 'See how ductless systems transformed this workspace.',
  },
  {
    title: 'Commercial HVAC Efficiency: Energy Storage Systems',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop',
    excerpt: 'Exploring innovative solutions for business owners.',
  },
  {
    title: 'Mini-Split Solutions for Home Office Comfort',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    excerpt: 'Perfect climate control for remote workers.',
  },
];

const BlogSection = () => {
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
          Latest News & Blogs
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden hover-lift group bg-card h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-card-foreground mb-2 text-sm leading-tight line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <a 
                    href="#" 
                    className="text-primary text-sm font-semibold hover:text-navy-dark transition-colors inline-flex items-center gap-1 group/link"
                  >
                    Read More 
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
