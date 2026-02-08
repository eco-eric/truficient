
# Property Data Lookup Integration

## Overview

Add automatic property data lookup to pre-fill sq ft, year built, and stories when entering a location address. This uses a phased approach starting with free county CAD APIs, with a paid API fallback for comprehensive coverage.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      Locations Form                                  │
├─────────────────────────────────────────────────────────────────────┤
│  1. User types address                                               │
│     ↓                                                                │
│  2. Google Places Autocomplete (already have)                        │
│     ↓                                                                │
│  3. Address selected → triggers lookup-property-data edge function   │
│     ↓                                                                │
│  4. Edge function determines county from address                     │
│     ↓                                                                │
│  5. Routes to appropriate data source:                               │
│     • Dallas CAD (free)                                              │
│     • Tarrant CAD (free)                                             │
│     • Collin CAD (free)                                              │
│     • Denton CAD (free)                                              │
│     • Attom API fallback (paid, optional)                            │
│     ↓                                                                │
│  6. Returns: sq_ft, year_built, stories, property_type               │
│     ↓                                                                │
│  7. Auto-fills form fields with visual indicator                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Core Implementation (Free APIs)

### 1. Database Schema Update

Add tracking columns to `crm_locations`:

```sql
ALTER TABLE crm_locations ADD COLUMN IF NOT EXISTS
  property_data_source TEXT,        -- 'dallas_cad', 'tarrant_cad', 'attom', 'manual'
  property_data_verified_at TIMESTAMPTZ,
  property_data_auto_populated BOOLEAN DEFAULT false,
  lot_size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  property_class TEXT;              -- 'residential', 'commercial', etc from CAD
```

### 2. Create Edge Function: `lookup-property-data`

**File:** `supabase/functions/lookup-property-data/index.ts`

```typescript
// Handles property data lookup with multi-source fallback
// Input: { address, city, state, zipCode, county }
// Output: { squareFootage, yearBuilt, stories, lotSize, source, ... }

async function handler(req) {
  const { address, city, state, zipCode, county } = await req.json();
  
  // Normalize county name
  const normalizedCounty = normalizeCounty(county);
  
  // Try county-specific CAD first (free)
  let propertyData = null;
  
  switch(normalizedCounty) {
    case 'dallas':
      propertyData = await dallasCadLookup(address, city, zipCode);
      break;
    case 'tarrant':
      propertyData = await tarrantCadLookup(address, city, zipCode);
      break;
    case 'collin':
      propertyData = await collinCadLookup(address, city, zipCode);
      break;
    case 'denton':
      propertyData = await dentonCadLookup(address, city, zipCode);
      break;
  }
  
  // If no data and Attom key exists, try paid API
  if (!propertyData && Deno.env.get('ATTOM_API_KEY')) {
    propertyData = await attomLookup(address, city, state, zipCode);
  }
  
  return propertyData || { source: 'not_found' };
}
```

### 3. County CAD API Integrations

| County | API Source | Cost | Data Available |
|--------|-----------|------|----------------|
| Dallas | Dallas CAD Public API | Free | Sq ft, year built, stories, lot size |
| Tarrant | Tarrant Appraisal District | Free | Sq ft, year built, property type |
| Collin | Collin CAD | Free | Sq ft, year built, stories |
| Denton | Denton CAD | Free | Sq ft, year built, lot size |
| Ellis | Manual fallback | - | - |
| Rockwall | Manual fallback | - | - |
| Kaufman | Manual fallback | - | - |
| Hunt | Manual fallback | - | - |

### 4. Frontend Updates

**File:** `src/pages/admin/Locations.tsx`

Changes:
1. Replace manual address input with `AddressAutocomplete` component
2. Add property lookup state and mutation
3. Show loading spinner during lookup
4. Visual indicator for auto-populated fields (light blue background)
5. Allow user override of any auto-filled values

```typescript
// New state
const [isLookingUp, setIsLookingUp] = useState(false);
const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(new Set());

// On address select from Google Places
const handleAddressSelect = async (components: AddressComponents) => {
  setAddressLine1(components.streetAddress);
  setCity(components.city);
  setState(components.state);
  setZipCode(components.zipCode);
  
  // Trigger property lookup
  setIsLookingUp(true);
  try {
    const result = await lookupPropertyData({
      address: components.streetAddress,
      city: components.city,
      state: components.state,
      zipCode: components.zipCode,
      county: components.county,
    });
    
    if (result.squareFootage) {
      setSquareFootage(result.squareFootage.toString());
      autoPopulatedFields.add('squareFootage');
    }
    // ... other fields
    
    toast.success(`Property data found via ${result.source}`);
  } catch (err) {
    // Silent fail - user can enter manually
  } finally {
    setIsLookingUp(false);
  }
};
```

### 5. Visual Indicators

Auto-populated fields show:
- Light blue background (`bg-blue-50 dark:bg-blue-950/30`)
- Small badge: "Auto-filled"
- Tooltip showing data source

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Sq Ft *                              Year Built                     │
│ ┌─────────────────────────────────┐  ┌─────────────────────────────┐│
│ │ 2,450        [Auto • Dallas CAD]│  │ 1998          [Auto • Dallas]││
│ └─────────────────────────────────┘  └─────────────────────────────┘│
│ (light blue background)              (light blue background)        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Enhanced Coverage (Optional Paid API)

### Attom Data Integration

Only when:
- County CAD lookup fails
- `ATTOM_API_KEY` secret is configured

```typescript
async function attomLookup(address, city, state, zip) {
  const response = await fetch(
    `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?address1=${encodeURIComponent(address)}&address2=${city},${state},${zip}`,
    { headers: { 'apikey': Deno.env.get('ATTOM_API_KEY') } }
  );
  
  const data = await response.json();
  // Parse Attom response format
  return {
    squareFootage: data.property?.building?.size?.universalsize,
    yearBuilt: data.property?.building?.yearbuilt,
    stories: data.property?.building?.stories,
    source: 'attom',
  };
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/lookup-property-data/index.ts` | Create | Edge function for property data lookup |
| `src/pages/admin/Locations.tsx` | Modify | Add address autocomplete + auto-lookup |
| `src/lib/propertyLookup.ts` | Create | Frontend helper for calling edge function |
| Database migration | Create | Add tracking columns |

---

## Cost Estimate

| Service | Volume | Monthly Cost |
|---------|--------|--------------|
| Dallas/Tarrant/Collin/Denton CAD | Unlimited | **FREE** |
| Google Places (already using) | ~50/month | ~$0.85 |
| Attom (fallback only) | ~10/month | ~$2-5 |

**Total: ~$3-6/month** for full DFW coverage

---

## Summary

| Feature | Details |
|---------|---------|
| Address autocomplete | Google Places (existing) |
| Property data lookup | County CAD APIs (free) |
| Fallback | Attom API (optional, paid) |
| Auto-fill fields | Sq ft, year built, stories, lot size |
| Data tracking | Source, verified date, auto-populated flag |
| UI feedback | Loading state, auto-fill badges |
| Coverage | Dallas, Tarrant, Collin, Denton counties |
