import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoomConfig, RoomSize, SunExposure, RoomType, GarageConfig, DuctlessUnitType, DuctlessSystemTier, DuctlessAddon } from "../types";

// BTU calculation constants
const BTU_PER_SQFT_BASE = 25; // Base BTU per sq ft
const CEILING_HEIGHT_BASELINE = 9; // Standard ceiling height (updated to 9ft)

// Room size square footage estimates
const ROOM_SIZE_SQFT: Record<RoomSize, number> = {
  small: 200,   // Up to 250 sq ft
  medium: 325,  // 250-400 sq ft
  large: 500,   // 400+ sq ft
};

// Garage base tonnage by room size
const GARAGE_SIZE_TONS: Record<RoomSize, number> = {
  small: 0.5,   // 6,000 BTU
  medium: 1.0,  // 12,000 BTU
  large: 1.5,   // 18,000 BTU
};

// Garage add-on tonnage values
const GARAGE_ADDON_TONS = {
  notInsulated: 0.25,      // +3,000 BTU
  standalone: 0.5,         // +6,000 BTU
  atticAbove: 0.25,        // +3,000 BTU
  comfortTemp: 0.25,       // +3,000 BTU
};

// Sun exposure multipliers
const SUN_EXPOSURE_MULTIPLIERS: Record<SunExposure, number> = {
  north: 0.95,  // Less sun = less cooling needed
  east: 1.0,    // Morning sun
  south: 1.1,   // High sun exposure
  west: 1.15,   // Afternoon sun = hottest
};

// Available system sizes in tons (converts to BTU by × 12000)
const SYSTEM_SIZE_TONS = [0.6, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5];

// Standard BTU sizes based on available system tonnages
const STANDARD_BTU_SIZES = SYSTEM_SIZE_TONS.map(tons => Math.round(tons * 12000));

/**
 * Round up to next available system size (always round UP for sizing)
 */
function roundToStandardBtu(rawBtu: number): number {
  // Find the first BTU size that is >= the raw BTU (round UP)
  const nextSize = STANDARD_BTU_SIZES.find(size => size >= rawBtu);
  // If no size is large enough, return the largest available
  return nextSize ?? STANDARD_BTU_SIZES[STANDARD_BTU_SIZES.length - 1];
}

/**
 * Calculate recommended BTU for a garage using additive tonnage approach
 */
function calculateGarageBtu(size: RoomSize, sunExposure: SunExposure, garageConfig?: GarageConfig): number {
  let tons = GARAGE_SIZE_TONS[size];
  
  if (garageConfig) {
    // Add tonnage based on garage conditions
    if (!garageConfig.isInsulated) tons += GARAGE_ADDON_TONS.notInsulated;
    if (garageConfig.isStandalone) tons += GARAGE_ADDON_TONS.standalone;
    if (garageConfig.hasAtticAbove) tons += GARAGE_ADDON_TONS.atticAbove;
    if (garageConfig.wantsComfortTemp) tons += GARAGE_ADDON_TONS.comfortTemp;
  } else {
    // Default: attic above only
    tons += GARAGE_ADDON_TONS.atticAbove;
  }
  
  // Apply sun exposure multiplier
  const sunMultiplier = SUN_EXPOSURE_MULTIPLIERS[sunExposure];
  
  // Convert tons to BTU, apply sun adjustment, and round to standard size
  const rawBtu = tons * 12000 * sunMultiplier;
  return roundToStandardBtu(rawBtu);
}

/**
 * Calculate recommended BTU for a room based on size, ceiling height, and sun exposure
 */
export function calculateRoomBtu(
  size: RoomSize,
  ceilingHeight: number,
  sunExposure: SunExposure,
  roomType?: RoomType,
  garageConfig?: GarageConfig
): number {
  // For garages, use additive tonnage approach with sun exposure
  if (roomType === "garage") {
    return calculateGarageBtu(size, sunExposure, garageConfig);
  }
  
  // Get base square footage for room size
  const sqft = ROOM_SIZE_SQFT[size];
  
  // Calculate volume adjustment for ceiling height
  const ceilingMultiplier = ceilingHeight / CEILING_HEIGHT_BASELINE;
  
  // Get sun exposure adjustment
  const sunMultiplier = SUN_EXPOSURE_MULTIPLIERS[sunExposure];
  
  // Calculate raw BTU needed
  const rawBtu = sqft * BTU_PER_SQFT_BASE * ceilingMultiplier * sunMultiplier;
  
  // Round to nearest standard BTU size
  return roundToStandardBtu(rawBtu);
}

