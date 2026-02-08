
# Fix Property Data Lookup, Add Map Preview & Error Feedback

## Overview

This plan addresses three issues:
1. Property lookup (SqFt, Year Built, Stories) failing silently because the backend uses wrong API endpoints
2. No Google Map showing in the Locations form to verify the address
3. No error feedback when property lookup fails

---

## Part A: Fix Backend Property Lookup

### Problem
The edge function uses dead/incorrect GIS API endpoints. The Dallas CAD endpoint returns 404, and other county endpoints are similarly broken.

### Solution
Update `supabase/functions/lookup-property-data/index.ts` with verified working endpoints:

| County | Working Endpoint | Available Fields |
|--------|-----------------|------------------|
| Dallas | `maps.dcad.org/prdwa/rest/services/Property/ParcelQuery/MapServer/4/query` | SqFt, Year Built, Stories |
| Denton | `gis.dentoncounty.gov/arcgis/rest/services/CAD/MapServer/0/query` | SqFt, Year Built |
| Collin | `maps.collincountytx.gov/server/rest/services/InteractiveMap/Appraisal_District/MapServer/1/query` | Year Built only |
| Tarrant | No public API found | Use Attom fallback |

### Technical Changes

**File: `supabase/functions/lookup-property-data/index.ts`**

1. **Update Dallas CAD lookup function**
   - New URL: `https://maps.dcad.org/prdwa/rest/services/Property/ParcelQuery/MapServer/4/query`
   - Query field: `SITEADDRESS` (contains street number + name)
   - Output fields: `RESFLRAREA` (sqft), `RESYRBLT` (year), `FLOORCOUNT` (stories)

2. **Update Denton County lookup function**
   - New URL: `https://gis.dentoncounty.gov/arcgis/rest/services/CAD/MapServer/0/query`
   - Query field: `situs` (full address)
   - Output fields: `living_area` (sqft), `yr_blt` (year)
   - Note: Stories not available in this dataset

3. **Update Collin County lookup function**
   - New URL: `https://maps.collincountytx.gov/server/rest/services/InteractiveMap/Appraisal_District/MapServer/1/query`
   - Query field: `situs_disp`
   - Output fields: `yr_blt` (year built only)
   - Note: SqFt and Stories not available

4. **Disable Tarrant County CAD lookup**
   - No public REST API available
   - Return null immediately, rely on Attom fallback

5. **Add detailed error tracking**
   - Track which endpoint was attempted
   - Track HTTP status codes
   - Return error details in response for debugging

6. **Update CORS headers**
   - Include full header allowlist to prevent preflight failures

---

## Part B: Add Error Feedback to Frontend

### Problem
When property lookup fails, the user sees nothing - no indication that something went wrong.

### Solution
Update `src/pages/admin/Locations.tsx` to show error feedback when lookup fails.

### Technical Changes

**File: `src/lib/propertyLookup.ts`**

1. Add error status to return type:
```typescript
export interface PropertyLookupResult {
  data: PropertyData | null;
  error: string | null;
  attemptedSource: string | null;
}
```

2. Update `lookupPropertyData` to return structured result with error info

**File: `src/pages/admin/Locations.tsx`**

1. Add state for lookup error:
```typescript
const [lookupError, setLookupError] = useState<string | null>(null);
```

2. Update `handleAddressSelect` to handle errors:
```typescript
if (result.error) {
  setLookupError(result.error);
  toast.error(`Property lookup failed: ${result.error}`);
} else if (result.data) {
  // ... existing success logic
} else {
  setLookupError('No property data found for this address');
  toast.info('No property data found - please enter manually');
}
```

3. Add visual error indicator in the form:
```typescript
{lookupError && (
  <Alert variant="destructive" className="mt-2">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{lookupError}</AlertDescription>
  </Alert>
)}
```

---

## Part C: Add Google Map Preview

### Problem
Users cannot visually verify that the selected address is correct.

### Solution
Store coordinates from Google Places and display a map preview in the form.

### Technical Changes

**File: `src/pages/admin/Locations.tsx`**

1. Add state for coordinates:
```typescript
const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
const [googlePlaceId, setGooglePlaceId] = useState('');
```

2. Update `handleAddressSelect` to capture coordinates:
```typescript
setLatitude(components.lat);
setLongitude(components.lng);
setGooglePlaceId(components.placeId);
```

3. Update `openEdit` to load coordinates:
```typescript
setLatitude(location.latitude || null);
setLongitude(location.longitude || null);
setGooglePlaceId(location.google_place_id || '');
```

4. Update `resetForm` to clear coordinates:
```typescript
setLatitude(null);
setLongitude(null);
setGooglePlaceId('');
```

5. Add coordinates to save payload:
```typescript
latitude: latitude,
longitude: longitude,
google_place_id: googlePlaceId || null,
```

6. Add MapPreview component after the County field:
```typescript
{latitude && longitude && (
  <MapPreview
    lat={latitude}
    lng={longitude}
    address={`${addressLine1}, ${city}, ${state} ${zipCode}`}
    county={county}
    className="mt-4"
  />
)}

{!latitude && addressLine1 && (
  <div className="text-sm text-muted-foreground mt-2">
    Select an address from the dropdown to see map preview
  </div>
)}
```

---

## Part D: Improve County Auto-Population

### Current State
County is already being set from `administrative_area_level_2` in `handleAddressSelect`. This should work but may not for all addresses.

### Enhancement
Add a fallback message when Google doesn't return county:
```typescript
if (!components.county && components.state === 'TX') {
  // Could not determine county - prompt user
  toast.info('County could not be determined - please verify');
}
```

---

## Summary of File Changes

| File | Changes |
|------|---------|
| `supabase/functions/lookup-property-data/index.ts` | Fix all CAD endpoints, add error tracking |
| `src/lib/propertyLookup.ts` | Return structured result with error info |
| `src/pages/admin/Locations.tsx` | Add map preview, error feedback, save coordinates |

---

## Expected Results After Implementation

| Feature | Before | After |
|---------|--------|-------|
| Dallas lookup | 404 error | Returns SqFt, Year, Stories |
| Denton lookup | 404 error | Returns SqFt, Year |
| Collin lookup | 404 error | Returns Year |
| Tarrant lookup | 404 error | "Not available" + Attom fallback |
| Error feedback | Silent fail | Toast + alert message |
| Map preview | Not shown | Interactive map in form |
| County | Auto-fills (when available) | Auto-fills + fallback hint |
| Coordinates | Not saved | Saved to database |

---

## Testing Checklist

1. Test Dallas County address (e.g., 3180 Carmel St, Dallas, TX 75204)
   - Verify SqFt, Year Built, Stories auto-fill
   - Verify map shows correct location
   - Verify county shows "Dallas County"

2. Test Denton County address
   - Verify SqFt, Year Built auto-fill
   - Verify Stories remains empty (not available)

3. Test Collin County address
   - Verify Year Built auto-fills
   - Verify SqFt, Stories show "No data" or remain empty

4. Test unsupported county
   - Verify error message shows
   - Verify manual entry still works

5. Test edit existing location
   - Verify map shows if coordinates exist
   - Verify all fields populate correctly
