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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    
    // Detect estimator type (default to ducted for backwards compatibility)
    const estimatorType = data.estimator_type || "ducted";
    const isDuctless = estimatorType === "ductless";
    
    console.log(`Received ${estimatorType} abandoned cart data:`, JSON.stringify(data, null, 2));

    // Validate required fields - need at least email OR phone
    const hasEmail = data.customer_email?.trim()?.length > 0;
    const hasPhone = data.customer_phone?.replace(/\D/g, '')?.length >= 10;
    
    if (!hasEmail && !hasPhone) {
      return new Response(
        JSON.stringify({ error: "At least email or phone is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let submissionId: string;

    if (isDuctless) {
      // ========== DUCTLESS SUBMISSION ==========
      const ductlessData = {
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
        selected_rooms: data.selected_rooms || null,
        zone_count: data.zone_count || 0,
        unit_type_id: data.unit_type_id || null,
        system_tier_id: data.system_tier_id || null,
        selected_addons: data.selected_addons || null,
        subtotal: data.subtotal || 0,
        tax_amount: data.tax_amount || 0,
        rebates: data.rebates || 0,
        final_total: data.final_total || 0,
        status: "partial",
        ghl_sync_status: "pending",
      };

      if (data.partial_submission_id) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('ductless_estimate_submissions')
          .update(ductlessData)
          .eq('id', data.partial_submission_id);

        if (error) {
          console.error("Ductless update error:", error);
          throw error;
        }
        submissionId = data.partial_submission_id;
        console.log("Updated ductless partial submission:", submissionId);
      } else {
        // Insert new
        const { data: insertedData, error } = await supabaseAdmin
          .from('ductless_estimate_submissions')
          .insert(ductlessData)
          .select('id')
          .single();

        if (error) {
          console.error("Ductless insert error:", error);
          throw error;
        }
        submissionId = insertedData.id;
        console.log("Created ductless partial submission:", submissionId);
      }
    } else {
      // ========== DUCTED SUBMISSION ==========
      const ductedData = {
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

      if (data.partial_submission_id) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('ducted_estimate_submissions')
          .update(ductedData)
          .eq('id', data.partial_submission_id);

        if (error) {
          console.error("Ducted update error:", error);
          throw error;
        }
        submissionId = data.partial_submission_id;
        console.log("Updated ducted partial submission:", submissionId);
      } else {
        // Insert new
        const { data: insertedData, error } = await supabaseAdmin
          .from('ducted_estimate_submissions')
          .insert(ductedData)
          .select('id')
          .single();

        if (error) {
          console.error("Ducted insert error:", error);
          throw error;
        }
        submissionId = insertedData.id;
        console.log("Created ducted partial submission:", submissionId);
      }
    }

    // ========== GHL SYNC ==========
    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');
    const tableName = isDuctless ? 'ductless_estimate_submissions' : 'ducted_estimate_submissions';

    // Debug logging for credentials
    console.log("GHL credentials check:", {
      hasApiKey: !!GHL_API_KEY,
      apiKeyLength: GHL_API_KEY?.length || 0,
      hasLocationId: !!GHL_LOCATION_ID,
      locationIdLength: GHL_LOCATION_ID?.length || 0,
    });

    if (GHL_API_KEY && GHL_LOCATION_ID) {
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
          city: data.customer_city || undefined,
          state: data.customer_state || "TX",
          postalCode: data.customer_zip || undefined,
          locationId: GHL_LOCATION_ID,
          source: isDuctless 
            ? "Ductless Estimator - Abandoned Cart" 
            : "Ducted Estimator - Abandoned Cart",
          tags: [
            "abandoned-cart", 
            isDuctless ? "ductless-estimator" : "ducted-estimator", 
            "website-lead"
          ],
        };

        // Build custom fields array
        const customFields: { key: string; field_value: string }[] = [];

        if (isDuctless) {
          // Ductless-specific fields
          if (data.zone_count) {
            customFields.push({ key: "zone_count", field_value: String(data.zone_count) });
          }
          if (data.customer_address) {
            customFields.push({ key: "customer_address", field_value: data.customer_address });
          }
        } else {
          // Ducted-specific fields
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
          if (data.customer_address) {
            customFields.push({ key: "customer_address", field_value: data.customer_address });
          }
          if (data.best_time_to_call) {
            customFields.push({ key: "best_time_to_call", field_value: data.best_time_to_call });
          }
          if (data.coverage) {
            customFields.push({ key: "coverage", field_value: data.coverage });
          }
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
        await supabaseAdmin
          .from(tableName)
          .update({ 
            ghl_sync_status: syncStatus,
            ghl_contact_id: ghlContactId,
          })
          .eq('id', submissionId);

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

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: submissionId, 
        estimator_type: estimatorType,
        action: data.partial_submission_id ? "updated" : "created" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
