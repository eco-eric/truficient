// supabase/functions/ai-assistant/index.ts
// AI Operations Assistant - Phase 1 (Read-Only)
// Uses Lovable AI Gateway with tool-calling to query CRM data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TOOL DEFINITIONS (OpenAI format for Lovable AI Gateway)
// ============================================================

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_customers",
      description: "Search for customers in the CRM by name, email, phone number, address, or status. Returns matching customer records with their primary location.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term — name, email, phone, or partial address" },
          status: { type: "string", enum: ["lead", "prospect", "active", "inactive", "former"], description: "Optional filter by customer lifecycle status" },
          limit: { type: "number", description: "Max results (default 10, max 25)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_customer_details",
      description: "Get comprehensive details for a specific customer by ID. Returns profile, locations, recent interactions, active jobs, and linked submissions.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "The UUID of the customer" },
        },
        required: ["customer_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_jobs",
      description: "Search for jobs by job number (e.g., TRU-2026-0042), customer name, job type, current stage, or date range.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Job number or customer name" },
          job_type: { type: "string", description: "Filter by job type slug" },
          stage: { type: "string", description: "Filter by current stage name" },
          date_from: { type: "string", description: "Start date (YYYY-MM-DD)" },
          date_to: { type: "string", description: "End date (YYYY-MM-DD)" },
          limit: { type: "number", description: "Max results (default 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_schedule",
      description: "Get scheduled job appointments for a date range. Shows who is working where and when. Use for questions like 'What's on the schedule tomorrow?'",
      parameters: {
        type: "object",
        properties: {
          date_from: { type: "string", description: "Start date YYYY-MM-DD (defaults to today)" },
          date_to: { type: "string", description: "End date YYYY-MM-DD (defaults to 7 days out)" },
          team_id: { type: "string", description: "Optional team UUID filter" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_submission_stats",
      description: "Get submission counts across all form types (contact, ducted, ductless, scanner, landing page). Use for 'How many leads this week?'",
      parameters: {
        type: "object",
        properties: {
          date_from: { type: "string", description: "Start date YYYY-MM-DD" },
          date_to: { type: "string", description: "End date YYYY-MM-DD" },
          source: { type: "string", enum: ["ducted", "ductless", "scanner", "contact", "landing_page", "all"], description: "Filter by source (default all)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recent_submissions",
      description: "Get the most recent form submissions across all types. Returns customer info, type, and key details.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number to return (default 10, max 25)" },
          source: { type: "string", enum: ["ducted", "ductless", "scanner", "contact", "landing_page"], description: "Optional filter" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_pipeline_overview",
      description: "Get sales pipeline summary with count and estimated value per stage.",
      parameters: {
        type: "object",
        properties: {
          include_entries: { type: "boolean", description: "Include individual entries (default false)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_team_info",
      description: "Get information about teams/crews and their members, certifications, roles, and specialties.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Team or member name to search" },
          team_id: { type: "string", description: "Specific team ID" },
        },
      },
    },
  },
];

// ============================================================
// TOOL EXECUTION FUNCTIONS
// ============================================================

async function executeSearchCustomers(supabase: any, input: { query: string; status?: string; limit?: number }) {
  const limit = Math.min(input.limit || 10, 25);
  let query = supabase
    .from("crm_customers")
    .select(`id, first_name, last_name, email, phone, customer_status, customer_type, lead_source, tags, created_at, updated_at, crm_locations(id, address_line1, city, state, zip_code, is_primary, square_footage, year_built)`)
    .is("deleted_at", null)
    .limit(limit);

  const searchTerm = input.query.trim();
  if (searchTerm && searchTerm !== "%" && searchTerm !== "*") {
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
  }
  if (input.status) query = query.eq("customer_status", input.status);

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) throw new Error(`Customer search failed: ${error.message}`);

  return {
    count: data?.length || 0,
    customers: (data || []).map((c: any) => ({
      id: c.id,
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
      email: c.email,
      phone: c.phone,
      status: c.customer_status,
      type: c.customer_type,
      lead_source: c.lead_source,
      tags: c.tags,
      primary_location: c.crm_locations?.find((l: any) => l.is_primary) || c.crm_locations?.[0] || null,
      location_count: c.crm_locations?.length || 0,
      last_updated: c.updated_at,
    })),
  };
}

async function executeGetCustomerDetails(supabase: any, input: { customer_id: string }) {
  const [custResult, interactionsResult, jobsResult, submissionsResult] = await Promise.all([
    supabase.from("crm_customers").select("*, crm_locations(*)").eq("id", input.customer_id).single(),
    supabase.from("crm_interactions").select("*").eq("customer_id", input.customer_id).order("created_at", { ascending: false }).limit(10),
    supabase.from("crm_jobs").select(`id, job_number, title, scheduled_date, current_stage_id, crm_job_types(name, category), crm_job_stages!crm_jobs_current_stage_id_fkey(name)`).eq("customer_id", input.customer_id).is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
    supabase.from("crm_submission_links").select("submission_type, submission_id, created_at").eq("customer_id", input.customer_id).order("created_at", { ascending: false }),
  ]);

  if (custResult.error) throw new Error(`Customer not found: ${custResult.error.message}`);
  const customer = custResult.data;

  return {
    customer: {
      id: customer.id, name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      email: customer.email, phone: customer.phone, status: customer.customer_status,
      type: customer.customer_type, lead_source: customer.lead_source, tags: customer.tags,
      created_at: customer.created_at,
    },
    locations: customer.crm_locations || [],
    recent_interactions: (interactionsResult.data || []).map((i: any) => ({
      type: i.interaction_type, direction: i.direction, content: i.content?.substring(0, 200),
      outcome: i.outcome, date: i.created_at,
    })),
    jobs: (jobsResult.data || []).map((j: any) => ({
      id: j.id, job_number: j.job_number, title: j.title,
      type: j.crm_job_types?.name, stage: j.crm_job_stages?.name, scheduled_date: j.scheduled_date,
    })),
    submission_count: submissionsResult.data?.length || 0,
  };
}

async function executeSearchJobs(supabase: any, input: { query?: string; job_type?: string; stage?: string; date_from?: string; date_to?: string; limit?: number }) {
  const limit = Math.min(input.limit || 10, 25);
  let query = supabase
    .from("crm_jobs")
    .select(`id, job_number, title, scheduled_date, priority, crm_customers(id, first_name, last_name, phone, email), crm_locations(address_line1, city, state, zip_code), crm_job_types(name, slug, category), crm_job_stages!crm_jobs_current_stage_id_fkey(name, stage_type), crm_job_appointments(start_datetime, end_datetime, crm_teams(name))`)
    .is("deleted_at", null)
    .limit(limit)
    .order("created_at", { ascending: false });

  if (input.query) {
    if (input.query.toUpperCase().startsWith("TRU-")) {
      query = query.ilike("job_number", `%${input.query}%`);
    } else {
      query = query.or(`job_number.ilike.%${input.query}%,title.ilike.%${input.query}%`);
    }
  }
  if (input.date_from) query = query.gte("scheduled_date", input.date_from);
  if (input.date_to) query = query.lte("scheduled_date", input.date_to);

  const { data, error } = await query;
  if (error) throw new Error(`Job search failed: ${error.message}`);

  let results = data || [];
  if (input.query && !input.query.toUpperCase().startsWith("TRU-")) {
    const searchLower = input.query.toLowerCase();
    results = results.filter((j: any) => {
      const name = `${j.crm_customers?.first_name || ""} ${j.crm_customers?.last_name || ""}`.toLowerCase();
      return name.includes(searchLower) || j.job_number?.toLowerCase().includes(searchLower) || j.title?.toLowerCase().includes(searchLower);
    });
  }

  return {
    count: results.length,
    jobs: results.map((j: any) => ({
      id: j.id, job_number: j.job_number, title: j.title,
      customer: j.crm_customers ? `${j.crm_customers.first_name || ""} ${j.crm_customers.last_name || ""}`.trim() : "Unknown",
      customer_phone: j.crm_customers?.phone,
      type: j.crm_job_types?.name, category: j.crm_job_types?.category,
      stage: j.crm_job_stages?.name, stage_type: j.crm_job_stages?.stage_type,
      location: j.crm_locations ? `${j.crm_locations.address_line1}, ${j.crm_locations.city}` : null,
      scheduled_date: j.scheduled_date, priority: j.priority,
      appointments: (j.crm_job_appointments || []).map((a: any) => ({ start: a.start_datetime, end: a.end_datetime, team: a.crm_teams?.name })),
    })),
  };
}

async function executeGetSchedule(supabase: any, input: { date_from?: string; date_to?: string; team_id?: string }) {
  const today = new Date().toISOString().split("T")[0];
  const dateFrom = input.date_from || today;
  const dateTo = input.date_to || new Date(new Date(dateFrom).getTime() + 7 * 86400000).toISOString().split("T")[0];

  let query = supabase
    .from("crm_job_appointments")
    .select(`id, start_datetime, end_datetime, notes, title, crm_jobs(job_number, crm_customers(first_name, last_name, phone), crm_locations(address_line1, city, state), crm_job_types(name)), crm_teams(id, name, color)`)
    .gte("start_datetime", `${dateFrom}T00:00:00`)
    .lte("start_datetime", `${dateTo}T23:59:59`)
    .order("start_datetime");

  if (input.team_id) query = query.eq("assigned_team_id", input.team_id);

  const { data, error } = await query;
  if (error) throw new Error(`Schedule fetch failed: ${error.message}`);

  const byDate: Record<string, any[]> = {};
  (data || []).forEach((apt: any) => {
    const date = apt.start_datetime?.split("T")[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({
      time_start: apt.start_datetime, time_end: apt.end_datetime,
      job_number: apt.crm_jobs?.job_number,
      customer: apt.crm_jobs?.crm_customers ? `${apt.crm_jobs.crm_customers.first_name} ${apt.crm_jobs.crm_customers.last_name}` : "Unknown",
      customer_phone: apt.crm_jobs?.crm_customers?.phone,
      job_type: apt.crm_jobs?.crm_job_types?.name,
      location: apt.crm_jobs?.crm_locations ? `${apt.crm_jobs.crm_locations.address_line1}, ${apt.crm_jobs.crm_locations.city}` : null,
      team: apt.crm_teams?.name,
    });
  });

  return { date_range: { from: dateFrom, to: dateTo }, total_appointments: data?.length || 0, schedule: byDate };
}

async function executeGetSubmissionStats(supabase: any, input: { date_from?: string; date_to?: string; source?: string }) {
  const today = new Date().toISOString().split("T")[0];
  const dateFrom = input.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const dateTo = input.date_to || today;

  const tables = [
    { table: "contact_submissions", source: "contact", label: "Contact Form" },
    { table: "ducted_estimate_submissions", source: "ducted", label: "Ducted Estimates" },
    { table: "ductless_estimate_submissions", source: "ductless", label: "Ductless Estimates" },
    { table: "equipment_scans", source: "scanner", label: "Equipment Scans" },
    { table: "landing_page_submissions", source: "landing_page", label: "Landing Pages" },
  ];

  const filteredTables = input.source && input.source !== "all" ? tables.filter((t) => t.source === input.source) : tables;

  const results = await Promise.all(
    filteredTables.map(async (t) => {
      const { count, error } = await supabase
        .from(t.table)
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${dateFrom}T00:00:00`)
        .lte("created_at", `${dateTo}T23:59:59`);
      return { source: t.source, label: t.label, count: error ? 0 : count || 0 };
    })
  );

  return { period: { from: dateFrom, to: dateTo }, total: results.reduce((s, r) => s + r.count, 0), by_source: results };
}

async function executeGetRecentSubmissions(supabase: any, input: { limit?: number; source?: string }) {
  const limit = Math.min(input.limit || 10, 25);
  const results: any[] = [];

  async function fetchFrom(table: string, source: string, fields: string) {
    if (input.source && input.source !== source) return;
    const { data } = await supabase.from(table).select(fields).order("created_at", { ascending: false }).limit(limit);
    (data || []).forEach((d: any) => results.push({ ...d, _source: source }));
  }

  await Promise.all([
    fetchFrom("contact_submissions", "contact", "id, first_name, last_name, email, phone, service_type, message, status, created_at"),
    fetchFrom("ducted_estimate_submissions", "ducted", "id, first_name, last_name, email, phone, heating_type, recommended_tonnage, final_total, status, created_at"),
    fetchFrom("ductless_estimate_submissions", "ductless", "id, customer_name, customer_email, customer_phone, zone_count, final_total, status, created_at"),
    fetchFrom("landing_page_submissions", "landing_page", "id, first_name, last_name, email, phone, status, created_at"),
  ]);

  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    submissions: results.slice(0, limit).map((s) => ({
      id: s.id, source: s._source,
      name: s.customer_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unknown",
      email: s.customer_email || s.email, phone: s.customer_phone || s.phone,
      status: s.status || "new",
      details: s._source === "ducted" ? `${s.heating_type || "HVAC"} - ${s.recommended_tonnage}T - $${s.final_total}` :
               s._source === "ductless" ? `${s.zone_count} zones - $${s.final_total}` :
               s._source === "contact" ? (s.service_type || s.message?.substring(0, 100)) : "Landing page submission",
      date: s.created_at,
    })),
  };
}

async function executeGetPipelineOverview(supabase: any, input: { include_entries?: boolean }) {
  const [stagesResult, entriesResult] = await Promise.all([
    supabase.from("crm_pipeline_stages").select("id, name, display_name, color, is_won_stage, is_lost_stage, sort_order").order("sort_order"),
    supabase.from("crm_pipeline_entries").select(`id, estimated_value, probability, expected_close_date, stage_id, crm_customers(first_name, last_name)`).order("created_at", { ascending: false }),
  ]);

  const stages = stagesResult.data || [];
  const entries = entriesResult.data || [];

  const stageMap = stages.map((stage: any) => {
    const stageEntries = entries.filter((e: any) => e.stage_id === stage.id);
    return {
      stage: stage.display_name, color: stage.color,
      is_won: stage.is_won_stage, is_lost: stage.is_lost_stage,
      count: stageEntries.length,
      total_value: stageEntries.reduce((sum: number, e: any) => sum + (e.estimated_value || 0), 0),
      entries: input.include_entries ? stageEntries.map((e: any) => ({
        customer: `${e.crm_customers?.first_name || ""} ${e.crm_customers?.last_name || ""}`.trim(),
        value: e.estimated_value, probability: e.probability, expected_close: e.expected_close_date,
      })) : undefined,
    };
  });

  return {
    total_entries: stageMap.reduce((s: number, st: any) => s + st.count, 0),
    total_pipeline_value: stageMap.reduce((s: number, st: any) => (!st.is_lost ? s + st.total_value : s), 0),
    stages: stageMap,
  };
}

async function executeGetTeamInfo(supabase: any, input: { query?: string; team_id?: string }) {
  if (input.team_id) {
    const { data: team } = await supabase.from("crm_teams").select(`id, name, color, is_active, crm_team_assignments(is_lead, role_in_team, crm_team_members(id, first_name, last_name, role, certifications, specialties, license_number))`).eq("id", input.team_id).single();
    return { team };
  }

  let teamsQuery = supabase.from("crm_teams").select(`id, name, color, is_active, crm_team_assignments(is_lead, role_in_team, crm_team_members(id, first_name, last_name, role, certifications, specialties))`);
  if (input.query) teamsQuery = teamsQuery.ilike("name", `%${input.query}%`);
  const { data: teams } = await teamsQuery;

  let membersQuery = supabase.from("crm_team_members").select("id, first_name, last_name, role, certifications, specialties, license_number");
  if (input.query) membersQuery = membersQuery.or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%`);
  const { data: members } = await membersQuery;

  return { teams: teams || [], members: members || [] };
}

// ============================================================
// TOOL ROUTER
// ============================================================

async function executeTool(supabase: any, toolName: string, toolInput: any): Promise<any> {
  switch (toolName) {
    case "search_customers": return executeSearchCustomers(supabase, toolInput);
    case "get_customer_details": return executeGetCustomerDetails(supabase, toolInput);
    case "search_jobs": return executeSearchJobs(supabase, toolInput);
    case "get_schedule": return executeGetSchedule(supabase, toolInput);
    case "get_submission_stats": return executeGetSubmissionStats(supabase, toolInput);
    case "get_recent_submissions": return executeGetRecentSubmissions(supabase, toolInput);
    case "get_pipeline_overview": return executeGetPipelineOverview(supabase, toolInput);
    case "get_team_info": return executeGetTeamInfo(supabase, toolInput);
    default: throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

function getSystemPrompt(): string {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return `You are Tru, an AI operations assistant for Truficient Energy Solutions, an HVAC company in the Dallas-Fort Worth area. You help the admin team manage their CRM, look up customer information, check schedules, and review business metrics.

PERSONALITY:
- Professional but conversational — like a competent office assistant
- Concise — lead with the answer, add detail only if helpful
- Proactive — if a search returns one obvious match, present it directly
- Honest — say when you can't find something or need more info

CAPABILITIES (Phase 1 - Read Only):
- Search and view customer records, locations, and interaction history
- Look up jobs by number, customer, type, or date range
- Check team schedules and availability
- View submission counts and pipeline metrics
- View team/crew information and assignments

LIMITATIONS:
- You CANNOT create, update, or delete any records yet
- If asked to modify data, acknowledge the request, explain it's coming soon, and suggest the specific admin page they can use instead

RESPONSE FORMAT:
- For single customer results: present key info naturally with phone, email, address on separate lines
- For lists: brief summaries with the most important details
- For numbers/stats: lead with the headline number
- Include job numbers (TRU-XXXX-XXXX) when referencing jobs
- Format phone numbers and addresses clearly
- Format dollar amounts with commas and 2 decimal places

IMPORTANT:
- Today's date is ${today}
- The business serves the Dallas-Fort Worth metroplex (DFW)
- Job numbers follow format TRU-YYYY-XXXX
- Customer statuses: lead → prospect → active → inactive → former
- When a user says "tomorrow", "next week", etc., calculate the actual dates
- If a search returns no results, suggest alternative search terms`;
}

// ============================================================
// AI PROVIDER ROUTING
// ============================================================

interface AIProviderConfig {
  provider: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
}

async function getAIConfig(serviceClient: any): Promise<AIProviderConfig> {
  const { data } = await serviceClient
    .from("ai_config")
    .select("provider, model, temperature, max_tokens, system_prompt, is_active")
    .eq("config_key", "ai_assistant")
    .eq("is_active", true)
    .single();

  if (data) {
    return {
      provider: data.provider || "lovable",
      model: data.model || "google/gemini-2.5-flash",
      temperature: Number(data.temperature) ?? 0.3,
      max_tokens: data.max_tokens || 2048,
      system_prompt: data.system_prompt || null,
    };
  }

  // Default fallback
  return { provider: "lovable", model: "google/gemini-2.5-flash", temperature: 0.3, max_tokens: 2048, system_prompt: null };
}

function getProviderEndpoint(provider: string): { url: string; keyEnvVar: string } {
  switch (provider) {
    case "xai":
      return { url: "https://api.x.ai/v1/chat/completions", keyEnvVar: "XAI_API_KEY" };
    case "openai":
      return { url: "https://api.openai.com/v1/chat/completions", keyEnvVar: "OPENAI_API_KEY" };
    case "anthropic":
      return { url: "https://api.anthropic.com/v1/messages", keyEnvVar: "ANTHROPIC_API_KEY" };
    case "google":
      return { url: "https://generativelanguage.googleapis.com/v1beta/chat/completions", keyEnvVar: "GOOGLE_AI_API_KEY" };
    case "lovable":
    default:
      return { url: "https://ai.gateway.lovable.dev/v1/chat/completions", keyEnvVar: "LOVABLE_API_KEY" };
  }
}

async function callAI(config: AIProviderConfig, messages: any[], toolsDef: any[]): Promise<Response> {
  const { url, keyEnvVar } = getProviderEndpoint(config.provider);
  const apiKey = Deno.env.get(keyEnvVar);
  
  if (!apiKey) {
    throw new Error(`API key not configured for provider "${config.provider}". Set the ${keyEnvVar} secret.`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Anthropic uses a different auth header
  if (config.provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // Anthropic uses a different request format
  if (config.provider === "anthropic") {
    const systemMsg = messages.find((m: any) => m.role === "system");
    const nonSystemMsgs = messages.filter((m: any) => m.role !== "system");
    
    return fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        system: systemMsg?.content || "",
        messages: nonSystemMsgs,
        tools: toolsDef.map(t => ({
          name: t.function.name,
          description: t.function.description,
          input_schema: t.function.parameters,
        })),
        max_tokens: config.max_tokens,
        temperature: config.temperature,
      }),
    });
  }

  // OpenAI-compatible format (xAI, OpenAI, Google, Lovable Gateway)
  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      tools: toolsDef,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    }),
  });
}

function parseAIResponse(provider: string, data: any): { content: string | null; toolCalls: any[] | null; finishReason: string } {
  if (provider === "anthropic") {
    const content = data.content || [];
    const textBlocks = content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    const toolUseBlocks = content.filter((b: any) => b.type === "tool_use");
    
    return {
      content: textBlocks || null,
      toolCalls: toolUseBlocks.length > 0 ? toolUseBlocks.map((t: any) => ({
        id: t.id,
        function: { name: t.name, arguments: JSON.stringify(t.input) },
      })) : null,
      finishReason: data.stop_reason === "tool_use" ? "tool_calls" : "stop",
    };
  }

  // OpenAI-compatible
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content || null,
    toolCalls: choice?.message?.tool_calls || null,
    finishReason: choice?.finish_reason || "stop",
  };
}

function buildToolResultMessage(provider: string, toolCallId: string, content: string): any {
  if (provider === "anthropic") {
    return { role: "user", content: [{ type: "tool_result", tool_use_id: toolCallId, content }] };
  }
  return { role: "tool", tool_call_id: toolCallId, content };
}

function buildAssistantToolCallMessage(provider: string, parsed: { content: string | null; toolCalls: any[] }, rawMessage: any): any {
  if (provider === "anthropic") {
    return { role: "assistant", content: rawMessage.content };
  }
  return rawMessage;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
    if (!userRole || !["admin", "manager", "super_admin"].includes(userRole.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { message, conversationHistory = [] } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load AI config from database using service role (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const aiConfig = await getAIConfig(serviceClient);

    // Use custom system prompt from config if set, otherwise default
    const systemPrompt = aiConfig.system_prompt || getSystemPrompt();

    const trimmedHistory = conversationHistory.slice(-20);
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    let toolsUsed: any[] = [];
    let finalResponse = "";
    let maxIterations = 10;

    while (maxIterations > 0) {
      maxIterations--;

      const aiResponse = await callAI(aiConfig, messages, tools);

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI provider error (${aiConfig.provider}/${aiConfig.model}): ${aiResponse.status} - ${errText}`);
      }

      const aiData = await aiResponse.json();
      const parsed = parseAIResponse(aiConfig.provider, aiData);

      if (!parsed.toolCalls || parsed.toolCalls.length === 0) {
        finalResponse = parsed.content || "";
        break;
      }

      // Add assistant message with tool calls
      const rawMessage = aiConfig.provider === "anthropic" ? aiData : aiData.choices?.[0]?.message;
      messages.push(buildAssistantToolCallMessage(aiConfig.provider, parsed, rawMessage));

      // Execute each tool call
      for (const toolCall of parsed.toolCalls) {
        const toolName = toolCall.function.name;
        let toolInput: any;
        try {
          toolInput = JSON.parse(toolCall.function.arguments);
        } catch {
          toolInput = {};
        }

        try {
          const result = await executeTool(supabase, toolName, toolInput);
          messages.push(buildToolResultMessage(aiConfig.provider, toolCall.id, JSON.stringify(result)));
          toolsUsed.push({ tool: toolName, input: toolInput, summary: `Called ${toolName}` });
        } catch (toolError: any) {
          messages.push(buildToolResultMessage(aiConfig.provider, toolCall.id, JSON.stringify({ error: toolError.message })));
          toolsUsed.push({ tool: toolName, input: toolInput, summary: `Error: ${toolError.message}` });
        }
      }

      if (parsed.finishReason === "stop") {
        finalResponse = parsed.content || "";
        break;
      }
    }

    // Log interaction (fire-and-forget)
    serviceClient.from("assistant_logs").insert({
      user_id: user.id,
      user_message: message,
      assistant_response: finalResponse,
      tools_used: toolsUsed,
      duration_ms: Date.now() - startTime,
    }).then(() => {}).catch(() => {});

    return new Response(
      JSON.stringify({ message: finalResponse, toolsUsed, provider: aiConfig.provider, model: aiConfig.model }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
