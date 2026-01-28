

## Heat Pump Advantage Page Implementation

This plan converts the uploaded `HeatPumpAdvantagePage.jsx` (which uses inline styles) into a properly styled React TypeScript page that matches the existing Truficient website design system.

---

### Overview

The page will be created at `/heat-pump-advantage` and will include:
- Interactive Gas vs Electric Calculator with real-time savings calculations
- Atmos Energy rate crisis data and timeline
- Climate advantage, technology, and rate stability sections
- Real DFW homeowner testimonials
- Myths debunked section
- ROI comparison between gas furnace and heat pump
- Call-to-action with credentials
- Collapsible data sources section

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/HeatPumpAdvantage.tsx` | Main page component with all sections |
| `src/components/heat-pump/GasVsElectricCalculator.tsx` | Interactive calculator component |
| `src/components/heat-pump/RateTimelineTable.tsx` | Atmos rate increase table |
| `src/components/heat-pump/BenefitsGrid.tsx` | "Why Heat Pumps Win" cards |
| `src/components/heat-pump/HomeownerReports.tsx` | Real user testimonials |
| `src/components/heat-pump/MythsSection.tsx` | Myths busted cards |
| `src/components/heat-pump/ROIComparison.tsx` | Financial comparison |

---

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add route for `/heat-pump-advantage` |

---

### Design Adaptations

The uploaded file uses inline styles with colors like `#1e3a5f` (navy) and `#d4a437` (gold). These will be converted to use the existing Tailwind CSS design system:

| Original (Inline) | Converted (Tailwind) |
|-------------------|---------------------|
| `#1e3a5f` (navy) | `bg-primary`, `text-primary` |
| `#d4a437` (gold) | `bg-secondary`, `text-secondary` |
| `#ffffff` (white) | `bg-background`, `text-foreground` |
| `#f0f9ff` (light blue) | `bg-muted` or custom gradient |
| `rgba(...)` overlays | Tailwind opacity utilities |
| Inline font styles | Existing font classes |
| Custom shadows | Tailwind shadow utilities |

---

### Component Breakdown

**1. Hero Section**
- Full-width gradient background matching `bg-primary`
- Badge component with lightning icon
- Headline with gold gradient highlight
- Stats comparison cards ($723 vs $150)
- CTA button linking to calculator anchor

**2. Crisis Alert Section**
- Warning card with alert styling
- Atmos rate timeline table showing 420% increase
- Five-year cumulative data

**3. Gas vs Electric Calculator**
- Input panel with sliders (using existing `@/components/ui/slider`)
- Home size (1,000-5,000 sq ft)
- Thermostat setting (65-78°F)
- Electric rate ($0.08-$0.18/kWh)
- SEER tier buttons (Good/Better/Premium/Elite)
- Results panel with live calculations
- Monthly/annual/5-year savings display

**4. Why Heat Pumps Win Section**
- Three-column grid using Card components
- Climate advantage with temperature distribution bars
- Technology features list
- Rate stability comparison

**5. Real Homeowner Reports**
- Two-column layout (Gas users vs Heat pump users)
- Quote cards with location, bill amount, and details
- Red/green accent borders for visual contrast

**6. Myths Busted Section**
- Dark navy background section
- Four myth cards with icons
- Yellow accent text for myth titles

**7. ROI Comparison**
- Side-by-side cost breakdown
- Gas furnace + AC vs Heat pump
- Highlight box showing immediate payback

**8. CTA Section**
- Reuses existing CTASection pattern
- Buttons to `/estimate/ducted` and `/contact`
- Credential badges

**9. Data Sources (Collapsible)**
- Uses Radix Collapsible component
- Lists all sources and methodology
- Disclaimer text

---

### Technical Details

**Calculator Logic (from uploaded file):**
```typescript
// Constants
const ATMOS_EFFECTIVE_RATE = 2.47; // $/Ccf
const FEDERAL_TAX_CREDIT = 2000;
const WINTER_MONTHS = 5;

// Gas calculation
const ccfPerMonth = (squareFootage / 2500) * 120 * (thermostatTemp - 65) / 7;
const monthlyGasCost = ccfPerMonth * ATMOS_EFFECTIVE_RATE + 20;

// Heat pump calculation
const heatPumpCOP = heatPumpSEER >= 20 ? 3.2 : heatPumpSEER >= 16 ? 2.8 : 2.5;
const btuNeeded = squareFootage * 30 * (thermostatTemp - 45) / 25;
const kwhPerMonth = (btuNeeded / 3412 / heatPumpCOP) * 30;
const monthlyHeatPumpCost = kwhPerMonth * electricRate;
```

