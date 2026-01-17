import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ServiceGalleryProps {
  serviceTag: string;
  title?: string;
  subtitle?: string;
}

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  alt_text: string | null;
}

const ServiceGallery = ({ 
  serviceTag, 
  title = "Recent Installations",
  subtitle
}: ServiceGalleryProps) => {
  // First get the tag id
  const { data: tag } = useQuery({
    queryKey: ['gallery-tag', serviceTag],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_tags')
        .select('id')
        .eq('slug', serviceTag)
        .eq('is_active', true)
        .single();
      if (error) return null;
      return data;
    },
  });

  // Then get images with that tag
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-service', serviceTag],
    queryFn: async () => {
      if (!tag) return [];

      // Get image IDs that have this tag
      const { data: relations, error: relError } = await supabase
        .from('gallery_image_tags')
        .select('image_id')
        .eq('tag_id', tag.id);
      
      if (relError || !relations.length) return [];

      const imageIds = relations.map(r => r.image_id);

      // Get the actual images
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, alt_text')
        .eq('is_active', true)
        .in('id', imageIds)
        .order('sort_order')
        .limit(4);

      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!tag,
  });

  // Don't render if no images
  if (isLoading || images.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/gallery?tag=${serviceTag}`} className="block">
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
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-6"
        >
          <Link to={`/gallery?tag=${serviceTag}`}>
            <Button variant="outline">
              View More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceGallery;