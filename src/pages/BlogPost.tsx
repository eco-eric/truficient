import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
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
          .single();

        if (error) throw error;
        setPost(data as unknown as BlogPost);

        // Update page title
        if (data) {
          document.title = (data as any).meta_title || (data as any).title + ' | Truficient Energy Solutions';
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
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
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="container mx-auto px-4 -mt-8">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src={post.featured_image}
            alt={post.title}
            className="w-full max-w-4xl mx-auto rounded-lg shadow-lg aspect-video object-cover"
          />
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
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-muted-foreground italic">No content available.</p>
            )}
          </motion.div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need HVAC Services?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Contact Truficient Energy Solutions for expert heating and cooling services in the Dallas-Fort Worth area.
          </p>
          <Button asChild size="lg" className="bg-[#d4a84b] hover:bg-[#c49a3d] text-white">
            <Link to="/contact">Get a Free Quote</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
