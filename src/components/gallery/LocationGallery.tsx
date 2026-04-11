import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Loader2 } from 'lucide-react';

interface LocationGalleryProps {
  neighborhood: string;
  geographyTag?: string | null;
  zipTag?: string | null;
  cityTag?: string | null;
  serviceTags?: string[] | null;
  propertyTags?: string[] | null;
  galleryHeading?: string | null;
}

interface GalleryPhoto {
  id: string;
  title: string;
  image_url: string;
  alt_text: string | null;
  photo_date: string | null;
}

export const LocationGallery = ({
  neighborhood,
  geographyTag,
  zipTag,
  cityTag,
  serviceTags,
  propertyTags,
  galleryHeading,
}: LocationGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['location-gallery', geographyTag, zipTag, cityTag, serviceTags, propertyTags],
    queryFn: async () => {
      // Get all approved photos with their tags
      const { data: approvedImages, error } = await supabase
        .from('gallery_images')
        .select(`
          id, title, image_url, alt_text, photo_date, media_type,
          gallery_image_tags ( tag_id, gallery_tags ( name, slug, tag_type ) )
        `)
        .eq('approved_for_website', true)
        .eq('is_active', true)
        .neq('media_type', 'video')
        .order('photo_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!approvedImages || approvedImages.length === 0) return [];

      // Score each image based on tag matching (fallback chain)
      const scored = (approvedImages as any[]).map((img) => {
        const imgTags = (img.gallery_image_tags || []).map((rel: any) => ({
          name: rel.gallery_tags?.name?.toLowerCase() || '',
          slug: rel.gallery_tags?.slug || '',
          type: rel.gallery_tags?.tag_type || '',
        }));

        let score = 0;
        
        // Geography match (highest priority)
        if (geographyTag && imgTags.some((t: any) => t.slug === geographyTag.toLowerCase() || t.name === geographyTag.toLowerCase())) {
          score += 100;
        }
        
        // ZIP match
        if (zipTag && imgTags.some((t: any) => t.slug === zipTag || t.name === zipTag)) {
          score += 50;
        }
        
        // City match
        if (cityTag && imgTags.some((t: any) => t.slug === cityTag.toLowerCase() || t.name === cityTag.toLowerCase())) {
          score += 25;
        }
        
        // Service match
        if (serviceTags?.length) {
          const serviceMatches = serviceTags.filter(st =>
            imgTags.some((t: any) => t.slug === st.toLowerCase().replace(/\s+/g, '-') || t.name === st.toLowerCase())
          );
          score += serviceMatches.length * 30;
        }
        
        // Property match
        if (propertyTags?.length) {
          const propMatches = propertyTags.filter(pt =>
            imgTags.some((t: any) => t.slug === pt.toLowerCase().replace(/\s+/g, '-') || t.name === pt.toLowerCase())
          );
          score += propMatches.length * 10;
        }

        // Minimum score of 1 for branded fallback
        if (score === 0) score = 1;

        return { ...img, score };
      });

      // Sort by score descending, take top 9
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 9) as GalleryPhoto[];
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <section className="mt-12" id="gallery">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (photos.length === 0) return null;

  const heading = galleryHeading || `Our Work in ${neighborhood}`;

  return (
    <section className="mt-12" id="gallery">
      <h2 className="text-xl font-bold mb-6 text-foreground">{heading}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => { setSelectedPhoto(photo); setLightboxOpen(true); }}
          >
            <img
              src={photo.image_url}
              alt={photo.alt_text || photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <ImageLightbox
          src={selectedPhoto.image_url}
          alt={selectedPhoto.alt_text || selectedPhoto.title}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </section>
  );
};
