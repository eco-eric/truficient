import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/utils/imageCompression";

interface GalleryTag {
  id: string;
  name: string;
  is_active: boolean;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  title: string;
  selectedTags: string[];
  is_featured: boolean;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

interface BulkImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: GalleryTag[];
  onComplete: () => void;
}

export const BulkImageUpload = ({
  open,
  onOpenChange,
  tags,
  onComplete,
}: BulkImageUploadProps) => {
  const [phase, setPhase] = useState<'upload' | 'review'>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [applyToAllTags, setApplyToAllTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateTitle = (filename: string) => {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\d+$/, '') // Remove trailing numbers
      .trim();
  };

  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    if (fileArray.length === 0) return;

    // Compress images before adding to state
    setIsCompressing(true);
    toast.info(`Optimizing ${fileArray.length} image${fileArray.length > 1 ? 's' : ''}...`);
    
    const compressedFiles = await Promise.all(
      fileArray.map(file => compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 }))
    );

    // Create preview URLs and add to state
    const newImages: UploadedImage[] = compressedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: URL.createObjectURL(file),
      title: generateTitle(file.name),
      selectedTags: [],
      is_featured: false,
      status: 'pending' as const,
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsCompressing(false);
    
    // Calculate total savings
    const originalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    const compressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0);
    const savedMB = ((originalSize - compressedSize) / 1024 / 1024).toFixed(1);
    
    if (originalSize > compressedSize) {
      toast.success(`Images optimized! Saved ${savedMB}MB`);
    } else {
      toast.success('Images ready for upload');
    }
  }, []);

  const uploadAllImages = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: images.length });

    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      const image = updatedImages[i];
      if (image.status === 'uploaded') {
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        continue;
      }

      updatedImages[i] = { ...image, status: 'uploading' };
      setImages([...updatedImages]);

      try {
        const timestamp = Date.now();
        const ext = image.file.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, image.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        // Revoke the blob URL and update with real URL
        URL.revokeObjectURL(image.url);
        updatedImages[i] = {
          ...updatedImages[i],
          url: urlData.publicUrl,
          status: 'uploaded',
        };
      } catch (error: any) {
        updatedImages[i] = {
          ...updatedImages[i],
          status: 'error',
          error: error.message,
        };
      }

      setImages([...updatedImages]);
      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setIsUploading(false);
    
    const successCount = updatedImages.filter(img => img.status === 'uploaded').length;
    if (successCount > 0) {
      toast.success(`${successCount} images uploaded successfully`);
      setPhase('review');
    }
  };

  const saveAllImages = async () => {
    const uploadedImages = images.filter(img => img.status === 'uploaded');
    if (uploadedImages.length === 0) {
      toast.error('No images to save');
      return;
    }

    setIsSaving(true);

    try {
      // Insert all gallery images
      const imageRecords = uploadedImages.map((img, index) => ({
        title: img.title || `Image ${index + 1}`,
        image_url: img.url,
        is_featured: img.is_featured,
        is_active: true,
        sort_order: index,
      }));

      const { data: insertedImages, error: insertError } = await supabase
        .from('gallery_images')
        .insert(imageRecords)
        .select();

      if (insertError) throw insertError;

      // Insert tag relations
      const tagRelations: { image_id: string; tag_id: string }[] = [];
      
      insertedImages?.forEach((dbImage, index) => {
        const originalImage = uploadedImages[index];
        const tagsToApply = [...new Set([...originalImage.selectedTags, ...applyToAllTags])];
        
        tagsToApply.forEach(tagId => {
          tagRelations.push({
            image_id: dbImage.id,
            tag_id: tagId,
          });
        });
      });

      if (tagRelations.length > 0) {
        const { error: tagError } = await supabase
          .from('gallery_image_tags')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      toast.success(`${uploadedImages.length} images saved to gallery`);
      handleClose();
      onComplete();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save images');
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image && image.status === 'pending') {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const updateImage = (id: string, updates: Partial<UploadedImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const toggleImageTag = (imageId: string, tagId: string) => {
    setImages(prev => prev.map(img => {
      if (img.id !== imageId) return img;
      const hasTag = img.selectedTags.includes(tagId);
      return {
        ...img,
        selectedTags: hasTag 
          ? img.selectedTags.filter(t => t !== tagId)
          : [...img.selectedTags, tagId],
      };
    }));
  };

  const toggleApplyToAllTag = (tagId: string) => {
    setApplyToAllTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClose = () => {
    // Clean up blob URLs
    images.forEach(img => {
      if (img.status === 'pending') {
        URL.revokeObjectURL(img.url);
      }
    });
    setImages([]);
    setPhase('upload');
    setUploadProgress({ current: 0, total: 0 });
    setApplyToAllTags([]);
    onOpenChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const activeTags = tags.filter(t => t.is_active);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {phase === 'upload' 
              ? 'Bulk Upload Images' 
              : `Review Images (${images.filter(i => i.status === 'uploaded').length} uploaded)`
            }
          </DialogTitle>
        </DialogHeader>

        {phase === 'upload' && (
          <div className="flex-1 space-y-4">
            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                (isUploading || isCompressing) && "pointer-events-none opacity-50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              {isCompressing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  <div>
                    <p className="text-lg font-medium">Optimizing images...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compressing for faster uploads
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop images here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPEG, PNG, WebP, or GIF (max 10MB each, auto-optimized)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />

            {/* Preview grid */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {images.length} image{images.length !== 1 ? 's' : ''} selected
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      images.forEach(img => {
                        if (img.status === 'pending') URL.revokeObjectURL(img.url);
                      });
                      setImages([]);
                    }}
                  >
                    Clear all
                  </Button>
                </div>

                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-6 gap-2">
                    {images.map((image) => (
                      <div key={image.id} className="relative group aspect-square">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {image.status === 'uploading' && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        )}
                        {image.status === 'uploaded' && (
                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {image.status === 'error' && (
                          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center rounded-md">
                            <X className="h-5 w-5 text-destructive" />
                          </div>
                        )}
                        <button
                          className="absolute top-1 left-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Progress bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress.current} of {uploadProgress.total}</span>
                    </div>
                    <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {phase === 'review' && (
          <div className="flex-1 space-y-4 overflow-hidden">
            {/* Apply to all tags */}
            {activeTags.length > 0 && (
              <div className="space-y-2 pb-3 border-b">
                <Label className="text-sm font-medium">Apply to all images:</Label>
                <div className="flex flex-wrap gap-2">
                  {activeTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={applyToAllTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleApplyToAllTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Image grid for review */}
            <ScrollArea className="flex-1 h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                {images.filter(img => img.status === 'uploaded').map((image) => (
                  <div key={image.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="relative aspect-video">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <Input
                      value={image.title}
                      onChange={(e) => updateImage(image.id, { title: e.target.value })}
                      placeholder="Image title"
                      className="h-8 text-sm"
                    />

                    <div className="flex flex-wrap gap-1">
                      {activeTags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant={
                            image.selectedTags.includes(tag.id) || applyToAllTags.includes(tag.id) 
                              ? 'default' 
                              : 'outline'
                          }
                          className={cn(
                            "cursor-pointer text-xs",
                            applyToAllTags.includes(tag.id) && "opacity-60"
                          )}
                          onClick={() => !applyToAllTags.includes(tag.id) && toggleImageTag(image.id, tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`featured-${image.id}`}
                        checked={image.is_featured}
                        onCheckedChange={(checked) => updateImage(image.id, { is_featured: checked })}
                        className="h-4 w-7"
                      />
                      <Label htmlFor={`featured-${image.id}`} className="text-xs flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {phase === 'upload' && (
            <Button
              onClick={uploadAllImages}
              disabled={images.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {images.length} Image{images.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}

          {phase === 'review' && (
            <Button
              onClick={saveAllImages}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save All ({images.filter(i => i.status === 'uploaded').length})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
