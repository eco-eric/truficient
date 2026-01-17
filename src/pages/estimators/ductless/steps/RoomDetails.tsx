import { useState, useEffect } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { ROOM_SIZE_OPTIONS, SUN_EXPOSURE_OPTIONS, RoomSize, SunExposure } from "../types";
import { calculateRoomBtu, getBtuBreakdown, formatMoney } from "../hooks/usePricing";
import { Minus, Plus, Lightbulb, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

export const RoomDetails = () => {
  const { state, updateRoom, nextStep, prevStep } = useQuote();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const rooms = state.selectedRooms;
  const room = rooms[currentRoomIndex];

  // Calculate BTU whenever room details change
  useEffect(() => {
    if (room) {
      const recommendedBtu = calculateRoomBtu(room.size, room.ceilingHeight, room.sunExposure);
      if (room.recommendedBtu !== recommendedBtu) {
        updateRoom(room.id, { recommendedBtu });
      }
    }
  }, [room?.size, room?.ceilingHeight, room?.sunExposure, room?.id, updateRoom]);

  if (!room) {
    // No rooms selected, go back
    prevStep();
    return null;
  }

  const isLastRoom = currentRoomIndex === rooms.length - 1;

  const handleNext = () => {
    if (isLastRoom) {
      nextStep();
    } else {
      setCurrentRoomIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentRoomIndex === 0) {
      prevStep();
    } else {
      setCurrentRoomIndex((i) => i - 1);
    }
  };

  const setSize = (size: RoomSize) => updateRoom(room.id, { size });
  const setExposure = (sunExposure: SunExposure) => updateRoom(room.id, { sunExposure });
  const setCeilingHeight = (h: number) => updateRoom(room.id, { ceilingHeight: Math.max(7, Math.min(16, h)) });

  // Get BTU breakdown for display
  const btuBreakdown = getBtuBreakdown(room);
  const recommendedBtu = btuBreakdown.recommendedBtu;

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        {/* Room progress */}
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
          Room {currentRoomIndex + 1} of {rooms.length}
        </div>

        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-1">{room.label}</h2>
        <p className="text-muted-foreground mb-6">Tell us about this room so we can size your system correctly.</p>

        {/* Room size */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">Room Size</label>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_SIZE_OPTIONS.map((opt) => (
              <SelectableCard
                key={opt.value}
                selected={room.size === opt.value}
                onClick={() => setSize(opt.value)}
                className="items-center text-center py-4"
              >
                <span className="font-semibold text-sm">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.sqftRange}</span>
              </SelectableCard>
            ))}
          </div>
        </div>

        {/* Ceiling height */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">Ceiling Height</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCeilingHeight(room.ceilingHeight - 1)}
              className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-xl font-bold text-[#1e3a5f] w-20 text-center">{room.ceilingHeight} ft</span>
            <button
              type="button"
              onClick={() => setCeilingHeight(room.ceilingHeight + 1)}
              className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {btuBreakdown.ceilingAdjustmentPercent !== 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {btuBreakdown.ceilingAdjustmentPercent > 0 ? "+" : ""}
              {btuBreakdown.ceilingAdjustmentPercent}% BTU adjustment for ceiling height
            </p>
          )}
        </div>

        {/* Sun exposure */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">Primary Sun Exposure</label>
          <div className="grid grid-cols-4 gap-2">
            {SUN_EXPOSURE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExposure(opt.value)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-semibold transition-colors",
                  room.sunExposure === opt.value
                    ? "border-[#d4a84b] bg-[#d4a84b]/10 text-[#d4a84b]"
                    : "border-border hover:border-primary/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {btuBreakdown.sunAdjustmentPercent !== 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {btuBreakdown.sunAdjustmentPercent > 0 ? "+" : ""}
              {btuBreakdown.sunAdjustmentPercent}% BTU adjustment for {room.sunExposure} exposure
            </p>
          )}
        </div>

        {/* Engineer recommendation with breakdown */}
        <div className="rounded-xl bg-[#a5a983]/10 border border-[#a5a983]/30 p-4 mb-8">
          <div className="flex gap-3">
            <Thermometer className="h-5 w-5 text-[#a5a983] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Recommended System Size</p>
              <p className="text-2xl font-bold text-[#1e3a5f] my-1">
                {recommendedBtu.toLocaleString()} BTU
              </p>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Base: ~{btuBreakdown.baseSqft} sq ft × 25 BTU/sq ft = {btuBreakdown.baseBtu.toLocaleString()} BTU</p>
                {btuBreakdown.ceilingAdjustmentPercent !== 0 && (
                  <p>Ceiling adjustment: {btuBreakdown.ceilingAdjustmentPercent > 0 ? "+" : ""}{btuBreakdown.ceilingAdjustmentPercent}%</p>
                )}
                {btuBreakdown.sunAdjustmentPercent !== 0 && (
                  <p>Sun exposure adjustment: {btuBreakdown.sunAdjustmentPercent > 0 ? "+" : ""}{btuBreakdown.sunAdjustmentPercent}%</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={handleBack} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={handleNext} className="flex-1">
            {isLastRoom ? "Continue" : "Next Room"}
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
