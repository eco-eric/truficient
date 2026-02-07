import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AIConfig {
  provider: string;
  model: string;
  api_key_secret_name: string | null;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  is_active: boolean;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, messages, customerId, jobId, context } = await req.json();

    // Fetch AI configuration
    const { data: configData, error: configError } = await supabase
      .from("ai_config")
      .select("*")
      .eq("config_key", "ai_assistant")
      .single();

    if (configError || !configData) {
      console.error("Failed to load AI config:", configError);
      return new Response(
        JSON.stringify({ error: "AI configuration not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config: AIConfig = configData;

    if (!config.is_active) {
      return new Response(
        JSON.stringify({ error: "AI Assistant is currently disabled" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context based on action
    let contextPrompt = "";
    if (action === "summarize_customer" && customerId) {
      contextPrompt = await buildCustomerContext(supabase, customerId);
    } else if (action === "summarize_job" && jobId) {
      contextPrompt = await buildJobContext(supabase, jobId);
    }

    // Build full messages array
    const fullMessages: Message[] = [];
    
    if (config.system_prompt) {
      fullMessages.push({ role: "system", content: config.system_prompt });
    }
    
    if (contextPrompt) {
      fullMessages.push({ role: "system", content: `Context:\n${contextPrompt}` });
    }

    if (messages && Array.isArray(messages)) {
      fullMessages.push(...messages);
    }

    // Route to appropriate provider
    let response: Response;
    let responseData: any;

    if (config.provider === "lovable") {
      response = await callLovableAI(config, fullMessages);
    } else if (config.provider === "openai") {
      const apiKey = Deno.env.get(config.api_key_secret_name || "OPENAI_API_KEY");
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }
      response = await callOpenAI(apiKey, config, fullMessages);
    } else if (config.provider === "anthropic") {
      const apiKey = Deno.env.get(config.api_key_secret_name || "ANTHROPIC_API_KEY");
      if (!apiKey) {
        throw new Error("Anthropic API key not configured");
      }
      response = await callAnthropic(apiKey, config, fullMessages);
    } else if (config.provider === "xai") {
      const apiKey = Deno.env.get(config.api_key_secret_name || "XAI_API_KEY");
      if (!apiKey) {
        throw new Error("xAI API key not configured");
      }
      response = await callXAI(apiKey, config, fullMessages);
    } else if (config.provider === "google") {
      const apiKey = Deno.env.get(config.api_key_secret_name || "GOOGLE_AI_API_KEY");
      if (!apiKey) {
        throw new Error("Google AI API key not configured");
      }
      response = await callGoogleAI(apiKey, config, fullMessages);
    } else {
      throw new Error(`Unknown provider: ${config.provider}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI provider error:", errorText);
      
      // Log the error
      await logRequest(supabase, {
        config_key: "ai_assistant",
        provider: config.provider,
        model: config.model,
        action,
        status: "error",
        error_message: errorText.slice(0, 500),
        duration_ms: Date.now() - startTime,
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    responseData = await response.json();
    
    // Extract response text based on provider format
    let responseText = "";
    if (config.provider === "anthropic") {
      responseText = responseData.content?.[0]?.text || "";
    } else {
      responseText = responseData.choices?.[0]?.message?.content || "";
    }

    // Log successful request
    await logRequest(supabase, {
      config_key: "ai_assistant",
      provider: config.provider,
      model: config.model,
      action,
      input_tokens: responseData.usage?.prompt_tokens || responseData.usage?.input_tokens,
      output_tokens: responseData.usage?.completion_tokens || responseData.usage?.output_tokens,
      status: "success",
      duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ response: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function buildCustomerContext(supabase: any, customerId: string): Promise<string> {
  const { data: customer } = await supabase
    .from("crm_customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (!customer) return "";

  const { data: interactions } = await supabase
    .from("crm_interactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("interaction_at", { ascending: false })
    .limit(20);

  const { data: pipelineEntries } = await supabase
    .from("crm_pipeline_entries")
    .select("*, crm_pipeline_stages(name, display_name)")
    .eq("customer_id", customerId);

  const { data: jobs } = await supabase
    .from("crm_jobs")
    .select("*, crm_job_types(name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(10);

  let context = `Customer: ${customer.first_name || ''} ${customer.last_name || ''}\n`;
  context += `Type: ${customer.customer_type}\n`;
  context += `Status: ${customer.customer_status}\n`;
  context += `Lead Source: ${customer.lead_source || 'Unknown'}\n`;
  context += `Email: ${customer.email || 'N/A'}\n`;
  context += `Phone: ${customer.phone || 'N/A'}\n\n`;

  if (interactions?.length > 0) {
    context += `Recent Interactions (${interactions.length}):\n`;
    interactions.slice(0, 10).forEach((i: any) => {
      context += `- ${i.interaction_type}: ${i.subject || i.content?.slice(0, 100) || 'No details'} (${new Date(i.interaction_at).toLocaleDateString()})\n`;
    });
    context += "\n";
  }

  if (pipelineEntries?.length > 0) {
    context += `Pipeline Status:\n`;
    pipelineEntries.forEach((p: any) => {
      context += `- Stage: ${p.crm_pipeline_stages?.display_name || 'Unknown'}, Value: $${p.estimated_value || 0}\n`;
    });
    context += "\n";
  }

  if (jobs?.length > 0) {
    context += `Jobs (${jobs.length}):\n`;
    jobs.slice(0, 5).forEach((j: any) => {
      context += `- ${j.title} (${j.crm_job_types?.name || 'Unknown Type'})\n`;
    });
  }

  return context;
}

async function buildJobContext(supabase: any, jobId: string): Promise<string> {
  const { data: job } = await supabase
    .from("crm_jobs")
    .select("*, crm_customers(*), crm_job_types(*), crm_locations(*)")
    .eq("id", jobId)
    .single();

  if (!job) return "";

  let context = `Job: ${job.title}\n`;
  context += `Job Number: ${job.job_number}\n`;
  context += `Type: ${job.crm_job_types?.name || 'Unknown'}\n`;
  context += `Priority: ${job.priority || 'Normal'}\n`;
  context += `Customer: ${job.crm_customers?.first_name || ''} ${job.crm_customers?.last_name || ''}\n`;
  
  if (job.crm_locations) {
    context += `Location: ${job.crm_locations.address_line1}, ${job.crm_locations.city}\n`;
  }
  
  if (job.scheduled_start) {
    context += `Scheduled: ${new Date(job.scheduled_start).toLocaleString()}\n`;
  }
  
  if (job.quoted_amount) {
    context += `Quoted Amount: $${job.quoted_amount}\n`;
  }
  
  if (job.internal_notes) {
    context += `\nInternal Notes: ${job.internal_notes}\n`;
  }

  return context;
}

async function logRequest(supabase: any, data: any) {
  try {
    await supabase.from("ai_request_logs").insert(data);
  } catch (error) {
    console.error("Failed to log AI request:", error);
  }
}

async function callLovableAI(config: AIConfig, messages: Message[]): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    }),
  });
}

async function callOpenAI(apiKey: string, config: AIConfig, messages: Message[]): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    }),
  });
}

async function callAnthropic(apiKey: string, config: AIConfig, messages: Message[]): Promise<Response> {
  // Extract system message for Anthropic's format
  const systemMessage = messages.find(m => m.role === "system")?.content || "";
  const userMessages = messages.filter(m => m.role !== "system");

  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      system: systemMessage,
      messages: userMessages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    }),
  });
}

async function callXAI(apiKey: string, config: AIConfig, messages: Message[]): Promise<Response> {
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    }),
  });
}

async function callGoogleAI(apiKey: string, config: AIConfig, messages: Message[]): Promise<Response> {
  // Convert messages to Google's format
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === "system")?.content;

  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.max_tokens,
      },
    }),
  });
}
