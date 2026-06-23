import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { displayUrl } from '@/lib/imageUtils';
import { classifyTag, FACET_LABEL, type Facet, type GalleryItem } from '@/lib/gallery/facets';

const PHONE = '214-238-4349';
const PHONE_TEL = 'tel:2142384349';

interface Props {
  items: GalleryItem[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  onPickTag: (facet: Facet, value: string) => void;
}

export function GalleryLightbox({ items, index, open, onOpenChange, onIndexChange, onPickTag }: Props) {
  const item = items[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, items.length, onIndexChange]);

  if (!item) return null;

  const loc = [item.facets.neighborhood[0], item.facets.city[0], item.facets.zip[0]]
    .filter(Boolean)
    .join(', ');
  const title = [item.facets.service[0] || 'Installation', item.facets.brand[0]].filter(Boolean).join(' — ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">{title || item.title || item.alt}</DialogTitle>
        <div className="grid md:grid-cols-[1.4fr_0.9fr] max-h-[90vh]">
          {/* Media */}
          <div className="relative bg-black flex items-center justify-center min-h-[40vh]">
            {item.media === 'video' ? (
              <video src={item.imageUrl} controls playsInline className="w-full max-h-[90vh] object-contain" />
            ) : (
              <img src={displayUrl(item.imageUrl)} alt={item.alt} className="w-full max-h-[90vh] object-contain" />
            )}
            {items.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 hover:bg-background w-9 h-9 flex items-center justify-center"
                  onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 hover:bg-background w-9 h-9 flex items-center justify-center"
                  onClick={() => onIndexChange((index + 1) % items.length)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="p-6 overflow-auto">
            <h3 className="text-lg font-bold">{title || item.title}</h3>
            {loc && <p className="text-sm text-muted-foreground mb-4">{loc}</p>}
            {item.tagNames.length > 0 && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-3 mb-2">
                  Tags (click to filter)
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tagNames.map((name) => {
                    const facet = classifyTag(name);
                    return (
                      <button
                        key={name}
                        title={`Filter by ${FACET_LABEL[facet]}: ${name}`}
                        onClick={() => onPickTag(facet, name)}
                        className="rounded-full border border-border px-3 py-1 text-[13px] font-medium hover:border-secondary hover:text-secondary-foreground transition-colors"
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <a
              href={PHONE_TEL}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary text-secondary-foreground px-4 py-2.5 font-bold text-sm"
            >
              <Phone className="w-4 h-4" /> Get a quote — {PHONE}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
