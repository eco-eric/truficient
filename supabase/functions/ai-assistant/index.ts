// supabase/functions/ai-assistant/index.ts
// AI Operations Assistant - Phase 2 (Read + Write with Confirmation)
// Renamed: Bach — the AI assistant for Truficient

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TOOL DEFINITIONS (OpenAI format)
// ============================================================

const tools = [
  // === PHASE 1: READ TOOLS ===
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
      description: "Get scheduled job appointments for a date range. Shows who is working where and when.",
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
      description: "Get submission counts across all form types.",
      parameters: {
        type: "object",
        properties: {
          date_from: { type: "string", description: "Start date YYYY-MM-DD" },
          date_to: { type: "string", description: "End date YYYY-MM-DD" },
          source: { type: "string", enum: ["ducted", "ductless", "scanner", "contact", "landing_page", "all"], description: "Filter by source" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recent_submissions",
      description: "Get the most recent form submissions across all types.",
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
      description: "Get information about teams/crews and their members.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Team or member name to search" },
          team_id: { type: "string", description: "Specific team ID" },
        },
      },
    },
  },

  // === PHASE 2: WRITE TOOLS ===
  {
    type: "function" as const,
    function: {
      name: "create_job",
      description: "Create a new job for an existing customer. ALWAYS confirm with the user before executing.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "UUID of the customer" },
          location_id: { type: "string", description: "UUID of the service location (optional, uses primary)" },
          job_type_slug: { type: "string", description: "Job type slug (e.g., 'ductless-install', 'repair'). Use get_job_types first." },
          scheduled_date: { type: "string", description: "Scheduled date YYYY-MM-DD (optional)" },
          estimated_completion: { type: "string", description: "Estimated completion YYYY-MM-DD (optional)" },
          notes: { type: "string", description: "Notes for the job" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms. First call: always false." },
        },
        required: ["customer_id", "job_type_slug", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_job_stage",
      description: "Move a job to a different workflow stage. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          job_id: { type: "string", description: "UUID of the job" },
          target_stage_name: { type: "string", description: "Stage name to move to" },
          notes: { type: "string", description: "Optional notes" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["job_id", "target_stage_name", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "log_interaction",
      description: "Add an interaction (call, email, note, text, meeting, task) to a customer's timeline. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "UUID of the customer" },
          interaction_type: { type: "string", enum: ["call", "email", "text", "meeting", "note", "task"], description: "Type of interaction" },
          direction: { type: "string", enum: ["inbound", "outbound"], description: "Direction (for calls/emails/texts)" },
          content: { type: "string", description: "Content/summary" },
          outcome: { type: "string", description: "Outcome (e.g., 'Left voicemail')" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["customer_id", "interaction_type", "content", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_customer_status",
      description: "Change a customer's lifecycle status. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "UUID of the customer" },
          new_status: { type: "string", enum: ["lead", "prospect", "active", "inactive", "former"], description: "New status" },
          reason: { type: "string", description: "Reason for change" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["customer_id", "new_status", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_to_pipeline",
      description: "Add a customer to the sales pipeline. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "UUID of the customer" },
          stage_name: { type: "string", description: "Pipeline stage name" },
          estimated_value: { type: "number", description: "Estimated deal value in dollars" },
          probability: { type: "number", description: "Win probability percentage (0-100)" },
          expected_close_date: { type: "string", description: "Expected close date YYYY-MM-DD" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["customer_id", "stage_name", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "move_pipeline_entry",
      description: "Move an existing pipeline entry to a different stage. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          entry_id: { type: "string", description: "UUID of the pipeline entry" },
          target_stage_name: { type: "string", description: "Stage to move to" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["entry_id", "target_stage_name", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "schedule_appointment",
      description: "Create a timed appointment for an existing job with a start/end time and optional team assignment. Automatically creates a Google Calendar event with job details, customer info, and location. ALWAYS confirm with the user before executing.",
      parameters: {
        type: "object",
        properties: {
          job_id: { type: "string", description: "UUID of the job" },
          start_datetime: { type: "string", description: "Start in ISO 8601 (e.g., '2026-02-15T09:00:00-06:00')" },
          end_datetime: { type: "string", description: "End in ISO 8601" },
          team_id: { type: "string", description: "UUID of team/crew (optional)" },
          notes: { type: "string", description: "Appointment notes" },
          skip_calendar: { type: "boolean", description: "If true, skip Google Calendar event creation (default false)" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms." },
        },
        required: ["job_id", "start_datetime", "end_datetime", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "reschedule_appointment",
      description: "Reschedule an existing job appointment to a new date/time. Updates both the CRM record and the linked Google Calendar event. Use search_jobs or get_schedule first to find the appointment. ALWAYS confirm before executing.",
      parameters: {
        type: "object",
        properties: {
          appointment_id: { type: "string", description: "UUID of the appointment to reschedule" },
          new_start_datetime: { type: "string", description: "New start time in ISO 8601 with Central Time offset" },
          new_end_datetime: { type: "string", description: "New end time in ISO 8601 with Central Time offset" },
          new_team_id: { type: "string", description: "Optional new team/crew assignment" },
          reason: { type: "string", description: "Reason for rescheduling" },
          confirmed: { type: "boolean", description: "Set to true ONLY after user confirmation." },
        },
        required: ["appointment_id", "new_start_datetime", "new_end_datetime", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "cancel_appointment",
      description: "Cancel a job appointment. Updates the CRM record and deletes the linked Google Calendar event. ALWAYS confirm before executing.",
      parameters: {
        type: "object",
        properties: {
          appointment_id: { type: "string", description: "UUID of the appointment to cancel" },
          reason: { type: "string", description: "Reason for cancellation" },
          confirmed: { type: "boolean", description: "Set to true ONLY after user confirmation." },
        },
        required: ["appointment_id", "confirmed"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_google_calendar",
      description: "Read events directly from Google Calendar for a date range. Shows all events including non-job items. Use for checking true availability. No confirmation needed.",
      parameters: {
        type: "object",
        properties: {
          date_from: { type: "string", description: "Start date (YYYY-MM-DD). Defaults to today." },
          date_to: { type: "string", description: "End date (YYYY-MM-DD). Defaults to 7 days from start." },
          team_id: { type: "string", description: "Optional team ID to check that team's specific calendar" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_job_types",
      description: "Get available job types and slugs. Read-only, no confirmation needed.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_pipeline_stages",
      description: "Get all pipeline stage definitions. Read-only, no confirmation needed.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ============================================================
// PHASE 1: READ TOOL EXECUTION FUNCTIONS
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
      email: c.email, phone: c.phone, status: c.customer_status, type: c.customer_type,
      lead_source: c.lead_source, tags: c.tags,
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
        id: e.id,
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
// PHASE 2: WRITE TOOL EXECUTION FUNCTIONS
// ============================================================

async function generateJobNumber(supabase: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TRU-${year}-`;
  const { data } = await supabase
    .from("crm_jobs")
    .select("job_number")
    .ilike("job_number", `${prefix}%`)
    .order("job_number", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].job_number.split("-").pop() || "0", 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

async function getDefaultStage(supabase: any, jobTypeId: string): Promise<any> {
  const { data } = await supabase
    .from("crm_job_stages")
    .select("id, name")
    .eq("job_type_id", jobTypeId)
    .eq("stage_type", "start")
    .order("sort_order")
    .limit(1);
  return data?.[0] || null;
}

async function executeCreateJob(supabase: any, userId: string, input: any) {
  const { data: jobType, error: jtError } = await supabase
    .from("crm_job_types")
    .select("id, name, slug, category, default_duration_hours")
    .eq("slug", input.job_type_slug)
    .single();

  if (jtError || !jobType) {
    const { data: types } = await supabase.from("crm_job_types").select("name, slug, category").eq("is_active", true);
    return { error: `Job type "${input.job_type_slug}" not found.`, available_types: types };
  }

  const { data: customer } = await supabase
    .from("crm_customers")
    .select("first_name, last_name, crm_locations(id, address_line1, city, is_primary)")
    .eq("id", input.customer_id)
    .single();

  if (!customer) return { error: "Customer not found." };

  let locationId = input.location_id;
  if (!locationId) {
    const primaryLocation = customer.crm_locations?.find((l: any) => l.is_primary) || customer.crm_locations?.[0];
    locationId = primaryLocation?.id;
  }
  const locationInfo = customer.crm_locations?.find((l: any) => l.id === locationId);

  if (!input.confirmed) {
    return {
      needs_confirmation: true,
      action: "create_job",
      summary: {
        customer: `${customer.first_name} ${customer.last_name}`,
        job_type: jobType.name,
        location: locationInfo ? `${locationInfo.address_line1}, ${locationInfo.city}` : "No location on file",
        scheduled_date: input.scheduled_date || "Not yet scheduled",
        notes: input.notes || "None",
      },
      confirmation_prompt: `Create a new **${jobType.name}** job for **${customer.first_name} ${customer.last_name}** at ${locationInfo ? `${locationInfo.address_line1}, ${locationInfo.city}` : "their primary address"}${input.scheduled_date ? ` scheduled for ${input.scheduled_date}` : ""}?`,
    };
  }

  const jobNumber = await generateJobNumber(supabase);
  const defaultStage = await getDefaultStage(supabase, jobType.id);

  const { data: job, error: createError } = await supabase
    .from("crm_jobs")
    .insert({
      job_number: jobNumber,
      customer_id: input.customer_id,
      location_id: locationId,
      job_type_id: jobType.id,
      current_stage_id: defaultStage?.id,
      title: `${jobType.name} - ${customer.first_name} ${customer.last_name}`,
      scheduled_date: input.scheduled_date || null,
      internal_notes: input.notes || null,
      created_by: userId,
    })
    .select("id, job_number")
    .single();

  if (createError) throw new Error(`Failed to create job: ${createError.message}`);

  await supabase.from("crm_interactions").insert({
    customer_id: input.customer_id,
    interaction_type: "note",
    content: `Job ${jobNumber} (${jobType.name}) created via AI Assistant`,
    logged_by: userId,
  });

  return { success: true, job_number: job.job_number, job_id: job.id, message: `Created job ${job.job_number} — ${jobType.name} for ${customer.first_name} ${customer.last_name}` };
}

async function executeUpdateJobStage(supabase: any, userId: string, input: any) {
  const { data: job, error: jobErr } = await supabase
    .from("crm_jobs")
    .select(`id, job_number, current_stage_id, job_type_id, crm_customers(first_name, last_name), crm_job_stages!crm_jobs_current_stage_id_fkey(name), crm_job_types(name)`)
    .eq("id", input.job_id)
    .single();

  if (jobErr || !job) return { error: "Job not found." };

  const { data: targetStage } = await supabase
    .from("crm_job_stages")
    .select("id, name, stage_type")
    .eq("job_type_id", job.job_type_id)
    .ilike("name", `%${input.target_stage_name}%`)
    .limit(1)
    .single();

  if (!targetStage) {
    const { data: stages } = await supabase.from("crm_job_stages").select("name, stage_type, sort_order").eq("job_type_id", job.job_type_id).order("sort_order");
    return { error: `Stage "${input.target_stage_name}" not found for this job type.`, available_stages: stages?.map((s: any) => s.name) };
  }

  const currentStageName = job.crm_job_stages?.name || "Unknown";
  const customerName = `${job.crm_customers?.first_name || ""} ${job.crm_customers?.last_name || ""}`.trim();

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "update_job_stage",
      summary: { job_number: job.job_number, job_type: job.crm_job_types?.name, customer: customerName, current_stage: currentStageName, target_stage: targetStage.name },
      confirmation_prompt: `Move job **${job.job_number}** (${customerName}) from **${currentStageName}** → **${targetStage.name}**?`,
    };
  }

  const { error: updateErr } = await supabase.from("crm_jobs").update({ current_stage_id: targetStage.id, updated_at: new Date().toISOString() }).eq("id", input.job_id);
  if (updateErr) throw new Error(`Failed to update job: ${updateErr.message}`);

  await supabase.from("crm_job_stage_history").insert({ job_id: input.job_id, from_stage_id: job.current_stage_id, to_stage_id: targetStage.id, changed_by: userId, notes: input.notes || "Moved via AI Assistant" });

  return { success: true, message: `Moved ${job.job_number} from "${currentStageName}" to "${targetStage.name}"` };
}

async function executeLogInteraction(supabase: any, userId: string, input: any) {
  const { data: customer } = await supabase.from("crm_customers").select("first_name, last_name").eq("id", input.customer_id).single();
  if (!customer) return { error: "Customer not found." };
  const customerName = `${customer.first_name} ${customer.last_name}`;

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "log_interaction",
      summary: { customer: customerName, type: input.interaction_type, direction: input.direction || "N/A", content: input.content, outcome: input.outcome || "None" },
      confirmation_prompt: `Add a **${input.direction ? input.direction + " " : ""}${input.interaction_type}** to **${customerName}**'s timeline?\n\n"${input.content}"${input.outcome ? `\nOutcome: ${input.outcome}` : ""}`,
    };
  }

  const { error } = await supabase.from("crm_interactions").insert({ customer_id: input.customer_id, interaction_type: input.interaction_type, direction: input.direction || null, content: input.content, outcome: input.outcome || null, logged_by: userId });
  if (error) throw new Error(`Failed to log interaction: ${error.message}`);

  return { success: true, message: `Logged ${input.interaction_type} for ${customerName}: "${input.content.substring(0, 80)}${input.content.length > 80 ? "..." : ""}"` };
}

async function executeUpdateCustomerStatus(supabase: any, userId: string, input: any) {
  const { data: customer } = await supabase.from("crm_customers").select("first_name, last_name, customer_status").eq("id", input.customer_id).single();
  if (!customer) return { error: "Customer not found." };
  const customerName = `${customer.first_name} ${customer.last_name}`;

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "update_customer_status",
      summary: { customer: customerName, current_status: customer.customer_status, new_status: input.new_status, reason: input.reason || "No reason provided" },
      confirmation_prompt: `Change **${customerName}**'s status from **${customer.customer_status}** → **${input.new_status}**?${input.reason ? `\nReason: ${input.reason}` : ""}`,
    };
  }

  const { error } = await supabase.from("crm_customers").update({ customer_status: input.new_status, updated_at: new Date().toISOString() }).eq("id", input.customer_id);
  if (error) throw new Error(`Failed to update status: ${error.message}`);

  await supabase.from("crm_interactions").insert({ customer_id: input.customer_id, interaction_type: "note", content: `Status changed from ${customer.customer_status} to ${input.new_status}${input.reason ? `: ${input.reason}` : ""} (via AI Assistant)`, logged_by: userId });

  return { success: true, message: `Updated ${customerName}'s status from "${customer.customer_status}" to "${input.new_status}"` };
}

async function executeAddToPipeline(supabase: any, userId: string, input: any) {
  const { data: customer } = await supabase.from("crm_customers").select("first_name, last_name").eq("id", input.customer_id).single();
  if (!customer) return { error: "Customer not found." };
  const customerName = `${customer.first_name} ${customer.last_name}`;

  const { data: stage } = await supabase.from("crm_pipeline_stages").select("id, name, display_name").ilike("display_name", `%${input.stage_name}%`).limit(1).single();
  if (!stage) {
    const { data: stages } = await supabase.from("crm_pipeline_stages").select("display_name").order("sort_order");
    return { error: `Stage "${input.stage_name}" not found.`, available_stages: stages?.map((s: any) => s.display_name) };
  }

  const { data: existing } = await supabase.from("crm_pipeline_entries").select("id, crm_pipeline_stages(display_name)").eq("customer_id", input.customer_id).limit(1);
  if (existing && existing.length > 0) {
    return { error: `${customerName} is already in the pipeline at "${existing[0].crm_pipeline_stages?.display_name}". Use move_pipeline_entry instead.` };
  }

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "add_to_pipeline",
      summary: { customer: customerName, stage: stage.display_name, estimated_value: input.estimated_value ? `$${input.estimated_value.toLocaleString()}` : "Not set", probability: input.probability ? `${input.probability}%` : "Not set", expected_close: input.expected_close_date || "Not set" },
      confirmation_prompt: `Add **${customerName}** to the pipeline at **${stage.display_name}**${input.estimated_value ? ` with estimated value of **$${input.estimated_value.toLocaleString()}**` : ""}?`,
    };
  }

  const { error } = await supabase.from("crm_pipeline_entries").insert({ customer_id: input.customer_id, stage_id: stage.id, estimated_value: input.estimated_value || null, probability: input.probability || null, expected_close_date: input.expected_close_date || null });
  if (error) throw new Error(`Failed to add to pipeline: ${error.message}`);

  await supabase.from("crm_interactions").insert({ customer_id: input.customer_id, interaction_type: "note", content: `Added to pipeline at "${stage.display_name}"${input.estimated_value ? ` — Est. value: $${input.estimated_value.toLocaleString()}` : ""} (via AI Assistant)`, logged_by: userId });

  return { success: true, message: `Added ${customerName} to pipeline at "${stage.display_name}"` };
}

async function executeMovePipelineEntry(supabase: any, userId: string, input: any) {
  const { data: entry } = await supabase.from("crm_pipeline_entries").select(`id, estimated_value, crm_customers(first_name, last_name, id), crm_pipeline_stages(display_name)`).eq("id", input.entry_id).single();
  if (!entry) return { error: "Pipeline entry not found." };

  const { data: targetStage } = await supabase.from("crm_pipeline_stages").select("id, display_name").ilike("display_name", `%${input.target_stage_name}%`).limit(1).single();
  if (!targetStage) {
    const { data: stages } = await supabase.from("crm_pipeline_stages").select("display_name").order("sort_order");
    return { error: `Stage "${input.target_stage_name}" not found.`, available_stages: stages?.map((s: any) => s.display_name) };
  }

  const customerName = `${entry.crm_customers?.first_name} ${entry.crm_customers?.last_name}`;
  const currentStage = entry.crm_pipeline_stages?.display_name;

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "move_pipeline_entry",
      summary: { customer: customerName, current_stage: currentStage, target_stage: targetStage.display_name, estimated_value: entry.estimated_value },
      confirmation_prompt: `Move **${customerName}** from **${currentStage}** → **${targetStage.display_name}** in the pipeline?`,
    };
  }

  const { error } = await supabase.from("crm_pipeline_entries").update({ stage_id: targetStage.id, updated_at: new Date().toISOString() }).eq("id", input.entry_id);
  if (error) throw new Error(`Failed to move pipeline entry: ${error.message}`);

  await supabase.from("crm_interactions").insert({ customer_id: entry.crm_customers?.id, interaction_type: "note", content: `Pipeline stage changed from "${currentStage}" to "${targetStage.display_name}" (via AI Assistant)`, logged_by: userId });

  return { success: true, message: `Moved ${customerName} from "${currentStage}" to "${targetStage.display_name}" in the pipeline` };
}

// Job type color map for Google Calendar
const JOB_TYPE_COLORS: Record<string, string> = {
  install: "9", maintenance: "2", repair: "11", inspection: "5", consultation: "7", default: "1",
};

async function getCalendarIdForTeam(supabase: any, teamId: string | null): Promise<string | null> {
  if (!teamId) return null;
  const { data: team } = await supabase.from("crm_teams").select("google_calendar_id").eq("id", teamId).single();
  if (team?.google_calendar_id) {
    const { data: cal } = await supabase.from("google_calendars").select("calendar_id").eq("id", team.google_calendar_id).single();
    return cal?.calendar_id || null;
  }
  return null;
}

async function executeScheduleAppointment(supabase: any, userId: string, input: any) {
  const { data: job } = await supabase.from("crm_jobs").select(`id, job_number, customer_id, crm_customers(first_name, last_name, phone, email), crm_locations(address_line1, city, state, zip_code), crm_job_types(name, category)`).eq("id", input.job_id).single();
  if (!job) return { error: "Job not found." };

  let teamName = "Unassigned";
  if (input.team_id) {
    const { data: team } = await supabase.from("crm_teams").select("name").eq("id", input.team_id).single();
    teamName = team?.name || "Unknown team";
  }

  const customerName = `${job.crm_customers?.first_name} ${job.crm_customers?.last_name}`;
  const location = job.crm_locations ? `${job.crm_locations.address_line1}, ${job.crm_locations.city}, ${job.crm_locations.state} ${job.crm_locations.zip_code}` : "";

  const { data: conflicts } = await supabase
    .from("crm_job_appointments")
    .select("id, start_datetime, end_datetime, crm_jobs(job_number)")
    .eq("assigned_team_id", input.team_id || "none")
    .or(`and(start_datetime.lt.${input.end_datetime},end_datetime.gt.${input.start_datetime})`);

  const startTime = new Date(input.start_datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const endTime = new Date(input.end_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "schedule_appointment",
      summary: { job_number: job.job_number, job_type: job.crm_job_types?.name, customer: customerName, location: location || "No location", time: `${startTime} – ${endTime}`, team: teamName, conflicts: conflicts?.length || 0 },
      confirmation_prompt: `Schedule **${job.job_number}** (${job.crm_job_types?.name}) for **${customerName}**:\n📅 ${startTime} – ${endTime}\n👷 ${teamName}\n📍 ${location || "No address"}\n🔗 Google Calendar event will be created${conflicts && conflicts.length > 0 ? `\n\n⚠️ **Warning:** ${conflicts.length} scheduling conflict(s) detected for this team at this time.` : ""}`,
    };
  }

  const { data: appointment, error } = await supabase
    .from("crm_job_appointments")
    .insert({ job_id: input.job_id, start_datetime: input.start_datetime, end_datetime: input.end_datetime, assigned_team_id: input.team_id || null, notes: input.notes || null })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to schedule: ${error.message}`);

  // Google Calendar sync
  let calendarResult = null;
  if (!input.skip_calendar) {
    try {
      const calendarDescription = [
        `Job: ${job.job_number}`,
        `Type: ${job.crm_job_types?.name}`,
        `Customer: ${customerName}`,
        `Phone: ${job.crm_customers?.phone || "N/A"}`,
        `Email: ${job.crm_customers?.email || "N/A"}`,
        input.notes ? `\nNotes: ${input.notes}` : "",
        `\n---\nManaged by Truficient AI Assistant`,
      ].filter(Boolean).join("\n");

      const calendarId = await getCalendarIdForTeam(supabase, input.team_id);
      let targetCalId = calendarId;
      if (!targetCalId) {
        const { data: activeCals } = await supabase.from("google_calendars").select("calendar_id").eq("is_active", true).eq("is_primary", true).limit(1);
        targetCalId = activeCals?.[0]?.calendar_id;
      }

      if (targetCalId) {
        const colorId = JOB_TYPE_COLORS[job.crm_job_types?.category || "default"] || JOB_TYPE_COLORS.default;
        const { data: gcalResult, error: gcalError } = await supabase.functions.invoke("google-calendar-sync", {
          body: {
            action: "create-event",
            calendarId: targetCalId,
            event: {
              summary: `${job.crm_job_types?.name} — ${customerName} (${job.job_number})`,
              description: calendarDescription,
              location: location,
              start: { dateTime: input.start_datetime, timeZone: "America/Chicago" },
              end: { dateTime: input.end_datetime, timeZone: "America/Chicago" },
              colorId: colorId,
            },
          },
        });

        if (gcalError) {
          console.error("Calendar sync failed:", gcalError);
          calendarResult = { synced: false, error: gcalError.message };
        } else {
          if (gcalResult?.id) {
            await supabase.from("crm_job_appointments").update({ google_calendar_event_id: gcalResult.id }).eq("id", appointment.id);
          }
          calendarResult = { synced: true, event_id: gcalResult?.id, calendar_link: gcalResult?.htmlLink };
        }
      }
    } catch (calErr: any) {
      console.error("Calendar sync error:", calErr);
      calendarResult = { synced: false, error: calErr.message };
    }
  }

  return {
    success: true, appointment_id: appointment.id,
    message: `Scheduled ${job.job_number} for ${startTime} – ${endTime} with ${teamName}`,
    calendar: calendarResult,
  };
}

async function executeRescheduleAppointment(supabase: any, userId: string, input: any) {
  const { data: apt } = await supabase
    .from("crm_job_appointments")
    .select(`id, start_datetime, end_datetime, assigned_team_id, google_calendar_event_id, crm_jobs(job_number, customer_id, crm_customers(first_name, last_name, phone), crm_locations(address_line1, city, state, zip_code), crm_job_types(name, category)), crm_teams(name, google_calendar_id)`)
    .eq("id", input.appointment_id)
    .single();

  if (!apt) return { error: "Appointment not found." };

  const customerName = `${apt.crm_jobs?.crm_customers?.first_name} ${apt.crm_jobs?.crm_customers?.last_name}`;
  const jobNumber = apt.crm_jobs?.job_number;

  const oldStart = new Date(apt.start_datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const newStart = new Date(input.new_start_datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  const newEnd = new Date(input.new_end_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

  let newTeamName = apt.crm_teams?.name || "Unassigned";
  if (input.new_team_id && input.new_team_id !== apt.assigned_team_id) {
    const { data: team } = await supabase.from("crm_teams").select("name").eq("id", input.new_team_id).single();
    newTeamName = team?.name || "Unknown team";
  }

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "reschedule_appointment",
      summary: { job_number: jobNumber, customer: customerName, old_time: oldStart, new_time: `${newStart} – ${newEnd}`, team: newTeamName, reason: input.reason || "No reason given", has_calendar_event: !!apt.google_calendar_event_id },
      confirmation_prompt: `Reschedule **${jobNumber}** (${customerName})?\n\n📅 **From:** ${oldStart}\n📅 **To:** ${newStart} – ${newEnd}\n👷 ${newTeamName}${input.reason ? `\n💬 Reason: ${input.reason}` : ""}${apt.google_calendar_event_id ? "\n🔗 Google Calendar event will be updated" : ""}`,
    };
  }

  const updateData: any = { start_datetime: input.new_start_datetime, end_datetime: input.new_end_datetime, notes: input.reason ? `Rescheduled: ${input.reason}` : null, updated_at: new Date().toISOString() };
  if (input.new_team_id) updateData.assigned_team_id = input.new_team_id;

  const { error } = await supabase.from("crm_job_appointments").update(updateData).eq("id", input.appointment_id);
  if (error) throw new Error(`Failed to reschedule: ${error.message}`);

  let calendarUpdated = false;
  if (apt.google_calendar_event_id) {
    try {
      const calendarId = await getCalendarIdForTeam(supabase, input.new_team_id || apt.assigned_team_id);
      let targetCalId = calendarId;
      if (!targetCalId) {
        const { data: activeCals } = await supabase.from("google_calendars").select("calendar_id").eq("is_active", true).eq("is_primary", true).limit(1);
        targetCalId = activeCals?.[0]?.calendar_id;
      }
      if (targetCalId) {
        await supabase.functions.invoke("google-calendar-sync", {
          body: {
            action: "update-event", calendarId: targetCalId, eventId: apt.google_calendar_event_id,
            event: { summary: `${apt.crm_jobs?.crm_job_types?.name} — ${customerName} (${jobNumber})`, start: { dateTime: input.new_start_datetime, timeZone: "America/Chicago" }, end: { dateTime: input.new_end_datetime, timeZone: "America/Chicago" } },
          },
        });
        calendarUpdated = true;
      }
    } catch (err) { console.error("Calendar update failed:", err); }
  }

  await supabase.from("crm_interactions").insert({ customer_id: apt.crm_jobs?.customer_id, interaction_type: "note", content: `Appointment for ${jobNumber} rescheduled from ${oldStart} to ${newStart}${input.reason ? ` — ${input.reason}` : ""} (via AI Assistant)`, logged_by: userId });

  return { success: true, message: `Rescheduled ${jobNumber} to ${newStart} – ${newEnd}${calendarUpdated ? " (calendar updated)" : ""}` };
}

async function executeCancelAppointment(supabase: any, userId: string, input: any) {
  const { data: apt } = await supabase
    .from("crm_job_appointments")
    .select(`id, start_datetime, end_datetime, google_calendar_event_id, assigned_team_id, crm_jobs(job_number, customer_id, crm_customers(first_name, last_name), crm_job_types(name)), crm_teams(name, google_calendar_id)`)
    .eq("id", input.appointment_id)
    .single();

  if (!apt) return { error: "Appointment not found." };

  const customerName = `${apt.crm_jobs?.crm_customers?.first_name} ${apt.crm_jobs?.crm_customers?.last_name}`;
  const jobNumber = apt.crm_jobs?.job_number;
  const aptTime = new Date(apt.start_datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

  if (!input.confirmed) {
    return {
      needs_confirmation: true, action: "cancel_appointment",
      summary: { job_number: jobNumber, customer: customerName, job_type: apt.crm_jobs?.crm_job_types?.name, time: aptTime, team: apt.crm_teams?.name || "Unassigned", has_calendar_event: !!apt.google_calendar_event_id },
      confirmation_prompt: `Cancel the appointment for **${jobNumber}** (${customerName})?\n📅 ${aptTime}\n👷 ${apt.crm_teams?.name || "Unassigned"}${apt.google_calendar_event_id ? "\n🔗 Google Calendar event will be deleted" : ""}${input.reason ? `\n💬 Reason: ${input.reason}` : ""}\n\n⚠️ This removes the appointment but keeps the job.`,
    };
  }

  if (apt.google_calendar_event_id) {
    try {
      const calendarId = await getCalendarIdForTeam(supabase, apt.assigned_team_id);
      let targetCalId = calendarId;
      if (!targetCalId) {
        const { data: activeCals } = await supabase.from("google_calendars").select("calendar_id").eq("is_active", true).eq("is_primary", true).limit(1);
        targetCalId = activeCals?.[0]?.calendar_id;
      }
      if (targetCalId) {
        await supabase.functions.invoke("google-calendar-sync", { body: { action: "delete-event", calendarId: targetCalId, eventId: apt.google_calendar_event_id } });
      }
    } catch (err) { console.error("Calendar delete failed:", err); }
  }

  const { error } = await supabase.from("crm_job_appointments").delete().eq("id", input.appointment_id);
  if (error) throw new Error(`Failed to cancel: ${error.message}`);

  await supabase.from("crm_interactions").insert({ customer_id: apt.crm_jobs?.customer_id, interaction_type: "note", content: `Appointment for ${jobNumber} on ${aptTime} cancelled${input.reason ? `: ${input.reason}` : ""} (via AI Assistant)`, logged_by: userId });

  return { success: true, message: `Cancelled appointment for ${jobNumber} on ${aptTime}` };
}

async function executeGetGoogleCalendar(supabase: any, input: any) {
  const today = new Date().toISOString().split("T")[0];
  const dateFrom = input.date_from || today;
  const dateTo = input.date_to || new Date(new Date(dateFrom).getTime() + 7 * 86400000).toISOString().split("T")[0];

  let calendarIds: string[] = [];
  if (input.team_id) {
    const calId = await getCalendarIdForTeam(supabase, input.team_id);
    if (calId) calendarIds = [calId];
  }
  if (calendarIds.length === 0) {
    const { data: activeCals } = await supabase.from("google_calendars").select("calendar_id").eq("is_active", true);
    calendarIds = (activeCals || []).map((c: any) => c.calendar_id);
  }

  if (calendarIds.length === 0) return { date_range: { from: dateFrom, to: dateTo }, total_events: 0, events: [], note: "No active calendars configured." };

  const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
    body: { action: "get-all-events", timeMin: `${dateFrom}T00:00:00-06:00`, timeMax: `${dateTo}T23:59:59-06:00`, calendarIds },
  });

  if (error) throw new Error(`Calendar read failed: ${error.message}`);

  const events = (data?.items || []).map((e: any) => ({
    summary: e.summary, location: e.location,
    start: e.start?.dateTime || e.start?.date, end: e.end?.dateTime || e.end?.date,
    status: e.status, calendar: e.calendarId,
  }));

  return { date_range: { from: dateFrom, to: dateTo }, total_events: events.length, events };
}

async function executeGetJobTypes(supabase: any) {
  const { data } = await supabase.from("crm_job_types").select("id, name, slug, category, default_duration_hours, requires_permit").eq("is_active", true).order("sort_order");
  return { job_types: data || [] };
}

async function executeGetPipelineStages(supabase: any) {
  const { data } = await supabase.from("crm_pipeline_stages").select("id, name, display_name, color, is_won_stage, is_lost_stage, sort_order").order("sort_order");
  return { stages: data || [] };
}

// ============================================================
// TOOL ROUTER
// ============================================================

async function executeTool(supabase: any, toolName: string, toolInput: any, userId: string): Promise<any> {
  switch (toolName) {
    // Read tools
    case "search_customers": return executeSearchCustomers(supabase, toolInput);
    case "get_customer_details": return executeGetCustomerDetails(supabase, toolInput);
    case "search_jobs": return executeSearchJobs(supabase, toolInput);
    case "get_schedule": return executeGetSchedule(supabase, toolInput);
    case "get_submission_stats": return executeGetSubmissionStats(supabase, toolInput);
    case "get_recent_submissions": return executeGetRecentSubmissions(supabase, toolInput);
    case "get_pipeline_overview": return executeGetPipelineOverview(supabase, toolInput);
    case "get_team_info": return executeGetTeamInfo(supabase, toolInput);
    // Write tools
    case "create_job": return executeCreateJob(supabase, userId, toolInput);
    case "update_job_stage": return executeUpdateJobStage(supabase, userId, toolInput);
    case "log_interaction": return executeLogInteraction(supabase, userId, toolInput);
    case "update_customer_status": return executeUpdateCustomerStatus(supabase, userId, toolInput);
    case "add_to_pipeline": return executeAddToPipeline(supabase, userId, toolInput);
    case "move_pipeline_entry": return executeMovePipelineEntry(supabase, userId, toolInput);
    case "schedule_appointment": return executeScheduleAppointment(supabase, userId, toolInput);
    case "reschedule_appointment": return executeRescheduleAppointment(supabase, userId, toolInput);
    case "cancel_appointment": return executeCancelAppointment(supabase, userId, toolInput);
    case "get_google_calendar": return executeGetGoogleCalendar(supabase, toolInput);
    case "get_job_types": return executeGetJobTypes(supabase);
    case "get_pipeline_stages": return executeGetPipelineStages(supabase);
    default: throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

function getSystemPrompt(): string {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return `You are Bach, an AI operations assistant for Truficient Energy Solutions, an HVAC company in the Dallas-Fort Worth area. You help the admin team manage their CRM, customers, jobs, schedules, and pipeline using natural language.

PERSONALITY:
- Professional but conversational — like a competent office assistant
- Concise — lead with the answer, add detail only if helpful
- Proactive — if a search returns one obvious match, present it directly
- Careful — always confirm before making changes to data
- Honest — say when you can't find something or need more info

CAPABILITIES:
Read operations:
- Search and view customer records, locations, and interaction history
- Look up jobs by number, customer, type, or date range
- Check team schedules and availability
- Read Google Calendar directly for full availability picture (includes meetings, blocks, travel time beyond just CRM appointments)
- View submission counts and pipeline metrics
- View team/crew information and assignments

Write operations (ALWAYS confirm first):
- Create new jobs for existing customers
- Move jobs between workflow stages
- Log interactions (calls, emails, notes, meetings, texts, tasks)
- Update customer lifecycle status
- Add customers to the sales pipeline or move between stages
- Schedule job appointments (automatically creates Google Calendar events with job details, customer info, and address)
- Reschedule appointments (updates both CRM record and Google Calendar event)
- Cancel appointments (removes CRM appointment and deletes Google Calendar event)

CALENDAR INTEGRATION:
- When scheduling, the system automatically creates a Google Calendar event
- Event titles follow format: "Job Type — Customer Name (TRU-XXXX-XXXX)"
- Events are color-coded by job type (blue=install, green=maintenance, red=repair, yellow=inspection)
- Each crew can have their own calendar
- When rescheduling, both CRM and calendar are updated
- When cancelling, the calendar event is also deleted
- Use get_google_calendar to check TRUE availability (includes meetings, blocks, etc. not just CRM appointments)
- Always check both CRM schedule AND Google Calendar before confirming availability
- Business hours: Monday-Friday 7am-6pm, Saturday 8am-2pm

CONFIRMATION RULES — VERY IMPORTANT:
1. When a write tool returns needs_confirmation: true, you MUST present the confirmation_prompt to the user and ASK them to confirm before proceeding.
2. Present the summary clearly so the user can verify the details.
3. Only call the tool again with confirmed: true AFTER the user explicitly says yes, confirm, do it, go ahead, etc.
4. If the user says no, cancel, or nevermind — acknowledge and do NOT execute.
5. If the user corrects a detail, call the tool again with corrected parameters and confirmed: false to show the updated summary.
6. NEVER set confirmed: true on the first call to any write tool.

MULTI-STEP WORKFLOWS:
When the user asks to do something that requires multiple steps (e.g., "Create a job for Smith and schedule it for Tuesday with Crew A"), break it into steps:
1. First search for the customer (search_customers)
2. Then create the job (create_job with confirmed: false)
3. After job confirmation, schedule the appointment (schedule_appointment with confirmed: false)
4. Confirm each step with the user before proceeding to the next

RESPONSE FORMAT:
- For single customer results: present key info naturally with phone, email, address on separate lines
- For lists: brief summaries with the most important details
- For numbers/stats: lead with the headline number
- Include job numbers (TRU-XXXX-XXXX) when referencing jobs
- Format phone numbers and addresses clearly
- Format dollar amounts with commas and 2 decimal places
- For confirmations: Present the summary in a clear, scannable format
- After successful writes: confirm what was done in a brief sentence

CONTEXT:
- Today's date is ${today}
- The business serves the Dallas-Fort Worth metroplex (DFW)
- Job numbers follow format TRU-YYYY-XXXX
- Customer statuses: lead → prospect → active → inactive → former
- Pipeline stages: New Lead → Contacted → Estimate Scheduled → Proposal Sent → Negotiating → Won/Lost
- Timezone: Central Time (CST/CDT)
- When scheduling, always use the Central timezone offset (-06:00 for CST, -05:00 for CDT)
- When a user says "tomorrow", "next week", etc., calculate the actual dates`;
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

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (config.provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

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
        tools: toolsDef.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })),
        max_tokens: config.max_tokens,
        temperature: config.temperature,
      }),
    });
  }

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: config.model, messages, tools: toolsDef, temperature: config.temperature, max_tokens: config.max_tokens }),
  });
}

function parseAIResponse(provider: string, data: any): { content: string | null; toolCalls: any[] | null; finishReason: string } {
  if (provider === "anthropic") {
    const content = data.content || [];
    const textBlocks = content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    const toolUseBlocks = content.filter((b: any) => b.type === "tool_use");
    return {
      content: textBlocks || null,
      toolCalls: toolUseBlocks.length > 0 ? toolUseBlocks.map((t: any) => ({ id: t.id, function: { name: t.name, arguments: JSON.stringify(t.input) } })) : null,
      finishReason: data.stop_reason === "tool_use" ? "tool_calls" : "stop",
    };
  }

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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const aiConfig = await getAIConfig(serviceClient);

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

      const rawMessage = aiConfig.provider === "anthropic" ? aiData : aiData.choices?.[0]?.message;
      messages.push(buildAssistantToolCallMessage(aiConfig.provider, parsed, rawMessage));

      for (const toolCall of parsed.toolCalls) {
        const toolName = toolCall.function.name;
        let toolInput: any;
        try {
          toolInput = JSON.parse(toolCall.function.arguments);
        } catch {
          toolInput = {};
        }

        try {
          const result = await executeTool(supabase, toolName, toolInput, user.id);
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
