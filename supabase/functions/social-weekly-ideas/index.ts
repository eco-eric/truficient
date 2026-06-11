// social-weekly-ideas
// Scaffold-only entry point intended for a future pg_cron schedule.
// INTENTIONALLY UNSCHEDULED — Prompt 3 (or a later toggle) will wire the cron.
// When invoked, this runs the same logic as social-suggest-ideas (count 5,
// useJobData true, spread across pillars) and inserts results directly as
// status='suggested' so Eric can review them in the Ideas tab.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1'
import { generateIdeas } from '../social-suggest-ideas/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const result = await generateIdeas({
      provider: 'lovable',
      model: 'google/gemini-2.5-flash',
      count: 5,
      pillar: null,
      platforms: null,
      useJobData: true,
      userId: null,
    })

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: (result as any).status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const rows = result.ideas.map(i => ({
      hook: i.hook,
      angle: i.angle,
      pillar: i.pillar,
      suggested_platforms: i.suggested_platforms,
      source_context: i.source_context,
      status: 'suggested',
      ai_model: result.model,
    }))
    const { error } = await supabase.from('crm_social_ideas').insert(rows)
    if (error) throw error

    return new Response(JSON.stringify({ inserted: rows.length, model: result.model }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('social-weekly-ideas error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
