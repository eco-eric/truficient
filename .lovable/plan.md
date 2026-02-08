
# Auto-Populate Building Type from RentCast

## Summary
When property data is fetched from RentCast, automatically map the `propertyType` field to your existing `building_type` dropdown and set `location_type` to residential/commercial accordingly.

## Current Situation

| Field | In Database | In Form | Auto-Populated from RentCast |
|-------|-------------|---------|------------------------------|
| location_type | ✓ | ✓ | ✗ Not currently |
| building_type | ✓ | ✗ | Not currently |
| propertyClass | ✓ | ✗ | ✓ (stored but not displayed) |

## RentCast Property Types to Map

Based on RentCast API documentation, these are the property types returned:

| RentCast Value | Your building_type | Your location_type |
|----------------|--------------------|--------------------|
| Single Family | single_family | residential |
| Condo | condo | residential |
| Townhouse | townhome | residential |
| Apartment | apartment | residential |
| Duplex / Triplex / Quadruplex | duplex | residential |
| Multi-Family | duplex | residential |
| Mobile/Manufactured | single_family | residential |
| Land | single_family | residential |
| Commercial | commercial_other | commercial |

## Implementation

### Step 1: Create Mapping Function
Add a utility function in the edge function response or frontend that converts RentCast's `propertyType` string to your schema values.

### Step 2: Update Property Lookup Handler
In `AddLocationDialog.tsx`, modify the `handleLookupPropertyData` function to also set:
- `building_type` based on the mapped value
- `location_type` based on residential vs commercial detection

### Technical Changes

**File: `src/components/admin/locations/AddLocationDialog.tsx`**

Add mapping helper (before component):
```typescript
function mapRentCastPropertyType(propertyType: string | null): {
  buildingType: string;
  locationType: 'residential' | 'commercial';
} {
  if (!propertyType) {
    return { buildingType: 'single_family', locationType: 'residential' };
  }
  
  const normalized = propertyType.toLowerCase();
  
  // Commercial detection
  if (normalized.includes('commercial') || 
      normalized.includes('retail') || 
      normalized.includes('office') ||
      normalized.includes('warehouse') ||
      normalized.includes('industrial')) {
    return { buildingType: 'commercial_other', locationType: 'commercial' };
  }
  
  // Residential mappings
  const residentialMap: Record<string, string> = {
    'single family': 'single_family',
    'singlefamily': 'single_family',
    'condo': 'condo',
    'condominium': 'condo',
    'townhouse': 'townhome',
    'townhome': 'townhome',
    'apartment': 'apartment',
    'duplex': 'duplex',
    'triplex': 'duplex',
    'quadruplex': 'duplex',
    'multi-family': 'duplex',
    'multifamily': 'duplex',
    'mobile': 'single_family',
    'manufactured': 'single_family',
  };
  
  for (const [key, value] of Object.entries(residentialMap)) {
    if (normalized.includes(key)) {
      return { buildingType: value, locationType: 'residential' };
    }
  }
  
  return { buildingType: 'single_family', locationType: 'residential' };
}
```

Update the property lookup handler (around line 260):
```typescript
if (data?.data) {
  const propertyData = data.data;
  
  // Map RentCast propertyType to our building_type
  const { buildingType, locationType } = mapRentCastPropertyType(propertyData.propertyClass);
  
  setFormData(prev => ({
    ...prev,
    square_footage: propertyData.squareFootage?.toString() || prev.square_footage,
    year_built: propertyData.yearBuilt?.toString() || prev.year_built,
    stories: propertyData.stories?.toString() || prev.stories,
    lot_size_sqft: propertyData.lotSizeSqft?.toString() || prev.lot_size_sqft,
    bedrooms: propertyData.bedrooms?.toString() || prev.bedrooms,
    bathrooms: propertyData.bathrooms?.toString() || prev.bathrooms,
    building_type: buildingType,      // NEW
    location_type: locationType,       // NEW
  }));
  // ...
}
```

## Files Modified

| File | Changes |
|------|---------|
| `src/components/admin/locations/AddLocationDialog.tsx` | Add mapping function + update lookup handler |

## Result
After clicking "Lookup Property Data", the form will automatically:
1. Fill in square footage, year built, bedrooms, etc. (existing)
2. Set **Building Type** dropdown to match (e.g., "Single Family Home")
3. Set **Type** dropdown to "Residential" or "Commercial"

This means less manual data entry for your team.
