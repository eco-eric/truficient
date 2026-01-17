import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoomConfig, RoomSize, SunExposure, DuctlessUnitType, DuctlessSystemTier, DuctlessAddon } from "../types";

// BTU calculation constants
const BTU_PER_SQFT_BASE = 25; // Base BTU per sq ft
const CEILING_HEIGHT_BASELINE = 8; // Standard ceiling height

// Room size square footage estimates
const ROOM_SIZE_SQFT: Record<RoomSize, number> = {
  small: 200,   // Up to 250 sq ft
  medium: 325,  // 250-400 sq ft
  large: 500,   // 400+ sq ft
};

// Sun exposure multipliers
const SUN_EXPOSURE_MULTIPLIERS: Record<SunExposure, number> = {
  north: 0.95,  // Less sun = less cooling needed
  east: 1.0,    // Morning sun
  south: 1.1,   // High sun exposure
  west: 1.15,   // Afternoon sun = hottest
};

// Standard BTU sizes available for mini-splits
const STANDARD_BTU_SIZES = [6000, 9000, 12000, 15000, 18000, 24000, 30000, 36000];

/**
 * Calculate recommended BTU for a room based on size, ceiling height, and sun exposure
 */
export function calculateRoomBtu(
  size: RoomSize,
  ceilingHeight: number,
  sunExposure: SunExposure
): number {
  // Get base square footage for room size
  const sqft = ROOM_SIZE_SQFT[size];
  
  // Calculate volume adjustment for ceiling height
  const ceilingMultiplier = ceilingHeight / CEILING_HEIGHT_BASELINE;
  
  // Get sun exposure adjustment
  const sunMultiplier = SUN_EXPOSURE_MULTIPLIERS[sunExposure];
  
  // Calculate raw BTU needed
  const rawBtu = sqft * BTU_PER_SQFT_BASE * ceilingMultiplier * sunMultiplier;
  
  // Round to nearest standard BTU size
  const nearestBtu = STANDARD_BTU_SIZES.reduce((prev, curr) => {
    return Math.abs(curr - rawBtu) < Math.abs(prev - rawBtu) ? curr : prev;
  });
  
  return nearestBtu;
}

/**
 * Get detailed BTU breakdown for a room
 */
export function getBtuBreakdown(room: RoomConfig) {
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
  };
}

// Tax rate constant
const TAX_RATE = 0.0825; // 8.25% Texas sales tax

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
      return sum + calculateRoomBtu(room.size, room.ceilingHeight, room.sunExposure);
    }, 0);

    // Base equipment cost = unit base price × number of zones
    const baseEquipmentCost = (selectedUnit?.base_price || 0) * zoneCount;
    
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

    // Calculate totals
    const subtotal = equipmentTotal + addonsTotal;
    const taxAmount = subtotal * TAX_RATE;
    const rebates = 0; // TODO: Could add rebate logic based on efficiency tier
    const finalTotal = subtotal + taxAmount - rebates;

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
  }, [input.rooms, selectedUnit, selectedTier, selectedAddons]);

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
