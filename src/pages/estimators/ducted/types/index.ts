// Home selection options
export type HomeType = 'single_family' | 'townhouse' | 'condo' | 'mobile_home' | 'duplex' | 'other';
export type HomeLayout = '1_story' | '2_stories' | '3_stories' | 'split_level' | 'basement' | 'loft';
export type SystemCount = 1 | 2 | 3 | 4;
export type Coverage = 'entire_home' | 'partial_home';
export type SquareFootage = 'under_800' | '800_1200' | '1200_1600' | '1600_2000' | '2000_2500' | '2500_3000' | '3000_3500' | '3500_4000' | '4000_plus';
export type HotColdSpots = 'none' | 'some' | 'too_many';
export type TempPreference = '64_68' | '68_72' | '72_76' | '76_plus';
export type HeatingType = 'gas_system' | 'heat_pump';

// Insulation & efficiency factors
export type AtticInsulation = 'not_sure' | 'low' | 'medium' | 'high';
export type WindowType = 'single_pane' | 'double_pane' | 'triple_pane' | 'mixed';
export type HomeAge = 'before_1980' | '1980_2000' | '2000_2010' | 'after_2010';

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

// Insulation & efficiency factor options
export const ATTIC_INSULATION_OPTIONS = [
  { value: 'not_sure' as const, label: 'Not sure' },
  { value: 'low' as const, label: 'Low (< 6")' },
  { value: 'medium' as const, label: 'Medium (6-15")' },
  { value: 'high' as const, label: 'High (> 16")' },
];

export const WINDOW_TYPE_OPTIONS = [
  { value: 'single_pane' as const, label: 'Single-Pane' },
  { value: 'double_pane' as const, label: 'Double-Pane' },
  { value: 'triple_pane' as const, label: 'Triple-Pane' },
  { value: 'mixed' as const, label: 'Mixed/Not Sure' },
];

export const HOME_AGE_OPTIONS = [
  { value: 'before_1980' as const, label: 'Before 1980' },
  { value: '1980_2000' as const, label: '1980-2000' },
  { value: '2000_2010' as const, label: '2000-2010' },
  { value: 'after_2010' as const, label: 'After 2010' },
];

// Summer temperature options
export const SUMMER_TEMP_OPTIONS: TempPreferenceOption[] = [
  { value: '68_72', label: '68° - 72°', description: 'Cold' },
  { value: '72_76', label: '72° - 76°', description: 'Comfortable' },
  { value: '76_plus', label: '76°+', description: 'Warm' },
];

export const SYSTEM_COUNT_OPTIONS = [
  { value: 1 as const, label: '1' },
  { value: 2 as const, label: '2' },
  { value: 3 as const, label: '3' },
  { value: 4 as const, label: '4+' },
];

export const COVERAGE_OPTIONS = [
  { value: 'entire_home' as const, label: 'Entire Home', description: 'Full house coverage' },
  { value: 'partial_home' as const, label: 'Partial Home', description: 'Specific areas only' },
];

// Tonnage options for system size selection
export interface TonnageOption {
  value: number;
  label: string;
  btu: string;
}

export const TONNAGE_OPTIONS: TonnageOption[] = [
  { value: 1.0, label: '1 Ton', btu: '12,000 BTU' },
  { value: 1.5, label: '1.5 Ton', btu: '18,000 BTU' },
  { value: 2.0, label: '2 Ton', btu: '24,000 BTU' },
  { value: 2.5, label: '2.5 Ton', btu: '30,000 BTU' },
  { value: 3.0, label: '3 Ton', btu: '36,000 BTU' },
  { value: 3.5, label: '3.5 Ton', btu: '42,000 BTU' },
  { value: 4.0, label: '4 Ton', btu: '48,000 BTU' },
  { value: 5.0, label: '5 Ton', btu: '60,000 BTU' },
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
  seer2_rating: number | null;
  hspf2_rating: number | null;
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
  streetAddress?: string;
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
  // Zip code gate
  zipCode: string;
  zipCity: string | null;
  zipState: string | null;
  isInServiceArea: boolean | null;
  // Home info
  homeType: HomeType | null;
  homeLayout: HomeLayout | null;
  // System details
  systemCount: SystemCount;
  coverage: Coverage | null;
  squareFootage: SquareFootage | null;
  // Insulation & efficiency factors
  atticInsulation: AtticInsulation | null;
  windowType: WindowType | null;
  homeAge: HomeAge | null;
  // Usage patterns
  hotColdSpots: HotColdSpots | null;
  winterTemp: TempPreference | null;
  summerTemp: TempPreference | null;
  // Equipment selection
  heatingType: HeatingType | null;
  selectedTonnage: number | null; // User-selected or scanned tonnage
  scannedEquipmentInfo: { brand?: string; tonnage?: number; model?: string; equipmentType?: string } | null; // From scanner
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
