import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  publishedAt?: string;
}

const BlogPreview = ({
  title,
  excerpt,
  content,
  featuredImage,
  category,
  tags,
  publishedAt,
}: BlogPreviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Simulated Blog Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] text-white p-6">
        <h1 className="text-2xl font-bold mb-3 leading-tight">
          {title || 'Untitled Post'}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              {publishedAt
                ? format(new Date(publishedAt), 'MMMM d, yyyy')
                : format(new Date(), 'MMMM d, yyyy')}
            </span>
          </div>
          
          {category && (
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              {category}
            </Badge>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-white/80 border-white/30 text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Featured Image */}
      {featuredImage && (
        <div className="mx-4 -mt-4 relative z-10">
          <img
            src={featuredImage}
            alt={title || 'Featured image'}
            className="w-full aspect-video object-cover rounded-lg shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content Preview */}
      <div className="p-6">
        {excerpt && (
          <p className="text-lg text-muted-foreground mb-6 italic">
            {excerpt}
          </p>
        )}

        {content ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-muted-foreground italic">
            Start writing content to see the preview...
          </p>
        )}
      </div>
    </div>
  );
};

export default BlogPreview;
