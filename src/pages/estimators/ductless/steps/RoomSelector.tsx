import { useState, useCallback, useMemo } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { SelectableCard } from "../components/SelectableCard";
import { useQuote } from "../context/QuoteContext";
import { ROOM_TYPE_OPTIONS, RoomType, RoomConfig } from "../types";
import { Minus, Plus } from "lucide-react";
import * as Icons from "lucide-react";

const getIcon = (name: string) => {
  const IconComp = (Icons as any)[name];
  return IconComp || Icons.Home;
};

export const RoomSelector = () => {
  const { state, setSelectedRooms, nextStep, prevStep } = useQuote();

  // Track counts per room type
  const [roomCounts, setRoomCounts] = useState<Record<RoomType, number>>(() => {
    const initial: Record<string, number> = {};
    ROOM_TYPE_OPTIONS.forEach((opt) => {
      const existing = state.selectedRooms.filter((r) => r.roomType === opt.type);
      initial[opt.type] = existing.length;
    });
    return initial as Record<RoomType, number>;
  });

  const toggleRoom = useCallback((type: RoomType, allowMultiple: boolean) => {
    setRoomCounts((prev) => {
      const current = prev[type] || 0;
      if (allowMultiple) {
        // For multiple, toggle between 0 and 1 on click, use +/- for more
        return { ...prev, [type]: current === 0 ? 1 : 0 };
      } else {
        return { ...prev, [type]: current === 0 ? 1 : 0 };
      }
    });
  }, []);

  const incrementRoom = useCallback((type: RoomType) => {
    setRoomCounts((prev) => ({ ...prev, [type]: Math.min((prev[type] || 0) + 1, 5) }));
  }, []);

  const decrementRoom = useCallback((type: RoomType) => {
    setRoomCounts((prev) => ({ ...prev, [type]: Math.max((prev[type] || 0) - 1, 0) }));
  }, []);

  const totalSelected = useMemo(() => {
    return Object.values(roomCounts).reduce((a, b) => a + b, 0);
  }, [roomCounts]);

  const handleContinue = () => {
    // Build room configs from counts
    const rooms: RoomConfig[] = [];
    ROOM_TYPE_OPTIONS.forEach((opt) => {
      const count = roomCounts[opt.type] || 0;
      for (let i = 0; i < count; i++) {
        rooms.push({
          id: `${opt.type}-${i}`,
          roomType: opt.type,
          label: count > 1 ? `${opt.label} ${i + 1}` : opt.label,
          size: "medium",
          ceilingHeight: 9,
          sunExposure: "north",
          quantity: 1,
          recommendedBtu: 12000, // Placeholder
          // Initialize garage config with defaults for garage rooms
          garageConfig: opt.type === "garage" ? {
            isInsulated: true,       // Default: insulated
            isStandalone: false,     // Default: attached
            hasAtticAbove: true,     // Default: attic above
            wantsComfortTemp: false, // Default: storage temp
          } : undefined,
        });
      }
    });
    setSelectedRooms(rooms);
    nextStep();
  };

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Select Your Rooms</h2>
        <p className="text-muted-foreground mb-6">
          Choose the rooms where you'd like ductless comfort. You can select multiple.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {ROOM_TYPE_OPTIONS.map((opt) => {
            const count = roomCounts[opt.type] || 0;
            const isSelected = count > 0;
            const IconComp = getIcon(opt.icon);

            return (
              <SelectableCard
                key={opt.type}
                selected={isSelected}
                onClick={() => toggleRoom(opt.type, opt.allowMultiple)}
                className="min-h-[100px]"
              >
                <div className="flex flex-col items-start w-full">
                  <IconComp className="h-6 w-6 text-[#1e3a5f] mb-2" />
                  <span className="font-medium text-foreground text-sm">{opt.label}</span>

                  {/* Quantity controls for rooms that allow multiple */}
                  {opt.allowMultiple && isSelected && (
                    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => decrementRoom(opt.type)}
                        className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{count}</span>
                      <button
                        type="button"
                        onClick={() => incrementRoom(opt.type)}
                        className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </SelectableCard>
            );
          })}
        </div>

        {/* Selected summary */}
        {totalSelected > 0 && (
          <div className="rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-4 mb-6">
            <p className="text-sm font-semibold text-[#1e3a5f]">
              {totalSelected} zone{totalSelected !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={handleContinue} disabled={totalSelected === 0} className="flex-1">
            Continue
          </CTAButton>
        </div>
      </div>
    </StepContainer>
  );
};
