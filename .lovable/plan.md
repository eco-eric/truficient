

# Improve Profit Margin Control

## Current Behavior

The profit margin slider goes from 1.2x to 2.0x (20% to 100%) in steps of 0.05 (5% increments). There is no way to type a specific number, and the maximum is capped at 100%.

## Changes

### `src/pages/admin/EstimateBuilder.tsx` (around lines 1313-1327)

**1. Make the slider more incremental**
- Change `step` from `0.05` to `0.01` (1% increments instead of 5%)

**2. Increase the maximum to 150%**
- Change `max` from `2.0` to `2.5` (which represents 150% margin)

**3. Add a numeric input field alongside the slider**
- Add an `Input` field next to the label that shows the current percentage value
- The user can type any value (e.g., "37" for 37%) and it will set the margin to 1.37x
- Clamp the typed value between 20% and 150% on blur to keep it within valid range
- The slider and input stay in sync -- changing one updates the other

### Updated UI Layout

```text
Profit Margin              [  60  ] %  (1.60x)
|===========--------------------------| slider
20%                                 150%
```

## Scope

- One file modified: `src/pages/admin/EstimateBuilder.tsx`
- No database changes

