import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { GalleryToolbar } from '@/components/gallery/GalleryToolbar';
import { GalleryGrid, type Density } from '@/components/gallery/GalleryGrid';
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import { FilterPanel } from '@/components/gallery/FilterPanel';
import { useGalleryFilters } from '@/lib/gallery/useGalleryFilters';
import { buildGalleryItems, filterItems, type Facet } from '@/lib/gallery/facets';

const Gallery = () => {
  usePageSEO();
  const { selected, toggle, add, remove, setMedia, clearAll, activeCount } = useGalleryFilters();
  const [density, setDensity] = useState<Density>('comfortable');
  const [panelOpen, setPanelOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: rawImages = [], isLoading } = useQuery({
    queryKey: ['gallery-all-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, thumbnail_url, media_type, alt_text, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data;
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['gallery-tags-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_tags').select('id, name').eq('is_active', true);
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const { data: relations = [] } = useQuery({
    queryKey: ['gallery-image-tags-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_image_tags').select('image_id, tag_id');
      if (error) throw error;
      return data as { image_id: string; tag_id: string }[];
    },
  });

  const items = useMemo(
    () => buildGalleryItems(rawImages, new Map(tags.map((t) => [t.id, t.name])), relations),
    [rawImages, tags, relations],
  );
  const filtered = useMemo(() => filterItems(items, selected), [items, selected]);

  const openAt = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const pickFromSearch = (facet: Facet, value: string) => add(facet, value);
  const pickFromLightbox = (facet: Facet, value: string) => { add(facet, value); setLightboxOpen(false); };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero (shorter) */}
      <section className="border-b bg-card py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Our Work<span className="text-secondary">.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse {items.length ? `${items.length} ` : ''}HVAC installations across Dallas–Fort Worth.
          </p>
        </div>
      </section>

      <GalleryToolbar
        items={items}
        selected={selected}
        density={density}
        resultCount={filtered.length}
        activeCount={activeCount}
        onPick={pickFromSearch}
        onToggle={toggle}
        onRemove={remove}
        onClear={clearAll}
        onSetMedia={setMedia}
        onDensity={setDensity}
        onOpenPanel={() => setPanelOpen(true)}
      />

      <main className="py-6 pb-16">
        <div className="container mx-auto px-4">
          <GalleryGrid
            items={filtered}
            loading={isLoading}
            density={density}
            hasFilters={activeCount > 0}
            onOpenAt={openAt}
            onClear={clearAll}
          />
        </div>
      </main>

      <FilterPanel
        items={items}
        selected={selected}
        resultCount={filtered.length}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onToggle={toggle}
        onClear={clearAll}
      />

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
        onPickTag={pickFromLightbox}
      />

      <Footer />
    </div>
  );
};

export default Gallery;
