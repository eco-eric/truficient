import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    
    console.log("Received abandoned cart data:", JSON.stringify(data, null, 2));

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

    // Build submission data with defaults
    const submissionData = {
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

    // Check if we should update existing or insert new
    if (data.partial_submission_id) {
      // Update existing partial submission
      const { error } = await supabaseAdmin
        .from('ducted_estimate_submissions')
        .update(submissionData)
        .eq('id', data.partial_submission_id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      console.log("Updated partial submission:", data.partial_submission_id);
      return new Response(
        JSON.stringify({ success: true, id: data.partial_submission_id, action: "updated" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Insert new partial submission
      const { data: insertedData, error } = await supabaseAdmin
        .from('ducted_estimate_submissions')
        .insert(submissionData)
        .select('id')
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      console.log("Created partial submission:", insertedData.id);
      return new Response(
        JSON.stringify({ success: true, id: insertedData.id, action: "created" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
