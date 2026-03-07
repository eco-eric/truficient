// supabase/functions/ai-assistant/index.ts
// AI Operations Assistant - Phase 2 (Read + Write with Confirmation)
// Renamed: Bach — the AI assistant for Truficient

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// === CST Timezone Utilities ===
const TZ = "America/Chicago";

function getCSTDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

function toCSTBoundary(dateStr: string, time: string): string {
  const naive = new Date(`${dateStr}T${time}:00`);
  const utcParts = new Date(naive.toLocaleString("en-US", { timeZone: "UTC", hour12: false }));
  const cstParts = new Date(naive.toLocaleString("en-US", { timeZone: TZ, hour12: false }));
  const offset = utcParts.getTime() - cstParts.getTime();
  return new Date(new Date(`${dateStr}T${time}:00Z`).getTime() + offset).toISOString();
}

function formatTimeCST(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// === RBAC: Get user's assistant permissions ===
async function getAssistantPermissions(supabase: any, userId: string) {
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (!roleData) return null;

  const { data: perms } = await supabase
    .from("assistant_role_permissions")
    .select("*")
    .eq("role_name", roleData.role)
    .single();

  return perms ? { ...perms, user_role: roleData.role } : null;
}

// === Financial data redaction for restricted roles ===
function redactFinancials(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") return data.replace(/\$[\d,]+\.?\d*/g, "$[restricted]");
  if (Array.isArray(data)) return data.map(redactFinancials);
  if (typeof data === "object") {
    const sensitive = new Set([
      "estimated_value","final_total","subtotal","tax_amount","equipment_cost",
      "installation_labor","installation_cost","price","hourly_rate",
      "monthly_payment","monthlyPayment","rebates","addons_cost","addonsCost",
      "base_price","equipment_total","equipmentTotal","recent_wins_total",
    ]);
    const out: any = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = sensitive.has(k) ? "[restricted]" : redactFinancials(v);
    }
    return out;
  }
  return data;
}

