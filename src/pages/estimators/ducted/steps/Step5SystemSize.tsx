import { useState, useRef } from "react";
import { StepContainer } from "../../ductless/components/StepContainer";
import { CTAButton } from "../../ductless/components/CTAButton";
import { SelectableCard } from "../../ductless/components/SelectableCard";
import { useEstimator } from "../context/EstimatorContext";
import { useDuctedPricing } from "../hooks/useDuctedPricing";
import { TONNAGE_OPTIONS } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Lightbulb, Camera, CheckCircle2, Zap, Upload 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Step5SystemSize = () => {
  const { 
    state, 
    setSelectedTonnage, 
    setScannedEquipmentInfo, 
    setRecommendedTonnage,
    nextStep, 
    prevStep 
  } = useEstimator();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Get AI-recommended tonnage from pricing hook
  const { pricing, isLoading: pricingLoading } = useDuctedPricing(state);
  const aiRecommendedTonnage = pricing.recommendedTonnage;
  
  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Parse tonnage from AI response
  const parseTonnage = (tonnageStr: string | null | undefined): number | null => {
    if (!tonnageStr) return null;
    
    // Remove common suffixes and extract number
    const cleaned = tonnageStr.toLowerCase().replace(/ton(s)?/gi, "").trim();
    const match = cleaned.match(/(\d+\.?\d*)/);
    
    if (match) {
      const value = parseFloat(match[1]);
      // Find the closest valid tonnage option
      const validTonnages = TONNAGE_OPTIONS.map(o => o.value);
      const closest = validTonnages.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      return closest;
    }
    
    return null;
  };

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    
    try {
      const imageBase64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke("decode-equipment", {
        body: { imageBase64 },
      });
      
      if (error) throw error;
      
      if (data?.specs) {
        const detectedTonnage = parseTonnage(data.specs.tonnage);
        
        // Store scanned info
        setScannedEquipmentInfo({
          brand: data.specs.brand || undefined,
          tonnage: detectedTonnage || undefined,
          model: data.specs.model_number || undefined,
        });
        
        // Auto-select tonnage if detected
        if (detectedTonnage) {
          setSelectedTonnage(detectedTonnage);
          toast.success(`Detected ${detectedTonnage} Ton ${data.specs.brand || ""} system!`);
        } else {
          toast.info("Equipment scanned but tonnage not detected. Please select manually.");
        }
      } else {
        toast.error("Could not read equipment info. Please select manually.");
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Failed to scan. Please try again or select manually.");
    } finally {
      setIsScanning(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
                {/* Recommended badge */}
                {isRecommended && !isSelected && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-[#a5a983] px-1.5 py-0.5 text-[9px] font-semibold text-white whitespace-nowrap">
                    <Zap className="h-2.5 w-2.5" />
                    AI
                  </div>
                )}
                
                {/* Selected checkmark */}
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

        {/* Scanner Section */}
        <div className="border-t border-border pt-6 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Have an existing system?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a photo of your data plate to auto-detect the size.
          </p>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed transition-all",
              isScanning 
                ? "border-muted-foreground/30 bg-muted/50 cursor-wait"
                : "border-[#1e3a5f]/30 bg-[#1e3a5f]/5 hover:border-[#1e3a5f]/50 hover:bg-[#1e3a5f]/10"
            )}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
                <span className="text-sm font-medium text-[#1e3a5f]">
                  Analyzing...
                </span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 text-[#1e3a5f]" />
                <span className="text-sm font-medium text-[#1e3a5f]">
                  Scan Data Plate
                </span>
              </>
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScanImage}
          />
          
          {/* Show scanned info */}
          {state.scannedEquipmentInfo && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">
                  Equipment Detected
                </p>
                <p className="text-green-700">
                  {state.scannedEquipmentInfo.brand && `${state.scannedEquipmentInfo.brand} • `}
                  {state.scannedEquipmentInfo.tonnage && `${state.scannedEquipmentInfo.tonnage} Ton`}
                  {state.scannedEquipmentInfo.model && ` • ${state.scannedEquipmentInfo.model}`}
                </p>
              </div>
            </div>
          )}
        </div>

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