/**
 * Get detailed BTU breakdown for a garage
 */
export function getGarageBtuBreakdown(room: RoomConfig) {
  const baseTons = GARAGE_SIZE_TONS[room.size];
  const config = room.garageConfig;
  const sunMultiplier = SUN_EXPOSURE_MULTIPLIERS[room.sunExposure];
  
  const insulationAddTons = config && !config.isInsulated ? GARAGE_ADDON_TONS.notInsulated : 0;
  const attachmentAddTons = config?.isStandalone ? GARAGE_ADDON_TONS.standalone : 0;
  const aboveAddTons = config?.hasAtticAbove !== false ? GARAGE_ADDON_TONS.atticAbove : 0; // Default is attic above
  const tempAddTons = config?.wantsComfortTemp ? GARAGE_ADDON_TONS.comfortTemp : 0;
  
  const totalTons = baseTons + insulationAddTons + attachmentAddTons + aboveAddTons + tempAddTons;
  const sunAdjustmentPercent = Math.round((sunMultiplier - 1) * 100);
  
  return {
    baseTons,
    insulationAddTons,
    attachmentAddTons,
    aboveAddTons,
    tempAddTons,
    totalTons,
    sunAdjustmentPercent,
    sunMultiplier,
    recommendedBtu: roundToStandardBtu(totalTons * 12000 * sunMultiplier),
    isGarage: true,
  };
}

/**
 * Get detailed BTU breakdown for a room
 */
export function getBtuBreakdown(room: RoomConfig) {
  // Use garage-specific breakdown for garages
  if (room.roomType === "garage") {
    return getGarageBtuBreakdown(room);
  }
  
  const sqft = ROOM_SIZE_SQFT[room.size];
  const baseBtu = sqft * BTU_PER_SQFT_BASE;
  const ceilingAdjustment = (room.ceilingHeight / CEILING_HEIGHT_BASELINE) - 1;
  const sunAdjustment = SUN_EXPOSURE_MULTIPLIERS[room.sunExposure] - 1;
  
  return {
    baseSqft: sqft,
    baseBtu,
    ceilingAdjustmentPercent: Math.round(ceilingAdjustment * 100),
    sunAdjustmentPercent: Math.round(sunAdjustment * 100),
    recommendedBtu: calculateRoomBtu(room.size, room.ceilingHeight, room.sunExposure),
    isGarage: false,
  };
}

// Financing constants
const FINANCING_TERM_MONTHS = 60;
const FINANCING_APR = 0.0599; // 5.99% APR

interface PricingInput {
  rooms: RoomConfig[];
  unitTypeId: string | null;
  systemTierId: string | null;
  selectedAddonIds: string[];
}

interface PricingBreakdown {
  // Equipment costs
  baseEquipmentCost: number;
  tierMultiplier: number;
  equipmentTotal: number;
  
  // Add-ons
  addonsBreakdown: Array<{
    id: string;
    name: string;
    price: number;
    priceType: "fixed" | "per_zone";
    total: number;
  }>;
  addonsTotal: number;
  
  // Totals
  subtotal: number;
  taxAmount: number;
  rebates: number;
  finalTotal: number;
  monthlyFinancing: number;
  
  // Metadata
  zoneCount: number;
  totalBtu: number;
}

/**
 * Custom hook that provides pricing calculations based on selections
 */
