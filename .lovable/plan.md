
# Fix Property Lookup: Pass County to Edge Function

## Problem Identified
The "Lookup Property Data" button returns "No Data Found" because:

1. **County not being sent** - The API call on line 250 is missing the `county` parameter. The edge function logs show `(County: unknown)` which causes it to skip all county-specific CAD lookups (Dallas, Collin, Denton)

2. **Response format mismatch** - The frontend checks for `data.success` (line 256) but the edge function returns `{ data, error, attemptedSource }` without a `success` field

## Root Cause
From edge function logs:
```text
Property lookup: 3180 Carmel St, Dallas, TX 75204 (County: unknown)
Normalized county: [empty]
No CAD integration for county: unknown
```

The county "Dallas" is visible in your form, but it's not being included in the API request body.

## Solution

### File: `src/components/admin/locations/AddLocationDialog.tsx`

**Change 1: Add county to the API request body (around line 250)**
```typescript
body: {
  address: formData.address_line1,
  city: formData.city,
  state: formData.state,
  zipCode: formData.zip_code,
  county: formData.county,   // ADD THIS LINE
},
```

**Change 2: Fix response handling (around line 256)**
```typescript
// Current (broken):
if (data.success && data.data) {

// Fixed:
if (data?.data) {
```

**Change 3: Update toast message to use correct response structure**
```typescript
// Current uses data.data.source and data.data.confidence
// Edge function returns: data.source (no confidence field)
toast({
  title: 'Property Data Retrieved',
  description: `Data found from ${data.attemptedSource || data.data?.source || 'CAD'}`,
});
```

## Expected Result
After the fix:
1. User clicks "Get Coordinates & County" - populates county from geocoder (e.g., "Dallas")
2. User clicks "Lookup Property Data" - sends county in request
3. Edge function routes to correct CAD (Dallas CAD for "dallas")
4. Property data (sq ft, year built, stories) populates from CAD records

## Files to Modify

| File | Changes |
|------|---------|
| `AddLocationDialog.tsx` | Add `county` to API body, fix response handling |
