import { X } from 'lucide-react';
import { FACET_LABEL, FACET_ORDER, type Facet, type Selected } from '@/lib/gallery/facets';

interface Props {
  selected: Selected;
  resultCount: number;
  onRemove: (facet: Facet, value: string) => void;
  onClear: () => void;
}

export function ActiveFilters({ selected, resultCount, onRemove, onClear }: Props) {
  const pills: { facet: Facet; value: string }[] = [];
  for (const f of [...FACET_ORDER, 'media'] as Facet[]) {
    for (const v of selected[f]) pills.push({ facet: f, value: v });
  }
  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-t border-dashed border-border/70 py-3">
      {pills.map(({ facet, value }) => (
        <span
          key={`${facet}:${value}`}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-primary bg-background py-1 pl-3 pr-1.5 text-[13px] font-bold text-primary"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {FACET_LABEL[facet]}
          </span>
          {value}
          <button
            aria-label={`Remove ${value}`}
            onClick={() => onRemove(facet, value)}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button onClick={onClear} className="text-[13px] font-bold text-secondary-foreground hover:underline">
        Clear all
      </button>
      <span className="ml-auto text-[13px] font-bold text-muted-foreground">
        {resultCount} result{resultCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}
