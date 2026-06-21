/**
 * Sync per-page Open Graph and Twitter Card meta tags with the page's
 * <title>, <meta name="description">, and canonical URL.
 *
 * Why this exists
 * ---------------
 * Pages like /hvac-:zip (LocationPage) and /equipment/:slug (EquipmentDetail)
 * set their own <title>, description, and canonical client-side, but never
 * touched og:* / twitter:* tags. That left every sub-page emitting the
 * homepage's social tags — wrong URL, wrong title, wrong description when
 * shared on Facebook, Twitter, Slack, LinkedIn, etc.
 *
 * Globally-stable tags (og:image, og:site_name, og:locale, og:type,
 * twitter:card, twitter:image) are intentionally NOT touched here — they
 * stay at the values set in index.html unless an explicit override is
 * passed in.
 */

const SITE_ORIGIN = 'https://truficient.com';

/**
 * Normalise a path or absolute URL to the site-wide canonical form:
 * https, non-www, clean path, TRAILING SLASH
 * (e.g. https://truficient.com/hvac-garland-tx/).
 *
 * This is the single source of truth for the canonical URL shape, shared by
 * the client (usePageSEO, LocationPage, BlogPost, EquipmentDetail) and mirrored
 * by the build-time prerender (scripts/prerender.mjs) so the raw HTML and the
 * hydrated DOM never disagree. Off-origin absolute URLs are returned unchanged
 * so intentional cross-site canonicals are preserved.
 */
export function cleanCanonicalUrl(input: string): string {
  let s = (input || '').trim();
  if (/^https?:\/\//i.test(s)) {
    const host = s.replace(/^https?:\/\//i, '').split('/')[0].replace(/^www\./i, '');
    if (host !== 'truficient.com') return s; // off-origin — respect as authored
    s = s.replace(/^https?:\/\/[^/]+/i, '');
  }
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\/{2,}/g, '/').replace(/\.html$/i, '');
  if (s === '/' || s === '') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${s.replace(/\/+$/, '')}/`;
}

export interface SocialMetaInput {
  /** Page <title> equivalent — used for og:title & twitter:title. */
  title?: string | null;
  /** Page meta description equivalent — used for og:description & twitter:description. */
  description?: string | null;
  /** Canonical URL — used for og:url & twitter:url. */
  url?: string | null;
  /** Optional per-page social image override. */
  image?: string | null;
}

function upsertMeta(
  selector: string,
  attr: 'property' | 'name',
  key: string,
  content: string,
) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setSocialMetaTags({ title, description, url, image }: SocialMetaInput) {
  if (typeof document === 'undefined') return;

  if (title) {
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  }
  if (description) {
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }
  if (url) {
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[name="twitter:url"]', 'name', 'twitter:url', url);
  }
  if (image) {
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  }
}
