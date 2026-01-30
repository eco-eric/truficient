

## Add "What's Included" Step to Ducted Estimator

### Overview

Add a new trust-building step (Step 7) that showcases everything included with every Truficient installation. This step features your photo, an owner quote, 8 value proposition cards, and trust badges.

---

### Step Flow Changes

| Step | Label | Component | Notes |
|------|-------|-----------|-------|
| 0 | Location | Step0ZipCodeGate.tsx | No change |
| 1 | Home Type | Step1HomeType.tsx | No change |
| 2 | Home Details | Step2HomeDetails.tsx | No change |
| 3 | Insulation | Step3InsulationFactors.tsx | No change |
| 4 | Comfort | Step4UsagePatterns.tsx | No change |
| 5 | Heating Type | Step5HeatingType.tsx | No change |
| 6 | System Size | Step6SystemSize.tsx | Rename from Step7SystemSize.tsx |
| **7** | **What's Included** | **Step7WhatsIncluded.tsx** | **NEW STEP** |
| 8 | Contact Info | Step8CustomerInfo.tsx | Rename from Step6CustomerInfo.tsx |
| 9 | Efficiency | Step9EfficiencyTier.tsx | Rename from Step8EfficiencyTier.tsx |
| 10 | Your Quote | Step10QuoteResults.tsx | Rename from Step9QuoteResults.tsx |
| 11 | Thank You | Step11ThankYou.tsx | Rename from Step10ThankYou.tsx |

---

### New Step 7: "What's Included" Layout

```text
+--------------------------------------------------+
|            Every Truficient Installation         |
|                    Includes                      |
|  We don't cut corners. Here's what sets us apart |
+--------------------------------------------------+
|                                                  |
|  +------------+  +----------------------------+  |
|  |            |  | "I personally stand behind |  |
|  |   [Your    |  |  every installation..."    |  |
|  |   Photo]   |  |                            |  |
|  |            |  | - Eric, Owner              |  |
|  +------------+  | [Diamond] [HERS] [1000+]   |  |
|                  +----------------------------+  |
|                                                  |
+--------------------------------------------------+
|                 8-ITEM VALUE GRID                |
|  +----------+  +----------+  +----------+  +--+  |
|  | Surge    |  | Air      |  | Dampers  |  |..|  |
|  | Protector|  | Balance  |  | $175     |  |  |  |
|  | $150     |  | $200     |  |          |  |  |  |
|  +----------+  +----------+  +----------+  +--+  |
|  +----------+  +----------+  +----------+  +--+  |
|  | Plenum   |  | Report   |  | 2-Year   |  |..|  |
|  | Sealing  |  | Included |  | Warranty |  |  |  |
|  | $125     |  |          |  |          |  |  |  |
|  +----------+  +----------+  +----------+  +--+  |
+--------------------------------------------------+
|       Total Added Value: Over $900               |
|   Other contractors charge extra for these       |
+--------------------------------------------------+
|   [Mitsubishi Diamond] [HERS] [A+ BBB] [Licensed]|
+--------------------------------------------------+
|        [ Back ]          [ Continue ]            |
+--------------------------------------------------+
```

---

### 8 Value Proposition Cards

| # | Icon | Title | Description | Badge |
|---|------|-------|-------------|-------|
| 1 | Zap | Whole-System Surge Protector | Protects your investment from power surges | $150 Value |
| 2 | Wind | Professional Air Balancing | Every room tested for optimal airflow | $200 Value |
| 3 | SlidersHorizontal | Balancing Dampers | Precision airflow control for consistent temps | $175 Value |
| 4 | Shield | Plenum Air Sealing | Complete sealing to maximize efficiency | $125 Value |
| 5 | FileCheck | Full Commissioning Report | Detailed documentation of system performance | Included |
| 6 | BadgeCheck | 2-Year Labor Warranty | Any issues? We fix them at no cost | Peace of Mind |
| 7 | Wifi | WiFi Smart Thermostat | Control your comfort from anywhere | $250 Value |
| 8 | Award | Performance Guarantee | If it doesn't perform as promised, we make it right | 100% Guaranteed |

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/owner-eric.jpg` | Copy your uploaded photo here |
| `src/pages/estimators/ducted/steps/Step7WhatsIncluded.tsx` | **Create** - New step component |
| `src/pages/estimators/ducted/steps/Step6SystemSize.tsx` | Rename from Step7SystemSize.tsx |
| `src/pages/estimators/ducted/steps/Step8CustomerInfo.tsx` | Rename from Step6CustomerInfo.tsx |
| `src/pages/estimators/ducted/steps/Step9EfficiencyTier.tsx` | Rename from Step8EfficiencyTier.tsx |
| `src/pages/estimators/ducted/steps/Step10QuoteResults.tsx` | Rename from Step9QuoteResults.tsx |
| `src/pages/estimators/ducted/steps/Step11ThankYou.tsx` | Rename from Step10ThankYou.tsx |
| `src/pages/estimators/ducted/DuctedEstimator.tsx` | Update imports, labels, and switch cases for 12 steps |

---

### Technical Details

#### New Step Component Structure

```typescript
// Step7WhatsIncluded.tsx
import { motion } from "framer-motion";
import { useEstimator } from "../context/EstimatorContext";
import ownerImage from "@/assets/owner-eric.jpg";

const INCLUDED_ITEMS = [
  { icon: Zap, title: "Whole-System Surge Protector", ... },
  // ... 7 more items
];

export const Step7WhatsIncluded = () => {
  const { nextStep, prevStep } = useEstimator();
  
  return (
    <StepContainer>
      {/* Header Section */}
      {/* Owner Photo + Quote Section */}
      {/* 8-Item Grid (2 cols mobile, 4 cols desktop) */}
      {/* Total Value Banner */}
      {/* Trust Badges Row */}
      {/* Navigation Buttons */}
    </StepContainer>
  );
};
```

#### Updated Step Labels

```typescript
const STEP_LABELS = [
  "Location",       // 0
  "Home Type",      // 1
  "Home Details",   // 2
  "Insulation",     // 3
  "Comfort",        // 4
  "Heating Type",   // 5
  "System Size",    // 6
  "What's Included",// 7 - NEW
  "Contact Info",   // 8
  "Efficiency",     // 9
  "Your Quote",     // 10
  "Thank You",      // 11
];
```

#### Updated Layout Logic

```typescript
// Progress shown on steps 1-10 (11 total progress steps)
const showProgress = currentStep > 0 && currentStep < 11;

// Compact header on steps 1-10
const showCompactHeader = currentStep > 0 && currentStep < 11;

// Standard footer on step 0 and step 11
const showStandardFooter = currentStep === 0 || currentStep === 11;
```

---

### Animations

- Owner section fades in from the left
- Grid items stagger with 0.1s delay between each
- Total value section slides up
- All using Framer Motion's `motion.div` with variants

---

### Mobile Responsiveness

- Owner photo stacks above quote on mobile
- Grid: 2 columns on mobile, 4 columns on desktop
- Value badges wrap to new line on small screens
- Reduced padding on mobile (p-4 vs p-6)

---

### Your Photo

Your uploaded photo will be saved to `src/assets/owner-eric.jpg` and imported as an ES6 module for optimal bundling and display.

