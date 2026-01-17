// Scanner Types

export interface EquipmentSpecs {
  brand: string | null;
  model_number: string;
  serial_number: string | null;
  manufactured_year: number | null;
  tonnage: string | null;
  refrigerant: string | null;
  breaker_size: string | null;
  seer_rating: number | null;
  equipment_type: string | null;
  fan_motor_info: string | null;
  compressor_info: string | null;
}

export interface ScanResult {
  id?: string;
  specs: EquipmentSpecs;
  raw_ai_response?: Record<string, unknown>;
}

export interface DocumentationResult {
  id: string;
  brand: string;
  model_pattern: string;
  document_type: 'submittal' | 'manual' | 'spec_sheet' | 'wiring_diagram';
  document_title: string | null;
  document_url: string;
  source_url: string | null;
}

export type InputMethod = 'scan' | 'upload' | 'manual';

export interface ScannerState {
  step: 'zip' | 'examples' | 'input-method' | 'scan' | 'upload' | 'manual' | 'processing' | 'results';
  zipCode: string;
  email: string;
  modelNumber: string;
  serialNumber: string;
  imageBase64: string | null;
  inputMethod: InputMethod | null;
  isDfw: boolean;
  isProcessing: boolean;
  result: ScanResult | null;
  error: string | null;
}

export type ScannerAction =
  | { type: 'SET_ZIP_CODE'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_MODEL_NUMBER'; payload: string }
  | { type: 'SET_SERIAL_NUMBER'; payload: string }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_INPUT_METHOD'; payload: InputMethod }
  | { type: 'SET_IS_DFW'; payload: boolean }
  | { type: 'GO_TO_STEP'; payload: ScannerState['step'] }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_RESULT'; payload: ScanResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

// DFW zip code prefixes
export const DFW_ZIP_PREFIXES = [
  '750', '751', '752', '753', '754', '755',
  '760', '761', '762', '763', '764', '765',
  '766', '767', '768', '769', '770', '771',
  '772', '773', '774', '775', '776', '779',
];

export function isDfwZipCode(zipCode: string): boolean {
  const prefix = zipCode.substring(0, 3);
  return DFW_ZIP_PREFIXES.includes(prefix);
}

// Brand logos mapping
export const BRAND_LOGOS: Record<string, string> = {
  carrier: '/brands/carrier.png',
  trane: '/brands/trane.png',
  lennox: '/brands/lennox.png',
  goodman: '/brands/goodman.png',
  rheem: '/brands/rheem.png',
  mitsubishi: '/brands/mitsubishi.png',
  daikin: '/brands/daikin.png',
  york: '/brands/york.png',
  amana: '/brands/amana.png',
  bryant: '/brands/bryant.png',
};
