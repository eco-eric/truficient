

## Add Scanner Promo Section to Sizing Calculator

### Overview

Add a visually appealing scanner promotion section to the bottom of the Sizing Calculator page. Since the scanner requires its own context provider (`ScannerProvider`), the cleanest approach is to create an attractive "teaser" card that links to the full scanner page.

---

### Recommended Approach: Scanner Teaser Card

Rather than embedding zip code entry (which would require the ScannerProvider and duplicate validation logic), we'll create an eye-catching promo section that:
1. Shows what the scanner does
2. Displays example data plate images
3. Links directly to the `/scanner` page

This keeps the sizing page focused while promoting the scanner tool effectively.

---

### New Section Layout

```text
+----------------------------------------------------------+
|                                                          |
|  Don't Know Your Current System Size?                    |
|  Scan your data plate to find out instantly              |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  +--------+  +--------+  +--------+  +--------+          |
|  |Carrier |  | Trane  |  |Lennox  |  |Goodman |          |
|  | [img]  |  | [img]  |  | [img]  |  | [img]  |          |
|  +--------+  +--------+  +--------+  +--------+          |
|                                                          |
|  [ScanLine Icon]                                         |
|                                                          |
|  Our free scanner identifies your system's:              |
|  • Brand & Model     • System Size (Tonnage)             |
|  • Age & Year        • Refrigerant Type                  |
|                                                          |
|          [ Scan Your Equipment → ]                       |
|                                                          |
+----------------------------------------------------------+
```

---

### Implementation Details

#### File to Modify
- `src/pages/estimators/SizingCalculator.tsx`

#### Changes

1. **Add Imports**
   - Add `ScanLine` to lucide-react imports
   - Import data plate images from `@/assets/data-plates/`

2. **Add Scanner Promo Section**
   - Insert new section between Quick Reference and CTA sections
   - Use Framer Motion for entrance animations
   - Display 4 sample data plate images in a row
   - List scanner capabilities
   - Large CTA button linking to `/scanner`

---

### Component Structure

```typescript
// New imports
import { ScanLine } from "lucide-react";
import carrierPlate from '@/assets/data-plates/carrier.jpg';
import tranePlate from '@/assets/data-plates/trane.jpg';
import lennoxPlate from '@/assets/data-plates/lennox.jpg';
import goodmanPlate from '@/assets/data-plates/goodman.jpg';

// Sample plates array (subset for visual teaser)
const samplePlates = [
  { brand: 'Carrier', image: carrierPlate },
  { brand: 'Trane', image: tranePlate },
  { brand: 'Lennox', image: lennoxPlate },
  { brand: 'Goodman', image: goodmanPlate },
];

// New section (add after Quick Reference, before CTA)
<section className="py-16 lg:py-20 bg-secondary/5">
  <div className="container mx-auto px-4">
    <motion.div ...>
      {/* Header */}
      <h2>Don't Know Your Current System Size?</h2>
      <p>Scan your data plate to find out instantly</p>
      
      {/* Sample Plates Row */}
      <div className="flex justify-center gap-3">
        {samplePlates.map(...)}
      </div>
      
      {/* Icon */}
      <ScanLine className="h-12 w-12 text-secondary" />
      
      {/* Capabilities List */}
      <div className="grid grid-cols-2 gap-2">
        <span>• Brand & Model</span>
        <span>• System Size (Tonnage)</span>
        <span>• Age & Year</span>
        <span>• Refrigerant Type</span>
      </div>
      
      {/* CTA Button */}
      <Button asChild>
        <Link to="/scanner">
          <ScanLine className="mr-2" />
          Scan Your Equipment
        </Link>
      </Button>
    </motion.div>
  </div>
</section>
```

---

### Design Notes

- Uses `bg-secondary/5` for subtle brand color background
- Sample plates show rounded thumbnails (4 of the 6 brands)
- Grid layout for capability list (2 columns)
- Large primary CTA button matches page style
- Button click tracking integrated

---

### Mobile Responsiveness

- Sample plates: 4 columns on desktop, 4 smaller on mobile
- Capability grid: 2 columns on all sizes
- Padding adjusts for mobile (`py-12` vs `py-16`)

