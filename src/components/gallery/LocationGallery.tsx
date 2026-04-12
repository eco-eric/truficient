import { useState } from 'react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Loader2 } from 'lucide-react';
import { useLocationGalleryPhotos, type GalleryPhoto } from '@/hooks/useLocationGalleryPhotos';

interface LocationGalleryProps {
  neighborhood: string;
  geographyTag?: string | null;
  zipTag?: string | null;
  cityTag?: string | null;
  serviceTags?: string[] | null;
  propertyTags?: string[] | null;
  galleryHeading?: string | null;
  /** Max photos to display (default 9) */
  maxPhotos?: number;
  /** Skip this many photos from the scored list (for second inline gallery) */
  offset?: number;
  /** Compact mode — smaller spacing, no heading */
  compact?: boolean;
  /** Pass pre-fetched photos to avoid duplicate queries */
  photos?: GalleryPhoto[];
  isLoading?: boolean;
}

export const LocationGallery = ({
  neighborhood,
  geographyTag,
  zipTag,
  cityTag,
  serviceTags,
  propertyTags,
  galleryHeading,
  maxPhotos = 9,
  offset = 0,
  compact = false,
  photos: externalPhotos,
  isLoading: externalLoading,
}: LocationGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  // Use shared hook only if photos not passed externally
  const { data: fetchedPhotos = [], isLoading: queryLoading } = useLocationGalleryPhotos({
    geographyTag,
    zipTag,
    cityTag,
    serviceTags,
    propertyTags,
  });

  const allPhotos = externalPhotos ?? fetchedPhotos;
  const loading = externalPhotos ? (externalLoading ?? false) : queryLoading;
  const slicedPhotos = allPhotos.slice(offset, offset + maxPhotos);

  if (loading) {
    return (
      <section className={compact ? 'my-6' : 'mt-12'} id={offset === 0 ? 'gallery' : undefined}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (slicedPhotos.length === 0) return null;

  const heading = galleryHeading || `Our Work in ${neighborhood}`;

  return (
    <section className={compact ? 'my-6' : 'mt-12'} id={offset === 0 ? 'gallery' : undefined}>
      {!compact && (
        <h2 className="text-xl font-bold mb-6 text-foreground">{heading}</h2>
      )}
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-4 gap-2' : 'grid-cols-2 sm:grid-cols-3 gap-3'}`}>
        {slicedPhotos.map((photo) => (
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
              width={400}
              height={400}
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
