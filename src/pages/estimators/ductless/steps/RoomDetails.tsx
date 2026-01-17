import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { ROOM_SIZE_OPTIONS, SUN_EXPOSURE_OPTIONS, RoomSize, SunExposure } from "../types";
import { Minus, Plus, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export const RoomDetails = () => {
  const { state, updateRoom, nextStep, prevStep } = useQuote();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const rooms = state.selectedRooms;
  const room = rooms[currentRoomIndex];

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

  // Placeholder BTU calculation (will be replaced in Phase 3)
  const estimatedBtu = room.size === "small" ? 9000 : room.size === "medium" ? 12000 : 18000;

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
        </div>

        {/* Engineer recommendation */}
        <div className="rounded-xl bg-[#a5a983]/10 border border-[#a5a983]/30 p-4 mb-8 flex gap-3">
          <Lightbulb className="h-5 w-5 text-[#a5a983] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Our Recommendation</p>
            <p className="text-sm text-muted-foreground">
              Based on your inputs, we recommend a <strong>{estimatedBtu.toLocaleString()} BTU</strong> unit for this room.
            </p>
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
