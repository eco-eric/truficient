

## Add "Your Home is A System" as Subtitle in Sizing Factors Section

### Overview

Integrate the 6 system factor cards into the existing "What Determines System Size?" section as a subtitle/subsection, rather than creating a separate section. This keeps the content cohesive and shows that these factors all work together.

---

### Updated Section Structure

```text
+----------------------------------------------------------+
|           What Determines System Size?                   |
|  Proper HVAC sizing involves more than just square       |
|  footage                                                 |
+----------------------------------------------------------+
|                                                          |
|  [3 EXISTING CARDS: Sq Footage, Climate, Insulation]     |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  ── Your Home is A System ──                             |
|  Every component works together to determine your        |
|  comfort and efficiency                                  |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  [6 NEW CARDS in 3x2 grid]                              |
|  Thermostat | Insulation | Windows                       |
|  Duct Quality | Orientation | Tree Coverage              |
|                                                          |
+----------------------------------------------------------+
```

---

### Implementation Details

#### File to Modify
- `src/pages/estimators/SizingCalculator.tsx`

#### Changes

1. **Add New Icon Imports** (line 2)
   - Add `Settings`, `Compass`, `Trees`, `Gauge` to existing lucide-react imports

2. **Add New Data Array** (after `sizingFactors` array, around line 31)
   ```typescript
   const systemFactors = [
     { icon: Settings, title: "Thermostat Setting", description: "Your preferred indoor temperature affects system capacity requirements and runtime efficiency" },
     { icon: Wind, title: "Insulation", description: "Proper attic and wall insulation reduces heating and cooling loads significantly" },
     { icon: Gauge, title: "Windows", description: "Double-pane, low-E windows minimize heat transfer and improve comfort" },
     { icon: Wind, title: "Duct Quality & Air Leakage", description: "Sealed, insulated ductwork ensures efficient air delivery throughout your home" },
     { icon: Compass, title: "Orientation of House", description: "South and west-facing rooms receive more sun exposure, requiring additional cooling capacity" },
     { icon: Trees, title: "Tree Coverage", description: "Shade from mature trees can reduce cooling loads by up to 25% in summer months" },
   ];
   ```

3. **Expand Sizing Factors Section** (lines 108-151)
   - Keep existing 3 cards
   - Add subtitle "Your Home is A System" with description
   - Add 6 new system factor cards below in same section

---

### Updated Section Layout

The single section will contain:
1. **Main heading**: "What Determines System Size?"
2. **Existing 3 cards** (Square Footage, Climate Zone, Insulation & Windows)
3. **Subtitle**: "Your Home is A System" with supporting text
4. **6 new cards** showing additional factors

---

### Visual Hierarchy

| Element | Style |
|---------|-------|
| Main H2 | `text-3xl md:text-4xl font-bold` (existing) |
| Subtitle H3 | `text-2xl md:text-3xl font-semibold` |
| Subtitle description | `text-lg text-muted-foreground` |
| Cards | Same style as existing sizing factor cards |

---

### Responsive Grid

- **Existing 3 cards**: `grid md:grid-cols-3` (unchanged)
- **New 6 cards**: `grid md:grid-cols-2 lg:grid-cols-3` (2 cols on tablet, 3 on desktop)

---

### Animation

- Subtitle fades in when scrolled into view
- 6 new cards use staggered animation (0.1s delay between each)
- Matches existing animation pattern

