import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Required custom fields for quote syncing
const REQUIRED_CUSTOM_FIELDS = [
  'quote_raw_details',
  'quote_system_type',
  'quote_price',
  'quote_tonnage',
  'quote_monthly',
  'quote_valid_until',
  'quote_tier',
  'quote_zones',
  'quote_total_btu',
  'quote_equipment',
  'quote_home_details',
  'equipment_brand',
  'equipment_age',
  'equipment_tonnage',
  'equipment_refrigerant',
  'equipment_seer',
  'equipment_type',
  'equipment_report_url',
  'zip_code',
  'is_dfw',
  'service_type',
  'message',
];

interface CustomField {
  id: string;
  name: string;
  fieldKey: string;
  dataType: string;
}

interface VerificationResult {
  success: boolean;
  configured: string[];
  missing: string[];
  total: number;
  configuredCount: number;
  missingCount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GHL credentials not configured. Please set GHL_API_Key_Contact and GHL_LOCATION_ID secrets.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching custom fields from GHL for location:', GHL_LOCATION_ID);

    // Fetch custom fields from GHL
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/locations/${GHL_LOCATION_ID}/customFields`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      }
    );

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error('GHL API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch custom fields from GHL: ${ghlResponse.status}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ghlData = await ghlResponse.json();
    const existingFields: CustomField[] = ghlData.customFields || [];
    
    console.log(`Found ${existingFields.length} custom fields in GHL`);

    // Check which required fields exist
    const existingFieldKeys = new Set(existingFields.map(f => f.fieldKey));
    
    const configured: string[] = [];
    const missing: string[] = [];

    for (const requiredField of REQUIRED_CUSTOM_FIELDS) {
      if (existingFieldKeys.has(requiredField)) {
        configured.push(requiredField);
      } else {
        missing.push(requiredField);
      }
    }

    const result: VerificationResult = {
      success: missing.length === 0,
      configured,
      missing,
      total: REQUIRED_CUSTOM_FIELDS.length,
      configuredCount: configured.length,
      missingCount: missing.length,
    };

    console.log('Verification result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify GHL custom fields';
    console.error('Error verifying GHL custom fields:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
