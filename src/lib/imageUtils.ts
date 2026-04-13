/**
 * Image URL helpers.
 * Returns original URLs directly — Supabase image transforms require a Pro plan.
 * Performance is handled via loading="lazy", width/height attributes, and WebP source images.
 */

export function optimizeImageUrl(
  url: string | null | undefined,
  _opts?: { width?: number; quality?: number; format?: string }
): string {
  if (!url) return '/placeholder.svg';
  return url;
}

/** Shorthand for gallery thumbnails */
export const thumbnailUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url);

/** Shorthand for full-size gallery / blog images */
export const displayUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url);

/** Shorthand for blog card previews */
export const cardImageUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url);
