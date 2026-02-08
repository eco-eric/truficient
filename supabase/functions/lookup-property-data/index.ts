import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PropertyLookupRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
}

interface PropertyData {
  squareFootage: number | null;
  yearBuilt: number | null;
  stories: number | null;
  lotSizeSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyClass: string | null;
  source: string;
  rawData?: Record<string, unknown>;
}

interface LookupResult {
  data: PropertyData | null;
  error: string | null;
  attemptedSource: string | null;
  httpStatus?: number;
}

// Normalize county name for matching
function normalizeCounty(county: string): string {
  if (!county) return "";
  return county
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

// Sanitize address for SQL-like query
function sanitizeAddress(address: string): string {
  return address
    .toUpperCase()
    .replace(/'/g, "''")
    .replace(/[^\w\s]/g, " ")
    .trim();
}

// County-specific CAD lookup functions using verified working endpoints

async function dallasCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<LookupResult> {
  const source = "dallas_cad";
  
  // Retry logic for transient failures
  const maxRetries = 2;
  let lastError: string | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Dallas CAD verified working endpoint - ParcelQuery MapServer layer 4
      const searchUrl = `https://maps.dcad.org/prdwa/rest/services/Property/ParcelQuery/MapServer/4/query`;
      
      const sanitizedAddress = sanitizeAddress(address);
      
      const params = new URLSearchParams({
        where: `SITEADDRESS LIKE '${sanitizedAddress}%'`,
        outFields: "RESFLRAREA,RESYRBLT,FLOORCOUNT,SITEADDRESS,BLDGAREA,LANDAREA",
        returnGeometry: "false",
        f: "json",
      });

      console.log(`Dallas CAD query (attempt ${attempt + 1}): ${sanitizedAddress}`);

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: { 
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; PropertyLookup/1.0)",
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        lastError = `Dallas CAD returned HTTP ${response.status}`;
        console.log(`${lastError} (attempt ${attempt + 1})`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Backoff
          continue;
        }
        return { data: null, error: lastError, attemptedSource: source, httpStatus: response.status };
      }

      const data = await response.json();
      
      if (data.error) {
        const errorMsg = `Dallas CAD API error: ${data.error.message || JSON.stringify(data.error)}`;
        console.log(errorMsg);
        return { data: null, error: errorMsg, attemptedSource: source };
      }
      
      if (!data.features || data.features.length === 0) {
        console.log("No Dallas CAD results found");
        return { data: null, error: "No property records found in Dallas CAD", attemptedSource: source };
      }

      const attrs = data.features[0].attributes;
      console.log(`Dallas CAD found record: ${JSON.stringify(attrs)}`);
      
      return {
        data: {
          squareFootage: attrs.RESFLRAREA || attrs.BLDGAREA || null,
          yearBuilt: attrs.RESYRBLT || null,
          stories: attrs.FLOORCOUNT || null,
          lotSizeSqft: attrs.LANDAREA || null,
          bedrooms: null,
          bathrooms: null,
          propertyClass: null,
          source,
          rawData: attrs,
        },
        error: null,
        attemptedSource: source,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      console.error(`Dallas CAD lookup error (attempt ${attempt + 1}):`, lastError);
      
      // Retry on connection errors
      if (attempt < maxRetries && (lastError.includes("reset") || lastError.includes("timeout"))) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
    }
  }
  
  return { data: null, error: `Dallas CAD lookup failed after ${maxRetries + 1} attempts: ${lastError}`, attemptedSource: source };
}

async function tarrantCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<LookupResult> {
  // Tarrant County does not have a public REST API that we've verified
  // Return null immediately and let Attom fallback handle it
  console.log("Tarrant CAD: No public API available, skipping to fallback");
  return { 
    data: null, 
    error: "Tarrant County CAD does not have a public API. Please enter property details manually or configure Attom API.", 
    attemptedSource: "tarrant_cad" 
  };
}

