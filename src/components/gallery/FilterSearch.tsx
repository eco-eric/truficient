import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { facetValues, FACET_LABEL, type Facet, type GalleryItem } from '@/lib/gallery/facets';

const SEARCH_FACETS: Facet[] = ['zip', 'neighborhood', 'city', 'brand', 'systemType', 'application', 'service', 'other'];

interface Props {
  items: GalleryItem[];
  onPick: (facet: Facet, value: string) => void;
}

export function FilterSearch({ items, onPick }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<number>();
  const boxRef = useRef<HTMLDivElement>(null);

  // Close the suggestion dropdown on any click outside the search box.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return SEARCH_FACETS.map((facet) => ({
      facet,
      hits: facetValues(items, facet)
        .filter(({ value }) => value.toLowerCase().includes(query))
        .slice(0, 8),
    })).filter((g) => g.hits.length);
  }, [q, items]);

  const flat = useMemo(() => groups.flatMap((g) => g.hits.map((h) => ({ facet: g.facet, value: h.value }))), [groups]);

  const pick = (facet: Facet, value: string) => {
    onPick(facet, value);
    setQ('');
    setOpen(false);
    setActive(0);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-[480px] min-w-[240px] flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => q && setOpen(true)}
        onBlur={() => { blurTimer.current = window.setTimeout(() => setOpen(false), 120); }}
        onKeyDown={(e) => {
          if (!open || !flat.length) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter') { e.preventDefault(); const s = flat[active]; if (s) pick(s.facet, s.value); }
          else if (e.key === 'Escape') { setOpen(false); }
        }}
        placeholder="Search ZIP, neighborhood, brand, or system…"
        className="h-[46px] pl-11 text-[15px]"
        aria-label="Search filters"
        autoComplete="off"
      />
      {open && q.trim() && (
        <div
          className="absolute left-0 right-0 top-[52px] z-[60] max-h-[360px] overflow-auto rounded-xl border border-border bg-popover shadow-lg"
          onMouseDown={(e) => { e.preventDefault(); window.clearTimeout(blurTimer.current); }}
        >
          {flat.length === 0 ? (
            <div className="p-3.5 text-[13px] text-muted-foreground">No filters match “{q.trim()}”.</div>
          ) : (
            groups.map((g) => (
              <div key={g.facet} className="py-1">
                <h4 className="px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {FACET_LABEL[g.facet]}
                </h4>
                {g.hits.map((h) => {
                  const idx = flat.findIndex((x) => x.facet === g.facet && x.value === h.value);
                  return (
                    <button
                      key={h.value}
                      onClick={() => pick(g.facet, h.value)}
                      onMouseEnter={() => setActive(idx)}
                      className={`flex w-full items-center justify-between gap-2.5 px-3.5 py-2 text-left text-sm ${
                        idx === active ? 'bg-accent' : ''
                      }`}
                    >
                      <span>{h.value}</span>
                      <span className="text-[12.5px] text-muted-foreground">{h.count}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
