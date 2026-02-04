

## Add Sizing Verification Notice to Step 6

### Overview

Add a highlighted notice banner between the "Choose your system" description and the tonnage selection grid to reassure customers that their sizing will be professionally verified during the home assessment.

---

### File to Modify

| File | Action | Purpose |
|------|---------|---------|
| `src/pages/estimators/ducted/steps/Step6SystemSize.tsx` | MODIFY | Add highlighted notice after description, before tonnage grid |

---

### Current Layout (Lines 168-176)

```tsx
<h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
  Select System Size
</h2>
<p className="text-muted-foreground mb-6">
  Choose your system tonnage. We'll verify sizing during our home assessment.
</p>

{/* Tonnage Grid */}
<div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
```

---

### Proposed Layout

```tsx
<h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
  Select System Size
</h2>
<p className="text-muted-foreground mb-4">
  Choose your system tonnage.
</p>

{/* NEW: Sizing Verification Notice */}
<div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-6 flex items-center gap-2">
  <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
  <p className="text-sm text-blue-800 font-medium">
    We'll verify sizing during your Home Assessment | Pre-Install Inspection
  </p>
</div>

{/* Tonnage Grid */}
<div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
```

---

### Implementation Details

1. **Import `Info` icon** from lucide-react (already importing other icons)

2. **Update description text** - Remove the duplicate "We'll verify sizing" from the description since it will now be in the highlighted notice

3. **Add highlighted notice** - Blue-themed banner with:
   - Rounded corners matching the card design
   - Light blue background (`bg-blue-50`)
   - Blue border (`border-blue-200`)
   - Info icon in blue
   - Bold/medium weight text for emphasis
   - Positioned between description and tonnage grid

---

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│ Select System Size                                          │
│                                                             │
│ Choose your system tonnage.                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️  We'll verify sizing during your Home Assessment |   │ │
│ │     Pre-Install Inspection                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐                                   │
│  │ 1 │ │1.5│ │ 2 │ │2.5│                                   │
│  └───┘ └───┘ └───┘ └───┘                                   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐                                   │
│  │ 3 │ │3.5│ │ 4 │ │ 5 │                                   │
│  └───┘ └───┘ └───┘ └───┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

### Changes Summary

- Add `Info` to the existing lucide-react imports
- Update paragraph text to just "Choose your system tonnage." (removing duplicate verification message)
- Insert new highlighted notice div between description and tonnage grid
- The notice uses blue styling to indicate informational/trust messaging

