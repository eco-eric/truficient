import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { usePageSEO } from '@/hooks/usePageSEO';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryTag {
  id: string;
  name: string;
  slug: string;
}

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
}

const Gallery = () => {
  usePageSEO();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['gallery-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_tags')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as GalleryTag[];
    },
  });

  // Fetch images
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, description, image_url, alt_text')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  // Fetch image-tag relations
  const { data: imageTagRelations = [] } = useQuery({
    queryKey: ['gallery-image-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_image_tags')
        .select('image_id, tag_id');
      if (error) throw error;
      return data;
    },
  });

  // Filter images based on selected tags
  const filteredImages = selectedTags.length === 0
    ? images
    : images.filter(image => {
        const imageTags = imageTagRelations
          .filter(r => r.image_id === image.id)
          .map(r => r.tag_id);
        return selectedTags.some(tagId => imageTags.includes(tagId));
      });

  const getImageTags = (imageId: string) => {
    const tagIds = imageTagRelations.filter(r => r.image_id === imageId).map(r => r.tag_id);
    return tags.filter(t => tagIds.includes(t.id));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => (prev === 0 ? filteredImages.length - 1 : prev - 1));
    } else {
      setSelectedImageIndex(prev => (prev === filteredImages.length - 1 ? 0 : prev + 1));
    }
  };

  const currentImage = filteredImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Work</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Browse our gallery of HVAC installations, from ductless mini-splits to complete residential systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      {tags.length > 0 && (
        <section className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
              <Badge
                variant={selectedTags.length === 0 ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTags([])}
              >
                All
              </Badge>
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {selectedTags.length > 0
                  ? 'No images found with the selected filters.'
                  : 'No images in the gallery yet.'}
              </p>
              {selectedTags.length > 0 && (
                <Button variant="outline" className="mt-4" onClick={() => setSelectedTags([])}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-medium text-sm">{image.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getImageTags(image.id).slice(0, 2).map(tag => (
                            <span key={tag.id} className="text-xs bg-white/20 px-2 py-0.5 rounded">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Lightbox with Navigation */}
      {currentImage && (
        <ImageLightbox
          src={currentImage.image_url}
          alt={currentImage.alt_text || currentImage.title}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}

      {/* Custom lightbox overlay for navigation when open */}
      {lightboxOpen && filteredImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] bg-background/80 hover:bg-background rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] bg-background/80 hover:bg-background rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-background/80 px-4 py-2 rounded-full text-sm">
            {selectedImageIndex + 1} / {filteredImages.length}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;