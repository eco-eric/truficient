import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message?: string;
  tags?: string[];
  source?: string;
  equipmentReportUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      throw new Error('GHL credentials not configured');
    }

    const contactData: ContactData = await req.json();
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

    // Add phone if provided
    if (contactData.phone) {
      ghlPayload.phone = contactData.phone;
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

    const ghlData = JSON.parse(responseText);
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
