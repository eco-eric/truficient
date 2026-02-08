import { supabase } from "@/integrations/supabase/client";

export interface PropertyLookupRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
}

export interface PropertyData {
  squareFootage: number | null;
  yearBuilt: number | null;
  stories: number | null;
  lotSizeSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyClass: string | null;
  source: string;
}

export async function lookupPropertyData(
  request: PropertyLookupRequest
): Promise<PropertyData | null> {
  try {
    const { data, error } = await supabase.functions.invoke("lookup-property-data", {
      body: request,
    });

    if (error) {
      console.error("Property lookup error:", error);
      return null;
    }

    if (data?.source === "not_found") {
      return null;
    }

    return data as PropertyData;
  } catch (err) {
    console.error("Property lookup failed:", err);
    return null;
  }
}

// Format source name for display
export function formatPropertySource(source: string): string {
  const sourceMap: Record<string, string> = {
    dallas_cad: "Dallas CAD",
    tarrant_cad: "Tarrant CAD",
    collin_cad: "Collin CAD",
    denton_cad: "Denton CAD",
    attom: "Attom Data",
    manual: "Manual Entry",
    not_found: "Not Found",
  };
  return sourceMap[source] || source;
}