async function collinCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<LookupResult> {
  const source = "collin_cad";
  try {
    // Collin County verified working endpoint
    const searchUrl = `https://maps.collincountytx.gov/server/rest/services/InteractiveMap/Appraisal_District/MapServer/1/query`;
    
    const sanitizedAddress = sanitizeAddress(address);
    
    const params = new URLSearchParams({
      where: `situs_disp LIKE '${sanitizedAddress}%'`,
      outFields: "yr_blt,situs_disp,legal_desc",
      returnGeometry: "false",
      f: "json",
    });

    console.log(`Collin CAD query: ${sanitizedAddress}`);

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorMsg = `Collin CAD returned HTTP ${response.status}`;
      console.log(errorMsg);
      return { data: null, error: errorMsg, attemptedSource: source, httpStatus: response.status };
    }

    const data = await response.json();
    
    if (data.error) {
      const errorMsg = `Collin CAD API error: ${data.error.message || JSON.stringify(data.error)}`;
      console.log(errorMsg);
      return { data: null, error: errorMsg, attemptedSource: source };
    }
    
    if (!data.features || data.features.length === 0) {
      console.log("No Collin CAD results found");
      return { data: null, error: "No property records found in Collin CAD", attemptedSource: source };
    }

    const attrs = data.features[0].attributes;
    console.log(`Collin CAD found record: ${JSON.stringify(attrs)}`);
    
    return {
      data: {
        squareFootage: null, // Not available in this layer
        yearBuilt: attrs.yr_blt || null,
        stories: null, // Not available
        lotSizeSqft: null,
        bedrooms: null,
        bathrooms: null,
        propertyClass: null,
        source,
        rawData: attrs,
      },
      error: null,
      attemptedSource: source,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Collin CAD lookup error:", errorMsg);
    return { data: null, error: `Collin CAD lookup failed: ${errorMsg}`, attemptedSource: source };
  }
}

async function dentonCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<LookupResult> {
  const source = "denton_cad";
  try {
    // Denton County verified working endpoint
    const searchUrl = `https://gis.dentoncounty.gov/arcgis/rest/services/CAD/MapServer/0/query`;
    
    const sanitizedAddress = sanitizeAddress(address);
    
    const params = new URLSearchParams({
      where: `situs LIKE '${sanitizedAddress}%'`,
      outFields: "living_area,yr_blt,situs,acres",
      returnGeometry: "false",
      f: "json",
    });

    console.log(`Denton CAD query: ${sanitizedAddress}`);

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorMsg = `Denton CAD returned HTTP ${response.status}`;
      console.log(errorMsg);
      return { data: null, error: errorMsg, attemptedSource: source, httpStatus: response.status };
    }

    const data = await response.json();
    
    if (data.error) {
      const errorMsg = `Denton CAD API error: ${data.error.message || JSON.stringify(data.error)}`;
      console.log(errorMsg);
      return { data: null, error: errorMsg, attemptedSource: source };
    }
    
    if (!data.features || data.features.length === 0) {
      console.log("No Denton CAD results found");
      return { data: null, error: "No property records found in Denton CAD", attemptedSource: source };
    }

    const attrs = data.features[0].attributes;
    console.log(`Denton CAD found record: ${JSON.stringify(attrs)}`);
    
    return {
      data: {
        squareFootage: attrs.living_area || null,
        yearBuilt: attrs.yr_blt || null,
        stories: null, // Not available in this dataset
        lotSizeSqft: attrs.acres ? Math.round(attrs.acres * 43560) : null,
        bedrooms: null,
        bathrooms: null,
        propertyClass: null,
        source,
        rawData: attrs,
      },
      error: null,
      attemptedSource: source,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Denton CAD lookup error:", errorMsg);
    return { data: null, error: `Denton CAD lookup failed: ${errorMsg}`, attemptedSource: source };
  }
}

