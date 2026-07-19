// Triggers a production deploy by POSTing to the Vercel deploy hook.
// The hook URL is stored in the secret VERCEL_DEPLOY_HOOK_URL (Eric adds this).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const hookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL');
  if (!hookUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'deploy hook not configured — tell Eric to add VERCEL_DEPLOY_HOOK_URL secret',
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    const bodyText = await res.text();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Vercel hook responded ${res.status}`, detail: bodyText.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    let parsed: any = null;
    try { parsed = JSON.parse(bodyText); } catch { /* ignore */ }
    return new Response(
      JSON.stringify({ success: true, triggered_at: new Date().toISOString(), vercel: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
