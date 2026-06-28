import { Link } from 'react-router-dom';
import { MapPin, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Deterministic internal-linking backbone for location/service pages.
 *
 * Every seo_location_pages leaf renders this block, so every page gets a set of
 * crawlable, descriptive-anchor internal links WITHOUT per-page content edits.
 * Because the relationship is reciprocal (A lists B → B lists A), this also
 * creates inbound links, which is what clears orphaned pages.
 *
 * Links are computed client-side from the page's own fields and embedded into
 * the SSG payload (see LocationPage), so the prerender snapshot bakes them into
 * the static HTML. All hrefs are normalized to the canonical extensionless
 * trailing-slash form (never `.html`) per the repo SEO guardrails (CLAUDE.md).
 */

export interface RelatedItem {
  slug: string;   // canonical path, e.g. "/ductless-hvac-lakewood-dallas/"
  label: string;  // descriptive anchor text
}

export interface RelatedPagesData {
  services: RelatedItem[];  // same area, different service
  nearby: RelatedItem[];    // same region/city, different area
}

/** Source fields needed to compute related pages. */
export interface RelatedSource {
  url_slug: string;
  cluster: string | null;
  city: string | null;
  neighborhood: string | null;
  primary_service: string | null;
}

interface CandidateRow {
  url_slug: string;
  h1_title: string | null;
  neighborhood: string | null;
  city: string | null;
  primary_service: string | null;
  cluster: string | null;
}

/** Normalize a stored url_slug to the canonical extensionless trailing-slash path. */
export function toCleanPath(slug: string): string {
  if (!slug) return '/';
  let p = slug.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/[#?].*$/, '').replace(/\.html$/i, '').replace(/\/+$/, '');
  return p === '' ? '/' : `${p}/`;
}

function labelFor(row: CandidateRow): string {
  if (row.h1_title?.trim()) return row.h1_title.trim();
  if (row.primary_service && row.neighborhood) return `${row.primary_service} in ${row.neighborhood}`;
  if (row.primary_service && row.city) return `${row.primary_service} in ${row.city}`;
  return row.neighborhood || row.city || 'HVAC services';
}

const PER_BUCKET = 5;
const COLS = 'url_slug, h1_title, neighborhood, city, primary_service, cluster';

async function queryPages(
  column: 'neighborhood' | 'cluster' | 'primary_service',
  value: string,
  excludeSlug: string,
  limit: number,
): Promise<CandidateRow[]> {
  const { data, error } = await supabase
    .from('seo_location_pages' as any)
    .select(COLS)
    .eq('published', true)
    .eq(column, value)
    .neq('url_slug', excludeSlug)
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as CandidateRow[];
}

/**
 * Fetch and rank related pages for a location row, prioritising specificity:
 * same NEIGHBORHOOD (the true siblings) > same CLUSTER (region) > same SERVICE
 * elsewhere. Three small targeted queries run in parallel — far more relevant
 * than one broad city-wide query (a city like "Dallas" has hundreds of pages,
 * so a single capped query never surfaces the same-neighborhood siblings).
 * Returns empty buckets when the page has no groupable fields.
 */
export async function fetchRelatedPages(loc: RelatedSource): Promise<RelatedPagesData> {
  const [sameHood, sameCluster, sameService] = await Promise.all([
    loc.neighborhood ? queryPages('neighborhood', loc.neighborhood, loc.url_slug, 25) : Promise.resolve([]),
    loc.cluster ? queryPages('cluster', loc.cluster, loc.url_slug, 40) : Promise.resolve([]),
    loc.primary_service ? queryPages('primary_service', loc.primary_service, loc.url_slug, 25) : Promise.resolve([]),
  ]);

  const seen = new Set<string>([toCleanPath(loc.url_slug)]);
  const take = (rows: CandidateRow[], bucket: RelatedItem[], cap: number, keep: (r: CandidateRow) => boolean) => {
    for (const r of rows) {
      if (bucket.length >= cap) break;
      const path = toCleanPath(r.url_slug);
      if (seen.has(path) || !keep(r)) continue;
      seen.add(path);
      bucket.push({ slug: path, label: labelFor(r) });
    }
  };

  // Bucket 1 — "Related HVAC Services": same neighborhood, a DIFFERENT service
  // (the true siblings, e.g. ductless / heat-pump / AC-repair in this area).
  // Backfilled with same-cluster different-service if the neighborhood is thin.
  const services: RelatedItem[] = [];
  take(sameHood, services, PER_BUCKET, (r) => r.primary_service !== loc.primary_service);
  if (services.length < PER_BUCKET) {
    take(sameCluster, services, PER_BUCKET, (r) => r.primary_service !== loc.primary_service);
  }

  // Bucket 2 — "Nearby Service Areas": same region, a DIFFERENT neighborhood;
  // backfilled with the same service in other areas.
  const nearby: RelatedItem[] = [];
  take(sameCluster, nearby, PER_BUCKET, (r) => r.neighborhood !== loc.neighborhood);
  if (nearby.length < PER_BUCKET) {
    take(sameService, nearby, PER_BUCKET, (r) => r.neighborhood !== loc.neighborhood);
  }

  return { services, nearby };
}

function LinkList({ items }: { items: RelatedItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.slug}>
          <Link to={it.slug} className="text-primary hover:underline text-sm">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RelatedPages({ data }: { data: RelatedPagesData | null }) {
  if (!data) return null;
  const { services, nearby } = data;
  if (services.length === 0 && nearby.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pb-16" aria-label="Related pages">
      <div className="max-w-3xl mx-auto pt-8 border-t border-border">
        <h2 className="text-xl font-bold mb-6 text-foreground">Related Services &amp; Nearby Areas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {services.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" /> Related HVAC Services
              </h3>
              <LinkList items={services} />
            </div>
          )}
          {nearby.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Nearby Service Areas
              </h3>
              <LinkList items={nearby} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RelatedPages;
