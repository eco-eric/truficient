import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EquipmentData {
  brand?: string;
  age?: number;
  tonnage?: string;
  refrigerant?: string;
  seerRating?: number;
  equipmentType?: string;
}

interface QuoteData {
  systemType?: string;
  tonnage?: string;
  equipment?: string;
  price?: string;
  monthlyPayment?: string;
  homeDetails?: string;
  validUntil?: string;
  tier?: string;
  zones?: number;
  totalBtu?: number;
  quoteRawDetails?: string;
}

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  message?: string;
  tags?: string[];
  source?: string;
  equipmentReportUrl?: string;
  zipCode?: string;
  isDfw?: boolean;
  equipment?: EquipmentData;
  quote?: QuoteData;
}

interface GHLResponse {
  contact?: {
    id: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.email);
    // ========== END AUTHENTICATION CHECK ==========

    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      throw new Error('GHL credentials not configured');
    }

    const contactData: ContactData = await req.json();
    console.log('Syncing contact to GHL:', contactData.email, 'by user:', user.email);

    // Build the GHL contact payload
    const ghlPayload: Record<string, unknown> = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      locationId: GHL_LOCATION_ID,
      source: contactData.source || 'Website Contact Form',
      tags: contactData.tags || ['website-lead'],
    };

    // Add phone if provided
    if (contactData.phone) {
      ghlPayload.phone = contactData.phone;
    }

    // Add address to native GHL field
    if (contactData.address) {
      ghlPayload.address1 = contactData.address;
    }

    // Add custom fields for service type and message
    const customFields: { key: string; field_value: string }[] = [];
    
    if (contactData.serviceType) {
      customFields.push({
        key: 'service_type',
        field_value: contactData.serviceType,
      });
    }

    if (contactData.message) {
      customFields.push({
        key: 'message',
        field_value: contactData.message,
      });
    }

    if (contactData.equipmentReportUrl) {
      customFields.push({
        key: 'equipment_report_url',
        field_value: contactData.equipmentReportUrl,
      });
    }

    // Add zip code
    if (contactData.zipCode) {
      customFields.push({
        key: 'zip_code',
        field_value: contactData.zipCode,
      });
    }

    // Add DFW flag
    if (contactData.isDfw !== undefined) {
      customFields.push({
        key: 'is_dfw',
        field_value: contactData.isDfw ? 'Yes' : 'No',
      });
    }

    // Add customer address to custom field
    if (contactData.address) {
      customFields.push({
        key: 'customer_address',
        field_value: contactData.address,
      });
    }

    // Add equipment-specific fields
    if (contactData.equipment) {
      const equip = contactData.equipment;
      
      if (equip.brand) {
        customFields.push({
          key: 'equipment_brand',
          field_value: equip.brand,
        });
      }

      if (equip.age !== undefined && equip.age !== null) {
        customFields.push({
          key: 'equipment_age',
          field_value: String(equip.age),
        });
      }

      if (equip.tonnage) {
        customFields.push({
          key: 'equipment_tonnage',
          field_value: equip.tonnage,
        });
      }

      if (equip.refrigerant) {
        customFields.push({
          key: 'equipment_refrigerant',
          field_value: equip.refrigerant,
        });
      }

      if (equip.seerRating !== undefined && equip.seerRating !== null) {
        customFields.push({
          key: 'equipment_seer',
          field_value: String(equip.seerRating),
        });
      }

      if (equip.equipmentType) {
        customFields.push({
          key: 'equipment_type',
          field_value: equip.equipmentType,
        });
      }
    }

    // Add quote-specific fields for "Save My Quote" feature
    if (contactData.quote) {
      const quote = contactData.quote;
      
      if (quote.systemType) {
        customFields.push({
          key: 'quote_system_type',
          field_value: quote.systemType,
        });
      }

      if (quote.tonnage) {
        customFields.push({
          key: 'quote_tonnage',
          field_value: quote.tonnage,
        });
      }

      if (quote.equipment) {
        customFields.push({
          key: 'quote_equipment',
          field_value: quote.equipment,
        });
      }

      if (quote.price) {
        customFields.push({
          key: 'quote_price',
          field_value: quote.price,
        });
      }

      if (quote.monthlyPayment) {
        customFields.push({
          key: 'quote_monthly',
          field_value: quote.monthlyPayment,
        });
      }

      if (quote.homeDetails) {
        customFields.push({
          key: 'quote_home_details',
          field_value: quote.homeDetails,
        });
      }

      if (quote.validUntil) {
        customFields.push({
          key: 'quote_valid_until',
          field_value: quote.validUntil,
        });
      }

      if (quote.tier) {
        customFields.push({
          key: 'quote_tier',
          field_value: quote.tier,
        });
      }

      if (quote.zones !== undefined) {
        customFields.push({
          key: 'quote_zones',
          field_value: String(quote.zones),
        });
      }

      if (quote.totalBtu !== undefined) {
        customFields.push({
          key: 'quote_total_btu',
          field_value: String(quote.totalBtu),
        });
      }

      if (quote.quoteRawDetails) {
        customFields.push({
          key: 'quote_raw_details',
          field_value: quote.quoteRawDetails,
        });
      }
    }

    if (customFields.length > 0) {
      ghlPayload.customFields = customFields;
    }

    console.log('GHL payload:', JSON.stringify(ghlPayload, null, 2));

    // Call GHL Contacts Upsert API
    const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify(ghlPayload),
    });

    const responseText = await ghlResponse.text();
    console.log('GHL API response status:', ghlResponse.status);
    console.log('GHL API response:', responseText);

    if (!ghlResponse.ok) {
      console.error('GHL API error:', responseText);
      throw new Error(`GHL API error: ${ghlResponse.status} - ${responseText}`);
    }

    const ghlData: GHLResponse = JSON.parse(responseText);
    console.log('Contact synced successfully. GHL Contact ID:', ghlData.contact?.id);

    return new Response(
      JSON.stringify({
        success: true,
        contactId: ghlData.contact?.id,
        message: 'Contact synced to GoHighLevel successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync contact to GoHighLevel';
    console.error('Error syncing contact to GHL:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
