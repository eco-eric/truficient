// Home selection options
export type HomeType = 'single_family' | 'townhouse' | 'condo' | 'mobile_home' | 'duplex' | 'other';
export type HomeLayout = '1_story' | '2_stories' | '3_stories' | 'split_level' | 'basement' | 'loft';
export type SystemCount = 1 | 2 | 3 | 4;
export type Coverage = 'entire_home' | 'partial_home';
export type SquareFootage = 'under_800' | '800_1200' | '1200_1600' | '1600_2000' | '2000_2500' | '2500_3000' | '3000_3500' | '3500_4000' | '4000_plus';
export type HotColdSpots = 'none' | 'some' | 'too_many';
export type TempPreference = '64_68' | '68_72' | '72_76' | '76_plus';
export type HeatingType = 'gas_system' | 'heat_pump';

// Display option types
export interface HomeTypeOption {
  value: HomeType;
  label: string;
  icon: string; // Lucide icon name
  description?: string;
}

export interface HomeLayoutOption {
  value: HomeLayout;
  label: string;
  icon: string;
  description?: string;
}

export interface SquareFootageOption {
  value: SquareFootage;
  label: string;
  range: string;
}

export interface TempPreferenceOption {
  value: TempPreference;
  label: string;
  description?: string;
}

// Display options for UI
export const HOME_TYPE_OPTIONS: HomeTypeOption[] = [
  { value: 'single_family', label: 'Single Family', icon: 'Home' },
  { value: 'townhouse', label: 'Townhouse', icon: 'Building2' },
  { value: 'condo', label: 'Condo', icon: 'Building' },
  { value: 'mobile_home', label: 'Mobile Home', icon: 'Caravan' },
  { value: 'duplex', label: 'Duplex', icon: 'Columns2' },
  { value: 'other', label: 'Other', icon: 'HelpCircle' },
];

export const HOME_LAYOUT_OPTIONS: HomeLayoutOption[] = [
  { value: '1_story', label: '1 Story', icon: 'Minus' },
  { value: '2_stories', label: '2 Stories', icon: 'Layers2' },
  { value: '3_stories', label: '3+ Stories', icon: 'Layers' },
  { value: 'split_level', label: 'Split Level', icon: 'AlignVerticalJustifyStart' },
  { value: 'basement', label: 'Basement', icon: 'ArrowDown' },
  { value: 'loft', label: 'Loft', icon: 'ArrowUp' },
];

export const SQUARE_FOOTAGE_OPTIONS: SquareFootageOption[] = [
  { value: 'under_800', label: 'Under 800', range: 'Under 800 sq ft' },
  { value: '800_1200', label: '800 - 1,200', range: '800 - 1,200 sq ft' },
  { value: '1200_1600', label: '1,200 - 1,600', range: '1,200 - 1,600 sq ft' },
  { value: '1600_2000', label: '1,600 - 2,000', range: '1,600 - 2,000 sq ft' },
  { value: '2000_2500', label: '2,000 - 2,500', range: '2,000 - 2,500 sq ft' },
  { value: '2500_3000', label: '2,500 - 3,000', range: '2,500 - 3,000 sq ft' },
  { value: '3000_3500', label: '3,000 - 3,500', range: '3,000 - 3,500 sq ft' },
  { value: '3500_4000', label: '3,500 - 4,000', range: '3,500 - 4,000 sq ft' },
  { value: '4000_plus', label: '4,000+', range: '4,000+ sq ft' },
];

export const HOT_COLD_SPOTS_OPTIONS = [
  { value: 'none' as const, label: 'None', description: 'Even temperature throughout' },
  { value: 'some' as const, label: 'Some', description: 'A few areas are uncomfortable' },
  { value: 'too_many' as const, label: 'Too Many', description: 'Many areas need improvement' },
];

export const TEMP_PREFERENCE_OPTIONS: TempPreferenceOption[] = [
  { value: '64_68', label: '64° - 68°', description: 'Cool' },
  { value: '68_72', label: '68° - 72°', description: 'Comfortable' },
  { value: '72_76', label: '72° - 76°', description: 'Warm' },
  { value: '76_plus', label: '76°+', description: 'Very Warm' },
];

