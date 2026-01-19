import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DuctedEstimatorState, SquareFootage, AtticInsulation, WindowType, HomeAge } from "../types";

// Insulation adjustment factors (adds to base tonnage)
const INSULATION_ADJUSTMENTS: Record<AtticInsulation, number> = {
  high: -0.25,      // Well insulated = slightly less capacity needed
  medium: 0,        // Standard - no adjustment
  low: 0.5,         // Poor insulation = need more capacity
  not_sure: 0.25,   // Assume slightly below average
};

// Window type adjustment factors
const WINDOW_ADJUSTMENTS: Record<WindowType, number> = {
  triple_pane: -0.25,  // High efficiency = less capacity needed
  double_pane: 0,      // Standard - no adjustment
  single_pane: 0.5,    // Poor efficiency = need more capacity
  mixed: 0.25,         // Assume slightly below average
};

// Home age adjustment factors (older homes typically have more air leakage)
const HOME_AGE_ADJUSTMENTS: Record<HomeAge, number> = {
  after_2010: -0.25,   // Modern construction, better sealed
  "2000_2010": 0,      // Standard - no adjustment
  "1980_2000": 0.25,   // Some air leakage expected
  before_1980: 0.5,    // Likely significant air leakage
};

// Tax rate constant
const TAX_RATE = 0.0825; // 8.25% Texas sales tax

// Financing constants
const FINANCING_TERM_MONTHS = 60;
const FINANCING_APR = 0.0599; // 5.99% APR

interface DuctedEquipment {
  id: string;
  system_name: string | null;
  brand: string;
  tonnage: number;
  system_type: string;
  // Gas System Components
  condenser_model: string | null;
  furnace_model: string | null;
  evap_coil_model: string | null;
  // Heat Pump Components
  heat_pump_model: string | null;
  air_handler_model: string | null;
  heat_kit_model: string | null;
  // Efficiency Ratings
  seer2_rating: number | null;
  eer2_rating: number | null;
  hspf2_rating: number | null;
  // Pricing & metadata
  equipment_cost: number;
  installation_labor: number;
  warranty_years: number;
  is_best_value: boolean;
  is_energy_star: boolean;
  efficiency_tier_id: string | null;
  features: string[] | null;
}

interface DuctedAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon_name: string | null;
  is_popular: boolean;
  sort_order: number;
}

interface DuctedEfficiencyTier {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  seer_min: number;
  seer_max: number;
  features: string[] | null;
  sort_order: number;
}

interface TonnageRule {
  id: string;
  home_type: string;
  layout: string;
  sq_ft_min: number;
  sq_ft_max: number;
  recommended_tonnage: number;
}

interface PricingBreakdown {
  // Equipment costs
  equipmentCost: number;
  installationCost: number;
  
  // Add-ons
  addonsBreakdown: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  addonsCost: number;
  
  // Totals
  subtotal: number;
  taxAmount: number;
  finalTotal: number;
  monthlyFinancing: number;
  
  // Metadata
  recommendedTonnage: number | null;
  effectiveTonnage: number | null; // The tonnage being used (selected or recommended)
  selectedEquipment: DuctedEquipment | null;
  selectedTier: DuctedEfficiencyTier | null;
}

/**
 * Get square footage midpoint value for calculations
 */
function getSqftMidpoint(sqft: SquareFootage): number {
  const midpoints: Record<SquareFootage, number> = {
    "under_800": 600,
    "800_1200": 1000,
    "1200_1600": 1400,
    "1600_2000": 1800,
    "2000_2500": 2250,
    "2500_3000": 2750,
    "3000_3500": 3250,
    "3500_4000": 3750,
    "4000_plus": 4500,
  };
  return midpoints[sqft];
}

/**
 * Custom hook that provides pricing calculations based on selections
 */