// === Tool-to-permission mapping ===
const TOOL_PERMISSIONS: Record<string, string> = {
  search_customers: "can_access_assistant",
  get_customer_details: "can_access_assistant",
  search_jobs: "can_access_assistant",
  get_schedule: "can_access_assistant",
  get_submission_stats: "can_access_assistant",
  get_recent_submissions: "can_access_assistant",
  get_pipeline_overview: "can_access_assistant",
  lookup_property_data: "can_access_assistant",
  get_team_info: "can_access_assistant",
  create_job: "can_use_write_tools",
  update_job_stage: "can_use_write_tools",
  log_interaction: "can_use_write_tools",
  update_customer_status: "can_use_write_tools",
  create_customer: "can_use_write_tools",
  create_pipeline_entry: "can_use_write_tools",
  intake_lead: "can_use_write_tools",
  review_submissions: "can_use_write_tools",
  scan_watch_list: "can_use_write_tools",
  draft_estimate: "can_use_write_tools",
  schedule_appointment: "can_use_write_tools",
  reschedule_appointment: "can_use_write_tools",
  cancel_appointment: "can_use_write_tools",
  get_google_calendar: "can_use_calendar_tools",
  get_daily_briefing: "can_view_briefing",
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
      name: "create_customer",
      description: "Create a new customer in the CRM. Optionally adds a primary location. ALWAYS confirm with the user before executing.",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Customer's first name" },
          last_name: { type: "string", description: "Customer's last name" },
          email: { type: "string", description: "Email address (optional)" },
          phone: { type: "string", description: "Phone number (optional)" },
          address_line1: { type: "string", description: "Street address (optional — if provided, creates a primary location)" },
          city: { type: "string", description: "City (required if address provided)" },
          state: { type: "string", description: "State abbreviation (required if address provided, default TX)" },
          zip_code: { type: "string", description: "ZIP code (required if address provided)" },
          lead_source: { type: "string", description: "How the customer was acquired (optional)" },
          customer_type: { type: "string", enum: ["residential", "commercial"], description: "Customer type (default residential)" },
          tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms. First call: always false." },
        },
        required: ["first_name", "last_name", "confirmed"],
      },
    },
  },
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
  // === CHAINED WRITE TOOLS ===
  {
    type: "function" as const,
    function: {
      name: "intake_lead",
      description: "Full lead intake: creates customer, adds location, adds to pipeline at the correct stage based on lead source, logs interaction, and syncs to GoHighLevel — all in one confirmed action. Use this instead of calling create_customer + add_to_pipeline separately when intake is the goal. ALWAYS confirm first.",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Lead's first name" },
          last_name: { type: "string", description: "Lead's last name" },
          email: { type: "string", description: "Email address (optional)" },
          phone: { type: "string", description: "Phone number (optional)" },
          address_line1: { type: "string", description: "Street address (optional)" },
          city: { type: "string", description: "City (optional)" },
          state: { type: "string", description: "State abbreviation (optional, default TX)" },
          zip_code: { type: "string", description: "ZIP code (optional)" },
          lead_source: { type: "string", description: "How the lead arrived — e.g. 'Mitsubishi Partner Program', 'Google Ads', 'Referral', 'Scanner', 'Estimator'" },
          customer_type: { type: "string", enum: ["residential", "commercial"], description: "Customer type (default residential)" },
          tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
          notes: { type: "string", description: "Any additional context about the lead" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms. First call: always false." },
        },
        required: ["first_name", "last_name", "confirmed"],
      },
    },
  },
  // === SUBMISSION REVIEW TOOL ===
  {
    type: "function" as const,
    function: {
      name: "review_submissions",
      description: "Scan all recent unreviewed submissions across all sources, classify each as real/junk/unsure using signal-based scoring, and return a structured report. Can also archive junk or intake real leads when instructed. Use when the user says 'review submissions', 'check new leads', or similar.",
      parameters: {
        type: "object",
        properties: {
          lookback_hours: { type: "number", description: "How far back to scan (default 48 hours)" },
          confirmed_archive: { type: "array", items: { type: "string" }, description: "Array of submission IDs to archive (set after user confirms archive)" },
          confirmed_intake: { type: "array", items: { type: "string" }, description: "Array of submission IDs to run through intake_lead (set after user confirms intake)" },
        },
      },
    },
  },
  // === WATCH LIST TOOL ===
  {
    type: "function" as const,
    function: {
      name: "scan_watch_list",
      description: "Scan the equipment scanner database for high-priority leads based on equipment age, R-22 refrigerant, DFW location, and contact info. Scores leads by urgency and can automatically run intake_lead on confirmed high-priority contacts. Use when the user says 'scan watch list', 'check aging equipment', or similar.",
      parameters: {
        type: "object",
        properties: {
          lookback_days: { type: "number", description: "How far back to scan (default 30 days)" },
          min_age_years: { type: "number", description: "Equipment age threshold in years (default 15)" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms intake. First call: always false." },
          include_medium: { type: "boolean", description: "If true, also intake medium priority leads on confirmation (default false)" },
        },
        required: ["confirmed"],
      },
    },
  },
  // === ESTIMATE DRAFTING TOOL ===
  {
    type: "function" as const,
    function: {
      name: "draft_estimate",
      description: "Draft a project estimate for an existing CRM customer using existing templates, system pricing, and materials. Saves as draft only — never sends to customer. ALWAYS confirm first. If job_type or customer is ambiguous, ask clarifying questions before proceeding.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "UUID of the CRM customer. If unknown, use customer_name to search." },
          customer_name: { type: "string", description: "Customer name to search if customer_id is not known. Will resolve to customer_id." },
          job_type: { type: "string", enum: ["residential_replacement", "residential_new", "commercial_replacement", "commercial_new", "maintenance", "repair"], description: "Job type for the estimate." },
          heating_type: { type: "string", enum: ["gas", "electric", "heat_pump", "dual_fuel"], description: "Heating type (default heat_pump)" },
          template_id: { type: "string", description: "Optional template UUID to override auto-selection" },
          title: { type: "string", description: "Optional custom title for the estimate" },
          notes: { type: "string", description: "Optional job notes" },
          confirmed: { type: "boolean", description: "Set true ONLY after user confirms the draft preview. First call: always false." },
        },
        required: ["job_type", "confirmed"],
      },
    },
  },
  // === PHASE 4: BRIEFING TOOL ===
  {
    type: "function" as const,
    function: {
      name: "get_daily_briefing",
      description: "Generate a daily operations briefing. Call this when the user opens the assistant for the first time in a session, or when they ask for a summary/briefing/update. Returns today's schedule, new leads, alerts, and action items. No confirmation needed.",
      parameters: {
        type: "object",
        properties: {
          briefing_data: {
            type: "object",
            description: "Pre-fetched briefing data from the assistant-briefing edge function. Pass this directly.",
          },
        },
      },
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
  const today = getCSTDateStr(new Date());
  const dateFrom = input.date_from || today;
  const dateTo = input.date_to || getCSTDateStr(new Date(Date.now() + 7 * 86400000));

  let query = supabase
    .from("crm_job_appointments")
    .select(`id, start_datetime, end_datetime, notes, title, crm_jobs(job_number, crm_customers(first_name, last_name, phone), crm_locations(address_line1, city, state), crm_job_types(name)), crm_teams(id, name, color)`)
    .gte("start_datetime", toCSTBoundary(dateFrom, "00:00"))
    .lte("start_datetime", toCSTBoundary(dateTo, "23:59"))
    .order("start_datetime");

  if (input.team_id) query = query.eq("assigned_team_id", input.team_id);

  const { data, error } = await query;
  if (error) throw new Error(`Schedule fetch failed: ${error.message}`);

  const byDate: Record<string, any[]> = {};
  (data || []).forEach((apt: any) => {
    const date = getCSTDateStr(new Date(apt.start_datetime));
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({
      time_start: apt.start_datetime,
      time_end: apt.end_datetime,
      time_display: formatTimeCST(apt.start_datetime),
      end_time_display: apt.end_datetime ? formatTimeCST(apt.end_datetime) : undefined,
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

async function executeCreateCustomer(supabase: any, userId: string, input: any) {
  const customerName = `${input.first_name} ${input.last_name}`;
  const hasAddress = input.address_line1 && input.city && input.zip_code;

  if (!input.confirmed) {
    return {
      needs_confirmation: true,
      action: "create_customer",
      summary: {
        name: customerName,
        email: input.email || "Not provided",
        phone: input.phone || "Not provided",
        address: hasAddress ? `${input.address_line1}, ${input.city}, ${input.state || "TX"} ${input.zip_code}` : "No address",
        type: input.customer_type || "residential",
        lead_source: input.lead_source || "Not set",
        tags: input.tags?.length ? input.tags.join(", ") : "None",
      },
      confirmation_prompt: `Create new customer **${customerName}**?\n📧 ${input.email || "No email"}\n📱 ${input.phone || "No phone"}${hasAddress ? `\n📍 ${input.address_line1}, ${input.city}, ${input.state || "TX"} ${input.zip_code}` : ""}${input.lead_source ? `\n🔗 Source: ${input.lead_source}` : ""}`,
    };
  }

  const { data: customer, error: custError } = await supabase
    .from("crm_customers")
    .insert({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
      customer_type: input.customer_type || "residential",
      customer_status: "lead",
      lead_source: input.lead_source || null,
      tags: input.tags || null,
    })
    .select("id")
    .single();

  if (custError) throw new Error(`Failed to create customer: ${custError.message}`);

  // Create primary location if address provided
  if (hasAddress) {
    await supabase.from("crm_locations").insert({
      customer_id: customer.id,
      address_line1: input.address_line1,
      city: input.city,
      state: input.state || "TX",
      zip_code: input.zip_code,
      is_primary: true,
    });
  }

  // Log system interaction
  await supabase.from("crm_interactions").insert({
    customer_id: customer.id,
    interaction_type: "note",
    content: `Customer created via AI Assistant${input.lead_source ? ` — Source: ${input.lead_source}` : ""}`,
    logged_by: userId,
  });

  return {
    success: true,
    customer_id: customer.id,
    message: `Created customer **${customerName}**${hasAddress ? ` with address at ${input.city}` : ""}`,
  };
}

// ============================================================
// CHAINED WRITE TOOL: INTAKE LEAD
// ============================================================

function resolveIntakePipelineStage(leadSource: string | undefined): string {
  if (!leadSource) return "New Lead";
  const src = leadSource.toLowerCase();
  if (src.includes("mitsubishi") || src.includes("partner") || src.includes("referral")) return "Contacted";
  if (src.includes("google") || src.includes("facebook") || src.includes("scanner") || src.includes("estimator")) return "New Lead";
  return "New Lead";
}

async function executeIntakeLead(supabase: any, userId: string, input: any) {
  const customerName = `${input.first_name} ${input.last_name}`;
  const hasAddress = !!(input.address_line1 && input.city && input.zip_code);
  const resolvedStageName = resolveIntakePipelineStage(input.lead_source);

  // Look up the actual pipeline stage
  const { data: stage } = await supabase
    .from("crm_pipeline_stages")
    .select("id, display_name")
    .ilike("display_name", `%${resolvedStageName}%`)
    .order("sort_order")
    .limit(1)
    .single();

  if (!stage) {
    const { data: stages } = await supabase.from("crm_pipeline_stages").select("display_name").order("sort_order");
    return { error: `Pipeline stage "${resolvedStageName}" not found.`, available_stages: stages?.map((s: any) => s.display_name) };
  }

  // === CONFIRMATION PREVIEW ===
  if (!input.confirmed) {
    const addressDisplay = hasAddress
      ? `${input.address_line1}, ${input.city}, ${input.state || "TX"} ${input.zip_code}`
      : "not provided";

    return {
      needs_confirmation: true,
      action: "intake_lead",
      summary: {
        name: customerName,
        email: input.email || "not provided",
        phone: input.phone || "not provided",
        address: addressDisplay,
        lead_source: input.lead_source || "not provided",
        pipeline_stage: stage.display_name,
        ghl_sync: "Yes",
        tags: input.tags?.length ? input.tags.join(", ") : "none",
        notes: input.notes || "none",
      },
      confirmation_prompt: `Ready to intake lead:\n\n👤 **${customerName}**\n📧 ${input.email || "—"} / 📱 ${input.phone || "—"}\n📍 ${addressDisplay}\n🏷️ Source: ${input.lead_source || "—"}\n📊 Pipeline: **${stage.display_name}**\n🔄 GHL Sync: Yes\n🏷️ Tags: ${input.tags?.length ? input.tags.join(", ") : "none"}\n📝 Notes: ${input.notes || "none"}\n\nReply "yes" to confirm or provide corrections.`,
    };
  }

  // === EXECUTE CHAIN ===
  const results: Record<string, string> = {};

  // Step 1: Create Customer
  const { data: customer, error: custError } = await supabase
    .from("crm_customers")
    .insert({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email || null,
      phone: input.phone || null,
      customer_type: input.customer_type || "residential",
      customer_status: "lead",
      lead_source: input.lead_source || null,
      tags: input.tags || null,
    })
    .select("id")
    .single();

  if (custError) return { error: `Failed to create customer: ${custError.message}` };
  results.customer = `✓ Customer created: ${customer.id}`;

  // Step 2: Create Location (if address provided)
  if (hasAddress) {
    const { error: locError } = await supabase.from("crm_locations").insert({
      customer_id: customer.id,
      address_line1: input.address_line1,
      city: input.city,
      state: input.state || "TX",
      zip_code: input.zip_code,
      is_primary: true,
    });
    if (locError) return { error: `Customer created but location failed: ${locError.message}`, customer_id: customer.id };
    results.location = "✓ Location added";
  } else {
    results.location = "— Skipped (no address)";
  }

  // Step 3: Add to Pipeline
  const { error: pipeError } = await supabase.from("crm_pipeline_entries").insert({
    customer_id: customer.id,
    stage_id: stage.id,
  });
  if (pipeError) return { error: `Customer created but pipeline add failed: ${pipeError.message}`, customer_id: customer.id };
  results.pipeline = `✓ Added to pipeline: ${stage.display_name}`;

  // Step 4: Log Interaction
  const interactionContent = `Lead intake via Bach Assistant. Source: ${input.lead_source || "unknown"}.${input.notes ? ` Notes: ${input.notes}` : ""}`;
  await supabase.from("crm_interactions").insert({
    customer_id: customer.id,
    interaction_type: "system_intake",
    direction: null,
    content: interactionContent,
    logged_by: userId,
  });
  results.interaction = "✓ Interaction logged";

  // Step 5: GHL Sync (non-blocking — failure doesn't abort)
  let ghlStatus = "failed";
  try {
    const ghlPayload = {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email || undefined,
      phone: input.phone || undefined,
      address: hasAddress ? `${input.address_line1}, ${input.city}, ${input.state || "TX"} ${input.zip_code}` : undefined,
      source: input.lead_source || "Bach Intake",
      tags: ["Bach Intake", ...(input.tags || [])],
    };

    const { data: ghlResult, error: ghlError } = await supabase.functions.invoke("sync-ghl-contact", {
      body: ghlPayload,
    });

    if (ghlError) {
      console.error("GHL sync failed:", ghlError);
    } else if (ghlResult?.contactId) {
      // Step 6: Write GHL contact ID back to customer
      await supabase.from("crm_customers").update({ ghl_contact_id: ghlResult.contactId }).eq("id", customer.id);
      ghlStatus = "success";
    } else {
      ghlStatus = "success"; // call succeeded even if no contactId returned
    }
  } catch (ghlErr: any) {
    console.error("GHL sync error:", ghlErr);
  }
  results.ghl = `${ghlStatus === "success" ? "✓" : "⚠️"} GHL sync: ${ghlStatus}`;

  return {
    success: true,
    customer_id: customer.id,
    ghl_sync: ghlStatus,
    message: `Lead intake complete:\n${results.customer}\n${results.location}\n${results.pipeline}\n${results.interaction}\n${results.ghl}`,
  };
}

// ============================================================
// SUBMISSION REVIEW TOOL
// ============================================================

const DFW_ZIPS = new Set([
  "75001","75002","75006","75007","75009","75010","75013","75019","75023","75024","75025",
  "75028","75032","75034","75035","75038","75039","75040","75041","75042","75043","75044",
  "75048","75050","75051","75052","75054","75056","75057","75060","75061","75062","75063",
  "75065","75067","75068","75069","75070","75071","75074","75075","75076","75077","75078",
  "75080","75081","75082","75083","75085","75086","75087","75088","75089","75093","75094",
  "75098","75099","75104","75115","75116","75134","75137","75141","75146","75149","75150",
  "75154","75159","75166","75180","75181","75182","75201","75202","75203","75204","75205",
  "75206","75207","75208","75209","75210","75211","75212","75214","75215","75216","75217",
  "75218","75219","75220","75221","75222","75223","75224","75225","75226","75227","75228",
  "75229","75230","75231","75232","75233","75234","75235","75236","75237","75238","75240",
  "75241","75242","75243","75244","75245","75246","75247","75248","75249","75250","75251",
  "75252","75253","75254","75260","75261","75262","75263","75264","75265","75266","75267",
  "75270","75275","75277","75283","75284","75285","75287","75301","75303","75312","75313",
  "75315","75320","75326","75336","75339","75342","75354","75355","75356","75357","75359",
  "75360","75367","75368","75370","75371","75372","75373","75374","75376","75378","75379",
  "75380","75381","75382","75386","75387","75388","75389","75390","75391","75392","75393",
  "75394","75395","75396","75397","75398","75401","76001","76002","76003","76004","76005",
  "76006","76010","76011","76012","76013","76014","76015","76016","76017","76018","76019",
  "76020","76021","76022","76028","76034","76036","76039","76040","76044","76051","76052",
  "76053","76054","76058","76059","76060","76063","76064","76065","76071","76078","76082",
  "76092","76094","76095","76096","76097","76098","76099","76101","76102","76103","76104",
  "76105","76106","76107","76108","76109","76110","76111","76112","76113","76114","76115",
  "76116","76117","76118","76119","76120","76121","76122","76123","76124","76126","76127",
  "76129","76130","76131","76132","76133","76134","76135","76136","76137","76140","76148",
  "76150","76155","76161","76162","76163","76164","76177","76179","76180","76181","76182",
  "76185","76191","76192","76193","76195","76196","76197","76198","76199","76201","76205",
  "76207","76208","76209","76210","76226","76227","76244","76247","76248","76249","76258",
  "76259","76262","76266",
]);

const HVAC_KEYWORDS = /\b(hvac|ac\b|a\/c|heat|cool|heating|cooling|mini.?split|ductless|furnace|install|replace|repair|estimate|quote|air.?condition|compressor|condenser|thermostat|refrigerant|tonnage|seer|heat.?pump)\b/i;
const JUNK_KEYWORDS = /\b(seo|marketing|leads|ranking|website|agency|partnership|collaboration|web.?design|social.?media|digital.?marketing|link.?building|backlink|ppc|content.?marketing)\b/i;
const SPAM_DOMAINS = /(marketing\.|promo\.|leads\.|seo\.|agency\.|digital\.|webdesign\.|info@|noreply@|sales@.*agency)/i;
const GENERIC_NAMES = new Set(["test user", "john smith", "jane doe", "admin", "test", "asdf", "qwerty"]);

interface ScoredSubmission {
  id: string;
  source_table: string;
  source_label: string;
  name: string;
  email: string | null;
  phone: string | null;
  zip: string | null;
  message: string | null;
  details: string;
  score: "real" | "junk" | "unsure";
  reasons: string[];
  intake_params: any;
}

function scoreSubmission(sub: ScoredSubmission): void {
  const realSignals: string[] = [];
  const junkSignals: string[] = [];

  // DFW zip
  if (sub.zip && DFW_ZIPS.has(sub.zip)) realSignals.push("DFW zip code");
  if (sub.zip && !DFW_ZIPS.has(sub.zip) && sub.zip.length === 5) junkSignals.push("out-of-service-area zip");

  // HVAC keywords in message
  if (sub.message && HVAC_KEYWORDS.test(sub.message)) realSignals.push("HVAC keywords in message");

  // Estimator submissions always real
  if (sub.source_table === "ducted_estimate_submissions" || sub.source_table === "ductless_estimate_submissions") {
    realSignals.push("completed multi-step estimator");
  }

  // Phone present and valid
  if (sub.phone && sub.phone.replace(/\D/g, "").length >= 10) realSignals.push("valid phone number");

  // Junk checks
  if (sub.message && JUNK_KEYWORDS.test(sub.message)) junkSignals.push("spam/marketing message");
  if (sub.email && SPAM_DOMAINS.test(sub.email)) junkSignals.push("known spam email domain");
  if (GENERIC_NAMES.has(sub.name.toLowerCase().trim())) junkSignals.push("generic/test name");
  if (!sub.phone && !sub.zip && (!sub.message || sub.message.length < 20)) junkSignals.push("no phone, no address, vague message");

  // Equipment scanner specific
  if (sub.source_table === "equipment_scans" && !sub.email) junkSignals.push("scanner with no email");

  sub.reasons = [...realSignals, ...junkSignals];

  if (junkSignals.length > 0 && realSignals.length === 0) {
    sub.score = "junk";
  } else if (realSignals.length > 0 && junkSignals.length === 0) {
    sub.score = "real";
  } else if (realSignals.length > 0 && junkSignals.length > 0) {
    sub.score = "unsure";
  } else {
    sub.score = "unsure";
  }
}

const SOURCE_LABEL_MAP: Record<string, string> = {
  contact_submissions: "Website Contact Form",
  ductless_estimate_submissions: "Ductless Estimator",
  ducted_estimate_submissions: "Ducted Estimator",
  equipment_scans: "Equipment Scanner",
  landing_page_submissions: "Landing Page",
};

async function executeReviewSubmissions(supabase: any, userId: string, input: any) {
  const lookbackHours = input.lookback_hours || 48;
  const cutoff = new Date(Date.now() - lookbackHours * 3600000).toISOString();

  // === HANDLE ARCHIVE ===
  if (input.confirmed_archive && input.confirmed_archive.length > 0) {
    const archiveResults: string[] = [];
    for (const id of input.confirmed_archive) {
      // Try updating status in each table until one succeeds
      for (const table of ["contact_submissions", "ducted_estimate_submissions", "ductless_estimate_submissions", "equipment_scans", "landing_page_submissions"]) {
        const { error, count } = await supabase.from(table).update({ status: "archived" }).eq("id", id).select("id");
        if (!error && count > 0) {
          archiveResults.push(id);
          break;
        }
      }
    }
    return { success: true, archived_count: archiveResults.length, message: `Archived ${archiveResults.length} submission(s).` };
  }

  // === HANDLE INTAKE ===
  if (input.confirmed_intake && input.confirmed_intake.length > 0) {
    const intakeResults: any[] = [];
    // We need to fetch the submissions to get their data for intake
    // The AI should have the scored data from a previous call, but we re-fetch to be safe
    for (const id of input.confirmed_intake) {
      let found = false;
      // Try each table
      for (const tableInfo of [
        { table: "contact_submissions", fields: "id, first_name, last_name, email, phone, service_type, message, status" },
        { table: "ducted_estimate_submissions", fields: "id, first_name, last_name, email, phone, address, city, state, zip_code, heating_type, recommended_tonnage, final_total, status" },
        { table: "ductless_estimate_submissions", fields: "id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_zip, zone_count, final_total, selected_tier, status" },
        { table: "equipment_scans", fields: "id, email, zip_code, brand, equipment_type, estimated_age, status" },
        { table: "landing_page_submissions", fields: "id, first_name, last_name, email, phone, message, status" },
      ]) {
        const { data } = await supabase.from(tableInfo.table).select(tableInfo.fields).eq("id", id).single();
        if (data) {
          found = true;
          // Build intake params from submission
          const params = buildIntakeParams(data, tableInfo.table);
          // Run intake_lead directly
          const result = await executeIntakeLead(supabase, userId, { ...params, confirmed: true });
          intakeResults.push({ id, source: tableInfo.table, result });
          // Mark submission as converted
          if (result.success) {
            await supabase.from(tableInfo.table).update({ status: "converted" }).eq("id", id);
          }
          break;
        }
      }
      if (!found) intakeResults.push({ id, error: "Submission not found" });
    }
    return {
      success: true,
      intake_count: intakeResults.filter(r => r.result?.success).length,
      results: intakeResults.map(r => ({
        id: r.id,
        source: r.source,
        success: r.result?.success || false,
        customer_id: r.result?.customer_id,
        ghl_sync: r.result?.ghl_sync,
        error: r.result?.error || r.error,
      })),
    };
  }

  // === STEP 1: FETCH UNREVIEWED SUBMISSIONS ===
  const submissions: ScoredSubmission[] = [];

  const [contacts, ducted, ductless, scans, landing] = await Promise.all([
    supabase.from("contact_submissions").select("id, first_name, last_name, email, phone, service_type, message, status, created_at").or("status.is.null,status.eq.new").gte("created_at", cutoff),
    supabase.from("ducted_estimate_submissions").select("id, first_name, last_name, email, phone, address, city, state, zip_code, heating_type, recommended_tonnage, final_total, status, created_at").or("status.is.null,status.eq.new").gte("created_at", cutoff),
    supabase.from("ductless_estimate_submissions").select("id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_zip, zone_count, final_total, selected_tier, status, created_at").or("status.is.null,status.eq.new").gte("created_at", cutoff),
    supabase.from("equipment_scans").select("id, email, zip_code, brand, equipment_type, estimated_age, status, created_at").or("status.is.null,status.eq.new").gte("created_at", cutoff).not("email", "is", null),
    supabase.from("landing_page_submissions").select("id, first_name, last_name, email, phone, message, status, created_at").or("status.is.null,status.eq.new").gte("created_at", cutoff),
  ]);

  // Map contact submissions
  (contacts.data || []).forEach((s: any) => {
    submissions.push({
      id: s.id, source_table: "contact_submissions", source_label: "Contact Form",
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unknown",
      email: s.email, phone: s.phone, zip: null,
      message: s.message || s.service_type,
      details: s.service_type || s.message?.substring(0, 80) || "No details",
      score: "unsure", reasons: [],
      intake_params: { first_name: s.first_name, last_name: s.last_name, email: s.email, phone: s.phone, lead_source: "Website Contact Form", notes: s.message?.substring(0, 200) },
    });
  });

  // Map ducted submissions
  (ducted.data || []).forEach((s: any) => {
    submissions.push({
      id: s.id, source_table: "ducted_estimate_submissions", source_label: "Ducted Estimator",
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unknown",
      email: s.email, phone: s.phone, zip: s.zip_code,
      message: null,
      details: `${s.heating_type || "HVAC"} — ${s.recommended_tonnage}T — $${s.final_total || "N/A"}`,
      score: "unsure", reasons: [],
      intake_params: { first_name: s.first_name, last_name: s.last_name, email: s.email, phone: s.phone, address_line1: s.address, city: s.city, state: s.state || "TX", zip_code: s.zip_code, lead_source: "Ducted Estimator", notes: `${s.heating_type || "HVAC"} ${s.recommended_tonnage}T, est $${s.final_total || "N/A"}` },
    });
  });

  // Map ductless submissions
  (ductless.data || []).forEach((s: any) => {
    const nameParts = (s.customer_name || "Unknown").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    submissions.push({
      id: s.id, source_table: "ductless_estimate_submissions", source_label: "Ductless Estimator",
      name: s.customer_name || "Unknown",
      email: s.customer_email, phone: s.customer_phone, zip: s.customer_zip,
      message: null,
      details: `${s.zone_count} zones — ${s.selected_tier || "Standard"} — $${s.final_total || "N/A"}`,
      score: "unsure", reasons: [],
      intake_params: { first_name: firstName, last_name: lastName, email: s.customer_email, phone: s.customer_phone, address_line1: s.customer_address, city: s.customer_city, state: s.customer_state || "TX", zip_code: s.customer_zip, lead_source: "Ductless Estimator", notes: `${s.zone_count} zones, ${s.selected_tier || "Standard"} tier, est $${s.final_total || "N/A"}` },
    });
  });

  // Map scanner submissions
  (scans.data || []).forEach((s: any) => {
    submissions.push({
      id: s.id, source_table: "equipment_scans", source_label: "Equipment Scanner",
      name: s.email?.split("@")[0] || "Scanner User",
      email: s.email, phone: null, zip: s.zip_code,
      message: null,
      details: `${s.brand || "Unknown"} ${s.equipment_type || ""} — ${s.estimated_age ? s.estimated_age + " yrs" : "age unknown"}`,
      score: "unsure", reasons: [],
      intake_params: { first_name: s.email?.split("@")[0] || "Scanner", last_name: "User", email: s.email, zip_code: s.zip_code, lead_source: "Equipment Scanner", notes: `Scanned ${s.brand || "unknown"} ${s.equipment_type || ""}, est age ${s.estimated_age || "unknown"} yrs` },
    });
    // Scanner age 12+ is a real signal
    if (s.estimated_age && s.estimated_age >= 12) {
      submissions[submissions.length - 1].reasons.push("equipment age 12+ years");
    }
  });

  // Map landing page submissions
  (landing.data || []).forEach((s: any) => {
    submissions.push({
      id: s.id, source_table: "landing_page_submissions", source_label: "Landing Page",
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unknown",
      email: s.email, phone: s.phone, zip: null,
      message: s.message,
      details: s.message?.substring(0, 80) || "Landing page submission",
      score: "unsure", reasons: [],
      intake_params: { first_name: s.first_name, last_name: s.last_name, email: s.email, phone: s.phone, lead_source: "Landing Page", notes: s.message?.substring(0, 200) },
    });
  });

  // === STEP 2: SCORE ===
  submissions.forEach(scoreSubmission);

  const real = submissions.filter(s => s.score === "real");
  const junk = submissions.filter(s => s.score === "junk");
  const unsure = submissions.filter(s => s.score === "unsure");

  return {
    lookback_hours: lookbackHours,
    total_scanned: submissions.length,
    real_count: real.length,
    junk_count: junk.length,
    unsure_count: unsure.length,
    real: real.map((s, i) => ({ index: i + 1, id: s.id, name: s.name, source: s.source_label, details: s.details, reasons: s.reasons, zip: s.zip })),
    junk: junk.map((s, i) => ({ index: real.length + unsure.length + i + 1, id: s.id, name: s.name, source: s.source_label, details: s.details, reasons: s.reasons })),
    unsure: unsure.map((s, i) => ({ index: real.length + i + 1, id: s.id, name: s.name, source: s.source_label, details: s.details, reasons: s.reasons })),
    instructions: 'Present this as a formatted report. For real leads, offer "intake all real" or "intake [number]". For junk, offer "archive junk". For unsure, let user decide "intake [number]" or "skip [number]".',
  };
}

function buildIntakeParams(data: any, table: string): any {
  const source = SOURCE_LABEL_MAP[table] || "Unknown";
  switch (table) {
    case "contact_submissions":
      return { first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone, lead_source: source, notes: data.message?.substring(0, 200) };
    case "ducted_estimate_submissions":
      return { first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone, address_line1: data.address, city: data.city, state: data.state || "TX", zip_code: data.zip_code, lead_source: source, notes: `${data.heating_type || "HVAC"} ${data.recommended_tonnage}T, est $${data.final_total || "N/A"}` };
    case "ductless_estimate_submissions": {
      const parts = (data.customer_name || "").split(" ");
      return { first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "", email: data.customer_email, phone: data.customer_phone, address_line1: data.customer_address, city: data.customer_city, state: data.customer_state || "TX", zip_code: data.customer_zip, lead_source: source, notes: `${data.zone_count} zones, ${data.selected_tier || "Standard"}, est $${data.final_total || "N/A"}` };
    }
    case "equipment_scans":
      return { first_name: data.email?.split("@")[0] || "Scanner", last_name: "User", email: data.email, zip_code: data.zip_code, lead_source: source, notes: `Scanned ${data.brand || "unknown"} ${data.equipment_type || ""}, est age ${data.estimated_age || "unknown"} yrs` };
    case "landing_page_submissions":
      return { first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone, lead_source: source, notes: data.message?.substring(0, 200) };
    default:
      return {};
  }
}

// ============================================================
// WATCH LIST TOOL
// ============================================================

const KNOWN_BRANDS = new Set(["carrier", "trane", "lennox", "goodman", "rheem", "york", "bryant", "american standard", "mitsubishi", "daikin", "fujitsu"]);

interface WatchListLead {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  zip: string | null;
  brand: string | null;
  equipment_type: string | null;
  tonnage: string | null;
  refrigerant: string | null;
  age: number | null;
  install_year: number | null;
  scanned_at: string;
  priority: "high" | "medium" | "low";
  score: number;
  signals: string[];
  tags: string[];
  notes: string;
  existing_customer: string | null;
}

function scoreWatchListLead(lead: WatchListLead, currentYear: number): void {
  let score = 0;
  const signals: string[] = [];
  const tags: string[] = [];

  // Calculate age
  let equipAge = lead.age;
  if (!equipAge && lead.install_year) {
    equipAge = currentYear - lead.install_year;
    lead.age = equipAge;
  }

  // Email always present (filtered in query)
  signals.push("Email ✓");

  // DFW zip
  const isDfw = lead.zip ? DFW_ZIPS.has(lead.zip) : false;
  if (isDfw) { signals.push("DFW ✓"); score += 3; }

  // Age scoring
  if (equipAge && equipAge >= 20) { tags.push("Critical Replacement"); score += 3; }
  else if (equipAge && equipAge >= 15) { tags.push("Aging Equipment"); score += 2; }

  // Phone
  if (lead.phone && lead.phone.replace(/\D/g, "").length >= 10) { signals.push("Phone ✓"); score += 1; }

  // R-22
  if (lead.refrigerant && lead.refrigerant.toLowerCase().includes("r-22")) {
    signals.push("R-22 ✓"); score += 2; tags.push("R-22 Replacement");
  }

  // Known brand
  if (lead.brand && KNOWN_BRANDS.has(lead.brand.toLowerCase())) {
    signals.push("Known brand ✓"); score += 1;
    tags.push(`${lead.brand} Owner`);
  }

  lead.signals = signals;
  lead.score = score;
  lead.tags = tags;

  // Determine priority
  const hasEmail = true; // filtered
  const meetsAge = equipAge ? equipAge >= 15 : false;

  if (hasEmail && isDfw && meetsAge) {
    lead.priority = "high";
  } else if (hasEmail && (isDfw || (lead.phone && lead.phone.replace(/\D/g, "").length >= 10))) {
    lead.priority = "medium";
  } else {
    lead.priority = "low";
  }

  // Build notes
  lead.notes = `Equipment scanner lead. ${lead.brand || "Unknown"} ${lead.tonnage ? lead.tonnage + "-ton" : ""} installed ${lead.install_year || "unknown"}, age ${equipAge || "unknown"} years. Refrigerant: ${lead.refrigerant || "unknown"}. Scanned: ${new Date(lead.scanned_at).toLocaleDateString("en-US")}.`;
}

async function executeScanWatchList(supabase: any, userId: string, input: any) {
  const lookbackDays = input.lookback_days || 30;
  const minAgeYears = input.min_age_years || 15;
  const cutoff = new Date(Date.now() - lookbackDays * 86400000).toISOString();
  const currentYear = new Date().getFullYear();

  // Fetch scans
  const { data: scans, error: scanErr } = await supabase
    .from("equipment_scans")
    .select("id, email, phone, zip_code, brand, equipment_type, tonnage, refrigerant, estimated_age, install_year, customer_name, created_at, status")
    .not("email", "is", null)
    .not("email", "eq", "")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false });

  if (scanErr) throw new Error(`Failed to query equipment scans: ${scanErr.message}`);

  // Filter out already converted/archived
  const eligible = (scans || []).filter((s: any) => s.status !== "converted" && s.status !== "archived");
  const alreadyConverted = (scans || []).length - eligible.length;

  // Build leads and score
  const leads: WatchListLead[] = eligible.map((s: any) => {
    const lead: WatchListLead = {
      id: s.id,
      name: s.customer_name || null,
      email: s.email,
      phone: s.phone || null,
      zip: s.zip_code || null,
      brand: s.brand || null,
      equipment_type: s.equipment_type || null,
      tonnage: s.tonnage || null,
      refrigerant: s.refrigerant || null,
      age: s.estimated_age || null,
      install_year: s.install_year || null,
      scanned_at: s.created_at,
      priority: "low",
      score: 0,
      signals: [],
      tags: [],
      notes: "",
      existing_customer: null,
    };
    scoreWatchListLead(lead, currentYear);
    return lead;
  });

  // Filter by age threshold
  const ageFiltered = leads.filter(l => l.age && l.age >= minAgeYears);

  const high = ageFiltered.filter(l => l.priority === "high").sort((a, b) => b.score - a.score);
  const medium = ageFiltered.filter(l => l.priority === "medium").sort((a, b) => b.score - a.score);
  const low = ageFiltered.filter(l => l.priority === "low");

  // === CONFIRMED: RUN INTAKE ===
  if (input.confirmed) {
    const toIntake = input.include_medium ? [...high, ...medium] : high;

    if (toIntake.length === 0) {
      return { success: true, message: "No leads to intake." };
    }

    // Deduplication check
    const emails = toIntake.map(l => l.email);
    const { data: existingCustomers } = await supabase
      .from("crm_customers")
      .select("id, first_name, last_name, email")
      .in("email", emails);

    const existingMap = new Map<string, string>();
    (existingCustomers || []).forEach((c: any) => {
      if (c.email) existingMap.set(c.email.toLowerCase(), `${c.first_name || ""} ${c.last_name || ""}`.trim());
    });

    const intakeResults: any[] = [];
    for (const lead of toIntake) {
      // Check dedup
      const existing = existingMap.get(lead.email.toLowerCase());
      if (existing) {
        intakeResults.push({ email: lead.email, skipped: true, reason: `Already in CRM as ${existing}` });
        continue;
      }

      // Parse name
      const nameParts = (lead.name || lead.email.split("@")[0] || "Scanner").split(" ");
      const firstName = nameParts[0] || "Scanner";
      const lastName = nameParts.slice(1).join(" ") || "User";

      // Determine pipeline stage
      const hasR22 = lead.refrigerant && lead.refrigerant.toLowerCase().includes("r-22");
      const leadSource = "Equipment Scanner";

      const intakeParams = {
        first_name: firstName,
        last_name: lastName,
        email: lead.email,
        phone: lead.phone || undefined,
        zip_code: lead.zip || undefined,
        lead_source: leadSource,
        tags: ["Bach Intake", "Watch List", ...lead.tags],
        notes: lead.notes,
        confirmed: true,
      };

      const result = await executeIntakeLead(supabase, userId, intakeParams);
      intakeResults.push({ email: lead.email, name: `${firstName} ${lastName}`, result });

      // Mark as converted
      if (result.success) {
        await supabase.from("equipment_scans").update({ status: "converted" }).eq("id", lead.id);
      }
    }

    const successCount = intakeResults.filter(r => r.result?.success).length;
    const skippedCount = intakeResults.filter(r => r.skipped).length;

    return {
      success: true,
      intake_count: successCount,
      skipped_count: skippedCount,
      results: intakeResults.map(r => ({
        email: r.email,
        name: r.name,
        success: r.result?.success || false,
        skipped: r.skipped || false,
        reason: r.reason,
        customer_id: r.result?.customer_id,
        ghl_sync: r.result?.ghl_sync,
      })),
      message: `Watch list intake complete: ${successCount} intaked, ${skippedCount} skipped (already in CRM).`,
    };
  }

  // === BUILD REPORT (confirmed: false) ===
  // Dedup check for report
  const allEmails = [...high, ...medium].map(l => l.email);
  if (allEmails.length > 0) {
    const { data: existingCustomers } = await supabase
      .from("crm_customers")
      .select("id, first_name, last_name, email")
      .in("email", allEmails);

    const existingMap = new Map<string, string>();
    (existingCustomers || []).forEach((c: any) => {
      if (c.email) existingMap.set(c.email.toLowerCase(), `${c.first_name || ""} ${c.last_name || ""}`.trim());
    });

    [...high, ...medium].forEach(l => {
      const existing = existingMap.get(l.email.toLowerCase());
      if (existing) l.existing_customer = existing;
    });
  }

  return {
    lookback_days: lookbackDays,
    min_age_years: minAgeYears,
    total_scanned: scans?.length || 0,
    already_converted: alreadyConverted,
    new_flags: ageFiltered.length,
    high_priority: high.map((l, i) => ({
      index: i + 1,
      id: l.id,
      name: l.name || l.email.split("@")[0],
      email: l.email,
      phone: l.phone || "no phone",
      brand: l.brand,
      tonnage: l.tonnage,
      refrigerant: l.refrigerant,
      age: l.age,
      install_year: l.install_year,
      zip: l.zip,
      signals: l.signals,
      tags: l.tags,
      score: l.score,
      existing_customer: l.existing_customer,
      pipeline_stage: l.refrigerant?.toLowerCase().includes("r-22") ? "Contacted" : "New Lead",
    })),
    medium_priority: medium.map((l, i) => ({
      index: high.length + i + 1,
      id: l.id,
      name: l.name || l.email.split("@")[0],
      email: l.email,
      phone: l.phone || "no phone",
      brand: l.brand,
      age: l.age,
      zip: l.zip,
      signals: l.signals,
      existing_customer: l.existing_customer,
    })),
    low_count: low.length,
    instructions: 'Present as a formatted watch list report. For 🔴 HIGH PRIORITY leads, show name, email, phone, equipment details, age, zip, and signal badges. Offer "confirm intake" to run intake_lead on all high items, or "intake all" to include medium. Show dedup warnings for leads already in CRM.',
  };
}

//
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
    case "create_customer": return executeCreateCustomer(supabase, userId, toolInput);
    case "create_job": return executeCreateJob(supabase, userId, toolInput);
    case "update_job_stage": return executeUpdateJobStage(supabase, userId, toolInput);
    case "log_interaction": return executeLogInteraction(supabase, userId, toolInput);
    case "update_customer_status": return executeUpdateCustomerStatus(supabase, userId, toolInput);
    case "add_to_pipeline": return executeAddToPipeline(supabase, userId, toolInput);
    case "move_pipeline_entry": return executeMovePipelineEntry(supabase, userId, toolInput);
    case "schedule_appointment": return executeScheduleAppointment(supabase, userId, toolInput);
    case "reschedule_appointment": return executeRescheduleAppointment(supabase, userId, toolInput);
    case "cancel_appointment": return executeCancelAppointment(supabase, userId, toolInput);
    case "intake_lead": return executeIntakeLead(supabase, userId, toolInput);
    case "review_submissions": return executeReviewSubmissions(supabase, userId, toolInput);
    case "scan_watch_list": return executeScanWatchList(supabase, userId, toolInput);
    case "get_google_calendar": return executeGetGoogleCalendar(supabase, toolInput);
    case "get_job_types": return executeGetJobTypes(supabase);
    case "get_pipeline_stages": return executeGetPipelineStages(supabase);
    case "get_daily_briefing": return toolInput.briefing_data || { error: "No briefing data available." };
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
- Intake new leads from any source using the intake_lead tool, which automatically creates the customer, adds them to the pipeline at the correct stage based on lead source, logs the interaction, and syncs to GoHighLevel
- Review and filter all incoming submissions using review_submissions — classifies each as real, junk, or unsure using signal-based scoring, automatically runs intake_lead on confirmed real leads, and asks for confirmation before archiving junk
- Scan the equipment scanner watch list using scan_watch_list — identifies high-priority leads based on equipment age (15+ years), R-22 refrigerant, DFW location, email and phone presence, and known brands. Automatically runs intake_lead on confirmed high-priority leads with appropriate tags and pipeline stage assignment
- Create new customers (with optional address that becomes their primary location)
- Create new jobs for existing customers
- Move jobs between workflow stages
- Log interactions (calls, emails, notes, meetings, texts, tasks)
- Update customer lifecycle status
- Add customers to the sales pipeline or move between stages
- Schedule job appointments (automatically creates Google Calendar events with job details, customer info, and address)
- Reschedule appointments (updates both CRM record and Google Calendar event)
- Cancel appointments (removes CRM appointment and deletes Google Calendar event)

WORKEDGE SYNC:
Each morning the WorkEdge sync runs at 1AM CST. Report on last night's sync by querying workedge_daily_sync_log data in the briefing. If status is 'failed' flag it immediately at the top of the morning briefing with urgency.

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

    // === RBAC check ===
    const permissions = await getAssistantPermissions(supabase, user.id);
    if (!permissions || !permissions.can_access_assistant) {
      return new Response(
        JSON.stringify({ error: "You don't have access to the AI assistant. Contact your admin." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === Rate limiting ===
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: msgCount } = await supabase
      .from("assistant_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((msgCount || 0) >= permissions.max_messages_per_hour) {
      return new Response(
        JSON.stringify({ error: `Rate limit reached (${permissions.max_messages_per_hour}/hr). Try again later.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, conversationHistory = [], briefing_data, is_auto_briefing } = await req.json();
    if (!is_auto_briefing && (!message || typeof message !== "string")) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const aiConfig = await getAIConfig(serviceClient);

    const baseSystemPrompt = aiConfig.system_prompt || getSystemPrompt();

    // === Briefing instructions ===
    const briefingInstructions = `

PROACTIVE BRIEFING:
When you receive briefing_data through the get_daily_briefing tool, generate a natural morning briefing:

1. GREETING — Time-appropriate greeting with the day/date
2. WORKEDGE SYNC — If workedge_sync data is present, report: "🔄 WorkEdge sync: [X] jobs updated, [Y] new jobs imported, [Z] attachments synced — Last sync: 1:00 AM — Status: ✅ success". If status is 'failed', flag it at the TOP of the briefing with ⚠️ urgency.
3. TODAY'S SCHEDULE — List appointments chronologically with crew, customer, job type, time. Flag overlaps.
4. ACTION ITEMS — New submissions needing follow-up, uncontacted leads (3+ days), stale estimates (5+ days), overdue jobs
5. ALERTS — Certification expirations, licensing issues
6. WINS — Recent pipeline victories

Keep it conversational but efficient. Use emoji sparingly: 📅 schedule, 🔔 alerts, 🎉 wins, ⚠️ urgent, 🔄 sync.
Skip empty categories. End with a suggested action.
All appointment times provided are already in Central Time (CST/CDT). Display the time_display and end_time_display fields directly — do NOT convert or offset them.

After the briefing, include follow-up suggestions formatted exactly as:
[SUGGESTIONS: "action 1", "action 2", "action 3"]
Make them specific to the briefing content.`;

    // === Dynamic role context ===
    let roleContext = `\n\nUSER CONTEXT:\nCurrent user role: ${permissions.user_role}`;
    if (!permissions.can_use_write_tools) {
      roleContext += "\nThis user has READ-ONLY access. Do NOT create, update, or delete records. If asked, explain they need admin access.";
    }
    if (!permissions.can_view_financials) {
      roleContext += "\nThis user CANNOT view financial data. Omit all dollar amounts, pricing, and cost information from responses. If data shows '[restricted]', skip it silently.";
    }
    if (!permissions.can_use_calendar_tools) {
      roleContext += "\nThis user does NOT have Google Calendar access. Use only CRM schedule data.";
    }
    if (!permissions.can_view_briefing) {
      roleContext += "\nThis user cannot access daily briefings.";
    }

    const fullSystemPrompt = baseSystemPrompt + briefingInstructions + roleContext;

    // === Build messages ===
    let messages: any[];

    if (is_auto_briefing && briefing_data) {
      // Pre-fill the tool call + result so the AI just formats the briefing
      messages = [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: "Generate my daily operations briefing." },
        {
          role: "assistant",
          content: null,
          tool_calls: [{
            id: "briefing_auto_001",
            type: "function",
            function: { name: "get_daily_briefing", arguments: JSON.stringify({ briefing_data }) },
          }],
        },
        {
          role: "tool",
          tool_call_id: "briefing_auto_001",
          content: JSON.stringify(briefing_data),
        },
      ];
    } else {
      const trimmedHistory = conversationHistory.slice(-20);
      messages = [
        { role: "system", content: fullSystemPrompt },
        ...trimmedHistory.map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ];
    }

    let toolsUsed: any[] = [];
    let finalResponse = "";
    let maxIterations = 10;

    while (maxIterations > 0) {
      maxIterations--;

      // Filter tools by permission
      const authorizedTools = tools.filter((tool: any) => {
        const req = TOOL_PERMISSIONS[tool.function.name];
        return !req || permissions[req] === true;
      });

      const aiResponse = await callAI(aiConfig, messages, authorizedTools);

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
          let result = await executeTool(supabase, toolName, toolInput, user.id);
          // Redact financials for restricted roles
          if (!permissions.can_view_financials) {
            result = redactFinancials(result);
          }
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
