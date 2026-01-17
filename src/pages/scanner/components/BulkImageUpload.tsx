import { useState, useRef, useCallback } from 'react';
import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, ArrowLeft, Images, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { compressImage } from '@/utils/imageCompression';
import { supabase } from '@/integrations/supabase/client';
import { AccumulatedScan, EquipmentSpecs } from '../types';
import { toast } from 'sonner';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  brand?: string;
  error?: string;
}

export function BulkImageUpload() {
  const { state, dispatch } = useScanner();
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - state.results.length;
  const canAddMore = images.length < remainingSlots;

  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: SelectedImage[] = [];

    for (const file of fileArray) {
      if (images.length + validFiles.length >= remainingSlots) {
        toast.error(`Maximum ${remainingSlots} images allowed`);
        break;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      });
    }

    setImages(prev => [...prev, ...validFiles]);
  }, [images.length, remainingSlots]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, [handleFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const processImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Update status to processing
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'processing' as const } : img
      ));

      try {
        // Compress the image
        const compressedFile = await compressImage(image.file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
        });

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });

        // Call the decode-equipment edge function
        const { data, error } = await supabase.functions.invoke('decode-equipment', {
          body: {
            imageBase64: base64,
            zipCode: state.zipCode,
            email: state.email,
            isDfw: state.isDfw,
          },
        });

        if (error) throw error;

        const specs: EquipmentSpecs = data.specs || {
          brand: null,
          model_number: 'Unknown',
          serial_number: null,
          manufactured_year: null,
          tonnage: null,
          refrigerant: null,
          breaker_size: null,
          seer_rating: null,
          equipment_type: null,
          fan_motor_info: null,
          compressor_info: null,
          factory_charge: null,
          voltage_info: null,
        };

        const accumulatedScan: AccumulatedScan = {
          id: data.scanId,
          specs,
          raw_ai_response: data.rawAiResponse,
          scannedAt: new Date(),
        };

        // Add to results
        dispatch({ type: 'ADD_BULK_RESULT', payload: accumulatedScan });

        // Update status to success
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'success' as const, brand: specs.brand || 'Unknown' } 
            : img
        ));
      } catch (err) {
        console.error('Error processing image:', err);
        
        // Update status to error
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'error' as const, error: 'Failed to process' } 
            : img
        ));
      }
    }

    setIsProcessing(false);

    // Check if any succeeded
    const successCount = images.filter(img => img.status === 'success').length;
    if (successCount > 0) {
      toast.success(`Successfully analyzed ${successCount} of ${images.length} images`);
      // Navigate to results
      dispatch({ type: 'GO_TO_STEP', payload: 'results' });
    } else {
      toast.error('Failed to analyze any images. Please try again.');
    }
  };

  const completedCount = images.filter(img => img.status === 'success' || img.status === 'error').length;
  const progressPercent = images.length > 0 ? (completedCount / images.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Upload Multiple Data Plates
        </h2>
        <p className="text-muted-foreground">
          Upload up to {remainingSlots} images at once for batch analysis
        </p>
      </div>

      {/* Drop Zone */}
      {!isProcessing && canAddMore && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging 
              ? 'border-secondary bg-secondary/10' 
              : 'border-muted-foreground/30 hover:border-secondary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Max {remainingSlots} images, 10MB each • JPG, PNG, HEIC
            </p>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
      />

      {/* Selected Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              Selected Images ({images.length}/{remainingSlots})
            </h3>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  images.forEach(img => URL.revokeObjectURL(img.preview));
                  setImages([]);
                }}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Progress Bar (during processing) */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzing images...</span>
                <span className="font-medium">{completedCount} of {images.length}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                  <img
                    src={image.preview}
                    alt={`Data plate ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status Overlay */}
                <div className={`absolute inset-0 rounded-lg flex items-center justify-center ${
                  image.status === 'processing' 
                    ? 'bg-background/80' 
                    : image.status === 'success'
                    ? 'bg-green-500/20'
                    : image.status === 'error'
                    ? 'bg-destructive/20'
                    : ''
                }`}>
                  {image.status === 'processing' && (
                    <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                  )}
                  {image.status === 'success' && (
                    <div className="text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                      <span className="text-xs text-green-700 font-medium">{image.brand}</span>
                    </div>
                  )}
                  {image.status === 'error' && (
                    <XCircle className="w-8 h-8 text-destructive" />
                  )}
                </div>

                {/* Remove Button */}
                {image.status === 'pending' && !isProcessing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'input-method' })}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={processImages}
          disabled={images.length === 0 || isProcessing}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Images className="w-4 h-4 mr-2" />
              Analyze All ({images.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
