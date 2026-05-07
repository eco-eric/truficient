import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BlogHeroImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  shadow?: boolean;
}

/**
 * Responsive blog hero image that adapts its container to the image's
 * natural aspect ratio. Always uses object-contain so the full image is
 * visible — letterboxes on a soft background instead of cropping.
 */
const BlogHeroImage = ({
  src,
  alt,
  caption,
  className,
  shadow = true,
}: BlogHeroImageProps) => {
  const [ratio, setRatio] = useState<number | null>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setRatio(naturalWidth / naturalHeight);
    }
  };

  // Decide container shape from ratio
  let containerClasses = 'aspect-[16/9]'; // default while loading / wide
  let extraStyle: React.CSSProperties = {};

  if (ratio !== null) {
    if (ratio > 1.5) {
      containerClasses = 'aspect-[16/9]';
    } else if (ratio >= 0.8) {
      // square-ish — use the actual ratio so we don't add extra letterbox
      containerClasses = '';
      extraStyle = { aspectRatio: `${ratio}` };
    } else {
      // tall image — cap height
      containerClasses = 'max-h-[600px]';
      extraStyle = { aspectRatio: `${ratio}` };
    }
  }

  return (
    <figure className={cn('w-full max-w-5xl mx-auto', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-lg bg-slate-50 dark:bg-muted',
          shadow && 'shadow-lg',
          containerClasses
        )}
        style={extraStyle}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          className="w-full h-full object-contain"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default BlogHeroImage;
