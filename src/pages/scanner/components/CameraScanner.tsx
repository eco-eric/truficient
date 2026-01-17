import { useRef, useState, useCallback, useEffect } from 'react';
import { useScanner } from '../context/ScannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CameraScanner() {
  const { state, dispatch } = useScanner();
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
      toast.error('Unable to access camera. Please try uploading a photo instead.');
    } finally {
      setIsStarting(false);
    }
  }, []);

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
    
    dispatch({ type: 'SET_IMAGE', payload: capturedImage });
    dispatch({ type: 'START_PROCESSING' });

    try {
      const { data, error } = await supabase.functions.invoke('decode-equipment', {
        body: {
          imageBase64: capturedImage,
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
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    // Cleanup on unmount
    return () => stopCamera();
  }, [stopCamera]);

  if (!hasCamera) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <Card className="p-6">
          <p className="text-muted-foreground mb-4">
            Camera access is not available. Please try uploading a photo instead.
          </p>
          <Button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'upload' })}>
            Upload Photo Instead
          </Button>
        </Card>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'input-method' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
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
              {/* Guide overlay */}
              <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={retakePhoto}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90">
              <Check className="w-4 h-4 mr-2" />
              Analyze Photo
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            onClick={capturePhoto}
            disabled={!isCameraActive || isStarting}
            className="bg-secondary hover:bg-secondary/90 touch-target"
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
            dispatch({ type: 'GO_TO_STEP', payload: 'input-method' });
          }}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