export function usePricing(input: PricingInput): {
  pricing: PricingBreakdown;
  unitTypes: DuctlessUnitType[];
  tiers: DuctlessSystemTier[];
  addons: DuctlessAddon[];
  isLoading: boolean;
  selectedUnit: DuctlessUnitType | undefined;
  selectedTier: DuctlessSystemTier | undefined;
} {
  // Fetch unit types
  const { data: unitTypes = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["ductless_unit_types_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ductless_unit_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctlessUnitType[];
    },
  });

  // Fetch system tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["ductless_system_tiers_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ductless_system_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctlessSystemTier[];
    },
  });

  // Fetch add-ons
  const { data: addons = [], isLoading: addonsLoading } = useQuery({
    queryKey: ["ductless_addons_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ductless_addons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctlessAddon[];
    },
  });

  const isLoading = unitsLoading || tiersLoading || addonsLoading;

  // Find selected items
  const selectedUnit = unitTypes.find((u) => u.id === input.unitTypeId);
  const selectedTier = tiers.find((t) => t.id === input.systemTierId);
  const selectedAddons = addons.filter((a) => input.selectedAddonIds.includes(a.id));

  const pricing = useMemo<PricingBreakdown>(() => {
    const zoneCount = input.rooms.length;
    
    // Calculate total BTU across all rooms
    const totalBtu = input.rooms.reduce((sum, room) => {
      return sum + calculateRoomBtu(room.size, room.ceilingHeight, room.sunExposure, room.roomType, room.garageConfig);
    }, 0);

    // Calculate base equipment cost from per-room unit type selections
    // If rooms have individual unit types, use those; otherwise fall back to global unitTypeId
    const baseEquipmentCost = input.rooms.reduce((sum, room) => {
      const roomUnitType = unitTypes.find(u => u.id === room.unitTypeId);
      // Use room's unit type if set, otherwise fall back to global selection or 0
      const unitPrice = roomUnitType?.base_price || selectedUnit?.base_price || 0;
      return sum + unitPrice;
    }, 0);
    
    // Apply tier multiplier
    const tierMultiplier = selectedTier?.price_multiplier || 1;
    const equipmentTotal = baseEquipmentCost * tierMultiplier;

    // Calculate add-ons
    const addonsBreakdown = selectedAddons.map((addon) => {
      const total = addon.price_type === "per_zone" 
        ? addon.price * zoneCount 
        : addon.price;
      return {
        id: addon.id,
        name: addon.name,
        price: addon.price,
        priceType: addon.price_type as "fixed" | "per_zone",
        total,
      };
    });
    
    const addonsTotal = addonsBreakdown.reduce((sum, a) => sum + a.total, 0);

    // Calculate totals (tax-inclusive pricing)
    const subtotal = equipmentTotal + addonsTotal;
    const taxAmount = 0; // Tax included in pricing
    const rebates = 0; // TODO: Could add rebate logic based on efficiency tier
    const finalTotal = subtotal - rebates;

    // Calculate monthly financing
    const monthlyRate = FINANCING_APR / 12;
    const monthlyFinancing = finalTotal > 0
      ? (finalTotal * monthlyRate * Math.pow(1 + monthlyRate, FINANCING_TERM_MONTHS)) /
        (Math.pow(1 + monthlyRate, FINANCING_TERM_MONTHS) - 1)
      : 0;

    return {
      baseEquipmentCost,
      tierMultiplier,
      equipmentTotal,
      addonsBreakdown,
      addonsTotal,
      subtotal,
      taxAmount,
      rebates,
      finalTotal,
      monthlyFinancing: Math.round(monthlyFinancing),
      zoneCount,
      totalBtu,
    };
  }, [input.rooms, selectedUnit, selectedTier, selectedAddons, unitTypes]);

  return {
    pricing,
    unitTypes,
    tiers,
    addons,
    isLoading,
    selectedUnit,
    selectedTier,
  };
}

/**
 * Format currency for display
 */
export function formatMoney(n: number, showCents = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(n);
}

/**
 * Get a price range based on tier multipliers
 */
export function getPriceRange(
  basePrice: number,
  tiers: DuctlessSystemTier[]
): { low: number; high: number } {
  if (tiers.length === 0) {
    return { low: basePrice, high: basePrice };
  }
  
  const multipliers = tiers.map((t) => t.price_multiplier);
  const minMultiplier = Math.min(...multipliers);
  const maxMultiplier = Math.max(...multipliers);
  
  return {
    low: Math.round(basePrice * minMultiplier),
    high: Math.round(basePrice * maxMultiplier),
  };
}
