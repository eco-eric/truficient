import { useState } from "react";
import { StepContainer } from "../components/StepContainer";
import { CTAButton } from "../components/CTAButton";
import { useQuote } from "../context/QuoteContext";
import { usePricing, formatMoney } from "../hooks/usePricing";
import { Loader2, ImageIcon, ZoomIn, Check } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const UnitStyleSelector = () => {
  const { state, updateRoom, nextStep, prevStep } = useQuote();
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const { unitTypes, selectedTier, isLoading } = usePricing({
    rooms: state.selectedRooms,
    unitTypeId: state.unitTypeId,
    systemTierId: state.systemTierId,
    selectedAddonIds: state.selectedAddonIds,
  });

  const isSingleRoom = state.selectedRooms.length === 1;
  const allRoomsHaveUnits = state.selectedRooms.every(room => room.unitTypeId);

  // Apply a unit type to a specific room
  const handleSelectForRoom = (roomId: string, unitTypeId: string) => {
    updateRoom(roomId, { unitTypeId });
  };

  // Apply a unit type to all rooms
  const handleApplyToAll = (unitTypeId: string) => {
    state.selectedRooms.forEach(room => {
      updateRoom(room.id, { unitTypeId });
    });
  };

  // Get unit type for a room
  const getUnitTypeForRoom = (roomId: string) => {
    const room = state.selectedRooms.find(r => r.id === roomId);
    return room?.unitTypeId || "";
  };

  // Calculate price for a unit type at this tier
  const getUnitPrice = (unitBasePrice: number) => {
    const multiplier = selectedTier?.price_multiplier || 1;
    return unitBasePrice * multiplier;
  };

  if (isLoading) {
    return (
      <StepContainer className="px-4 pb-28 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </StepContainer>
    );
  }

  return (
    <StepContainer className="px-4 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
          {isSingleRoom ? "Choose Your Indoor Unit Style" : "Choose Indoor Units for Each Zone"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isSingleRoom
            ? "Select the indoor unit style that best fits your space and aesthetic preferences."
            : "Select the indoor unit style for each zone. Different rooms may benefit from different styles."}
        </p>

        {/* Quick Apply Buttons (for multi-room) */}
        {!isSingleRoom && unitTypes.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {unitTypes.slice(0, 3).map((unit) => (
                <Button
                  key={unit.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToAll(unit.id)}
                  className="text-xs"
                >
                  Set All to {unit.display_name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Single Room: Card Selection */}
        {isSingleRoom && (
          <div className="space-y-4 mb-8">
            {unitTypes.map((unit) => {
              const isSelected = state.selectedRooms[0]?.unitTypeId === unit.id;
              const price = getUnitPrice(unit.base_price);

              return (
                <div
                  key={unit.id}
                  onClick={() => handleSelectForRoom(state.selectedRooms[0].id, unit.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 ring-2 ring-[#1e3a5f]/20"
                      : "border-border hover:border-[#1e3a5f]/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex gap-4">
                    {unit.image_url ? (
                      <div
                        className="relative group cursor-zoom-in flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({ src: unit.image_url!, alt: unit.display_name });
                        }}
                      >
                        <img
                          src={unit.image_url}
                          alt={unit.display_name}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-lg">{unit.display_name}</h3>
                        <span className="text-lg font-bold text-[#1e3a5f]">{formatMoney(price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{unit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Multi-Zone Discount Banner */}
        {!isSingleRoom && state.selectedRooms.length >= 2 && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">
              Multi-Zone Discount Active: 25% off zones 2-4, 6-8, and beyond!
            </p>
          </div>
        )}

        {/* Multi Room: Per-Room Selection */}
        {!isSingleRoom && (
          <div className="space-y-4 mb-8">
            {state.selectedRooms.map((room, index) => {
              const selectedUnitId = room.unitTypeId || "";
              const selectedUnit = unitTypes.find(u => u.id === selectedUnitId);
              const zonePosition = index + 1;
              const hasDiscount = (zonePosition - 1) % 4 !== 0; // Zones 2-4, 6-8, etc.

              return (
                <div
                  key={room.id}
                  className={`rounded-xl border p-4 transition-all ${
                    selectedUnitId ? "border-[#1e3a5f]/30 bg-[#1e3a5f]/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{room.label}</h4>
                        {hasDiscount && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            25% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {room.recommendedBtu.toLocaleString()} BTU
                        {hasDiscount && " • Zone discount applies"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={selectedUnitId}
                        onValueChange={(value) => handleSelectForRoom(room.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unitTypes.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span>{unit.display_name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedUnit && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-3">
                      {selectedUnit.image_url && (
                        <img
                          src={selectedUnit.image_url}
                          alt={selectedUnit.display_name}
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() =>
                            setLightboxImage({
                              src: selectedUnit.image_url!,
                              alt: selectedUnit.display_name,
                            })
                          }
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {selectedUnit.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#1e3a5f]">
                        {formatMoney(getUnitPrice(selectedUnit.base_price))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unit Type Reference (collapsible for multi-room) */}
        {!isSingleRoom && unitTypes.length > 0 && (
          <div className="mb-8 p-4 rounded-xl border bg-background">
            <p className="text-sm font-medium text-muted-foreground mb-3">Available Unit Types</p>
            <div className="grid grid-cols-2 gap-3">
              {unitTypes.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30"
                >
                  {unit.image_url ? (
                    <img
                      src={unit.image_url}
                      alt={unit.display_name}
                      className="w-10 h-10 object-cover rounded cursor-pointer"
                      onClick={() =>
                        setLightboxImage({ src: unit.image_url!, alt: unit.display_name })
                      }
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{unit.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(getUnitPrice(unit.base_price))}/zone
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <CTAButton variant="outline" onClick={prevStep} className="flex-1">
            Back
          </CTAButton>
          <CTAButton onClick={nextStep} disabled={!allRoomsHaveUnits} className="flex-1">
            Continue
          </CTAButton>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || ""}
        alt={lightboxImage?.alt || ""}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      />
    </StepContainer>
  );
};
