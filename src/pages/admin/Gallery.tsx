import { useState, useMemo, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BulkImageUpload } from '@/components/admin/BulkImageUpload';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Plus, Pencil, Trash2, Star, Image as ImageIcon, Tag, Loader2, Upload, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 48;

interface GalleryTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface ImageTagRelation {
  tag_id: string;
}

type ThumbnailSize = 'small' | 'medium' | 'large';

const AdminGallery = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('images');
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('medium');
  
  // Image dialog state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    image_url: '',
    alt_text: '',
    is_featured: false,
    is_active: true,
    selectedTags: [] as string[],
  });

  // Tag dialog state
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<GalleryTag | null>(null);
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  // Fetch tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['gallery-tags-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_tags')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as GalleryTag[];
    },
  });

  // Fetch total count for display
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['gallery-images-count-admin'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gallery_images')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Infinite query for images
  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: imagesLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-images-admin-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      
      return {
        images: data as GalleryImage[],
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Flatten all pages into a single array
  const images = useMemo(() => {
    return imagesData?.pages.flatMap(page => page.images) || [];
  }, [imagesData]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  // Fetch image-tag relations
  const { data: imageTagRelations = [] } = useQuery({
    queryKey: ['gallery-image-tags-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_image_tags')
        .select('image_id, tag_id');
      if (error) throw error;
      return data;
    },
  });

  // Image mutations
  const createImageMutation = useMutation({
    mutationFn: async (data: typeof imageForm) => {
      const { selectedTags, ...imageData } = data;
      const { data: newImage, error } = await supabase
        .from('gallery_images')
        .insert({
          title: imageData.title,
          description: imageData.description || null,
          image_url: imageData.image_url,
          alt_text: imageData.alt_text || null,
          is_featured: imageData.is_featured,
          is_active: imageData.is_active,
        })
        .select()
        .single();
      if (error) throw error;

      // Add tag relations
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from('gallery_image_tags')
          .insert(selectedTags.map(tagId => ({ image_id: newImage.id, tag_id: tagId })));
        if (tagError) throw tagError;
      }

      return newImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images-admin-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images-count-admin'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-image-tags-admin'] });
      setImageDialogOpen(false);
      resetImageForm();
      toast.success('Image added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add image: ' + error.message);
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof imageForm }) => {
      const { selectedTags, ...imageData } = data;
      const { error } = await supabase
        .from('gallery_images')
        .update({
          title: imageData.title,
          description: imageData.description || null,
          image_url: imageData.image_url,
          alt_text: imageData.alt_text || null,
          is_featured: imageData.is_featured,
          is_active: imageData.is_active,
        })
        .eq('id', id);
      if (error) throw error;

      // Update tag relations - remove old ones and add new ones
      await supabase.from('gallery_image_tags').delete().eq('image_id', id);
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from('gallery_image_tags')
          .insert(selectedTags.map(tagId => ({ image_id: id, tag_id: tagId })));
        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images-admin-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-image-tags-admin'] });
      setImageDialogOpen(false);
      resetImageForm();
      toast.success('Image updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update image: ' + error.message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images-admin-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images-count-admin'] });
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete image: ' + error.message);
    },
  });

  // Tag mutations
  const createTagMutation = useMutation({
    mutationFn: async (data: typeof tagForm) => {
      const { error } = await supabase.from('gallery_tags').insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-tags-admin'] });
      setTagDialogOpen(false);
      resetTagForm();
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tag: ' + error.message);
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof tagForm }) => {
      const { error } = await supabase
        .from('gallery_tags')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          sort_order: data.sort_order,
          is_active: data.is_active,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-tags-admin'] });
      setTagDialogOpen(false);
      resetTagForm();
      toast.success('Tag updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update tag: ' + error.message);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-tags-admin'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete tag: ' + error.message);
    },
  });

  const resetImageForm = () => {
    setEditingImage(null);
    setImageForm({
      title: '',
      description: '',
      image_url: '',
      alt_text: '',
      is_featured: false,
      is_active: true,
      selectedTags: [],
    });
  };

  const resetTagForm = () => {
    setEditingTag(null);
    setTagForm({
      name: '',
      slug: '',
      description: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const openEditImage = (image: GalleryImage) => {
    const imageTags = imageTagRelations
      .filter(r => r.image_id === image.id)
      .map(r => r.tag_id);
    
    setEditingImage(image);
    setImageForm({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      is_featured: image.is_featured,
      is_active: image.is_active,
      selectedTags: imageTags,
    });
    setImageDialogOpen(true);
  };

  const openEditTag = (tag: GalleryTag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      sort_order: tag.sort_order,
      is_active: tag.is_active,
    });
    setTagDialogOpen(true);
  };

  const handleImageSubmit = () => {
    if (!imageForm.title || !imageForm.image_url) {
      toast.error('Title and image are required');
      return;
    }
    if (editingImage) {
      updateImageMutation.mutate({ id: editingImage.id, data: imageForm });
    } else {
      createImageMutation.mutate(imageForm);
    }
  };

  const handleTagSubmit = () => {
    if (!tagForm.name || !tagForm.slug) {
      toast.error('Name and slug are required');
      return;
    }
    if (editingTag) {
      updateTagMutation.mutate({ id: editingTag.id, data: tagForm });
    } else {
      createTagMutation.mutate(tagForm);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getImageTags = (imageId: string) => {
    const tagIds = imageTagRelations.filter(r => r.image_id === imageId).map(r => r.tag_id);
    return tags.filter(t => tagIds.includes(t.id));
  };

  const getImageCountForTag = (tagId: string) => {
    return imageTagRelations.filter(r => r.tag_id === tagId).length;
  };

  const toggleTagSelection = (tagId: string) => {
    setImageForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  return (
    <AdminLayout title="Gallery Management">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="images" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="tags" className="gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </TabsTrigger>
            </TabsList>

            {activeTab === 'images' && (
              <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Dialog open={imageDialogOpen} onOpenChange={(open) => {
                setImageDialogOpen(open);
                if (!open) resetImageForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingImage ? 'Edit Image' : 'Add New Image'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <ImageUpload
                      bucketName="gallery-images"
                      currentUrl={imageForm.image_url}
                      onUpload={(url) => setImageForm(prev => ({ ...prev, image_url: url }))}
                      onRemove={() => setImageForm(prev => ({ ...prev, image_url: '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={imageForm.title}
                      onChange={(e) => setImageForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Ductless Installation - McKinney Home"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={imageForm.description}
                      onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the project..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alt_text">Alt Text (for accessibility)</Label>
                    <Input
                      id="alt_text"
                      value={imageForm.alt_text}
                      onChange={(e) => setImageForm(prev => ({ ...prev, alt_text: e.target.value }))}
                      placeholder="Describe the image for screen readers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.is_active).map(tag => (
                        <Badge
                          key={tag.id}
                          variant={imageForm.selectedTags.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTagSelection(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    {tags.filter(t => t.is_active).length === 0 && (
                      <p className="text-sm text-muted-foreground">No tags available. Create tags first.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_featured"
                        checked={imageForm.is_featured}
                        onCheckedChange={(checked) => setImageForm(prev => ({ ...prev, is_featured: checked }))}
                      />
                      <Label htmlFor="is_featured">Featured (show on home page)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={imageForm.is_active}
                        onCheckedChange={(checked) => setImageForm(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImageSubmit}
                    disabled={createImageMutation.isPending || updateImageMutation.isPending}
                  >
                    {(createImageMutation.isPending || updateImageMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingImage ? 'Save Changes' : 'Add Image'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <BulkImageUpload
              open={bulkUploadOpen}
              onOpenChange={setBulkUploadOpen}
              tags={tags}
              onComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['gallery-images-admin'] });
                queryClient.invalidateQueries({ queryKey: ['gallery-image-tags-admin'] });
              }}
            />
              </div>
            )}

            {activeTab === 'tags' && (
            <Dialog open={tagDialogOpen} onOpenChange={(open) => {
              setTagDialogOpen(open);
              if (!open) resetTagForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTag ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tag_name">Name *</Label>
                    <Input
                      id="tag_name"
                      value={tagForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setTagForm(prev => ({ 
                          ...prev, 
                          name,
                          slug: editingTag ? prev.slug : generateSlug(name),
                        }));
                      }}
                      placeholder="e.g., Ductless"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag_slug">Slug *</Label>
                    <Input
                      id="tag_slug"
                      value={tagForm.slug}
                      onChange={(e) => setTagForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., ductless"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag_description">Description</Label>
                    <Textarea
                      id="tag_description"
                      value={tagForm.description}
                      onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this tag..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag_sort_order">Sort Order</Label>
                    <Input
                      id="tag_sort_order"
                      type="number"
                      value={tagForm.sort_order}
                      onChange={(e) => setTagForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="tag_is_active"
                      checked={tagForm.is_active}
                      onCheckedChange={(checked) => setTagForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="tag_is_active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTagSubmit}
                    disabled={createTagMutation.isPending || updateTagMutation.isPending}
                  >
                    {(createTagMutation.isPending || updateTagMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingTag ? 'Save Changes' : 'Add Tag'}
                  </Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Photo Count and Thumbnail Size Toggle */}
          {activeTab === 'images' && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{totalCount.toLocaleString()}</span>
                <span className="text-muted-foreground">Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <ToggleGroup 
                  type="single" 
                  value={thumbnailSize} 
                  onValueChange={(value) => value && setThumbnailSize(value as ThumbnailSize)}
                  className="border rounded-md"
                >
                  <ToggleGroupItem value="small" aria-label="Small thumbnails" className="px-3">
                    <Grid3X3 className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Medium thumbnails" className="px-3">
                    <Grid2X2 className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="large" aria-label="Large thumbnails" className="px-3">
                    <LayoutGrid className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="images">
          {imagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Images Yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first gallery image to showcase your work.</p>
                <Button onClick={() => setImageDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={`grid gap-4 ${
                thumbnailSize === 'small' 
                  ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8' 
                  : thumbnailSize === 'large' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden group">
                    <div className="aspect-square relative">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {image.is_featured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-secondary text-secondary-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      {!image.is_active && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">Hidden</Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditImage(image)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this image?')) {
                              deleteImageMutation.mutate(image.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate">{image.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getImageTags(image.id).slice(0, 2).map(tag => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {getImageTags(image.id).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{getImageTags(image.id).length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-16 flex items-center justify-center mt-6">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more photos...</span>
                  </div>
                )}
                {!hasNextPage && images.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing all {images.length.toLocaleString()} photos
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tags">
          {tagsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : tags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tags Yet</h3>
                <p className="text-muted-foreground mb-4">Create tags to organize your gallery images.</p>
                <Button onClick={() => setTagDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Images</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {tag.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">{getImageCountForTag(tag.id)}</TableCell>
                      <TableCell className="text-center">{tag.sort_order}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                          {tag.is_active ? 'Active' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditTag(tag)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this tag?')) {
                                deleteTagMutation.mutate(tag.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminGallery;