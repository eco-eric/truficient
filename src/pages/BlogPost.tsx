import { useState, useEffect, useRef, useCallback } from 'react';
import { displayUrl } from '@/lib/imageUtils';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import BlogHeroImage from '@/components/blog/BlogHeroImage';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, ArrowLeft, Tag, User, Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
  category: string | null;
  tags: string[] | null;
  noindex: boolean;
  canonical_url: string | null;
  author_name: string | null;
  author_bio: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  updated_at: string | null;
}

// Component that wraps iframes in expandable containers
const BlogContent = ({ html }: { html: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const iframes = contentRef.current.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      // Find the parent container — blog HTML already wraps iframes in a
      // positioned div with padding-bottom for aspect ratio
      const parent = iframe.parentElement;
      if (!parent || parent.classList.contains('blog-iframe-styled')) return;

      // Style the existing parent as our wrapper (it already has position:relative + padding-bottom)
      parent.classList.add('blog-iframe-styled', 'blog-iframe-wrapper', 'not-prose');
    });
  }, [html]);

  return <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlogPostPage = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = rawSlug?.replace(/\.html$/, '');
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('blog_posts' as any)
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .single();

        if (error) throw error;
        setPost(data as unknown as BlogPost);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Set meta tags and structured data
  useEffect(() => {
    if (!post) return;

    // Update page title
    document.title = post.meta_title || `${post.title} | Truficient Energy Solutions`;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', post.meta_description || post.excerpt || '');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = post.meta_description || post.excerpt || '';
      document.head.appendChild(meta);
    }

    // Set robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (post.noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = post.canonical_url || `https://truficient.com/blog/${post.slug}`;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Set Open Graph tags
    const setOgMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setOgMeta('og:type', 'article');
    setOgMeta('og:title', post.og_title || post.meta_title || post.title);
    setOgMeta('og:description', post.og_description || post.meta_description || post.excerpt || '');
    setOgMeta('og:image', post.og_image || post.featured_image || '/og-image.png');
    setOgMeta('og:url', canonicalUrl);
    setOgMeta('article:published_time', post.published_at);
    if (post.updated_at) {
      setOgMeta('article:modified_time', post.updated_at);
    }

    // Add Article structured data (JSON-LD)
    let scriptTag = document.querySelector('script[data-schema="article"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-schema', 'article');
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.meta_description || post.excerpt || '',
      image: post.featured_image || '/og-image.png',
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      author: post.author_name ? {
        '@type': 'Person',
        name: post.author_name,
        description: post.author_bio || undefined,
      } : {
        '@type': 'Organization',
        name: 'Truficient Energy Solutions',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Truficient Energy Solutions',
        logo: {
          '@type': 'ImageObject',
          url: 'https://truficient.com/truficient-logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    // Cleanup function
    return () => {
      const schemaScript = document.querySelector('script[data-schema="article"]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-primary-foreground/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
              </div>
              
              {post.author_name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{post.author_name}</span>
                </div>
              )}
              
              {post.category && (
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground hover:bg-white/30">
                  {post.category}
                </Badge>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-primary-foreground/80 border-primary-foreground/30">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="container mx-auto px-4 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BlogHeroImage
              src={displayUrl(post.featured_image)}
              alt={post.featured_image_alt || post.title}
            />
          </motion.div>
        </div>
      )}

      {/* Content */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto prose prose-lg"
          >
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 not-prose">
                {post.excerpt}
              </p>
            )}
            
            {post.content ? (
              <BlogContent html={post.content} />
            ) : (
              <p className="text-muted-foreground italic">No content available.</p>
            )}
          </motion.div>
        </div>
      </article>

      {/* Author Bio Section */}
      {post.author_name && post.author_bio && (
        <section className="py-8 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{post.author_name}</p>
                  <p className="text-muted-foreground mt-1">{post.author_bio}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need HVAC Services?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Contact Truficient Energy Solutions for expert heating and cooling services in the Dallas-Fort Worth area.
          </p>
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/contact">Get a Free Quote</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