// Summer temperature options
export const SUMMER_TEMP_OPTIONS: TempPreferenceOption[] = [
  { value: '64_68', label: '64° - 68°', description: 'Cold' },
  { value: '68_72', label: '68° - 72°', description: 'Comfortable' },
  { value: '72_76', label: '72° - 76°', description: 'Warm' },
];

export const SYSTEM_COUNT_OPTIONS = [
  { value: 1 as const, label: '1 System' },
  { value: 2 as const, label: '2 Systems' },
  { value: 3 as const, label: '3 Systems' },
  { value: 4 as const, label: '4+ Systems' },
];

export const COVERAGE_OPTIONS = [
  { value: 'entire_home' as const, label: 'Entire Home', description: 'Full house coverage' },
  { value: 'partial_home' as const, label: 'Partial Home', description: 'Specific areas only' },
];

// Database types from Supabase
export interface DuctedEfficiencyTier {
  id: string;
  name: string;
  display_name: string;
  seer_min: number;
  seer_max: number;
  description: string | null;
  features: string[] | null;
  sort_order: number;
  is_active: boolean;
}

export interface DuctedEquipment {
  id: string;
  brand: string;
  model_number: string | null;
  tonnage: number;
  system_type: 'heat_pump' | 'gas_system';
  efficiency_tier_id: string | null;
  seer_rating: number;
  hspf_rating: number | null;
  afue_rating: number | null;
  equipment_cost: number;
  installation_labor: number;
  is_energy_star: boolean;
  warranty_years: number;
  features: string[] | null;
  is_best_value: boolean;
  is_active: boolean;
  display_order: number;
}

export interface DuctedTonnageSizingRule {
  id: string;
  home_type: string;
  layout: string;
  sq_ft_min: number;
  sq_ft_max: number;
  recommended_tonnage: number;
  notes: string | null;
  is_active: boolean;
}

export interface DuctedAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon_name: string | null;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface DuctedPricingModifier {
  id: string;
  name: string;
  modifier_type: 'add_on' | 'adjustment' | 'discount';
  amount: number | null;
  percentage: number | null;
  calculation_base: 'equipment' | 'labor' | 'total' | null;
  conditions: Record<string, unknown> | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

// Customer info for lead capture
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  // Extended address fields from Google Places
  formattedAddress?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  placeId?: string;
  bestTimeToCall: 'morning' | 'afternoon' | 'evening' | null;
  wantsBackupQuote: boolean;
}

// Pricing totals
export interface PricingTotals {
  equipmentCost: number;
  installationCost: number;
  addonsCost: number;
  subtotal: number;
  taxAmount: number;
  finalTotal: number;
  monthlyFinancing: number;
}

// Full estimator state
export interface DuctedEstimatorState {
  currentStep: number;
  // Home info
  homeType: HomeType | null;
  homeLayout: HomeLayout | null;
  // System details
  systemCount: SystemCount;
  coverage: Coverage | null;
  squareFootage: SquareFootage | null;
  // Usage patterns
  hotColdSpots: HotColdSpots | null;
  winterTemp: TempPreference | null;
  summerTemp: TempPreference | null;
  // Equipment selection
  heatingType: HeatingType | null;
  efficiencyTierId: string | null;
  selectedEquipmentId: string | null;
  recommendedTonnage: number | null;
  // Add-ons
  selectedAddonIds: string[];
  // Customer
  customerInfo: CustomerInfo;
  // Calculated totals
  totals: PricingTotals;
}

// Helper function to get square footage midpoint for calculations
export function getSquareFootageMidpoint(sqft: SquareFootage): number {
  const ranges: Record<SquareFootage, number> = {
    'under_800': 600,
    '800_1200': 1000,
    '1200_1600': 1400,
    '1600_2000': 1800,
    '2000_2500': 2250,
    '2500_3000': 2750,
    '3000_3500': 3250,
    '3500_4000': 3750,
    '4000_plus': 4500,
  };
  return ranges[sqft];
}
