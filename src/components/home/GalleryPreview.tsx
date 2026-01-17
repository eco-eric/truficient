import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  alt_text: string | null;
}

const GalleryPreview = () => {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, alt_text')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order')
        .limit(6);
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  // Don't render if no featured images
  if (isLoading || images.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See Our Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our gallery of completed installations across the Dallas-Fort Worth area.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {images.slice(0, 6).map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to="/gallery" className="block">
                <div className="aspect-square overflow-hidden rounded-lg bg-card">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/gallery">
            <Button variant="outline" size="lg">
              View Full Gallery
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryPreview;