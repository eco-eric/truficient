import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Package, 
  LayoutDashboard, 
  Zap, 
  Calculator, 
  CreditCard, 
  Database 
} from 'lucide-react';

interface DocumentInfo {
  id: string;
  title: string;
  filename: string;
  description: string;
  icon: React.ReactNode;
  lines: number;
}

const documents: DocumentInfo[] = [
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    filename: 'ADMIN-DASHBOARD.md',
    description: 'Dashboard architecture, RBAC, navigation structure',
    icon: <LayoutDashboard className="h-5 w-5" />,
    lines: 345,
  },
  {
    id: 'ducted-estimator',
    title: 'Ducted Estimator',
    filename: 'DUCTED-ESTIMATOR.md',
    description: 'Multi-step HVAC estimator with pricing engine',
    icon: <Calculator className="h-5 w-5" />,
    lines: 599,
  },
  {
    id: 'ductless-estimator',
    title: 'Ductless Estimator',
    filename: 'DUCTLESS-ESTIMATOR.md',
    description: 'Mini-split zone configuration and BTU calculations',
    icon: <Calculator className="h-5 w-5" />,
    lines: 672,
  },
  {
    id: 'ghl-integration',
    title: 'GHL Integration',
    filename: 'GHL-INTEGRATION.md',
    description: 'GoHighLevel CRM sync and lead management',
    icon: <Zap className="h-5 w-5" />,
    lines: 408,
  },
  {
    id: 'financing-integration',
    title: 'Financing Integration',
    filename: 'FINANCING-INTEGRATION.md',
    description: 'Synchrony financing plans and payment calculations',
    icon: <CreditCard className="h-5 w-5" />,
    lines: 427,
  },
  {
    id: 'system-pricing',
    title: 'System Pricing Database',
    filename: 'SYSTEM-PRICING-DATABASE.md',
    description: 'Equipment systems and price book management',
    icon: <Database className="h-5 w-5" />,
    lines: 499,
  },
];

