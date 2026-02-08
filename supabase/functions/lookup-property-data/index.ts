import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

// Normalize county name for matching
function normalizeCounty(county: string): string {
  if (!county) return "";
  return county
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

// County-specific CAD lookup functions
// These use public web APIs where available

async function dallasCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<PropertyData | null> {
  try {
    // Dallas CAD uses a search endpoint
    // Format: https://www.dallascad.org/SearchOwner.aspx (web interface)
    // They have a GIS REST API for property data
    const searchUrl = `https://gis.dallascad.org/arcgis/rest/services/Layers/DC_Parcels/MapServer/0/query`;
    
    const params = new URLSearchParams({
      where: `SITUS_ADDR LIKE '${address.toUpperCase().replace(/'/g, "''")}%' AND SITUS_ZIP = '${zipCode}'`,
      outFields: "LIVING_AREA,YR_BUILT,LAND_SQFT,PROPERTY_TYPE,ACREAGE",
      returnGeometry: "false",
      f: "json",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.log("Dallas CAD lookup failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log("No Dallas CAD results found");
      return null;
    }

    const attrs = data.features[0].attributes;
    return {
      squareFootage: attrs.LIVING_AREA || null,
      yearBuilt: attrs.YR_BUILT || null,
      stories: null, // Dallas CAD doesn't typically expose this
      lotSizeSqft: attrs.LAND_SQFT || (attrs.ACREAGE ? Math.round(attrs.ACREAGE * 43560) : null),
      bedrooms: null,
      bathrooms: null,
      propertyClass: attrs.PROPERTY_TYPE || null,
      source: "dallas_cad",
      rawData: attrs,
    };
  } catch (error) {
    console.error("Dallas CAD lookup error:", error);
    return null;
  }
}

async function tarrantCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<PropertyData | null> {
  try {
    // Tarrant Appraisal District GIS API
    const searchUrl = `https://gis.tad.org/arcgis/rest/services/Public/TAD_Property/MapServer/0/query`;
    
    const params = new URLSearchParams({
      where: `StreetAddr LIKE '${address.toUpperCase().replace(/'/g, "''")}%' AND Zip = '${zipCode}'`,
      outFields: "LivingArea,YearBuilt,LandSqFt,ImprovType,Stories",
      returnGeometry: "false",
      f: "json",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.log("Tarrant CAD lookup failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log("No Tarrant CAD results found");
      return null;
    }

    const attrs = data.features[0].attributes;
    return {
      squareFootage: attrs.LivingArea || null,
      yearBuilt: attrs.YearBuilt || null,
      stories: attrs.Stories || null,
      lotSizeSqft: attrs.LandSqFt || null,
      bedrooms: null,
      bathrooms: null,
      propertyClass: attrs.ImprovType || null,
      source: "tarrant_cad",
      rawData: attrs,
    };
  } catch (error) {
    console.error("Tarrant CAD lookup error:", error);
    return null;
  }
}

async function collinCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<PropertyData | null> {
  try {
    // Collin CAD GIS API
    const searchUrl = `https://gis.collincad.org/arcgis/rest/services/Layers/CC_Parcels/MapServer/0/query`;
    
    const params = new URLSearchParams({
      where: `SITUS_ADDR LIKE '${address.toUpperCase().replace(/'/g, "''")}%'`,
      outFields: "LIVING_AREA,YEAR_BUILT,LAND_SQFT,PROP_TYPE,NUM_STORIES",
      returnGeometry: "false",
      f: "json",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.log("Collin CAD lookup failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log("No Collin CAD results found");
      return null;
    }

    const attrs = data.features[0].attributes;
    return {
      squareFootage: attrs.LIVING_AREA || null,
      yearBuilt: attrs.YEAR_BUILT || null,
      stories: attrs.NUM_STORIES || null,
      lotSizeSqft: attrs.LAND_SQFT || null,
      bedrooms: null,
      bathrooms: null,
      propertyClass: attrs.PROP_TYPE || null,
      source: "collin_cad",
      rawData: attrs,
    };
  } catch (error) {
    console.error("Collin CAD lookup error:", error);
    return null;
  }
}

async function dentonCadLookup(
  address: string,
  city: string,
  zipCode: string
): Promise<PropertyData | null> {
  try {
    // Denton CAD GIS API
    const searchUrl = `https://gis.dentoncad.com/arcgis/rest/services/Parcels/DCADParcels/MapServer/0/query`;
    
    const params = new URLSearchParams({
      where: `SITUS LIKE '${address.toUpperCase().replace(/'/g, "''")}%'`,
      outFields: "SQFT,YEARBUILT,ACRES,PROPTYPE,STORIES",
      returnGeometry: "false",
      f: "json",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.log("Denton CAD lookup failed:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log("No Denton CAD results found");
      return null;
    }

    const attrs = data.features[0].attributes;
    return {
      squareFootage: attrs.SQFT || null,
      yearBuilt: attrs.YEARBUILT || null,
      stories: attrs.STORIES || null,
      lotSizeSqft: attrs.ACRES ? Math.round(attrs.ACRES * 43560) : null,
      bedrooms: null,
      bathrooms: null,
      propertyClass: attrs.PROPTYPE || null,
      source: "denton_cad",
      rawData: attrs,
    };
  } catch (error) {
    console.error("Denton CAD lookup error:", error);
    return null;
  }
}

// Attom API fallback (paid, optional)
async function attomLookup(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<PropertyData | null> {
  const apiKey = Deno.env.get("ATTOM_API_KEY");
  if (!apiKey) {
    console.log("No ATTOM_API_KEY configured");
    return null;
  }

  try {
    const address2 = `${city},${state},${zipCode}`;
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?address1=${encodeURIComponent(address)}&address2=${encodeURIComponent(address2)}`;

    const response = await fetch(url, {
      headers: {
        apikey: apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.log("Attom API lookup failed:", response.status);
      return null;
    }

    const data = await response.json();
    const property = data.property?.[0];
    
    if (!property) {
      console.log("No Attom results found");
      return null;
    }

    const building = property.building || {};
    const lot = property.lot || {};

    return {
      squareFootage: building.size?.universalsize || building.size?.livingsize || null,
      yearBuilt: building.yearbuilt || null,
      stories: building.stories || null,
      lotSizeSqft: lot.lotsize1 || null,
      bedrooms: building.rooms?.beds || null,
      bathrooms: building.rooms?.bathstotal || null,
      propertyClass: property.summary?.proptype || null,
      source: "attom",
      rawData: property,
    };
  } catch (error) {
    console.error("Attom API lookup error:", error);
    return null;
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
        JSON.stringify({ error: "Missing required fields: address, city, zipCode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Property lookup: ${address}, ${city}, ${state} ${zipCode} (County: ${county || "unknown"})`);

    // Normalize county name
    const normalizedCounty = normalizeCounty(county || "");
    console.log(`Normalized county: ${normalizedCounty}`);

    let propertyData: PropertyData | null = null;

    // Try county-specific CAD first (free)
    switch (normalizedCounty) {
      case "dallas":
        console.log("Trying Dallas CAD...");
        propertyData = await dallasCadLookup(address, city, zipCode);
        break;
      case "tarrant":
        console.log("Trying Tarrant CAD...");
        propertyData = await tarrantCadLookup(address, city, zipCode);
        break;
      case "collin":
        console.log("Trying Collin CAD...");
        propertyData = await collinCadLookup(address, city, zipCode);
        break;
      case "denton":
        console.log("Trying Denton CAD...");
        propertyData = await dentonCadLookup(address, city, zipCode);
        break;
      default:
        console.log(`No CAD integration for county: ${county}`);
    }

    // If no CAD data and Attom API key exists, try paid fallback
    if (!propertyData) {
      console.log("Trying Attom API fallback...");
      propertyData = await attomLookup(address, city, state, zipCode);
    }

    // Return result
    if (propertyData) {
      console.log(`Property data found via ${propertyData.source}`);
      return new Response(JSON.stringify(propertyData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No data found
    return new Response(
      JSON.stringify({ 
        source: "not_found",
        message: "No property data found for this address"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Property lookup error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
