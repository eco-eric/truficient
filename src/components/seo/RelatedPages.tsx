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

/**
 * Fetch and rank related pages for a location row. One round-trip; ranked and
 * de-duplicated client-side. Returns empty buckets when the page has no
 * groupable fields (caller renders nothing).
 */
export async function fetchRelatedPages(loc: RelatedSource): Promise<RelatedPagesData> {
  const orParts: string[] = [];
  if (loc.cluster) orParts.push(`cluster.eq.${loc.cluster}`);
  if (loc.city) orParts.push(`city.eq.${loc.city}`);
  if (loc.primary_service) orParts.push(`primary_service.eq.${loc.primary_service}`);
  if (orParts.length === 0) return { services: [], nearby: [] };

  const { data, error } = await supabase
    .from('seo_location_pages' as any)
    .select('url_slug, h1_title, neighborhood, city, primary_service, cluster')
    .eq('published', true)
    .neq('url_slug', loc.url_slug)
    .or(orParts.join(','))
    .limit(60);

  if (error || !data) return { services: [], nearby: [] };
  const rows = data as unknown as CandidateRow[];

  const selfPath = toCleanPath(loc.url_slug);
  const seen = new Set<string>([selfPath]);
  const services: RelatedItem[] = [];
  const nearby: RelatedItem[] = [];

  // Bucket 1 — same area, a DIFFERENT service (most relevant cross-sell).
  for (const r of rows) {
    if (services.length >= PER_BUCKET) break;
    const path = toCleanPath(r.url_slug);
    if (seen.has(path)) continue;
    const sameArea =
      (loc.neighborhood && r.neighborhood === loc.neighborhood) ||
      (loc.city && r.city === loc.city);
    const differentService = r.primary_service !== loc.primary_service;
    if (sameArea && differentService) {
      seen.add(path);
      services.push({ slug: path, label: labelFor(r) });
    }
  }

  // Bucket 2 — same region/city, a DIFFERENT area (nearby coverage).
  for (const r of rows) {
    if (nearby.length >= PER_BUCKET) break;
    const path = toCleanPath(r.url_slug);
    if (seen.has(path)) continue;
    const sameRegion =
      (loc.cluster && r.cluster === loc.cluster) ||
      (loc.city && r.city === loc.city);
    const differentArea = r.neighborhood !== loc.neighborhood;
    if (sameRegion && differentArea) {
      seen.add(path);
      nearby.push({ slug: path, label: labelFor(r) });
    }
  }

  // Backfill: if a bucket is thin, pull any remaining unseen candidates so no
  // page is left with too few links.
  if (services.length + nearby.length < PER_BUCKET) {
    for (const r of rows) {
      if (services.length + nearby.length >= PER_BUCKET * 2) break;
      const path = toCleanPath(r.url_slug);
      if (seen.has(path)) continue;
      seen.add(path);
      nearby.push({ slug: path, label: labelFor(r) });
    }
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
