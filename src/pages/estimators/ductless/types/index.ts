// Room configuration types
export interface GarageConfig {
  isInsulated: boolean;          // Yes = +0, No = +0.25 tons
  isStandalone: boolean;         // Attached = +0, Standalone = +0.5 tons
  hasAtticAbove: boolean;        // Room above = +0, Attic = +0.25 tons
  wantsComfortTemp: boolean;     // Storage = +0, Comfort = +0.25 tons
}

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
  garageConfig?: GarageConfig;   // Only used for garage rooms
}

// Garage add-on options with tonnage values
export const GARAGE_INSULATION_OPTIONS = [
  { value: true, label: "Yes, Insulated", addedTons: 0 },
  { value: false, label: "No Insulation", addedTons: 0.25 },
] as const;

export const GARAGE_ATTACHMENT_OPTIONS = [
  { value: false, label: "Attached to House", addedTons: 0 },
  { value: true, label: "Standalone / Detached", addedTons: 0.5 },
] as const;

export const GARAGE_ABOVE_OPTIONS = [
  { value: false, label: "Room Above", description: "Same as house", addedTons: 0 },
  { value: true, label: "Attic / Unconditioned", description: "More heat loss", addedTons: 0.25 },
] as const;

export const GARAGE_TEMP_OPTIONS = [
  { value: false, label: "Conditioned Storage", description: "Keep comfortable, not precise", addedTons: 0 },
  { value: true, label: "Comfort Like House", description: "Maintain ~70 degrees", addedTons: 0.25 },
] as const;

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
  // Extended address fields from Google Places
  streetAddress?: string;
  formattedAddress?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  placeId?: string;
  // Optional notes for customer to share setup details, issues, or promo codes
  notes?: string;
}

// Per-zone pricing with discount info
export interface ZonePrice {
  roomId: string;
  roomLabel: string;
  basePrice: number;
  discountRate: number;      // 0 or 0.25
  discountAmount: number;    // Saved amount
  finalPrice: number;        // After discount
  zonePosition: number;      // 1-indexed position
}

// Pricing totals
export interface PricingTotals {
  subtotal: number;
  taxAmount: number;
  rebates: number;
  finalTotal: number;
  monthlyFinancing: number;
  // Multi-zone discount tracking
  perZonePrices: ZonePrice[];
  totalSavings: number;      // Sum of all discounts
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
  partialSubmissionId: string | null; // For abandoned cart tracking
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
  { value: "large", label: "Large", sqftRange: "400–600 sq ft" },
];

export const SUN_EXPOSURE_OPTIONS: { value: SunExposure; label: string }[] = [
  { value: "north", label: "North" },
  { value: "east", label: "East" },
  { value: "south", label: "South" },
  { value: "west", label: "West" },
];
