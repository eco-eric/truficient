
# Switch Property Lookup to RentCast API

## Summary
Replace the complex county-specific CAD integrations with a single RentCast API integration. This eliminates the unreliable county website connections and provides consistent, nationwide property data.

## Benefits of RentCast vs. County CAD Sites
- **Single API** - No need to maintain separate integrations for each county
- **Reliable** - Commercial service with 99.9% uptime vs. flaky government servers
- **More Data** - Returns bedrooms, bathrooms, property type (fields CAD sites often miss)
- **Nationwide** - Works for any US address, not just DFW counties

## RentCast API Details
- **Endpoint**: `GET https://api.rentcast.io/v1/properties`
- **Auth Header**: `X-Api-Key: YOUR_API_KEY`
- **Query Parameters**: `address`, `city`, `state`, `zipCode`

## Response Fields (mapped to your existing schema)

| RentCast Field | Your Field |
|----------------|------------|
| `squareFootage` | `squareFootage` |
| `yearBuilt` | `yearBuilt` |
| `stories` (if available) | `stories` |
| `lotSize` | `lotSizeSqft` |
| `bedrooms` | `bedrooms` |
| `bathrooms` | `bathrooms` |
| `propertyType` | `propertyClass` |

## Implementation Steps

### Step 1: Add RentCast API Key as Secret
Store your API key securely as a backend secret named `RENTCAST_API_KEY`.

### Step 2: Simplify Edge Function
Rewrite `lookup-property-data/index.ts` to:
1. Remove all county CAD functions (Dallas, Collin, Denton, Tarrant)
2. Remove Attom fallback
3. Add single `rentcastLookup` function
4. Much simpler, ~100 lines vs ~470 lines

### Step 3: Update Source Display
Update `src/lib/propertyLookup.ts` to add RentCast to the source display map.

## Technical Changes

### File: `supabase/functions/lookup-property-data/index.ts`

**Before (complex)**:
```text
├── dallasCadLookup()     (57 lines)
├── tarrantCadLookup()    (14 lines)
├── collinCadLookup()     (68 lines)
├── dentonCadLookup()     (68 lines)
├── attomLookup()         (62 lines)
└── County switching logic
    Total: ~470 lines
```

**After (simple)**:
```typescript
async function rentcastLookup(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<LookupResult> {
  const apiKey = Deno.env.get("RENTCAST_API_KEY");
  if (!apiKey) {
    return { data: null, error: "RentCast API key not configured", attemptedSource: "rentcast" };
  }

  const params = new URLSearchParams({
    address,
    city,
    state,
    zipCode,
  });

  const response = await fetch(`https://api.rentcast.io/v1/properties?${params}`, {
    headers: {
      "X-Api-Key": apiKey,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    return { data: null, error: `RentCast returned HTTP ${response.status}`, attemptedSource: "rentcast" };
  }

  const results = await response.json();
  const property = results[0]; // First match

  if (!property) {
    return { data: null, error: "No property found", attemptedSource: "rentcast" };
  }

  return {
    data: {
      squareFootage: property.squareFootage || null,
      yearBuilt: property.yearBuilt || null,
      stories: property.stories || null,
      lotSizeSqft: property.lotSize || null,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      propertyClass: property.propertyType || null,
      source: "rentcast",
    },
    error: null,
    attemptedSource: "rentcast",
  };
}
```

**Main handler simplified**:
```typescript
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { address, city, state, zipCode } = await req.json();
  
  // No county logic needed - just call RentCast
  const result = await rentcastLookup(address, city, state, zipCode);
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

### File: `src/lib/propertyLookup.ts`

Add RentCast to the source display map:
```typescript
const sourceMap: Record<string, string> = {
  rentcast: "RentCast",  // ADD
  dallas_cad: "Dallas CAD",
  // ... keep others for backwards compatibility
};
```

## Files Modified

| File | Action |
|------|--------|
| `supabase/functions/lookup-property-data/index.ts` | Complete rewrite (~100 lines, down from ~470) |
| `src/lib/propertyLookup.ts` | Add "rentcast" to source map |

## Secret Required

| Secret Name | Description |
|-------------|-------------|
| `RENTCAST_API_KEY` | Your RentCast API key |

After approval, I'll first ask you to add your RentCast API key, then implement the simplified edge function.
