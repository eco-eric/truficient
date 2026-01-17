// DFW Metroplex service area counties
export const SERVICE_AREA_COUNTIES = [
  "Dallas",
  "Collin",
  "Tarrant",
  "Denton",
  "Ellis",
  "Rockwall",
  "Kaufman",
  "Johnson",
  "Parker",
  "Hunt",
  "Wise",
  "Henderson",
] as const;

export type ServiceAreaCounty = (typeof SERVICE_AREA_COUNTIES)[number];

/**
 * Check if a county name is within the service area
 * Handles variations like "Dallas County" vs "Dallas"
 */
export function isInServiceArea(county: string): boolean {
  if (!county) return false;
  
  const normalizedCounty = county
    .toLowerCase()
    .replace(/\s*county\s*/gi, "")
    .trim();
  
  return SERVICE_AREA_COUNTIES.some(
    (c) => c.toLowerCase() === normalizedCounty
  );
}

/**
 * Get formatted list of service area counties for display
 */
export function getServiceAreaDisplay(): string {
  return SERVICE_AREA_COUNTIES.slice(0, -1).join(", ") + 
    ", and " + SERVICE_AREA_COUNTIES[SERVICE_AREA_COUNTIES.length - 1] + " counties";
}
