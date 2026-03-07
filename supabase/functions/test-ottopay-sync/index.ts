import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_BASE = Deno.env.get('VITE_OTTOPAY_SUPABASE_URL') || Deno.env.get('OTTOPAY_SUPABASE_URL');
    const SYNC_KEY = Deno.env.get('VITE_OTTOPAY_SYNC_KEY');
    const BUSINESS_ID = Deno.env.get('VITE_OTTOPAY_BUSINESS_ID');

    if (!API_BASE || !SYNC_KEY || !BUSINESS_ID) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing config',
        details: {
          hasUrl: !!API_BASE,
          hasSyncKey: !!SYNC_KEY,
          hasBusinessId: !!BUSINESS_ID,
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const url = `${API_BASE}/functions/v1/api-sync?entity=customers&limit=3`;
    console.log('Testing URL:', url);

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SYNC_KEY,
        'x-business-id': BUSINESS_ID,
      },
    });

    const body = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', body.substring(0, 500));

    return new Response(JSON.stringify({
      success: res.ok,
      status: res.status,
      data: res.ok ? JSON.parse(body) : body,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
