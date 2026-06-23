import { SlidersHorizontal, Image as ImageIcon, Video, Grid2X2, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FilterSearch } from './FilterSearch';
import { ActiveFilters } from './ActiveFilters';
import type { Density } from './GalleryGrid';
import { POPULAR, facetValues, type Facet, type GalleryItem, type Selected } from '@/lib/gallery/facets';

interface Props {
  items: GalleryItem[];
  selected: Selected;
  density: Density;
  resultCount: number;
  activeCount: number;
  onPick: (facet: Facet, value: string) => void;
  onToggle: (facet: Facet, value: string) => void;
  onRemove: (facet: Facet, value: string) => void;
  onClear: () => void;
  onSetMedia: (v: 'Photos' | 'Videos' | null) => void;
  onDensity: (d: Density) => void;
  onOpenPanel: () => void;
}

export function GalleryToolbar(props: Props) {
  const { items, selected, density, resultCount, activeCount } = props;
  const mediaValue = selected.media[0] === 'Photos' ? 'photo' : selected.media[0] === 'Videos' ? 'video' : 'all';

  return (
    <div className="sticky top-[88px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center gap-3 py-3">
          <FilterSearch items={items} onPick={props.onPick} />
          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={mediaValue}
              onValueChange={(v) => { if (v) props.onSetMedia(v === 'photo' ? 'Photos' : v === 'video' ? 'Videos' : null); }}
              className="rounded-lg border bg-background"
            >
              <ToggleGroupItem value="all" className="h-9 px-3 text-xs font-semibold">All</ToggleGroupItem>
              <ToggleGroupItem value="photo" aria-label="Photos" className="h-9 px-3 text-xs font-semibold gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> Photos
              </ToggleGroupItem>
              <ToggleGroupItem value="video" aria-label="Videos" className="h-9 px-3 text-xs font-semibold gap-1">
                <Video className="h-3.5 w-3.5" /> Videos
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup
              type="single"
              value={density}
              onValueChange={(v) => v && props.onDensity(v as Density)}
              className="rounded-lg border bg-background"
            >
              <ToggleGroupItem value="comfortable" aria-label="Comfortable grid" className="h-9 px-2.5">
                <Grid2X2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="large" aria-label="Large grid" className="h-9 px-2.5">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <button
              onClick={props.onOpenPanel}
              className="inline-flex h-10 items-center gap-2 rounded-lg border-[1.5px] px-3.5 text-[13px] font-bold hover:border-primary"
            >
              <SlidersHorizontal className="h-4 w-4" /> More filters
              {activeCount > 0 && (
                <span className="rounded-full bg-secondary px-1.5 text-[11px] text-secondary-foreground">{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Popular chips */}
        <div className="flex flex-wrap items-center gap-2 pb-3">
          <span className="mr-0.5 text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground">Popular</span>
          {POPULAR.map(({ facet, value }) => {
            const count = facetValues(items, facet).find((v) => v.value === value)?.count || 0;
            if (!count) return null;
            const on = selected[facet].includes(value);
            return (
              <button
                key={`${facet}:${value}`}
                onClick={() => props.onToggle(facet, value)}
                className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border-[1.5px] px-3 text-[13.5px] font-semibold transition-colors ${
                  on ? 'border-secondary bg-secondary text-secondary-foreground' : 'border-border bg-background hover:border-primary'
                }`}
              >
                {value}
                <span className={`text-[12px] ${on ? 'opacity-70' : 'text-muted-foreground'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <ActiveFilters selected={selected} resultCount={resultCount} onRemove={props.onRemove} onClear={props.onClear} />
      </div>
    </div>
  );
}
