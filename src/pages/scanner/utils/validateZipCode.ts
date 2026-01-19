const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const CACHE_KEY = 'validated_zip_codes';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ZipCodeValidation {
  valid: boolean;
  zipCode: string;
  city: string | null;
  state: string | null;
  formatted: string | null;
  error?: string;
}

interface CachedValidation extends ZipCodeValidation {
  timestamp: number;
}

interface ZipCodeCache {
  [zipCode: string]: CachedValidation;
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

function getCache(): ZipCodeCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setCache(cache: ZipCodeCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full or disabled
  }
}

function getCachedValidation(zipCode: string): ZipCodeValidation | null {
  const cache = getCache();
  const cached = cache[zipCode];
  
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
    const { timestamp, ...validation } = cached;
    return validation;
  }
  
  return null;
}

function cacheValidation(validation: ZipCodeValidation): void {
  const cache = getCache();
  cache[validation.zipCode] = {
    ...validation,
    timestamp: Date.now()
  };
  setCache(cache);
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

  // Check cache first
  const cached = getCachedValidation(cleanZip);
  if (cached) {
    console.log('Using cached zip code validation for:', cleanZip);
    return cached;
  }

  // If no API key, fallback to basic format validation
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('No Google Places API key configured - using basic validation');
    return { valid: true, zipCode: cleanZip, city: null, state: null, formatted: null };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZip}&components=country:US&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn('Geocoding API request failed:', response.status, '- using basic validation');
      return { valid: true, zipCode: cleanZip, city: null, state: null, formatted: null };
    }

    const data: GeocodingResponse = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const city = extractComponent(result, 'locality') || extractComponent(result, 'sublocality') || extractComponent(result, 'neighborhood');
      const state = extractComponent(result, 'administrative_area_level_1');
      const stateShort = result.address_components?.find(c => c.types.includes('administrative_area_level_1'))?.short_name || state;
      
      const validation: ZipCodeValidation = {
        valid: true,
        zipCode: cleanZip,
        city,
        state,
        formatted: city && stateShort ? `${city}, ${stateShort} ${cleanZip}` : cleanZip
      };
      
      cacheValidation(validation);
      return validation;
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
    console.warn('Geocoding API error:', error, '- using basic validation');
    return { valid: true, zipCode: cleanZip, city: null, state: null, formatted: null };
  }
}
