/**
 * Append Supabase image transformation params to storage URLs.
 * Non-Supabase URLs are returned unchanged.
 */
const SUPABASE_STORAGE_PATTERN = /\.supabase\.co\/storage\/v1\/object\/public\//;

export function optimizeImageUrl(
  url: string | null | undefined,
  opts: { width?: number; quality?: number; format?: string } = {}
): string {
  if (!url) return '/placeholder.svg';
  if (!SUPABASE_STORAGE_PATTERN.test(url)) return url;

  const { width = 800, quality = 80, format = 'webp' } = opts;

  // Replace /object/public/ with /object/public/ → /render/image/public/ for transforms
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const separator = transformUrl.includes('?') ? '&' : '?';
  return `${transformUrl}${separator}width=${width}&quality=${quality}&format=${format}`;
}

/** Shorthand for gallery thumbnails */
export const thumbnailUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url, { width: 400, quality: 75 });

/** Shorthand for full-size gallery / blog images */
export const displayUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url, { width: 800, quality: 80 });

/** Shorthand for blog card previews */
export const cardImageUrl = (url: string | null | undefined) =>
  optimizeImageUrl(url, { width: 600, quality: 75 });