// Attom API fallback (paid, optional)
async function attomLookup(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<LookupResult> {
  const source = "attom";
  const apiKey = Deno.env.get("ATTOM_API_KEY");
  if (!apiKey) {
    console.log("No ATTOM_API_KEY configured");
    return { data: null, error: "Attom API key not configured", attemptedSource: source };
  }

  try {
    const address2 = `${city},${state},${zipCode}`;
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?address1=${encodeURIComponent(address)}&address2=${encodeURIComponent(address2)}`;

    const response = await fetch(url, {
      headers: {
        apikey: apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorMsg = `Attom API returned HTTP ${response.status}`;
      console.log(errorMsg);
      return { data: null, error: errorMsg, attemptedSource: source, httpStatus: response.status };
    }

    const data = await response.json();
    const property = data.property?.[0];
    
    if (!property) {
      console.log("No Attom results found");
      return { data: null, error: "No property records found in Attom", attemptedSource: source };
    }

    const building = property.building || {};
    const lot = property.lot || {};

    return {
      data: {
        squareFootage: building.size?.universalsize || building.size?.livingsize || null,
        yearBuilt: building.yearbuilt || null,
        stories: building.stories || null,
        lotSizeSqft: lot.lotsize1 || null,
        bedrooms: building.rooms?.beds || null,
        bathrooms: building.rooms?.bathstotal || null,
        propertyClass: property.summary?.proptype || null,
        source,
        rawData: property,
      },
      error: null,
      attemptedSource: source,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Attom API lookup error:", errorMsg);
    return { data: null, error: `Attom lookup failed: ${errorMsg}`, attemptedSource: source };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, city, state, zipCode, county } =
      (await req.json()) as PropertyLookupRequest;

    if (!address || !city || !zipCode) {
      return new Response(
        JSON.stringify({ 
          data: null,
          error: "Missing required fields: address, city, zipCode",
          attemptedSource: null
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Property lookup: ${address}, ${city}, ${state} ${zipCode} (County: ${county || "unknown"})`);

    // Normalize county name
    const normalizedCounty = normalizeCounty(county || "");
    console.log(`Normalized county: ${normalizedCounty}`);

    let result: LookupResult = { data: null, error: null, attemptedSource: null };

    // Try county-specific CAD first (free)
    switch (normalizedCounty) {
      case "dallas":
        console.log("Trying Dallas CAD...");
        result = await dallasCadLookup(address, city, zipCode);
        break;
      case "tarrant":
        console.log("Trying Tarrant CAD...");
        result = await tarrantCadLookup(address, city, zipCode);
        break;
      case "collin":
        console.log("Trying Collin CAD...");
        result = await collinCadLookup(address, city, zipCode);
        break;
      case "denton":
        console.log("Trying Denton CAD...");
        result = await dentonCadLookup(address, city, zipCode);
        break;
      default:
        console.log(`No CAD integration for county: ${county || "unknown"}`);
        result = { 
          data: null, 
          error: `No property lookup available for ${county || "unknown county"}. Please enter details manually.`,
          attemptedSource: "none"
        };
    }

    // If no CAD data and Attom API key exists, try paid fallback
    if (!result.data) {
      console.log("Trying Attom API fallback...");
      const attomResult = await attomLookup(address, city, state, zipCode);
      
      // Use Attom result if it has data, otherwise keep original error
      if (attomResult.data) {
        result = attomResult;
      } else if (!result.error) {
        result.error = attomResult.error;
        result.attemptedSource = attomResult.attemptedSource;
      }
    }

    // Return result with full error context
    if (result.data) {
      console.log(`Property data found via ${result.data.source}`);
      return new Response(
        JSON.stringify({
          data: result.data,
          error: null,
          attemptedSource: result.data.source,
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No data found - return with error details
    console.log(`No property data found. Error: ${result.error}`);
    return new Response(
      JSON.stringify({ 
        data: null,
        error: result.error || "No property data found for this address",
        attemptedSource: result.attemptedSource || "unknown",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Property lookup error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        data: null,
        error: `Internal server error: ${errorMsg}`,
        attemptedSource: null 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