**State Management:**
```typescript
const [squareFootage, setSquareFootage] = useState(2500);
const [thermostatTemp, setThermostatTemp] = useState(72);
const [electricRate, setElectricRate] = useState(0.13);
const [heatPumpSEER, setHeatPumpSEER] = useState(18);
```

**Animations:**
- Uses Framer Motion for entrance animations (matching existing patterns)
- `whileInView` triggers for scroll-based animations
- `viewport={{ once: true }}` to prevent re-animation

---

### Route Addition

```typescript
// In src/App.tsx
import HeatPumpAdvantage from "./pages/HeatPumpAdvantage";

// Add to routes array:
{ path: "/heat-pump-advantage", element: <HeatPumpAdvantage /> },
```

---

### Components Used from Existing Library

- `Header` and `Footer` layout components
- `Button` from `@/components/ui/button`
- `Card`, `CardContent` from `@/components/ui/card`
- `Slider` from `@/components/ui/slider`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- `motion` from Framer Motion
- Lucide icons: `Zap`, `Flame`, `Thermometer`, `TrendingUp`, `CheckCircle`, `AlertTriangle`, `XCircle`, `ChevronDown`

---

### Mobile Responsiveness

All sections will use:
- `grid lg:grid-cols-2` for two-column layouts
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for multi-column grids
- `text-3xl md:text-4xl lg:text-5xl` for responsive typography
- `flex-col sm:flex-row` for button groups
- `container mx-auto px-4` for consistent spacing

---

### SEO Integration

The page will include:
```typescript
import { usePageSEO } from '@/hooks/usePageSEO';

// In component:
usePageSEO();
```

This enables dynamic SEO metadata from the database.

---

### Button Tracking Integration

All CTA buttons will use the existing tracking hook:
```typescript
import { useButtonTracking } from '@/hooks/useButtonTracking';

const { trackButtonClick } = useButtonTracking();

const handleEstimateClick = () => {
  trackButtonClick({
    buttonName: 'Get Your Free Estimate',
    buttonLocation: 'Heat Pump Advantage Page',
    destinationUrl: '/estimate/ducted',
  });
};
```

---

### Data from Uploaded File

**Rate Timeline Data:**
```typescript
const rateData = [
  { year: '2022', increase: '+$4.17/mo', cumulative: '$4.17', change: '~4%' },
  { year: '2023', increase: '+$5.73/mo', cumulative: '$9.90', change: '~5%' },
  { year: '2024', increase: '+$13.69/mo', cumulative: '$23.59', change: '+14.94%' },
  { year: '2025', increase: '+$7.83/mo', cumulative: '$31.42', change: '+7.93%' },
  { year: '2026', increase: '+$11.25/mo', cumulative: '$42.67', change: '+10.4%' },
];
```

**Myths Data:**
```typescript
const myths = [
  { icon: '❄️', myth: "Heat pumps don't work in cold weather", truth: "Modern inverter heat pumps maintain full capacity to 5°F..." },
  { icon: '💸', myth: "Electric heating is always more expensive", truth: "At 2026 gas rates, heat pumps cost 30-50% less to operate..." },
  { icon: '🏠', myth: "Heat pumps can't heat a whole house", truth: "Properly sized heat pumps provide the same BTU output..." },
  { icon: '⏰', myth: "Heat pumps take forever to heat up", truth: "Variable-speed compressors provide consistent temperature..." },
];
```

**Homeowner Reports:**
```typescript
const gasReports = [
  { location: 'Allen, TX', bill: '$723', sqft: '3,200 sqft', month: 'Jan 2026' },
  { location: 'Plano, TX', bill: '$335', sqft: '2,100 sqft', month: 'Dec 2025' },
  { location: 'Frisco, TX', bill: '$400+', sqft: '2,800 sqft', month: 'Jan 2026' },
];

const heatPumpReports = [
  { location: 'Richardson, TX', bill: '$147', sqft: '2,400 sqft', month: 'Jan 2026' },
  { location: 'McKinney, TX', bill: '$165', sqft: '3,100 sqft', month: 'Dec 2025' },
  { location: 'Carrollton, TX', bill: '$182', sqft: '2,800 sqft', month: 'Jan 2026' },
];
```

---

### Summary

This implementation will create a compelling, data-driven landing page that:
1. Matches the existing Truficient design system
2. Provides an interactive calculator for personalized savings estimates
3. Uses real 2026 Atmos rate data to demonstrate the cost advantage
4. Includes social proof from real DFW homeowners
5. Addresses common objections with the myths section
6. Drives conversions with clear CTAs to the ducted estimator

