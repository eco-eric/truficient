import { useRef, useState } from 'react';
import { useScanner } from '../context/ScannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackScanCompleted } from '@/utils/conversionTracking';
import { compressImage } from '@/utils/imageCompression';

export function ImageUpload() {
  const { state, dispatch } = useScanner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject HEIC/HEIF first (iPhone often reports empty file.type for these)
    if (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      /\.(heic|heif)$/i.test(file.name)
    ) {
      toast.error("HEIC images aren't supported. Please convert to JPG or PNG and try again.");
      return;
    }

    // Validate file type — allow empty type if extension looks like a supported image
    const hasImageExt = /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
    if (file.type && !file.type.startsWith('image/') && !hasImageExt) {
      toast.error('Please select an image file (JPG, PNG, or WebP)');
      return;
    }
    if (!file.type && !hasImageExt) {
      toast.error('Please select an image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB raw)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    try {
      // Compress to keep base64 payload small enough for the vision model
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeMB: 2,
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
      };
      reader.onerror = () => toast.error('Could not read image. Please try another file.');
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Image prep error:', err);
      toast.error('Could not process image. Please try another file.');
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    dispatch({ type: 'SET_IMAGE', payload: previewUrl });
    dispatch({ type: 'START_PROCESSING' });

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: {
          imageBase64: previewUrl,
          zipCode: state.zipCode,
          isDfw: state.isDfw,
        },
      });

      if (error) throw error;

      if (data?.specs) {
        dispatch({
          type: 'SET_RESULT',
          payload: {
            id: data.scanId,
            specs: data.specs,
            raw_ai_response: data.raw_ai_response,
          },
        });
        
        // Track scan completion
        trackScanCompleted(data.specs?.brand, data.specs?.equipment_type);
      } else {
        throw new Error('No specs returned from decoder');
      }
    } catch (err) {
      console.error('Decode error:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to analyze image. Please try again or enter manually.',
      });
      dispatch({ type: 'GO_TO_STEP', payload: 'input-method' });
      toast.error('Failed to analyze image. Try again or enter manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Upload a Photo</h2>
        <p className="text-muted-foreground">
          Select a clear photo of your equipment's data plate
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <img
              src={previewUrl}
              alt="Uploaded data plate"
              className="w-full h-auto max-h-[400px] object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-dashed border-2 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Click to upload</p>
              <p className="text-sm text-muted-foreground">
                or drag and drop an image
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or WebP up to 10MB (HEIC not supported)
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {previewUrl && (
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-secondary hover:bg-secondary/90 touch-target"
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? 'Analyzing...' : 'Analyze Photo'}
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'input-method' })}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        For best results, ensure the data plate text is clearly visible and in focus
      </p>
    </div>
  );
}
