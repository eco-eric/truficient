import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== Authentication Check =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check for admin/manager role
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!roleData || !['super_admin', 'admin', 'manager'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // ===== End Authentication Check =====

    const GHL_API_KEY = Deno.env.get('GHL_CONVERSATIONS_API_KEY') || Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      throw new Error('GHL credentials not configured');
    }

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const conversationId = url.searchParams.get('conversationId');

    // If conversationId provided, fetch specific conversation messages
    if (conversationId) {
      console.log('Fetching messages for conversation:', conversationId);
      
      const messagesResponse = await fetch(
        `https://services.leadconnectorhq.com/conversations/${conversationId}/messages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-04-15',
          },
        }
      );

      const messagesText = await messagesResponse.text();

      if (!messagesResponse.ok) {
        console.error('GHL Messages API error:', messagesText);
        throw new Error(`GHL Messages API error: ${messagesResponse.status}`);
      }

      const messagesData = JSON.parse(messagesText);
      const messagesList = messagesData.messages?.messages || messagesData.messages || messagesData.data || [];
      
      return new Response(
        JSON.stringify({
          success: true,
          messages: Array.isArray(messagesList) ? messagesList : [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Build query parameters for conversations list
    const queryParams = new URLSearchParams({
      locationId: GHL_LOCATION_ID,
      limit: limit.toString(),
    });

    if (status !== 'all') {
      queryParams.append('status', status);
    }

    const conversationsResponse = await fetch(
      `https://services.leadconnectorhq.com/conversations/search?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-04-15',
        },
      }
    );

    const responseText = await conversationsResponse.text();

    if (!conversationsResponse.ok) {
      console.error('GHL Conversations API error:', responseText);
      throw new Error(`GHL Conversations API error: ${conversationsResponse.status} - ${responseText}`);
    }

    const conversationsData = JSON.parse(responseText);

    return new Response(
      JSON.stringify({
        success: true,
        conversations: conversationsData.conversations || [],
        total: conversationsData.total || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
    console.error('Error fetching GHL conversations:', errorMessage);
    
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
