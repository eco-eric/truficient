import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { thumbnailUrl, buildImageSrcSet, GALLERY_SIZES } from '@/lib/imageUtils';
import { getTodaysFeaturedIds } from '@/lib/galleryRotation';

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
    queryKey: ['gallery-featured-daily'],
    queryFn: async () => {
      // Fetch all featured photo IDs first
      const { data: featured, error: featuredError } = await supabase
        .from('gallery_images')
        .select('id')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (featuredError) throw featuredError;

      const featuredIds = (featured || []).map(f => f.id);
      const todaysIds = getTodaysFeaturedIds(featuredIds, 8);

      // Fall back to most recent active photos if no featured set yet
      if (todaysIds.length === 0) {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('id, title, image_url, thumbnail_url, media_type, alt_text')
          .eq('is_active', true)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(8);
        if (error) throw error;
        return data as GalleryImage[];
      }

      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, thumbnail_url, media_type, alt_text')
        .in('id', todaysIds);
      if (error) throw error;
      // Preserve rotation order
      const byId = new Map((data as GalleryImage[]).map(img => [img.id, img]));
      return todaysIds.map(id => byId.get(id)).filter(Boolean) as GalleryImage[];
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
            const sourceUrl = isVideo && image.thumbnail_url ? image.thumbnail_url : image.image_url;
            const imgUrl = thumbnailUrl(sourceUrl);
            const imgSrcSet = buildImageSrcSet(sourceUrl);
            
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
                      src={imgUrl}
                      srcSet={imgSrcSet}
                      sizes={GALLERY_SIZES}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={400}
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