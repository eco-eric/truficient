import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GHLResponse {
  contact?: {
    id: string;
  };
}

serve(async (req) => {
  console.log("=== ABANDONED CART SAVE START ===");
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    
    // Determine estimator type (default to ducted for backwards compatibility)
    const estimatorType = data.estimator_type || 'ducted';
    console.log("Estimator type:", estimatorType);
    console.log("Received data keys:", Object.keys(data));

    // Validate required fields - need at least email OR phone
    const hasEmail = data.customer_email?.trim()?.length > 0;
    const hasPhone = data.customer_phone?.replace(/\D/g, '')?.length >= 10;
    
    console.log("Has email:", hasEmail, "Has phone:", hasPhone);
    
    if (!hasEmail && !hasPhone) {
      console.log("Validation failed: no email or phone");
      return new Response(
        JSON.stringify({ error: "At least email or phone is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Has Supabase URL:", Boolean(supabaseUrl));
    console.log("Has Service Key:", Boolean(supabaseServiceKey));
    
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

    let submissionData: Record<string, unknown>;
    let tableName: string;
    let ghlSource: string;
    let ghlTags: string[];

    if (estimatorType === 'ductless') {
      // Ductless submission data
      tableName = 'ductless_estimate_submissions';
      ghlSource = 'Ductless Estimator - Abandoned Cart';
      ghlTags = ['abandoned-cart', 'ductless-estimator', 'website-lead'];
      
      submissionData = {
        customer_name: data.customer_name || null,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        customer_city: data.customer_city || null,
        customer_county: data.customer_county || null,
        customer_state: data.customer_state || null,
        customer_zip: data.customer_zip || null,
        google_place_id: data.google_place_id || null,
        notes: data.notes || null,
        zone_count: data.zone_count || 0,
        unit_type_id: data.unit_type_id || null,
        system_tier_id: data.system_tier_id || null,
        selected_rooms: data.selected_rooms || null,
        selected_addons: data.selected_addons || null,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        rebates: data.rebates || 0,
        final_total: data.final_total || 0,
        status: 'partial',
        ghl_sync_status: 'pending',
      };
    } else {
      // Ducted submission data (default)
      tableName = 'ducted_estimate_submissions';
      ghlSource = 'Ducted Estimator - Abandoned Cart';
      ghlTags = ['abandoned-cart', 'ducted-estimator', 'website-lead'];
      
      submissionData = {
        customer_name: data.customer_name || "",
        customer_email: data.customer_email || "",
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        best_time_to_call: data.best_time_to_call || null,
        home_type: data.home_type || "single_family",
        home_layout: data.home_layout || "1_story",
        square_footage: data.square_footage || "1600_2000",
        hot_cold_spots: data.hot_cold_spots || null,
        winter_temp: data.winter_temp || null,
        summer_temp: data.summer_temp || null,
        heating_type: data.heating_type || "gas_system",
        coverage: data.coverage || "entire_home",
        system_count: data.system_count || 1,
        status: "partial",
        ghl_sync_status: "pending",
      };
    }

    console.log("Table name:", tableName);
    console.log("Submission data:", JSON.stringify(submissionData, null, 2));

    let submissionId: string;

    // Check if we should update existing or insert new
    if (data.partial_submission_id) {
      console.log("Updating existing partial submission:", data.partial_submission_id);
      
      const { error } = await supabaseAdmin
        .from(tableName)
        .update(submissionData)
        .eq('id', data.partial_submission_id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      submissionId = data.partial_submission_id;
      console.log("Updated partial submission successfully");
    } else {
      console.log("Creating new partial submission");
      
      const { data: insertedData, error } = await supabaseAdmin
        .from(tableName)
        .insert(submissionData)
        .select('id')
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      submissionId = insertedData.id;
      console.log("Created partial submission:", submissionId);
    }

    // ========== GHL SYNC ==========
    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    console.log("Has GHL API Key:", Boolean(GHL_API_KEY));
    console.log("Has GHL Location ID:", Boolean(GHL_LOCATION_ID));

    if (GHL_API_KEY && GHL_LOCATION_ID) {
      console.log("Starting GHL sync...");
      try {
        // Parse name into first/last
        const nameParts = (data.customer_name || "").trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Build GHL payload
        const ghlPayload: Record<string, unknown> = {
          firstName,
          lastName,
          email: data.customer_email || undefined,
          phone: data.customer_phone || undefined,
          address1: data.customer_address || undefined,
          locationId: GHL_LOCATION_ID,
          source: ghlSource,
          tags: ghlTags,
        };

        // Build custom fields array based on estimator type
        const customFields: { key: string; field_value: string }[] = [];

        if (estimatorType === 'ductless') {
          // Ductless-specific custom fields
          if (data.zone_count) {
            customFields.push({ key: "zone_count", field_value: String(data.zone_count) });
          }
          if (data.customer_city) {
            customFields.push({ key: "city", field_value: data.customer_city });
          }
          if (data.customer_zip) {
            customFields.push({ key: "zip_code", field_value: data.customer_zip });
          }
          if (data.final_total) {
            customFields.push({ key: "estimated_total", field_value: String(data.final_total) });
          }
        } else {
          // Ducted-specific custom fields
          if (data.home_type) {
            customFields.push({ key: "home_type", field_value: data.home_type });
          }
          if (data.square_footage) {
            customFields.push({ key: "square_footage", field_value: data.square_footage });
          }
          if (data.home_layout) {
            customFields.push({ key: "home_layout", field_value: data.home_layout });
          }
          if (data.heating_type) {
            customFields.push({ key: "heating_type", field_value: data.heating_type });
          }
          if (data.best_time_to_call) {
            customFields.push({ key: "best_time_to_call", field_value: data.best_time_to_call });
          }
          if (data.coverage) {
            customFields.push({ key: "coverage", field_value: data.coverage });
          }
        }

        // Common custom field
        if (data.customer_address) {
          customFields.push({ key: "customer_address", field_value: data.customer_address });
        }

        if (customFields.length > 0) {
          ghlPayload.customFields = customFields;
        }

        console.log("GHL payload:", JSON.stringify(ghlPayload, null, 2));

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

        let ghlContactId: string | null = null;
        let syncStatus = "failed";

        if (ghlResponse.ok) {
          const ghlData: GHLResponse = JSON.parse(responseText);
          ghlContactId = ghlData.contact?.id || null;
          syncStatus = "synced";
          console.log("GHL sync successful. Contact ID:", ghlContactId);
        } else {
          console.error("GHL API error:", responseText);
        }

        // Update sync status in database
        console.log("Updating sync status in database...");
        const { error: updateError } = await supabaseAdmin
          .from(tableName)
          .update({ 
            ghl_sync_status: syncStatus,
            ghl_contact_id: ghlContactId,
          })
          .eq('id', submissionId);

        if (updateError) {
          console.error("Failed to update sync status:", updateError);
        } else {
          console.log("Sync status updated successfully");
        }

      } catch (ghlError) {
        console.error("GHL sync error:", ghlError);
        // Update status to failed but don't throw - we still saved the submission
        await supabaseAdmin
          .from(tableName)
          .update({ ghl_sync_status: "failed" })
          .eq('id', submissionId);
      }
    } else {
      console.warn("GHL credentials not configured - skipping sync");
    }

    console.log("=== ABANDONED CART SAVE END ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: submissionId, 
        action: data.partial_submission_id ? "updated" : "created",
        estimator_type: estimatorType,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("=== ABANDONED CART SAVE ERROR ===");
    console.error("Error saving abandoned cart:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
