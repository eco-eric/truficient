import { useState, useRef, useCallback, useEffect } from "react";
import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing } from "../hooks/useDuctedPricing";
import { TONNAGE_OPTIONS } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, Lightbulb, Camera, CheckCircle2, Zap, Upload, 
  Keyboard, ArrowLeft, X, RotateCcw, Check, Search,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type InputView = 'main' | 'camera' | 'upload' | 'manual';

export const Step6SystemSize = () => {
  const { 
    state, 
    setSelectedTonnage, 
    setScannedEquipmentInfo, 
    setRecommendedTonnage,
    nextStep, 
    prevStep 
  } = useEstimator();
  
  const [inputView, setInputView] = useState<InputView>('main');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get AI-recommended tonnage from pricing hook
  const { pricing, isLoading: pricingLoading } = useDuctedPricing(state);
  const aiRecommendedTonnage = pricing.recommendedTonnage;

  // Parse tonnage from AI response
  const parseTonnage = (tonnageStr: string | null | undefined): number | null => {
    if (!tonnageStr) return null;
    
    const cleaned = tonnageStr.toLowerCase().replace(/ton(s)?/gi, "").trim();
    const match = cleaned.match(/(\d+\.?\d*)/);
    
    if (match) {
      const value = parseFloat(match[1]);
      const validTonnages = TONNAGE_OPTIONS.map(o => o.value);
      const closest = validTonnages.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      return closest;
    }
    
    return null;
  };

  // Handler for successful scan - auto-select tonnage, create equipment page, return to main
  const handleScanSuccess = async (specs: any) => {
    const tonnage = parseTonnage(specs?.tonnage);
    const equipmentType = specs?.equipment_type || specs?.equipmentType;
    
    setScannedEquipmentInfo({
      brand: specs?.brand || undefined,
      tonnage: tonnage || undefined,
      model: specs?.model_number || undefined,
      equipmentType: equipmentType || undefined,
    });
    
    // Create equipment library page (without serial number)
    if (specs?.model_number && specs?.brand) {
      try {
        const slug = `${specs.brand.toLowerCase().replace(/\s+/g, '-')}-${specs.model_number.toLowerCase().replace(/\s+/g, '-')}`;
        
        await supabase.from('equipment_pages').upsert({
          model_number: specs.model_number,
          brand: specs.brand,
          slug: slug,
          equipment_type: equipmentType || null,
          specs: {
            tonnage: specs.tonnage,
            seer_rating: specs.seer_rating,
            refrigerant: specs.refrigerant,
            manufactured_year: specs.manufactured_year,
            voltage_info: specs.voltage_info,
            breaker_size: specs.breaker_size,
          },
          auto_generated: true,
          published: true,
        }, { onConflict: 'slug' });
        
        console.log('Equipment page created/updated:', slug);
      } catch (err) {
        console.error('Failed to create equipment page:', err);
      }
    }
    
    if (tonnage) {
      setSelectedTonnage(tonnage);
      const typeStr = equipmentType ? `${equipmentType} • ` : '';
      toast.success(`Detected ${typeStr}${tonnage} Ton ${specs?.brand || ''} system!`);
    } else {
      toast.info("Equipment scanned but tonnage not detected. Please select manually.");
    }
    
    setInputView('main');
    setIsProcessing(false);
  };

  const handleScanError = (message: string) => {
    toast.error(message);
    setIsProcessing(false);
  };

  const handleUseRecommendation = () => {
    if (aiRecommendedTonnage) {
      setSelectedTonnage(aiRecommendedTonnage);
      setRecommendedTonnage(aiRecommendedTonnage);
      toast.success(`Selected ${aiRecommendedTonnage} Ton based on your home details`);
    }
  };

  const handleSelect = (value: number) => {
    setSelectedTonnage(value);
  };

  // Render based on current view
  if (inputView === 'camera') {
    return (
      <CameraScannerView 
        onBack={() => setInputView('main')} 
        onSuccess={handleScanSuccess}
        onError={handleScanError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    );
  }
  
  if (inputView === 'upload') {
    return (
      <ImageUploadView 
        onBack={() => setInputView('main')} 
        onSuccess={handleScanSuccess}
        onError={handleScanError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    );
  }
  
  if (inputView === 'manual') {
    return (
      <ManualEntryView 
        onBack={() => setInputView('main')} 
        onSuccess={handleScanSuccess}
        onError={handleScanError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    );
  }

  // Main view with tonnage grid and method selection
  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          Select System Size
        </h2>
        <p className="text-muted-foreground mb-6">
          Choose your system tonnage. We'll verify sizing during our home assessment.
        </p>

        {/* Tonnage Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
          {TONNAGE_OPTIONS.map((option) => {
            const isSelected = state.selectedTonnage === option.value;
            const isRecommended = aiRecommendedTonnage === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 p-3 sm:p-4 transition-all duration-200",
                  isSelected
                    ? "border-[#d4a84b] bg-[#d4a84b]/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                )}
              >
                {isRecommended && !isSelected && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-[#a5a983] px-1.5 py-0.5 text-[9px] font-semibold text-white whitespace-nowrap">
                    <Zap className="h-2.5 w-2.5" />
                    AI
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a84b] text-white">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                )}
                
                <span className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">
                  {option.value}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  Ton
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Recommendation Box */}
        {!pricingLoading && aiRecommendedTonnage && (
          <div className="rounded-xl bg-gradient-to-r from-[#a5a983]/15 to-[#a5a983]/5 border border-[#a5a983]/30 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#a5a983] rounded-full">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  AI Recommendation: {aiRecommendedTonnage} Ton
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Based on your {state.squareFootage?.replace("_", "-")} sq ft {state.homeLayout?.replace("_", " ")} home.
                </p>
                {state.selectedTonnage !== aiRecommendedTonnage && (
                  <button
                    type="button"
                    onClick={handleUseRecommendation}
                    className="text-sm font-medium text-[#1e3a5f] hover:underline flex items-center gap-1"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Use This Recommendation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scanner Section - 3 Options */}
        <div className="border-t border-border pt-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Have an existing system?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Scan your data plate to auto-detect the system size.
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Scan with Camera */}
            <button
              type="button"
              onClick={() => setInputView('camera')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-border bg-card hover:border-[#1e3a5f]/50 hover:bg-[#1e3a5f]/5 transition-all"
            >
              <div className="p-2 rounded-full bg-[#1e3a5f]/10">
                <Camera className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                Scan Camera
              </span>
            </button>
            
            {/* Upload Photo */}
            <button
              type="button"
              onClick={() => setInputView('upload')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-border bg-card hover:border-[#1e3a5f]/50 hover:bg-[#1e3a5f]/5 transition-all"
            >
              <div className="p-2 rounded-full bg-[#1e3a5f]/10">
                <Upload className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                Upload Photo
              </span>
            </button>
            
            {/* Enter Manually */}
            <button
              type="button"
              onClick={() => setInputView('manual')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-border bg-card hover:border-[#1e3a5f]/50 hover:bg-[#1e3a5f]/5 transition-all"
            >
              <div className="p-2 rounded-full bg-[#1e3a5f]/10">
                <Keyboard className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                Enter Manually
              </span>
            </button>
          </div>
        </div>
        
        {/* Show scanned info with equipment type */}
        {state.scannedEquipmentInfo && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800">
                Equipment Detected
              </p>
              <p className="text-green-700">
                {state.scannedEquipmentInfo.equipmentType && `${state.scannedEquipmentInfo.equipmentType} • `}
                {state.scannedEquipmentInfo.brand && `${state.scannedEquipmentInfo.brand} • `}
                {state.scannedEquipmentInfo.tonnage && `${state.scannedEquipmentInfo.tonnage} Ton`}
                {state.scannedEquipmentInfo.model && ` • ${state.scannedEquipmentInfo.model}`}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton
            onClick={nextStep}
            disabled={!state.selectedTonnage}
            className="flex-1"
          >
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};

// ============================================
// CAMERA SCANNER VIEW
// ============================================
interface ScannerViewProps {
  onBack: () => void;
  onSuccess: (specs: any) => void;
  onError: (message: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

function CameraScannerView({ onBack, onSuccess, onError, isProcessing, setIsProcessing }: ScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasCamera, setHasCamera] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setHasCamera(false);
      onError('Unable to access camera. Please try uploading a photo instead.');
    } finally {
      setIsStarting(false);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleSubmit = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: { imageBase64: capturedImage },
      });

      if (error) throw error;

      if (data?.specs) {
        onSuccess(data.specs);
      } else {
        throw new Error('No specs returned from decoder');
      }
    } catch (err) {
      console.error('Decode error:', err);
      onError('Failed to analyze image. Please try again or enter manually.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  if (!hasCamera) {
    return (
      <StepContainer className="px-4 pb-28">
        <div className="max-w-md mx-auto text-center space-y-4">
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">
              Camera access is not available. Please try uploading a photo instead.
            </p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </Card>
        </div>
      </StepContainer>
    );
  }

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {capturedImage ? 'Review Your Photo' : 'Position the Data Plate'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {capturedImage
              ? 'Make sure the text is visible and readable'
              : 'Center the data plate in the frame and tap capture'}
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0 relative aspect-[4/3] bg-black">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured data plate"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
                <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={retakePhoto} disabled={isProcessing}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button onClick={handleSubmit} disabled={isProcessing} className="bg-secondary hover:bg-secondary/90">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Analyze Photo
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={capturePhoto}
              disabled={!isCameraActive || isStarting}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          )}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              stopCamera();
              onBack();
            }}
            disabled={isProcessing}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </StepContainer>
  );
}

// ============================================
// IMAGE UPLOAD VIEW
// ============================================
function ImageUploadView({ onBack, onSuccess, onError, isProcessing, setIsProcessing }: ScannerViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
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

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: { imageBase64: previewUrl },
      });

      if (error) throw error;

      if (data?.specs) {
        onSuccess(data.specs);
      } else {
        throw new Error('No specs returned from decoder');
      }
    } catch (err) {
      console.error('Decode error:', err);
      onError('Failed to analyze image. Please try again or enter manually.');
    }
  };

  return (
    <StepContainer className="px-4 pb-28">
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
                disabled={isProcessing}
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
                JPG, PNG, or HEIC up to 10MB
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {previewUrl && (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full bg-secondary hover:bg-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Analyze Photo
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isProcessing}
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
    </StepContainer>
  );
}

// ============================================
// MANUAL ENTRY VIEW
// ============================================
function ManualEntryView({ onBack, onSuccess, onError, isProcessing, setIsProcessing }: ScannerViewProps) {
  const [localModel, setLocalModel] = useState('');
  const [localSerial, setLocalSerial] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localModel.trim()) {
      onError('Please enter a model number');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: {
          modelNumber: localModel.trim().toUpperCase(),
          serialNumber: localSerial.trim().toUpperCase() || null,
        },
      });

      if (error) {
        console.error('Decode error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.specs) {
        onSuccess(data.specs);
        toast.success('Equipment decoded successfully!');
      } else {
        throw new Error('No specs returned');
      }
    } catch (err) {
      console.error('Decode error:', err);
      onError('Failed to decode equipment. Please try again.');
    }
  };

  return (
    <StepContainer className="px-4 pb-28">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Enter Equipment Info
          </h2>
          <p className="text-muted-foreground">
            Type in your model and serial number from the data plate.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="model-number" className="text-base font-medium">
                Model Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="model-number"
                type="text"
                placeholder="e.g., 24ACC636A003"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value.toUpperCase())}
                className="text-lg h-12 font-mono"
                autoComplete="off"
                disabled={isProcessing}
                required
              />
              <p className="text-xs text-muted-foreground">
                Usually starts with letters followed by numbers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial-number" className="text-base font-medium">
                Serial Number <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="serial-number"
                type="text"
                placeholder="e.g., 2519E12345"
                value={localSerial}
                onChange={(e) => setLocalSerial(e.target.value.toUpperCase())}
                className="text-lg h-12 font-mono"
                autoComplete="off"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Helps us determine the manufacturing date
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isProcessing || !localModel.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Decode Equipment
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </StepContainer>
  );
}
