import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url: string | null;
  media_type: 'image' | 'video';
  alt_text: string | null;
}

const GalleryPreview = () => {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, thumbnail_url, media_type, alt_text')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(8);
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {images.slice(0, 8).map((image, index) => {
            const isVideo = image.media_type === 'video';
            const displayUrl = isVideo && image.thumbnail_url 
              ? image.thumbnail_url 
              : image.image_url;
            
            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link to="/gallery" className="block">
                  <div className="aspect-square overflow-hidden rounded-lg bg-card relative">
                    <img
                      src={displayUrl}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
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