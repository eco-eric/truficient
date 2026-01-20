import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Eye, X, Plus, Upload, Trash2 } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import BlogPreview from '@/components/admin/BlogPreview';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  status: string;
  author_id: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: string | null;
  tags: string[] | null;
}

const CATEGORIES = [
  'HVAC Tips',
  'Energy Efficiency',
  'Home Comfort',
  'Maintenance',
  'Industry News',
  'Seasonal Advice',
  'Technology',
  'Case Studies',
];

const BlogPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    category: '',
    tags: [],
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchPost();
    }
  }, [id, isNew]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data as unknown as BlogPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post.',
        variant: 'destructive',
      });
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: isNew || !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !post.tags?.includes(tag)) {
      setPost(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove),
    }));
  };

  const handleSave = async (publishNow = false) => {
    if (!post.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!post.slug?.trim()) {
      toast({
        title: 'Error',
        description: 'Slug is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        content: post.content || null,
        featured_image: post.featured_image || null,
        status: publishNow ? 'published' : post.status,
        meta_title: post.meta_title || null,
        meta_description: post.meta_description || null,
        published_at: publishNow ? new Date().toISOString() : post.published_at,
        author_id: user?.id || null,
        category: post.category || null,
        tags: post.tags || [],
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts' as any)
          .insert(postData)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: publishNow ? 'Post published!' : 'Post created!',
          description: publishNow ? 'Your post is now live.' : 'Your draft has been saved.',
        });
        
        navigate(`/admin/blog/${(data as any).id}`);
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        
        setPost(prev => ({ ...prev, ...postData }));
        
        toast({
          title: publishNow ? 'Post published!' : 'Post saved!',
          description: publishNow ? 'Your post is now live.' : 'Your changes have been saved.',
        });
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      
      if (error.code === '23505') {
        toast({
          title: 'Error',
          description: 'A post with this slug already exists. Please use a different slug.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save the post.',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isNew ? 'New Post' : 'Edit Post'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? 'New Post' : 'Edit Post'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/admin/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {post.status === 'published' && !isNew && (
              <Button variant="outline" asChild>
                <Link to={`/blog/${post.slug}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            {post.status !== 'published' && (
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Publish
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Live Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={post.title || ''}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter post title..."
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">/blog/</span>
                        <Input
                          id="slug"
                          value={post.slug || ''}
                          onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="post-url-slug"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={post.excerpt || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description for previews..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Content</Label>
                      <RichTextEditor
                        value={post.content || ''}
                        onChange={(html) => setPost(prev => ({ ...prev, content: html }))}
                        placeholder="Write your blog post content here..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={post.status || 'draft'}
                      onValueChange={(value) => setPost(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category & Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={post.category || ''}
                        onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" size="icon" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {post.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {post.featured_image ? (
                        <div className="relative group">
                          <img
                            src={post.featured_image}
                            alt="Featured"
                            className="w-full h-40 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setPost(prev => ({ ...prev, featured_image: '' }))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploadingImage ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploadingImage(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `featured/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

                                const { error: uploadError } = await supabase.storage
                                  .from('blog_images')
                                  .upload(fileName, file);

                                if (uploadError) throw uploadError;

                                const { data: { publicUrl } } = supabase.storage
                                  .from('blog_images')
                                  .getPublicUrl(fileName);

                                setPost(prev => ({ ...prev, featured_image: publicUrl }));
                                toast({
                                  title: 'Image uploaded',
                                  description: 'Featured image has been set.',
                                });
                              } catch (error) {
                                console.error('Error uploading image:', error);
                                toast({
                                  title: 'Upload failed',
                                  description: 'Failed to upload image. Please try again.',
                                  variant: 'destructive',
                                });
                              } finally {
                                setUploadingImage(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Or paste an image URL:
                      </p>
                      <Input
                        value={post.featured_image || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={post.meta_title || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="SEO title (defaults to post title)"
                      />
                      <p className="text-xs text-muted-foreground">
                        {(post.meta_title || post.title || '').length}/60 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={post.meta_description || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                        placeholder="SEO description..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        {(post.meta_description || '').length}/160 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <BlogPreview
              title={post.title || ''}
              excerpt={post.excerpt || ''}
              content={post.content || ''}
              featuredImage={post.featured_image || ''}
              category={post.category || ''}
              tags={post.tags || []}
              publishedAt={post.published_at || undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BlogPostEditor;
