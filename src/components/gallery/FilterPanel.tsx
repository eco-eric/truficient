import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  FACET_ORDER, FACET_LABEL, facetValues, contextualCount,
  type Facet, type GalleryItem, type Selected,
} from '@/lib/gallery/facets';

const ZIP_PREVIEW = 8;

interface Props {
  items: GalleryItem[];
  selected: Selected;
  resultCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (facet: Facet, value: string) => void;
  onClear: () => void;
}

export function FilterPanel({ items, selected, resultCount, open, onOpenChange, onToggle, onClear }: Props) {
  const [openFacets, setOpenFacets] = useState<Set<Facet>>(new Set(['city', 'neighborhood']));
  const [zipExpanded, setZipExpanded] = useState(false);

  const toggleFacet = (f: Facet) =>
    setOpenFacets((prev) => {
      const n = new Set(prev);
      n.has(f) ? n.delete(f) : n.add(f);
      return n;
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] max-w-[92vw] p-0 flex flex-col gap-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>More filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto">
          {FACET_ORDER.map((facet) => {
            const all = facetValues(items, facet);
            if (!all.length) return null;
            const isOpen = openFacets.has(facet);
            const selN = selected[facet].length;
            const visible = facet === 'zip' && !zipExpanded ? all.slice(0, ZIP_PREVIEW) : all;

            return (
              <div key={facet} className="border-b">
                <button
                  onClick={() => toggleFacet(facet)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-extrabold"
                >
                  <span>
                    {FACET_LABEL[facet]}
                    {selN > 0 && <span className="ml-2 text-xs font-semibold text-muted-foreground">· {selN} selected</span>}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="flex flex-wrap gap-2 px-4 pb-3.5">
                    {visible.map(({ value }) => {
                      const on = selected[facet].includes(value);
                      const count = contextualCount(items, selected, facet, value);
                      if (!count && !on) return null; // hide zero-count unless selected
                      return (
                        <button
                          key={value}
                          onClick={() => onToggle(facet, value)}
                          className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-[13px] font-semibold transition-colors ${
                            on
                              ? 'border-secondary bg-secondary text-secondary-foreground'
                              : 'border-border bg-background hover:border-primary'
                          }`}
                        >
                          {value}
                          <span className={`text-[11.5px] ${on ? 'opacity-70' : 'text-muted-foreground'}`}>{count}</span>
                        </button>
                      );
                    })}
                    {facet === 'zip' && all.length > ZIP_PREVIEW && (
                      <button
                        onClick={() => setZipExpanded((v) => !v)}
                        className="mt-1 basis-full text-left text-[12.5px] font-bold text-secondary-foreground hover:underline"
                      >
                        {zipExpanded ? 'Show fewer ZIPs' : `Show all ${all.length} ZIPs`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SheetFooter className="flex-row gap-2.5 border-t px-5 py-3.5">
          <Button variant="secondary" className="flex-1 bg-muted text-foreground hover:bg-muted/80" onClick={onClear}>
            Clear all
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Show {resultCount} result{resultCount === 1 ? '' : 's'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
