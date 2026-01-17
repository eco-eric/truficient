// Room configuration types
export interface RoomConfig {
  id: string;
  roomType: RoomType;
  label: string;
  size: RoomSize;
  ceilingHeight: number; // in feet
  sunExposure: SunExposure;
  quantity: number;
  recommendedBtu: number;
  unitTypeId?: string;
}

export type RoomType =
  | "master_bedroom"
  | "living_room"
  | "kitchen"
  | "home_office"
  | "bedroom"
  | "dining_room"
  | "bonus_room"
  | "basement"
  | "garage"
  | "sunroom";

export type RoomSize = "small" | "medium" | "large";

export type SunExposure = "north" | "east" | "south" | "west";

// Unit type from database
export interface DuctlessUnitType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  base_price: number;
  benefits: string[] | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// System tier from database
export interface DuctlessSystemTier {
  id: string;
  name: string;
  display_name: string;
  tier_level: "good" | "better" | "best";
  description: string | null;
  price_multiplier: number;
  features: string[] | null;
  seer_rating: number | null;
  warranty_years: number;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
}

// Add-on from database
export interface DuctlessAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_type: "fixed" | "per_zone";
  icon_name: string | null;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

// Customer info for lead capture
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Pricing totals
export interface PricingTotals {
  subtotal: number;
  taxAmount: number;
  rebates: number;
  finalTotal: number;
  monthlyFinancing: number;
}

// Full quote state
export interface QuoteState {
  currentStep: number;
  selectedRooms: RoomConfig[];
  unitTypeId: string | null;
  systemTierId: string | null;
  selectedAddonIds: string[];
  customerInfo: CustomerInfo;
  totals: PricingTotals;
  applyUnitTypeToAll: boolean;
}

// Room type metadata for display
export interface RoomTypeOption {
  type: RoomType;
  label: string;
  icon: string; // Lucide icon name
  allowMultiple: boolean;
}

export const ROOM_TYPE_OPTIONS: RoomTypeOption[] = [
  { type: "master_bedroom", label: "Master Bedroom", icon: "BedDouble", allowMultiple: false },
  { type: "living_room", label: "Living Room", icon: "Sofa", allowMultiple: false },
  { type: "kitchen", label: "Kitchen", icon: "ChefHat", allowMultiple: false },
  { type: "home_office", label: "Home Office", icon: "Monitor", allowMultiple: false },
  { type: "bedroom", label: "Bedroom", icon: "Bed", allowMultiple: true },
  { type: "dining_room", label: "Dining Room", icon: "UtensilsCrossed", allowMultiple: false },
  { type: "bonus_room", label: "Bonus Room", icon: "Gamepad2", allowMultiple: true },
  { type: "basement", label: "Basement", icon: "Home", allowMultiple: false },
  { type: "garage", label: "Garage", icon: "Car", allowMultiple: false },
  { type: "sunroom", label: "Sunroom", icon: "Sun", allowMultiple: false },
];

export const ROOM_SIZE_OPTIONS: { value: RoomSize; label: string; sqftRange: string }[] = [
  { value: "small", label: "Small", sqftRange: "Up to 250 sq ft" },
  { value: "medium", label: "Medium", sqftRange: "250–400 sq ft" },
  { value: "large", label: "Large", sqftRange: "400+ sq ft" },
];

export const SUN_EXPOSURE_OPTIONS: { value: SunExposure; label: string }[] = [
  { value: "north", label: "North" },
  { value: "east", label: "East" },
  { value: "south", label: "South" },
  { value: "west", label: "West" },
];
