import { Play } from 'lucide-react';
import { thumbnailUrl, buildImageSrcSet } from '@/lib/imageUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { tileTags, type GalleryItem } from '@/lib/gallery/facets';

export type Density = 'comfortable' | 'large';

// More columns = smaller tiles so whole photos fit on screen (masonry keeps the
// full image — no crop). "large" is the fewer-columns / bigger option.
const COLS: Record<Density, string> = {
  comfortable: 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6',
  large: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
};

interface Props {
  items: GalleryItem[];
  loading: boolean;
  density: Density;
  hasFilters: boolean;
  onOpenAt: (index: number) => void;
  onClear: () => void;
}

export function GalleryGrid({ items, loading, density, hasFilters, onOpenAt, onClear }: Props) {
  if (loading) {
    return (
      <div className={`${COLS[density]} gap-3`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 w-full rounded-lg" style={{ height: 220 + (i % 4) * 70 }} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold">No matching photos</p>
        <p className="text-muted-foreground mt-1">Try removing a filter or searching a different ZIP, area, or brand.</p>
        {hasFilters && (
          <Button variant="outline" className="mt-4" onClick={onClear}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`${COLS[density]} gap-3`}>
      {items.map((item, index) => {
        const isVideo = item.media === 'video';
        const tags = tileTags(item);
        const thumbSrc = isVideo && item.thumbnailUrl ? item.thumbnailUrl : item.imageUrl;
        return (
          <button
            key={item.id}
            onClick={() => onOpenAt(index)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg bg-muted text-left shadow-sm"
          >
            {isVideo && !item.thumbnailUrl ? (
              <video src={item.imageUrl} muted playsInline className="w-full" />
            ) : (
              <img
                src={thumbnailUrl(thumbSrc)}
                srcSet={buildImageSrcSet(thumbSrc)}
                sizes="(min-width:1280px) 16vw, (min-width:1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33vw, 50vw"
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}

            {isVideo && (
              <>
                <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
                  ▶ VIDEO
                </span>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary">
                    <Play className="h-5 w-5 translate-x-0.5" />
                  </span>
                </span>
              </>
            )}

            {tags.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-3 pt-6 text-white opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
                {tags.map((t, i) => (
                  <span
                    key={t}
                    className={
                      i === 0
                        ? 'rounded-full bg-secondary px-2 py-0.5 text-[12px] font-semibold text-secondary-foreground'
                        : 'rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[12px] font-medium backdrop-blur-sm'
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
