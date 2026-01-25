import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setPosts((data as BlogPost[]) || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (!loading && posts.length === 0) {
    return null; // Don't show section if no posts
  }

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          Latest News & Blogs
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden bg-card h-full">
                <Skeleton className="w-full h-40" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover-lift group bg-card h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featured_image || '/placeholder.svg'}
                        alt={post.title}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-card-foreground mb-2 text-sm leading-tight line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt || 'Read more about this topic...'}
                      </p>
                      <span className="text-primary text-sm font-semibold hover:text-navy-dark transition-colors inline-flex items-center gap-1 group/link">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button asChild size="lg" variant="outline">
              <Link to="/blog">
                View All Posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
