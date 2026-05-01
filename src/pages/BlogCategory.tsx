import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowRight,
  Calendar,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { usePageSEO } from '@/hooks/usePageSEO';
import { cardImageUrl } from '@/lib/imageUtils';

interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  hero_eyebrow: string | null;
  hero_heading: string;
  hero_subheading: string | null;
  hero_image: string | null;
  intro_html: string;
  what_we_cover: { title: string; body: string }[] | null;
  faqs: { question: string; answer: string }[] | null;
  cta_heading: string | null;
  cta_body: string | null;
  cta_button_label: string | null;
  cta_button_href: string | null;
  related_post_categories: string[] | null;
  related_service_links: { label: string; href: string }[] | null;
  status: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  category: string[] | string | null;
}

const PHONE = '214-238-4349';
const PHONE_TEL = 'tel:2142384349';

const BlogCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  usePageSEO();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories' as any)
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setNotFound(true);
          return;
        }
        setCategory(data as unknown as BlogCategory);
      } catch (err) {
        console.error('Error fetching category:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!category || !category.related_post_categories?.length) {
      setPosts([]);
      return;
    }

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts' as any)
          .select('id, title, slug, excerpt, featured_image, published_at, category')
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .overlaps('category', category.related_post_categories as string[])
          .order('published_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setPosts((data as unknown as RelatedPost[]) || []);
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-xl text-center">
            <h1 className="text-3xl font-bold mb-4">Category not found</h1>
            <p className="text-muted-foreground mb-6">
              The category you're looking for has been moved or no longer exists.
            </p>
            <Button asChild>
              <Link to="/blog">Browse the blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-muted/40 to-background border-b">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl text-center">
          {category.hero_eyebrow && (
            <Badge variant="secondary" className="mb-4">
              {category.hero_eyebrow}
            </Badge>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            {category.hero_heading}
          </motion.h1>
          {category.hero_subheading && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {category.hero_subheading}
            </p>
          )}
        </div>
      </section>

      {/* INTRO */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: category.intro_html }}
        />
      </section>

      {/* WHAT WE COVER */}
      {category.what_we_cover?.length ? (
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            What we cover
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {category.what_we_cover.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-3 items-start">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* RELATED POSTS */}
      {posts.length > 0 && (
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Articles in {category.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={cardImageUrl(post.featured_image)}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </div>
                    <h3 className="font-semibold text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                      Read more <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {category.faqs?.length ? (
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {category.faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2" data-faq-question={faq.question}>
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground" data-faq-answer={faq.answer}>
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* RELATED SERVICES */}
      {category.related_service_links?.length ? (
        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Related services</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {category.related_service_links.map((link, i) => (
              <Button key={i} variant="outline" asChild>
                <Link to={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="bg-primary text-primary-foreground mt-12">
        <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {category.cta_heading || `Need help with ${category.name.toLowerCase()}?`}
          </h2>
          <p className="text-primary-foreground/90 mb-6">
            {category.cta_body ||
              `Talk to a Truficient technician — straight answers, no high-pressure sales.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href={PHONE_TEL}>
                <Phone className="h-4 w-4 mr-2" />
                Call {PHONE}
              </a>
            </Button>
            {category.cta_button_label && category.cta_button_href && (
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link to={category.cta_button_href}>{category.cta_button_label}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogCategory;