// Documentation content embedded for download
const documentationContent: Record<string, string> = {
  'admin-dashboard': `# Admin Dashboard Documentation

> Last Updated: January 2026

## Overview

The admin dashboard provides a centralized interface for managing submissions, content, pricing, analytics, and integrations. It uses a role-based access control system with \`admin\` and \`manager\` roles.

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN LAYOUT                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │            │ │                    AdminHeader                       │ │
│ │            │ ├──────────────────────────────────────────────────────┤ │
│ │ AdminSide  │ │                                                      │ │
│ │   bar      │ │                    Page Content                      │ │
│ │            │ │                                                      │ │
│ │ • Overview │ │    (Dashboard, Submissions, Blog, etc.)             │ │
│ │ • Content  │ │                                                      │ │
│ │ • Estima-  │ │                                                      │ │
│ │   tors     │ │                                                      │ │
│ │ • Finan-   │ │                                                      │ │
│ │   cials    │ │                                                      │ │
│ │ • Market-  │ │                                                      │ │
│ │   ing      │ │                                                      │ │
│ │ • Analyt-  │ │                                                      │ │
│ │   ics      │ │                                                      │ │
│ │ • System   │ │                                                      │ │
│ │            │ │                                                      │ │
│ └────────────┘ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Navigation Structure

**File:** \`src/components/admin/adminNavConfig.ts\`

### Sections

| Section | Access | Pages |
|---------|--------|-------|
| **Overview** | All roles | Dashboard, Submissions, DFW Watch List* |
| **Content** | Mixed | Blog, Gallery*, Equipment Library* |
| **Estimators** | Admin only | Estimates, Templates, System Pricing, Customer Equipment, Ductless Config |
| **Financials** | Admin only | Materials, Labor Rates, Admin Costs, Financing |
| **Marketing** | Admin only | SEO, Calculators, Landing Pages, GHL Tags, GHL Conversations |
| **Analytics** | Admin only | Scanner Analytics, Button Clicks, Analytics, Social Media |
| **System** | Mixed | Users*, Trash Bin*, Settings |

*Items marked with \`*\` are admin-only within mixed sections.

---

## Dashboard Components

**File:** \`src/pages/admin/Dashboard.tsx\`

### Layout Grid

\`\`\`
┌───────────────────────────────────────────────────────────────┐
│                      STATS CARDS ROW                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ Total   │ │ New     │ │ Reviewed│ │ This    │             │
│  │ Submis- │ │ (count) │ │ (count) │ │ Week    │             │
│  │ sions   │ │         │ │         │ │ (count) │             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│  │     QUICK ACTIONS       │ │      LEAD METRICS           │ │
│  │ [Blog] [Site] [Media]   │ │ Total | Conv% | Week | Src  │ │
│  │ [Submissions] [Settings]│ │  150  | 24%   | +12  | Web  │ │
│  └─────────────────────────┘ └─────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│  │   SUBMISSIONS CHART     │ │    ENGAGEMENT STATS         │ │
│  │   (30-day line chart)   │ │   Button clicks, heatmaps   │ │
│  └─────────────────────────┘ └─────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │
│  │ ACTIVITY FEED │ │ RECENT SUBS   │ │ RECENT CHATS     │   │
│  │ (timeline)    │ │ (table)       │ │ (GHL convos)     │   │
│  └───────────────┘ └───────────────┘ └───────────────────┘   │
└───────────────────────────────────────────────────────────────┘
\`\`\`

### Component Details

#### StatsCards
**File:** \`src/components/admin/dashboard/StatsCards.tsx\`

Displays four key metrics:
- **Total Submissions:** All-time count across all forms
- **New:** Submissions with status \`new\` or null
- **Reviewed:** Submissions with status \`reviewed\`, \`contacted\`, or \`closed\`
- **This Week:** Submissions from the current week

Data sources aggregated:
- \`contact_submissions\`
- \`landing_page_submissions\`
- \`ductless_estimate_submissions\`
- \`equipment_scans\` (with email)

---

## Role-Based Access Control

### Database Table: \`user_roles\`

\`\`\`sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,  -- 'admin' or 'manager'
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

### Hook: \`useUserRole\`
**File:** \`src/hooks/useUserRole.ts\`

\`\`\`typescript
const { role, isLoading } = useUserRole();
// role: 'admin' | 'manager' | null
\`\`\`

### Protected Route Component
**File:** \`src/components/admin/ProtectedRoute.tsx\`

Wraps admin pages to enforce authentication and role requirements.

---

## Related Files

### Core Layout
| File | Purpose |
|------|---------|
| \`src/components/admin/AdminLayout.tsx\` | Main layout wrapper |
| \`src/components/admin/AdminSidebar.tsx\` | Navigation sidebar |
| \`src/components/admin/AdminHeader.tsx\` | Top header bar |
| \`src/components/admin/MobileAdminNav.tsx\` | Mobile navigation |
| \`src/components/admin/adminNavConfig.ts\` | Navigation structure |

### Dashboard Components
| File | Purpose |
|------|---------|
| \`src/components/admin/dashboard/StatsCards.tsx\` | Key metric cards |
| \`src/components/admin/dashboard/QuickActions.tsx\` | Action shortcuts |
| \`src/components/admin/dashboard/LeadMetrics.tsx\` | Conversion metrics |
| \`src/components/admin/dashboard/SubmissionsChart.tsx\` | Trend visualization |
| \`src/components/admin/dashboard/EngagementStats.tsx\` | Click analytics |
| \`src/components/admin/dashboard/ActivityFeed.tsx\` | Activity timeline |
| \`src/components/admin/dashboard/RecentSubmissions.tsx\` | Latest submissions |
| \`src/components/admin/dashboard/RecentChats.tsx\` | GHL conversations |

### Auth & Access
| File | Purpose |
|------|---------|
| \`src/hooks/useAuth.ts\` | Authentication hook |
| \`src/hooks/useUserRole.ts\` | Role management hook |
| \`src/components/admin/ProtectedRoute.tsx\` | Route protection |

---

## Database Tables Used

| Table | Dashboard Usage |
|-------|-----------------|
| \`contact_submissions\` | Stats, recent submissions |
| \`landing_page_submissions\` | Stats, recent submissions |
| \`ductless_estimate_submissions\` | Stats, recent submissions |
| \`ducted_estimate_submissions\` | Stats, recent submissions |
| \`equipment_scans\` | Stats, activity feed, DFW watch list |
| \`blog_posts\` | Activity feed |
| \`button_clicks\` | Engagement stats |
| \`user_roles\` | Access control |`,

  'ducted-estimator': `# Ducted HVAC Estimator Documentation

## Overview

- **Route**: \`/estimate/ducted\`
- **Purpose**: Multi-step estimator for ducted HVAC systems (AC + Gas Furnace or Heat Pump)
- **Total Steps**: 11 (Steps 0-10)
- **Main Component**: \`src/pages/estimators/ducted/DuctedEstimator.tsx\`

---

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DUCTED ESTIMATOR FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0          Step 1         Step 2          Step 3         Step 4       │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │ ZIP  │──────▶│ HOME │──────▶│ HOME │───────▶│INSUL-│──────▶│USAGE │      │
│  │ GATE │       │ TYPE │       │DETAILS│       │ATION │       │PTRNS │      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                                              │
│  Step 5         Step 6         Step 7          Step 8         Step 9        │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │HEAT- │──────▶│SYSTEM│──────▶│ TIER │───────▶│QUOTE │──────▶│ INFO │      │
│  │ ING  │       │ SIZE │       │SELECT│        │RESULT│       │SUBMIT│      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                              Step 10         │
│                                                              ┌──────┐        │
│                                                              │THANK │        │
│                                                              │ YOU  │        │
│                                                              └──────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## File Structure

\`\`\`
src/pages/estimators/ducted/
├── DuctedEstimator.tsx           # Main component with step routing
├── context/
│   └── EstimatorContext.tsx      # State management provider
├── hooks/
│   └── useDuctedPricing.ts       # Pricing calculations
├── types/
│   └── index.ts                  # TypeScript interfaces and constants
└── steps/
    ├── Step0ZipCodeGate.tsx      # Service area validation
    ├── Step1HomeType.tsx         # Home type selection
    ├── Step2HomeDetails.tsx      # Layout, sqft, system count
    ├── Step3InsulationFactors.tsx# Attic, windows, age
    ├── Step4UsagePatterns.tsx    # Temperature preferences
    ├── Step5HeatingType.tsx      # Gas vs Heat Pump
    ├── Step6SystemSize.tsx       # Tonnage selection
    ├── Step7EfficiencyTier.tsx   # Efficiency tier selection
    ├── Step8QuoteResults.tsx     # Equipment & pricing display
    ├── Step9CustomerInfo.tsx     # Lead capture form
    └── Step10ThankYou.tsx        # Confirmation page
\`\`\`

---

## State Management

### Context Provider
**File**: \`src/pages/estimators/ducted/context/EstimatorContext.tsx\`

### State Interface (\`DuctedEstimatorState\`)

\`\`\`typescript
interface DuctedEstimatorState {
  // Navigation
  currentStep: number;
  
  // Zip Gate
  zipCode: string;
  zipCity: string | null;
  zipState: string | null;
  isInServiceArea: boolean | null;
  
  // Home Configuration
  homeType: HomeType | null;
  homeLayout: HomeLayout | null;
  systemCount: SystemCount;
  coverage: Coverage | null;
  squareFootage: SquareFootage | null;
  
  // Insulation Factors (affect tonnage)
  atticInsulation: AtticInsulation | null;
  windowType: WindowType | null;
  homeAge: HomeAge | null;
  
  // Usage Patterns
  hotColdSpots: HotColdSpots | null;
  winterTemp: TempPreference | null;
  summerTemp: TempPreference | null;
  
  // System Selection
  heatingType: HeatingType | null;
  selectedTonnage: number | null;
  recommendedTonnage: number | null;
  
  // Equipment Selection
  efficiencyTierId: string | null;
  selectedEquipmentId: string | null;
  selectedAddonIds: string[];
  
  // Customer Info
  customerInfo: CustomerInfo;
  
  // Pricing
  totals: PricingTotals;
}
\`\`\`

---

## Tonnage Calculation Engine

**File**: \`src/pages/estimators/ducted/hooks/useDuctedPricing.ts\`

### Adjustment Factors

\`\`\`typescript
// Attic Insulation Impact
const ATTIC_INSULATION_FACTOR = {
  good: 1.0,      // No adjustment
  average: 1.05,  // +5% capacity needed
  poor: 1.10,     // +10% capacity needed
};

// Window Type Impact
const WINDOW_TYPE_FACTOR = {
  double_pane: 1.0,   // No adjustment
  single_pane: 1.08,  // +8% capacity needed
};

// Home Age Impact
const HOME_AGE_FACTOR = {
  new: 1.0,    // Built after 2000
  mid: 1.05,   // Built 1980-2000
  old: 1.10,   // Built before 1980
};
\`\`\`

### Square Footage Mapping

\`\`\`typescript
function getSquareFootageMidpoint(sqft: SquareFootage): number {
  const mapping = {
    "under_1000": 800,
    "1000_1500": 1250,
    "1500_2000": 1750,
    "2000_2500": 2250,
    "2500_3000": 2750,
    "3000_3500": 3250,
    "3500_4000": 3750,
    "4000_plus": 4500,
  };
  return mapping[sqft];
}
\`\`\`

---

## Pricing Engine

**File**: \`src/pages/estimators/ducted/hooks/useDuctedPricing.ts\`

### Constants

\`\`\`typescript
const TAX_RATE = 0.0825;           // 8.25% Texas sales tax
const FINANCING_TERM_MONTHS = 60;  // 60-month financing
const FINANCING_APR = 0.0999;      // 9.99% APR default
\`\`\`

### Pricing Breakdown Interface

\`\`\`typescript
interface PricingBreakdown {
  equipmentCost: number;      // From ducted_equipment table
  installationCost: number;   // From ducted_equipment table
  addonsCost: number;         // Sum of selected add-ons
  subtotal: number;           // equipment + installation + addons
  taxAmount: number;          // subtotal * TAX_RATE
  finalTotal: number;         // subtotal + taxAmount
  monthlyPayment: number;     // Calculated financing payment
}
\`\`\`

---

## Database Schema

### \`ducted_estimate_submissions\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`customer_name\` | TEXT | Full name |
| \`customer_email\` | TEXT | Email address |
| \`customer_phone\` | TEXT | Phone number |
| \`customer_address\` | TEXT | Full address |
| \`home_type\` | TEXT | single_family, townhome, etc. |
| \`home_layout\` | TEXT | single_story, two_story, multi_story |
| \`square_footage\` | TEXT | Range category |
| \`heating_type\` | TEXT | gas_system, heat_pump |
| \`recommended_tonnage\` | NUMERIC | Calculated tonnage |
| \`efficiency_tier_id\` | UUID | FK to ducted_efficiency_tiers |
| \`equipment_id\` | UUID | FK to ducted_equipment |
| \`final_total\` | NUMERIC | Grand total |
| \`ghl_contact_id\` | TEXT | GoHighLevel contact ID |
| \`ghl_sync_status\` | TEXT | pending, synced, failed |

### \`ducted_equipment\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`brand\` | TEXT | Trane, Carrier, Lennox, etc. |
| \`system_name\` | TEXT | Display name |
| \`system_type\` | TEXT | gas_system, heat_pump |
| \`tonnage\` | NUMERIC | 1.5, 2, 2.5, 3, 3.5, 4, 5 |
| \`efficiency_tier_id\` | UUID | FK to ducted_efficiency_tiers |
| \`seer2_rating\` | NUMERIC | SEER2 efficiency rating |
| \`equipment_cost\` | NUMERIC | Equipment price |
| \`installation_labor\` | NUMERIC | Labor cost |

### \`ducted_efficiency_tiers\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`name\` | TEXT | good, better, premium, elite |
| \`display_name\` | TEXT | Good, Better, Premium, Elite |
| \`seer_min\` | NUMERIC | Minimum SEER for tier |
| \`seer_max\` | NUMERIC | Maximum SEER for tier |
| \`features\` | JSONB | Tier features array |

---

## GHL Integration

The GHL sync is triggered in \`Step9CustomerInfo.tsx\` after successful form submission:

\`\`\`typescript
// 1. Insert submission to Supabase
const { data: submission } = await supabase
  .from('ducted_estimate_submissions')
  .insert({ ... })
  .select()
  .single();

// 2. Sync to GHL
const { data: ghlResponse } = await supabase.functions.invoke('sync-ghl-contact', {
  body: {
    firstName: customerInfo.name.split(' ')[0],
    lastName: customerInfo.name.split(' ').slice(1).join(' '),
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    source: 'ducted_estimator',
    tags: ['Ducted Estimator', 'Online Estimate'],
    customFields: {
      quote_raw_details: buildQuoteRawDetails(),
      service_type: heatingType === 'heat_pump' ? 'Heat Pump' : 'AC + Furnace',
      equipment_tonnage: selectedTonnage,
      estimated_total: totals.finalTotal,
    },
  },
});

// 3. Update submission with GHL contact ID
await supabase
  .from('ducted_estimate_submissions')
  .update({ 
    ghl_contact_id: ghlResponse.contactId,
    ghl_sync_status: 'synced'
  })
  .eq('id', submission.id);
\`\`\``,

  'ductless-estimator': `# Ductless Mini-Split Estimator Documentation

## Overview

- **Route**: \`/estimate/ductless\`
- **Purpose**: Multi-zone mini-split system estimator with per-room configuration
- **Total Steps**: 9 (Steps 0-8)
- **Main Component**: \`src/pages/estimators/ductless/DuctlessEstimator.tsx\`

---

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUCTLESS ESTIMATOR FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0          Step 1         Step 2          Step 3         Step 4       │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐       ┌──────┐      │
│  │WELCM │──────▶│ CUST │──────▶│ ROOM │───────▶│ ROOM │──────▶│ UNIT │      │
│  │ HERO │       │ INFO │       │SELECT│        │DETAIL│       │STYLE │      │
│  └──────┘       └──────┘       └──────┘        └──────┘       └──────┘      │
│                                                                              │
│  Step 5         Step 6         Step 7          Step 8                        │
│  ┌──────┐       ┌──────┐       ┌──────┐        ┌──────┐                      │
│  │SYSTEM│──────▶│ ADD- │──────▶│QUOTE │───────▶│THANK │                      │
│  │ TIER │       │ ONS  │       │SUMMARY│       │ YOU  │                      │
│  └──────┘       └──────┘       └──────┘        └──────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## File Structure

\`\`\`
src/pages/estimators/ductless/
├── DuctlessEstimator.tsx         # Main component with step routing
├── context/
│   └── QuoteContext.tsx          # State management provider
├── hooks/
│   └── usePricing.ts             # BTU calculations & pricing
├── types/
│   └── index.ts                  # TypeScript interfaces and constants
├── constants/
│   └── serviceArea.ts            # DFW ZIP code validation
├── components/
│   ├── CTAButton.tsx             # Reusable action button
│   ├── PriceBar.tsx              # Sticky price display bar
│   ├── ProgressIndicator.tsx     # Step progress bar
│   ├── SelectableCard.tsx        # Selection card component
│   └── StepContainer.tsx         # Step wrapper with animations
└── steps/
    ├── WelcomeHero.tsx           # Landing page
    ├── CustomerInfoStep.tsx      # Contact & address
    ├── RoomSelector.tsx          # Room type selection
    ├── RoomDetails.tsx           # Per-room configuration
    ├── UnitStyleSelector.tsx     # Indoor unit type selection
    ├── SystemTierComparison.tsx  # Good/Better/Best tier
    ├── AddOnsSelector.tsx        # Optional upgrades
    ├── QuoteSummary.tsx          # Final quote & submit
    └── ThankYou.tsx              # Confirmation page
\`\`\`

---

## State Management

### Room Configuration Interface (\`RoomConfig\`)

\`\`\`typescript
interface RoomConfig {
  id: string;
  roomType: RoomType;
  label: string;
  size: RoomSize;               // small, medium, large
  ceilingHeight: number;        // in feet (8, 9, 10, 12, 14+)
  sunExposure: SunExposure;     // north, east, south, west
  quantity: number;
  recommendedBtu: number;       // Calculated BTU
  unitTypeId?: string;
  garageConfig?: GarageConfig;
}
\`\`\`

### Garage Configuration (\`GarageConfig\`)

\`\`\`typescript
interface GarageConfig {
  isInsulated: boolean;       // Yes = +0, No = +0.25 tons
  isStandalone: boolean;      // Attached = +0, Standalone = +0.5 tons
  hasAtticAbove: boolean;     // Room above = +0, Attic = +0.25 tons
  wantsComfortTemp: boolean;  // Storage = +0, Comfort = +0.25 tons
}
\`\`\`

---

## BTU Calculation Engine

**File**: \`src/pages/estimators/ductless/hooks/usePricing.ts\`

### Room Size to Square Footage Mapping

\`\`\`typescript
const ROOM_SIZE_SQFT = {
  small: 200,   // Up to 250 sq ft
  medium: 325,  // 250-400 sq ft
  large: 500,   // 400-600 sq ft
};
\`\`\`

### Ceiling Height Multipliers

\`\`\`typescript
const CEILING_MULTIPLIERS = {
  8: 1.0,    // Standard 8ft
  9: 1.05,   // +5%
  10: 1.10,  // +10%
  12: 1.15,  // +15%
  14: 1.25,  // +25% (vaulted)
};
\`\`\`

### Sun Exposure Multipliers

\`\`\`typescript
const SUN_EXPOSURE_MULTIPLIERS = {
  north: 1.0,   // Coolest exposure
  east: 1.05,   // Morning sun
  south: 1.10,  // Full day sun
  west: 1.15,   // Hot afternoon sun
};
\`\`\`

### Standard BTU Calculation

\`\`\`typescript
function calculateRoomBtu(room: RoomConfig): number {
  // Base: 20 BTU per square foot
  const baseBtu = ROOM_SIZE_SQFT[room.size] * 20;
  
  // Apply multipliers
  const adjustedBtu = baseBtu 
    * CEILING_MULTIPLIERS[room.ceilingHeight]
    * SUN_EXPOSURE_MULTIPLIERS[room.sunExposure];
  
  // Round to nearest standard size: 6k, 9k, 12k, 15k, 18k, 24k
  return roundToStandardBtu(adjustedBtu);
}
\`\`\`

### Garage BTU Calculation

\`\`\`typescript
function calculateGarageBtu(room: RoomConfig): number {
  const config = room.garageConfig;
  let baseBtu = calculateRoomBtu(room);
  let addedTons = 0;
  
  if (!config.isInsulated) addedTons += 0.25;
  if (config.isStandalone) addedTons += 0.5;
  if (config.hasAtticAbove) addedTons += 0.25;
  if (config.wantsComfortTemp) addedTons += 0.25;
  
  // Convert tons to BTU (1 ton = 12,000 BTU)
  const addedBtu = addedTons * 12000;
  
  return roundToStandardBtu(baseBtu + addedBtu);
}
\`\`\`

---

## Pricing Engine

### Pricing Breakdown Interface

\`\`\`typescript
interface PricingBreakdown {
  baseEquipmentCost: number;  // Sum of per-room unit prices
  tierMultiplier: number;     // From system tier (e.g., 1.0, 1.15, 1.30)
  equipmentTotal: number;     // baseEquipmentCost * tierMultiplier
  addonsCost: number;         // Sum of selected add-ons
  subtotal: number;           // equipmentTotal + addonsCost
  taxAmount: number;          // subtotal * TAX_RATE
  rebates: number;            // Any applicable rebates
  finalTotal: number;         // subtotal + taxAmount - rebates
  monthlyPayment: number;     // Calculated financing payment
}
\`\`\`

### Tier Multiplier Application

\`\`\`typescript
// System tiers have price_multiplier values:
// Good: 1.0, Better: 1.15, Best: 1.30

const tierMultiplier = selectedTier?.price_multiplier ?? 1.0;
const equipmentTotal = baseEquipmentCost * tierMultiplier;
\`\`\`

### Add-on Pricing

\`\`\`typescript
// Add-ons can be fixed or per-zone
interface DuctlessAddon {
  price: number;
  price_type: "fixed" | "per_zone";
}

const addonsCost = selectedAddons.reduce((sum, addon) => {
  if (addon.price_type === "per_zone") {
    return sum + (addon.price * selectedRooms.length);
  }
  return sum + addon.price;
}, 0);
\`\`\`

---

## Database Schema

### \`ductless_estimate_submissions\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`customer_name\` | TEXT | Full name |
| \`customer_email\` | TEXT | Email address |
| \`customer_phone\` | TEXT | Phone number |
| \`customer_address\` | TEXT | Street address |
| \`zone_count\` | INTEGER | Number of zones |
| \`selected_rooms\` | JSONB | Array of RoomConfig objects |
| \`unit_type_id\` | UUID | FK to ductless_unit_types |
| \`system_tier_id\` | UUID | FK to ductless_system_tiers |
| \`selected_addons\` | JSONB | Array of addon IDs |
| \`final_total\` | NUMERIC | Grand total |

### \`ductless_unit_types\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`name\` | TEXT | Internal name |
| \`display_name\` | TEXT | Display name |
| \`base_price\` | NUMERIC | Fallback base price |
| \`benefits\` | JSONB | Array of benefit strings |

### \`ductless_unit_size_pricing\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`unit_type_id\` | UUID | FK to ductless_unit_types |
| \`size_btu\` | INTEGER | BTU size (6000, 9000, etc.) |
| \`price\` | NUMERIC | Price for this size |

### \`ductless_system_tiers\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | UUID | Primary key |
| \`name\` | TEXT | good, better, best |
| \`display_name\` | TEXT | Good, Better, Best |
| \`price_multiplier\` | NUMERIC | 1.0, 1.15, 1.30 |
| \`seer_rating\` | NUMERIC | SEER efficiency rating |
| \`warranty_years\` | INTEGER | Warranty period |`,

  'ghl-integration': `# GoHighLevel (GHL) Integration Documentation

> Last Updated: January 2026

## Overview

This document describes the GoHighLevel (GHL) integration architecture used for lead capture, CRM synchronization, and internal notifications across all forms and estimators.

---

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND FORMS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Contact Form    │  Onsite Estimate  │  Equipment Scanner  │ Estimators │
│  (Contact.tsx)   │  (OnsiteEstimate) │  (EmailCapture.tsx) │ (Ducted/   │
│                  │                    │                     │  Ductless) │
└────────┬─────────┴─────────┬──────────┴─────────┬───────────┴─────┬─────┘
         │                   │                    │                 │
         ▼                   ▼                    ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE EDGE FUNCTIONS                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    sync-ghl-contact                             │    │
│  │  - Upserts contact to GHL via LeadConnector API                │    │
│  │  - Maps custom fields (service_type, quote_raw_details, etc.)  │    │
│  │  - Returns contactId on success                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │               send-estimator-notification                       │    │
│  │  - Creates notes on GHL contact                                 │    │
│  │  - Creates follow-up tasks                                      │    │
│  │  - Triggers GHL automation workflows                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Edge Functions

### 1. \`sync-ghl-contact\`

**Purpose:** Primary function for creating/updating contacts in GHL.

**File:** \`supabase/functions/sync-ghl-contact/index.ts\`

**Required Environment Variables:**
| Variable | Description |
|----------|-------------|
| \`GHL_API_Key_Contact\` | GHL Private Integration API Key |
| \`GHL_LOCATION_ID\` | GHL Location/Sub-account ID |

**Request Payload:**
\`\`\`typescript
interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message?: string;
  tags?: string[];
  source?: string;
  equipmentReportUrl?: string;
  zipCode?: string;
  isDfw?: boolean;
  equipment?: {
    brand?: string;
    age?: number;
    tonnage?: string;
    refrigerant?: string;
    seerRating?: number;
  };
  quote?: {
    systemType?: string;
    tonnage?: string;
    equipment?: string;
    price?: string;
    monthlyPayment?: string;
    quoteRawDetails?: string;
  };
}
\`\`\`

**Custom Fields Mapped:**
| GHL Field Key | Source |
|---------------|--------|
| \`service_type\` | contactData.serviceType |
| \`message\` | contactData.message |
| \`equipment_report_url\` | contactData.equipmentReportUrl |
| \`zip_code\` | contactData.zipCode |
| \`is_dfw\` | contactData.isDfw ("Yes"/"No") |
| \`equipment_brand\` | contactData.equipment.brand |
| \`equipment_age\` | contactData.equipment.age |
| \`quote_raw_details\` | contactData.quote.quoteRawDetails |

---

### 2. \`send-estimator-notification\`

**Purpose:** Creates internal notes and tasks in GHL for staff follow-up.

**Workflow:**
1. Receives notification data from estimator submission
2. Searches for the contact in GHL by email
3. Adds a detailed note to the contact with full quote breakdown
4. Creates a follow-up task assigned to staff

---

### 3. \`verify-ghl-custom-fields\`

**Purpose:** Audit utility for admins to verify GHL configuration.

**Admin Access:** Settings → GoHighLevel Integration → "Verify Custom Fields"

---

## Form Integration Points

| Form | File | Source Tag |
|------|------|------------|
| Contact Form | \`src/pages/Contact.tsx\` | "Website Contact Form" |
| Onsite Estimate | \`src/components/forms/OnsiteEstimateForm.tsx\` | "HVAC Estimate Page - Onsite Request" |
| Equipment Scanner | \`src/pages/scanner/components/EmailCapture.tsx\` | "Equipment Scanner" |
| Ducted Estimator | \`src/pages/estimators/ducted/steps/Step9CustomerInfo.tsx\` | "Ducted HVAC Estimator" |
| Ductless Estimator | \`src/pages/estimators/ductless/steps/QuoteSummary.tsx\` | "Ductless Mini-Split Estimator" |

---

## Submission Sync Sequence

\`\`\`
User Submits Form
       │
       ▼
┌─────────────────────────────────────┐
│  1. Insert to Supabase Table        │
│     (contact_submissions,           │
│      ducted_estimate_submissions,   │
│      ductless_estimate_submissions) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Call sync-ghl-contact           │
│     - Upsert contact to GHL         │
│     - Map all custom fields         │
│     - Get contactId                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Update Supabase Record          │
│     - ghl_contact_id = contactId    │
│     - ghl_sync_status = 'synced'    │
└──────────────┬──────────────────────┘
               │
               ▼ (Estimators only)
┌─────────────────────────────────────┐
│  4. Call send-estimator-notification│
│     - Add note to contact           │
│     - Create follow-up task         │
│     - Trigger GHL automations       │
└─────────────────────────────────────┘
\`\`\`

---

## Troubleshooting

### Common Issues

1. **GHL Credentials Not Configured**
   - Check Supabase secrets for \`GHL_API_Key_Contact\` and \`GHL_LOCATION_ID\`

2. **Custom Fields Not Syncing**
   - Run verification from Admin → Settings → GoHighLevel Integration
   - Ensure custom fields exist in GHL Location Settings

3. **Sync Failed Status**
   - Check edge function logs for API errors
   - Verify GHL API key has correct permissions

---

## Related Files

| File | Purpose |
|------|---------|
| \`supabase/functions/sync-ghl-contact/index.ts\` | Contact sync function |
| \`supabase/functions/send-estimator-notification/index.ts\` | Internal notifications |
| \`supabase/functions/verify-ghl-custom-fields/index.ts\` | Field verification |
| \`src/hooks/useFormSourceTags.ts\` | Dynamic tag fetching |
| \`src/pages/admin/GHLTags.tsx\` | Tag management UI |`,

  'financing-integration': `# Financing Integration Documentation

> Last Updated: January 2026

## Overview

This document describes how financing options are managed in the admin dashboard and displayed in the ducted and ductless estimators. The system uses Synchrony Bank financing with configurable plans.

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD                                    │
│                   /admin/financing                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Financing Options Manager                       │   │
│  │  - Create/Edit financing plans                                   │   │
│  │  - Set APR, payment factors, terms                               │   │
│  │  - Toggle active status                                          │   │
│  │  - Assign to estimator types (ducted/ductless)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                                     │
│                  financing_options table                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  id | plan_name | promotional_offer | interest_rate | payment_factor   │
│     | months_to_payoff | contractor_fee | applies_to | sort_order      │
│     | is_active                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│    DUCTED ESTIMATOR         │ │    DUCTLESS ESTIMATOR       │
│    Step8QuoteResults.tsx    │ │    QuoteSummary.tsx         │
├─────────────────────────────┤ ├─────────────────────────────┤
│  ┌───────────────────────┐  │ │  ┌───────────────────────┐  │
│  │ FinancingOptionsSection│  │ │  │ FinancingOptionsSection│  │
│  │ estimatorType="ducted" │  │ │  │ estimatorType="ductless│  │
│  │ finalTotal={price}     │  │ │  │ finalTotal={price}     │  │
│  └───────────────────────┘  │ │  └───────────────────────┘  │
└─────────────────────────────┘ └─────────────────────────────┘
\`\`\`

---

## Database Schema

### Table: \`financing_options\`

\`\`\`sql
CREATE TABLE public.financing_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  tran_code TEXT,
  promotional_offer TEXT NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  payment_factor DECIMAL(10,6) NOT NULL DEFAULT 0,
  months_to_payoff INTEGER,
  contractor_fee DECIMAL(5,2) NOT NULL DEFAULT 0,
  dealer_net_cost TEXT,
  notes TEXT,
  applies_to TEXT[] DEFAULT ARRAY['ductless', 'ducted'],
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
\`\`\`

---

## Admin Management

### Page: Financing Options
**File:** \`src/pages/admin/FinancingOptions.tsx\`
**Route:** \`/admin/financing\`

### Features

1. **List All Plans** - Sortable table with all financing options
2. **Create/Edit Plans** - Dialog form for plan details
3. **Delete Plans** - Confirmation required

---

## Estimator Integration

### Component: FinancingOptionsSection
**File:** \`src/components/estimators/FinancingOptionsSection.tsx\`

### Props

\`\`\`typescript
interface FinancingOptionsSectionProps {
  estimatorType: "ducted" | "ductless";
  finalTotal: number;
}
\`\`\`

### Payment Calculation

\`\`\`typescript
// Monthly payment = Total × Payment Factor
const monthlyPayment = finalTotal * plan.payment_factor;

// Example: $14,847 × 0.0125 = $185.59/mo
\`\`\`

---

## Payment Factor Reference

| APR | Term | Factor | Example ($15,000) |
|-----|------|--------|-------------------|
| 9.99% | 132 mo | 0.0125 | $187.50/mo |
| 7.99% | 61 mo | 0.0200 | $300.00/mo |
| 5.99% | 37 mo | 0.0300 | $450.00/mo |
| 3.99% | 57 mo | 0.0260 | $390.00/mo |
| 0.00% | 60 mo | 0.0167 | $250.50/mo |

---

## Synchrony Disclaimers

### Required Disclosures

\`\`\`
*Subject to credit approval. Minimum monthly payments required. 
See store for details. Financing provided by Synchrony Bank.
\`\`\`

---

## Related Files

| File | Purpose |
|------|---------|
| \`src/pages/admin/FinancingOptions.tsx\` | Admin management page |
| \`src/components/estimators/FinancingOptionsSection.tsx\` | Display component |
| \`src/pages/estimators/ducted/steps/Step8QuoteResults.tsx\` | Ducted integration |
| \`src/pages/estimators/ductless/steps/QuoteSummary.tsx\` | Ductless integration |`,

  'system-pricing': `# System Pricing Database Setup

Complete database documentation for the **System Pricing** admin feature, which manages HVAC equipment systems and price book PDFs.

---

## Overview

The System Pricing feature allows administrators to:
- Manage equipment systems with detailed specifications and pricing
- **Separate gas furnace and heat pump system configurations**
- Upload and organize PDF price books from manufacturers
- Import/export equipment data via Excel

---

## Tables

### 1. \`equipment_systems\`

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | uuid | Primary key |
| \`system_name\` | text | Display name (required) |
| \`system_type\` | text | \`'ducted'\` or \`'mini_split'\` |
| \`heating_source\` | text | \`'gas_furnace'\` or \`'heat_pump'\` (ducted only) |
| \`tonnage\` | numeric | System capacity in tons |
| \`ahri_number\` | text | AHRI certification number |
| \`condenser_heat_pump_model\` | text | Outdoor unit model number |
| \`condenser_price\` | numeric | Outdoor unit cost |
| \`furnace_model\` | text | Gas furnace model |
| \`furnace_price\` | numeric | Furnace cost |
| \`furnace_btu_input\` | integer | Furnace heating capacity |
| \`furnace_afue\` | numeric | Furnace efficiency |
| \`air_handler_model\` | text | Air handler model (heat pump) |
| \`air_handler_price\` | numeric | Air handler cost |
| \`evap_coil_model\` | text | Evaporator coil model |
| \`evap_coil_price\` | numeric | Evaporator coil cost |
| \`heat_kit\` | text | Electric heat kit model |
| \`heat_kit_price\` | numeric | Heat kit cost |
| \`system_price\` | numeric | Total calculated system price |
| \`seer2\` | numeric | SEER2 efficiency rating |
| \`eer2\` | numeric | EER2 efficiency rating |
| \`hspf2\` | numeric | HSPF2 heating efficiency |

---

## System Types and Heating Sources

### Ducted Systems

| Heating Source | Indoor Unit | Key Fields |
|----------------|-------------|------------|
| \`gas_furnace\` | Gas Furnace | \`furnace_model\`, \`furnace_price\`, \`furnace_btu_input\`, \`furnace_afue\` |
| \`heat_pump\` | Air Handler | \`air_handler_model\`, \`air_handler_price\`, \`air_handler_cfm\`, \`heat_kit\`, \`heat_kit_price\` |

---

## Auto-Calculated System Price

**Gas Furnace Systems:**
\`\`\`
system_price = condenser_price + furnace_price + evap_coil_price
\`\`\`

**Heat Pump Systems:**
\`\`\`
system_price = condenser_price + air_handler_price + evap_coil_price + heat_kit_price
\`\`\`

---

## Row Level Security (RLS) Policies

### \`equipment_systems\` Policies

| Policy Name | Operation | Using/With Check |
|-------------|-----------|------------------|
| \`Admins can view equipment systems\` | SELECT | \`has_role(auth.uid(), 'admin')\` |
| \`Admins can insert equipment systems\` | INSERT | \`has_role(auth.uid(), 'admin')\` |
| \`Admins can update equipment systems\` | UPDATE | \`has_role(auth.uid(), 'admin')\` |
| \`Admins can delete equipment systems\` | DELETE | \`has_role(auth.uid(), 'admin')\` |

---

## TypeScript Interfaces

\`\`\`typescript
interface EquipmentSystem {
  id: string;
  system_name: string;
  system_type: 'ducted' | 'mini_split';
  heating_source: 'gas_furnace' | 'heat_pump' | null;
  tonnage: number | null;
  ahri_number: string | null;
  
  // Outdoor unit
  condenser_heat_pump_model: string | null;
  condenser_price: number | null;
  
  // Furnace (gas systems only)
  furnace_model: string | null;
  furnace_price: number | null;
  furnace_btu_input: number | null;
  furnace_afue: number | null;
  
  // Air handler (heat pump systems only)
  air_handler_model: string | null;
  air_handler_price: number | null;
  
  // Common equipment
  evap_coil_model: string | null;
  evap_coil_price: number | null;
  heat_kit: string | null;
  heat_kit_price: number | null;
  
  // Efficiency ratings
  seer2: number | null;
  eer2: number | null;
  hspf2: number | null;
  
  // Calculated total
  system_price: number | null;
}
\`\`\`

---

## Usage Examples

### Fetch Equipment Systems

\`\`\`typescript
import { supabase } from "@/integrations/supabase/client";

// Get all ducted gas furnace systems
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .eq('system_type', 'ducted')
  .eq('heating_source', 'gas_furnace')
  .order('tonnage', { ascending: true });

// Get all heat pump systems
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .eq('heating_source', 'heat_pump')
  .order('tonnage', { ascending: true });
\`\`\`

---

## Related Files

| File | Purpose |
|------|---------|
| \`src/pages/admin/SystemPricing.tsx\` | Admin UI for managing systems and price books |
| \`src/integrations/supabase/types.ts\` | Auto-generated TypeScript types |`,
};

