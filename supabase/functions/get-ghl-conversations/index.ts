import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationQuery {
  status?: string;
  limit?: number;
  startAfterDate?: string;
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
      console.log('Messages response status:', messagesResponse.status);

      if (!messagesResponse.ok) {
        console.error('GHL Messages API error:', messagesText);
        throw new Error(`GHL Messages API error: ${messagesResponse.status}`);
      }

      const messagesData = JSON.parse(messagesText);
      
      return new Response(
        JSON.stringify({
          success: true,
          messages: messagesData.messages || [],
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

    console.log('Fetching GHL conversations with params:', queryParams.toString());

    // Fetch conversations from GHL API
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
    console.log('GHL Conversations API response status:', conversationsResponse.status);

    if (!conversationsResponse.ok) {
      console.error('GHL Conversations API error:', responseText);
      throw new Error(`GHL Conversations API error: ${conversationsResponse.status} - ${responseText}`);
    }

    const conversationsData = JSON.parse(responseText);
    console.log('Fetched conversations count:', conversationsData.conversations?.length || 0);

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
