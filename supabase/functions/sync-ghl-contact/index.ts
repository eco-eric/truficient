import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const equipmentSchema = z.object({
  brand: z.string().max(100).optional(),
  age: z.number().int().min(0).max(100).optional(),
  tonnage: z.string().max(20).optional(),
  refrigerant: z.string().max(50).optional(),
  seerRating: z.number().min(0).max(50).optional(),
  equipmentType: z.string().max(100).optional(),
}).optional();

const quoteSchema = z.object({
  systemType: z.string().max(100).optional(),
  tonnage: z.string().max(20).optional(),
  equipment: z.string().max(200).optional(),
  price: z.string().max(50).optional(),
  monthlyPayment: z.string().max(50).optional(),
  homeDetails: z.string().max(500).optional(),
  validUntil: z.string().max(50).optional(),
  tier: z.string().max(50).optional(),
  zones: z.number().int().min(0).max(20).optional(),
  totalBtu: z.number().min(0).max(1000000).optional(),
  quoteRawDetails: z.string().max(5000).optional(),
}).optional();

const contactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  serviceType: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  source: z.string().max(100).optional(),
  equipmentReportUrl: z.string().url().max(500).optional(),
  zipCode: z.string().max(10).optional(),
  isDfw: z.boolean().optional(),
  equipment: equipmentSchema,
  quote: quoteSchema,
  notes: z.string().max(2000).optional(),
});

interface GHLResponse {
  contact?: {
    id: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('sync-ghl-contact: Processing public submission request');

    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      throw new Error('GHL credentials not configured');
    }

    const rawBody = await req.json();
    const parsed = contactSchema.safeParse(rawBody);
    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.flatten().fieldErrors);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input', details: parsed.error.flatten().fieldErrors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const contactData = parsed.data;
    console.log('Syncing contact to GHL:', contactData.email);

    // Build the GHL contact payload
    const ghlPayload: Record<string, unknown> = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      locationId: GHL_LOCATION_ID,
      source: contactData.source || 'Website Contact Form',
      tags: contactData.tags || ['website-lead'],
    };

    if (contactData.phone) {
      ghlPayload.phone = contactData.phone;
    }

    if (contactData.address) {
      ghlPayload.address1 = contactData.address;
    }

    const customFields: { key: string; field_value: string }[] = [];
    
    if (contactData.serviceType) {
      customFields.push({ key: 'service_type', field_value: contactData.serviceType });
    }

    if (contactData.message) {
      customFields.push({ key: 'message', field_value: contactData.message });
    }

    if (contactData.equipmentReportUrl) {
      customFields.push({ key: 'equipment_report_url', field_value: contactData.equipmentReportUrl });
    }

    if (contactData.zipCode) {
      customFields.push({ key: 'zip_code', field_value: contactData.zipCode });
    }

    if (contactData.isDfw !== undefined) {
      customFields.push({ key: 'is_dfw', field_value: contactData.isDfw ? 'Yes' : 'No' });
    }

    if (contactData.address) {
      customFields.push({ key: 'customer_address', field_value: contactData.address });
    }

    if (contactData.notes) {
      customFields.push({ key: 'customer_notes', field_value: contactData.notes });
    }

    if (contactData.equipment) {
      const equip = contactData.equipment;
      if (equip.brand) customFields.push({ key: 'equipment_brand', field_value: equip.brand });
      if (equip.age !== undefined) customFields.push({ key: 'equipment_age', field_value: String(equip.age) });
      if (equip.tonnage) customFields.push({ key: 'equipment_tonnage', field_value: equip.tonnage });
      if (equip.refrigerant) customFields.push({ key: 'equipment_refrigerant', field_value: equip.refrigerant });
      if (equip.seerRating !== undefined) customFields.push({ key: 'equipment_seer', field_value: String(equip.seerRating) });
      if (equip.equipmentType) customFields.push({ key: 'equipment_type', field_value: equip.equipmentType });
    }

    if (contactData.quote) {
      const quote = contactData.quote;
      if (quote.systemType) customFields.push({ key: 'quote_system_type', field_value: quote.systemType });
      if (quote.tonnage) customFields.push({ key: 'quote_tonnage', field_value: quote.tonnage });
      if (quote.equipment) customFields.push({ key: 'quote_equipment', field_value: quote.equipment });
      if (quote.price) customFields.push({ key: 'quote_price', field_value: quote.price });
      if (quote.monthlyPayment) customFields.push({ key: 'quote_monthly', field_value: quote.monthlyPayment });
      if (quote.homeDetails) customFields.push({ key: 'quote_home_details', field_value: quote.homeDetails });
      if (quote.validUntil) customFields.push({ key: 'quote_valid_until', field_value: quote.validUntil });
      if (quote.tier) customFields.push({ key: 'quote_tier', field_value: quote.tier });
      if (quote.zones !== undefined) customFields.push({ key: 'quote_zones', field_value: String(quote.zones) });
      if (quote.totalBtu !== undefined) customFields.push({ key: 'quote_total_btu', field_value: String(quote.totalBtu) });
      if (quote.quoteRawDetails) customFields.push({ key: 'quote_raw_details', field_value: quote.quoteRawDetails });
    }

    if (customFields.length > 0) {
      ghlPayload.customFields = customFields;
    }

    console.log('GHL payload:', JSON.stringify(ghlPayload, null, 2));

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
      throw new Error(`GHL API error: ${ghlResponse.status}`);
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
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error('Error syncing contact to GHL:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process submission',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
