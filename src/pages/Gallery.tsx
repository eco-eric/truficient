import { useState, useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaLightbox } from '@/components/ui/media-lightbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePageSEO } from '@/hooks/usePageSEO';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Grid2X2, Grid3X3, LayoutGrid, Image as ImageIcon, Video, Play } from 'lucide-react';

type ThumbnailSize = 'small' | 'medium' | 'large';
type MediaFilter = 'all' | 'image' | 'video';

const PAGE_SIZE = 48;

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
  thumbnail_url: string | null;
  media_type: 'image' | 'video';
  alt_text: string | null;
  sort_order: number | null;
}

const Gallery = () => {
  usePageSEO();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('medium');

  // Fetch total count for display
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['gallery-images-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gallery_images')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
  });

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

  // Fetch image-tag relations (needed for filtering)
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

  // Get image IDs that match selected tags
  const filteredImageIds = useMemo(() => {
    if (selectedTags.length === 0) return null;
    const matchingIds = new Set<string>();
    imageTagRelations.forEach(r => {
      if (selectedTags.includes(r.tag_id)) {
        matchingIds.add(r.image_id);
      }
    });
    return Array.from(matchingIds);
  }, [selectedTags, imageTagRelations]);

  // Infinite query for images
  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-images-infinite', filteredImageIds],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('gallery_images')
        .select('id, title, description, image_url, thumbnail_url, media_type, alt_text, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      // If filtering by tags, only get matching images
      if (filteredImageIds && filteredImageIds.length > 0) {
        query = query.in('id', filteredImageIds);
      } else if (filteredImageIds && filteredImageIds.length === 0) {
        // No matches for selected tags
        return { images: [], nextPage: null };
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return {
        images: data as GalleryImage[],
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Flatten all pages and filter by media type
  const images = useMemo(() => {
    const allImages = imagesData?.pages.flatMap(page => page.images) || [];
    if (mediaFilter === 'all') return allImages;
    return allImages.filter(img => 
      mediaFilter === 'video' ? img.media_type === 'video' : img.media_type !== 'video'
    );
  }, [imagesData, mediaFilter]);

  // Calculate filtered count
  const filteredCount = selectedTags.length > 0 
    ? (filteredImageIds?.length || 0)
    : totalCount;

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const getImageTags = useCallback((imageId: string) => {
    const tagIds = imageTagRelations.filter(r => r.image_id === imageId).map(r => r.tag_id);
    return tags.filter(t => tagIds.includes(t.id));
  }, [imageTagRelations, tags]);

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
      setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const currentImage = images[selectedImageIndex];

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

      {/* Filter Bar and Photo Count */}
      <section className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Media type filter */}
              <Badge
                variant={mediaFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMediaFilter('all')}
              >
                All
              </Badge>
              <Badge
                variant={mediaFilter === 'image' ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => setMediaFilter('image')}
              >
                <ImageIcon className="w-3 h-3" />
                Photos
              </Badge>
              <Badge
                variant={mediaFilter === 'video' ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => setMediaFilter('video')}
              >
                <Video className="w-3 h-3" />
                Videos
              </Badge>
              
              {/* Tag filters */}
              {tags.length > 0 && (
                <>
                  <span className="text-muted-foreground mx-2">|</span>
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
                </>
              )}
            </div>
            
            {/* Right side - Photo count and thumbnail size */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{filteredCount.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">
                  {selectedTags.length > 0 && totalCount !== filteredCount
                    ? `of ${totalCount.toLocaleString()} Photos`
                    : 'Photos'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ToggleGroup 
                  type="single" 
                  value={thumbnailSize} 
                  onValueChange={(value) => value && setThumbnailSize(value as ThumbnailSize)}
                  className="border rounded-md bg-background"
                >
                  <ToggleGroupItem value="small" aria-label="Small thumbnails" className="px-2 h-8">
                    <Grid3X3 className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Medium thumbnails" className="px-2 h-8">
                    <Grid2X2 className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="large" aria-label="Large thumbnails" className="px-2 h-8">
                    <LayoutGrid className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
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
            <>
              <div className={`grid gap-4 ${
                thumbnailSize === 'small' 
                  ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8' 
                  : thumbnailSize === 'large' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {images.map((image, index) => {
                  const isVideo = image.media_type === 'video';
                  return (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index % PAGE_SIZE, 12) * 0.03 }}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                        {isVideo ? (
                          <>
                            {image.thumbnail_url ? (
                              <img
                                src={image.thumbnail_url}
                                alt={image.alt_text || image.title}
                                loading="lazy"
                                width={400}
                                height={400}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <video
                                src={image.image_url}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                muted
                                playsInline
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img
                            src={image.image_url}
                            alt={image.alt_text || image.title}
                            loading="lazy"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
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
                  );
                })}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more photos...</span>
                  </div>
                )}
                {!hasNextPage && images.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You've seen all {images.length.toLocaleString()} photos
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Enhanced Lightbox with Navigation */}
      {currentImage && (
        <MediaLightbox
          src={currentImage.image_url}
          alt={currentImage.alt_text || currentImage.title}
          mediaType={currentImage.media_type || 'image'}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}

      {/* Custom lightbox overlay for navigation when open */}
      {lightboxOpen && images.length > 1 && (
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
            {selectedImageIndex + 1} / {images.length}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