export function useDuctedPricing(state: DuctedEstimatorState): {
  pricing: PricingBreakdown;
  equipment: DuctedEquipment[];
  tiers: DuctedEfficiencyTier[];
  addons: DuctedAddon[];
  tonnageRules: TonnageRule[];
  isLoading: boolean;
  matchingEquipment: DuctedEquipment[];
} {
  // Fetch equipment
  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ["ducted_equipment_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_equipment")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as DuctedEquipment[];
    },
  });

  // Fetch efficiency tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["ducted_efficiency_tiers_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_efficiency_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctedEfficiencyTier[];
    },
  });

  // Fetch add-ons
  const { data: addons = [], isLoading: addonsLoading } = useQuery({
    queryKey: ["ducted_addons_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_addons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DuctedAddon[];
    },
  });

  // Fetch tonnage sizing rules
  const { data: tonnageRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["ducted_tonnage_sizing_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ducted_tonnage_sizing_rules")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as TonnageRule[];
    },
  });

  const isLoading = equipmentLoading || tiersLoading || addonsLoading || rulesLoading;

  // Get available tonnages for the selected heating type
  const availableTonnages = useMemo(() => {
    if (!state.heatingType || equipment.length === 0) return [];
    
    const tonnages = equipment
      .filter((eq) => eq.system_type === state.heatingType)
      .map((eq) => eq.tonnage);
    
    // Get unique values and sort
    return [...new Set(tonnages)].sort((a, b) => a - b);
  }, [equipment, state.heatingType]);

  // Calculate recommended tonnage based on home characteristics including insulation factors
  const recommendedTonnage = useMemo(() => {
    if (!state.homeType || !state.homeLayout || !state.squareFootage || tonnageRules.length === 0) {
      return null;
    }

    const sqftMidpoint = getSqftMidpoint(state.squareFootage);
    
    // Find matching rule
    const matchingRule = tonnageRules.find((rule) => {
      const homeTypeMatch = rule.home_type === state.homeType;
      const layoutMatch = rule.layout === state.homeLayout;
      const sqftMatch = sqftMidpoint >= rule.sq_ft_min && sqftMidpoint <= rule.sq_ft_max;
      return homeTypeMatch && layoutMatch && sqftMatch;
    });

    // Get base tonnage from rules
    let baseTonnage: number | null = null;
    
    if (matchingRule) {
      baseTonnage = matchingRule.recommended_tonnage;
    } else {
      // Fallback: find by just sqft range
      const fallbackRule = tonnageRules.find((rule) => {
        return sqftMidpoint >= rule.sq_ft_min && sqftMidpoint <= rule.sq_ft_max;
      });
      baseTonnage = fallbackRule?.recommended_tonnage || null;
    }

    if (baseTonnage === null) return null;

    // Apply insulation and efficiency adjustments
    let adjustment = 0;
    
    if (state.atticInsulation) {
      adjustment += INSULATION_ADJUSTMENTS[state.atticInsulation];
    }
    
    if (state.windowType) {
      adjustment += WINDOW_ADJUSTMENTS[state.windowType];
    }
    
    if (state.homeAge) {
      adjustment += HOME_AGE_ADJUSTMENTS[state.homeAge];
    }

    // Apply adjustment and round to nearest 0.5 ton (standard sizing increments)
    const adjustedTonnage = baseTonnage + adjustment;
    const roundedTonnage = Math.round(adjustedTonnage * 2) / 2;
    
    // Clamp to valid tonnage range (1.5 to 5 tons for residential)
    const clampedTonnage = Math.max(1.5, Math.min(5, roundedTonnage));
    
    // Snap to nearest available tonnage in equipment database
    if (availableTonnages.length > 0) {
      // Find the closest available tonnage (prefer rounding up for safety)
      let closest = availableTonnages[0];
      let minDiff = Math.abs(clampedTonnage - closest);
      
      for (const t of availableTonnages) {
        const diff = Math.abs(clampedTonnage - t);
        // Prefer this tonnage if it's closer, or same distance but higher (round up)
        if (diff < minDiff || (diff === minDiff && t > closest)) {
          closest = t;
          minDiff = diff;
        }
      }
      
      return closest;
    }
    
    return clampedTonnage;
  }, [state.homeType, state.homeLayout, state.squareFootage, state.atticInsulation, state.windowType, state.homeAge, tonnageRules, availableTonnages]);

  // Find matching equipment based on tonnage, heating type, and efficiency tier
  // Use selectedTonnage if user picked one, otherwise fall back to recommendedTonnage
  const effectiveTonnage = state.selectedTonnage || recommendedTonnage;
  
  const matchingEquipment = useMemo(() => {
    // Debug logging
    console.log('[Pricing Debug] effectiveTonnage:', effectiveTonnage);
    console.log('[Pricing Debug] heatingType:', state.heatingType);
    console.log('[Pricing Debug] efficiencyTierId:', state.efficiencyTierId);
    console.log('[Pricing Debug] Equipment count before filter:', equipment.length);

    if (!effectiveTonnage || !state.heatingType || !state.efficiencyTierId) {
      console.log('[Pricing Debug] Early return - missing required values');
      return [];
    }

    // The database uses "gas_system" and "heat_pump" as system_type values
    const systemType = state.heatingType;

    const filtered = equipment.filter((eq) => {
      const tonnageMatch = eq.tonnage === effectiveTonnage;
      const typeMatch = eq.system_type === systemType;
      // FIXED: Use efficiency_tier_id instead of SEER range matching
      const tierMatch = eq.efficiency_tier_id === state.efficiencyTierId;
      return tonnageMatch && typeMatch && tierMatch;
    });

    console.log('[Pricing Debug] matchingEquipment count:', filtered.length);
    console.log('[Pricing Debug] matchingEquipment:', filtered);

    return filtered;
  }, [equipment, effectiveTonnage, state.heatingType, state.efficiencyTierId]);

  // Find selected equipment
  const selectedEquipment = useMemo(() => {
    if (state.selectedEquipmentId) {
      return equipment.find((eq) => eq.id === state.selectedEquipmentId) || null;
    }
    // Auto-select best value or first matching equipment
    return matchingEquipment.find((eq) => eq.is_best_value) || matchingEquipment[0] || null;
  }, [state.selectedEquipmentId, equipment, matchingEquipment]);

  // Find selected tier
  const selectedTier = useMemo(() => {
    return tiers.find((t) => t.id === state.efficiencyTierId) || null;
  }, [tiers, state.efficiencyTierId]);

  // Find selected addons
  const selectedAddons = useMemo(() => {
    return addons.filter((a) => state.selectedAddonIds.includes(a.id));
  }, [addons, state.selectedAddonIds]);

  // Calculate pricing breakdown
  const pricing = useMemo<PricingBreakdown>(() => {
    const equipmentCost = selectedEquipment?.equipment_cost || 0;
    const installationCost = selectedEquipment?.installation_labor || 0;

    // Calculate add-ons
    const addonsBreakdown = selectedAddons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    }));
    
    const addonsCost = addonsBreakdown.reduce((sum, a) => sum + a.price, 0);

    // Calculate totals
    const subtotal = equipmentCost + installationCost + addonsCost;
    const taxAmount = subtotal * TAX_RATE;
    const finalTotal = subtotal + taxAmount;

    // Calculate monthly financing
    const monthlyRate = FINANCING_APR / 12;
    const monthlyFinancing = finalTotal > 0
      ? (finalTotal * monthlyRate * Math.pow(1 + monthlyRate, FINANCING_TERM_MONTHS)) /
        (Math.pow(1 + monthlyRate, FINANCING_TERM_MONTHS) - 1)
      : 0;

    return {
      equipmentCost,
      installationCost,
      addonsBreakdown,
      addonsCost,
      subtotal,
      taxAmount,
      finalTotal,
      monthlyFinancing: Math.round(monthlyFinancing),
      recommendedTonnage,
      effectiveTonnage,
      selectedEquipment,
      selectedTier,
    };
  }, [selectedEquipment, selectedAddons, recommendedTonnage, effectiveTonnage, selectedTier]);

  return {
    pricing,
    equipment,
    tiers,
    addons,
    tonnageRules,
    isLoading,
    matchingEquipment,
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