export const SystemDocumentation = () => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadDocument = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = (docId: string, filename: string) => {
    setDownloading(docId);
    const content = documentationContent[docId];
    if (content) {
      downloadDocument(content, filename);
      toast({
        title: 'Download started',
        description: `${filename} is being downloaded.`,
      });
    }
    setTimeout(() => setDownloading(null), 500);
  };

  const handleDownloadAll = () => {
    setDownloading('all');
    
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];
    
    let combinedContent = `# Truficient Admin System Documentation
Generated: ${now.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

---

## Table of Contents

${documents.map((doc, idx) => `${idx + 1}. [${doc.title}](#${doc.id})`).join('\n')}

---

`;

    documents.forEach((doc) => {
      const content = documentationContent[doc.id];
      if (content) {
        combinedContent += `\n\n---\n\n<a id="${doc.id}"></a>\n\n${content}`;
      }
    });

    downloadDocument(combinedContent, `truficient-system-docs-${timestamp}.md`);
    
    toast({
      title: 'Combined export started',
      description: 'All documentation is being downloaded as a single file.',
    });
    
    setTimeout(() => setDownloading(null), 500);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Download system documentation for use with external AI assistants like Claude or ChatGPT.
      </p>

      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 p-2 rounded-md bg-muted">
                    {doc.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{doc.title}</p>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {doc.lines} lines
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc.id, doc.filename)}
                  disabled={downloading === doc.id}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading === doc.id ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={handleDownloadAll}
          disabled={downloading === 'all'}
          className="w-full gap-2"
        >
          <Package className="h-4 w-4" />
          {downloading === 'all' ? 'Preparing Download...' : 'Download All Documentation (Combined)'}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Generates a single markdown file with table of contents
        </p>
      </div>
    </div>
  );
};
