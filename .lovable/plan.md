
# Simplify Location Form: Remove Google Places Autocomplete

## Summary
Remove the Google Places search/autocomplete feature from the Add Location dialog while keeping geocoding for coordinates and county auto-population. The map embed will continue to work once coordinates are obtained.

## What Will Change

### Remove
- The "Search Address (Google Places)" autocomplete input field
- The `GooglePlacesAutocomplete` component import and usage
- The `handlePlaceSelected` handler

### Keep
- Manual address entry fields (Address Line 1, City, State, ZIP)
- "Use Billing Address" button with geocoding (already working - fills coordinates and county automatically)
- "Lookup Property Data" button for CAD data
- Map embed preview (displays once coordinates exist)
- County auto-population from geocoding

## How It Will Work

```text
┌─────────────────────────────────────────────────────────┐
│  Add Location Flow (Simplified)                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Select Customer                                     │
│         ↓                                               │
│  2. Click "Use Billing Address" (if available)          │
│         ↓                                               │
│  3. System auto-geocodes → fills lat/lng + county       │
│         ↓                                               │
│  4. Map preview appears                                 │
│         ↓                                               │
│  5. Click "Lookup Property Data" for sq ft, year, etc.  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technical Changes

### File: `src/components/admin/locations/AddLocationDialog.tsx`

1. **Remove import** of `GooglePlacesAutocomplete`
2. **Remove `handlePlaceSelected` function** (lines 143-157)
3. **Remove the `GooglePlacesAutocomplete` component** from the Address section (lines 467-469)
4. **Add a new "Get Coordinates" button** that geocodes the manually-entered address fields (so users can still get map preview without using billing address)

### File: `src/components/admin/locations/GooglePlacesAutocomplete.tsx`

- No changes needed (can keep the file in case you want to re-enable later, or delete it)

## New "Get Coordinates" Button

A small enhancement: add a button next to the address fields that geocodes the current address to populate coordinates and county. This provides the same geocoding capability without needing the autocomplete search box.

```
[Address Line 1] [City] [State] [ZIP]
                                      [📍 Get Coordinates]
```

When clicked:
- Validates address fields are filled
- Calls Google Geocoding API
- Populates latitude, longitude, and county
- Shows map preview

## Files Modified

| File | Action |
|------|--------|
| `AddLocationDialog.tsx` | Remove autocomplete, add "Get Coordinates" button |
| `GooglePlacesAutocomplete.tsx` | Keep (unused) or delete |

## APIs Still Required

- **Geocoding API** - For "Use Billing Address" and new "Get Coordinates" button
- **Maps Embed API** - For the map preview iframe
- **Maps JavaScript API** - For the geocoder object

The Places API will no longer be needed after this change.
