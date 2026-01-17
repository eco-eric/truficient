import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelNumber, serialNumber, zipCode, email, isDfw } = await req.json();

    if (!modelNumber) {
      return new Response(
        JSON.stringify({ error: 'Model number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Decoding equipment:', { modelNumber, serialNumber, zipCode });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for the AI
    const prompt = `You are an expert HVAC equipment decoder. Given the following model number and serial number, decode as much information as possible about this HVAC equipment.

Model Number: ${modelNumber}
Serial Number: ${serialNumber || 'Not provided'}

Please analyze this equipment and provide the following information. If you cannot determine a value with reasonable confidence, return null for that field.

Return ONLY a valid JSON object with these fields:
{
  "brand": "The manufacturer name (Carrier, Trane, Lennox, Goodman, Rheem, Mitsubishi, Daikin, York, Amana, Bryant, etc.)",
  "equipment_type": "The type of equipment (Central AC, Heat Pump, Gas Furnace, Air Handler, Package Unit, Mini-Split, etc.)",
  "manufactured_year": "The year of manufacture as a number (decode from serial number patterns)",
  "tonnage": "The system capacity (e.g., '2 Ton', '3 Ton', '4 Ton')",
  "refrigerant": "The refrigerant type (R-22, R-410A, R-32, R-454B, etc.)",
  "seer_rating": "The SEER rating as a number if decodable from model number",
  "breaker_size": "Recommended circuit breaker size in amps (e.g., '20', '30', '40')",
  "fan_motor_info": "Fan motor details if available (e.g., 'Variable Speed', 'Single Stage', 'ECM')",
  "compressor_info": "Compressor details if available (e.g., 'Single Stage', 'Two Stage', 'Variable Speed')"
}

IMPORTANT: 
- Use standard serial number decoding patterns for each brand
- For Carrier: First 4 digits are week/year (e.g., 2519 = week 25, 2019)
- For Trane: Look for year indicator in specific positions
- For Lennox: First 2 digits often indicate year
- For Goodman/Amana: First 4 digits are year/month
- For Rheem: Look at first 4 characters for week/year
- Return ONLY the JSON object, no additional text`;

    // Call the Lovable AI Gateway using tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'decode_equipment',
              description: 'Decode HVAC equipment specifications from model and serial numbers',
              parameters: {
                type: 'object',
                properties: {
                  brand: { type: 'string', description: 'The manufacturer name' },
                  equipment_type: { type: 'string', description: 'Type of HVAC equipment' },
                  manufactured_year: { type: 'number', description: 'Year of manufacture' },
                  tonnage: { type: 'string', description: 'System capacity' },
                  refrigerant: { type: 'string', description: 'Refrigerant type' },
                  seer_rating: { type: 'number', description: 'SEER efficiency rating' },
                  breaker_size: { type: 'string', description: 'Recommended breaker size in amps' },
                  fan_motor_info: { type: 'string', description: 'Fan motor details' },
                  compressor_info: { type: 'string', description: 'Compressor details' },
                },
                required: ['brand'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'decode_equipment' } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to decode equipment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    // Extract the tool call result
    let decodedSpecs: Record<string, unknown> = {};
    
    if (aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        decodedSpecs = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
      }
    } else if (aiData.choices?.[0]?.message?.content) {
      // Fallback: try to parse from content if no tool call
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          decodedSpecs = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse content as JSON:', e);
      }
    }

    // Build the full specs object
    const specs = {
      brand: decodedSpecs.brand || null,
      model_number: modelNumber,
      serial_number: serialNumber || null,
      manufactured_year: decodedSpecs.manufactured_year || null,
      tonnage: decodedSpecs.tonnage || null,
      refrigerant: decodedSpecs.refrigerant || null,
      breaker_size: decodedSpecs.breaker_size || null,
      seer_rating: decodedSpecs.seer_rating || null,
      equipment_type: decodedSpecs.equipment_type || null,
      fan_motor_info: decodedSpecs.fan_motor_info || null,
      compressor_info: decodedSpecs.compressor_info || null,
    };

    console.log('Decoded specs:', specs);

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: scanData, error: scanError } = await supabase
      .from('equipment_scans')
      .insert({
        zip_code: zipCode,
        email: email || null,
        brand: specs.brand,
        model_number: specs.model_number,
        serial_number: specs.serial_number,
        manufactured_year: specs.manufactured_year,
        tonnage: specs.tonnage,
        refrigerant: specs.refrigerant,
        breaker_size: specs.breaker_size,
        seer_rating: specs.seer_rating,
        equipment_type: specs.equipment_type,
        fan_motor_info: specs.fan_motor_info,
        compressor_info: specs.compressor_info,
        raw_ai_response: aiData,
        is_dfw: isDfw || false,
      })
      .select('id')
      .single();

    if (scanError) {
      console.error('Failed to save scan:', scanError);
      // Continue anyway - don't fail the user request
    }

    // Auto-generate equipment page if it doesn't exist
    if (specs.brand && typeof specs.brand === 'string') {
      const brandSlug = specs.brand.toLowerCase().replace(/\s+/g, '-');
      const modelSlug = specs.model_number.toLowerCase().replace(/\s+/g, '-');
      const slug = `${brandSlug}/${modelSlug}`;
      
      const { data: existingPage } = await supabase
        .from('equipment_pages')
        .select('id, times_searched')
        .eq('slug', slug)
        .single();

      if (existingPage) {
        // Increment search count
        await supabase
          .from('equipment_pages')
          .update({ times_searched: (existingPage.times_searched || 0) + 1 })
          .eq('id', existingPage.id);
      } else {
        // Create new equipment page
        await supabase
          .from('equipment_pages')
          .insert({
            slug,
            brand: specs.brand,
            model_number: specs.model_number,
            model_pattern: specs.model_number.substring(0, 8),
            specs: specs,
            seo_title: `${specs.brand} ${specs.model_number} Specifications, Manuals & Documentation | Truficient`,
            seo_description: `Complete specs for ${specs.brand} ${specs.model_number} including tonnage, refrigerant type, SEER rating, and downloadable manuals. Free resource from Truficient Energy Solutions.`,
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanId: scanData?.id,
        specs,
        raw_ai_response: aiData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error decoding equipment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to decode equipment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
