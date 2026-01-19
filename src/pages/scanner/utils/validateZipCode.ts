const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export interface ZipCodeValidation {
  valid: boolean;
  zipCode: string;
  city: string | null;
  state: string | null;
  formatted: string | null;
  error?: string;
}

interface GeocodingResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface GeocodingResponse {
  status: string;
  results: GeocodingResult[];
}

function extractComponent(result: GeocodingResult, type: string): string | null {
  const component = result.address_components?.find(
    (c) => c.types.includes(type)
  );
  return component?.long_name || null;
}

export async function validateZipCode(zipCode: string): Promise<ZipCodeValidation> {
  // Basic format validation
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length !== 5) {
    return { 
      valid: false, 
      zipCode: cleanZip, 
      city: null, 
      state: null, 
      formatted: null,
      error: 'Please enter a valid 5-digit zip code' 
    };
  }

  // If no API key, reject - we need real validation
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('No Google Places API key configured - cannot validate zip codes');
    return { 
      valid: false, 
      zipCode: cleanZip, 
      city: null, 
      state: null, 
      formatted: null,
      error: 'Unable to validate zip code. Please try again.' 
    };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZip}&components=country:US&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Geocoding API request failed:', response.status);
      return { 
        valid: false, 
        zipCode: cleanZip, 
        city: null, 
        state: null, 
        formatted: null,
        error: 'Unable to verify zip code. Please try again.' 
      };
    }

    const data: GeocodingResponse = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const city = extractComponent(result, 'locality') || extractComponent(result, 'sublocality') || extractComponent(result, 'neighborhood');
      const state = extractComponent(result, 'administrative_area_level_1');
      const stateShort = result.address_components?.find(c => c.types.includes('administrative_area_level_1'))?.short_name || state;
      
      return {
        valid: true,
        zipCode: cleanZip,
        city,
        state,
        formatted: city && stateShort ? `${city}, ${stateShort} ${cleanZip}` : cleanZip
      };
    }
    
    // No results found - invalid zip code
    return { 
      valid: false, 
      zipCode: cleanZip, 
      city: null, 
      state: null, 
      formatted: null,
      error: 'Please enter a valid US zip code' 
    };
  } catch (error) {
    console.error('Geocoding API error:', error);
    return { 
      valid: false, 
      zipCode: cleanZip, 
      city: null, 
      state: null, 
      formatted: null,
      error: 'Unable to verify zip code. Please check your connection and try again.' 
    };
  }
}
