import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkEdgeSyncRequest {
  action: 'create-project' | 'sync-customer' | 'get-project-media' | 'get-equipment' | 'create-service-record';
  jobId?: string;
  customerId?: string;
  locationId?: string;
  workedgeProjectId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get WorkEdge API configuration
    const { data: config, error: configError } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('integration_name', 'workedge')
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'WorkEdge integration not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!config.is_active) {
      return new Response(
        JSON.stringify({ error: 'WorkEdge integration is disabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WORKEDGE_API_KEY = Deno.env.get('WORKEDGE_API_KEY');
    if (!WORKEDGE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'WORKEDGE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: WorkEdgeSyncRequest = await req.json();
    const { action, jobId, customerId, locationId, workedgeProjectId } = body;

    const apiUrl = config.config?.api_url || 'https://api.workedge.pro';
    let result: any = null;

    // Log the sync attempt
    const logEntry = {
      entity_type: action.includes('project') ? 'project' : action.includes('customer') ? 'customer' : 'equipment',
      local_id: jobId || customerId || locationId,
      sync_direction: action.startsWith('get') ? 'pull' : 'push',
      sync_status: 'pending',
      request_payload: body
    };

    const { data: logData } = await supabase
      .from('workedge_sync_log')
      .insert(logEntry)
      .select()
      .single();

    try {
      switch (action) {
        case 'create-project': {
          if (!jobId) throw new Error('jobId is required');

          // Fetch job details
          const { data: job, error: jobError } = await supabase
            .from('crm_jobs')
            .select(`
              *,
              customer:crm_customers(*),
              location:crm_locations(*),
              job_type:crm_job_types(*)
            `)
            .eq('id', jobId)
            .single();

          if (jobError || !job) throw new Error('Job not found');

          // Create project in WorkEdge
          const projectPayload = {
            name: `${job.job_number} - ${job.title}`,
            client_name: job.customer?.company_name || 
                         `${job.customer?.first_name} ${job.customer?.last_name}`.trim(),
            property_address: [
              job.location?.address_line1,
              job.location?.city,
              job.location?.state,
              job.location?.zip_code
            ].filter(Boolean).join(', '),
            project_type: job.job_type?.name?.toLowerCase() || 'service'
          };

          const response = await fetch(`${apiUrl}/api-projects`, {
            method: 'POST',
            headers: {
              'x-api-key': WORKEDGE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectPayload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const projectData = await response.json();

          // Update job with WorkEdge project ID
          await supabase
            .from('crm_jobs')
            .update({ 
              workedge_project_id: projectData.id,
              workedge_last_sync: new Date().toISOString()
            })
            .eq('id', jobId);

          result = { success: true, workedge_project_id: projectData.id };
          break;
        }

        case 'sync-customer': {
          if (!customerId) throw new Error('customerId is required');

          const { data: customer, error: customerError } = await supabase
            .from('crm_customers')
            .select('*')
            .eq('id', customerId)
            .single();

          if (customerError || !customer) throw new Error('Customer not found');

          const customerPayload = {
            name: customer.company_name || `${customer.first_name} ${customer.last_name}`,
            email: customer.email,
            phone: customer.phone,
            type: customer.customer_type
          };

          const response = await fetch(`${apiUrl}/api-customers`, {
            method: 'POST',
            headers: {
              'x-api-key': WORKEDGE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerPayload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const customerData = await response.json();

          await supabase
            .from('crm_customers')
            .update({ workedge_customer_id: customerData.id })
            .eq('id', customerId);

          result = { success: true, workedge_customer_id: customerData.id };
          break;
        }

        case 'get-project-media': {
          if (!workedgeProjectId || !jobId) throw new Error('workedgeProjectId and jobId are required');

          const response = await fetch(`${apiUrl}/api-projects/${workedgeProjectId}/media`, {
            method: 'GET',
            headers: {
              'x-api-key': WORKEDGE_API_KEY
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const mediaData = await response.json();

          // Upsert media records
          const mediaRecords = (mediaData.items || []).map((item: any) => ({
            job_id: jobId,
            workedge_project_id: workedgeProjectId,
            media_type: item.type || 'photo',
            media_url: item.url,
            thumbnail_url: item.thumbnail_url,
            title: item.title,
            description: item.description,
            transcription: item.transcription,
            captured_by: item.captured_by,
            captured_at: item.captured_at,
            synced_at: new Date().toISOString()
          }));

          if (mediaRecords.length > 0) {
            // Clear existing and insert fresh
            await supabase
              .from('workedge_project_media')
              .delete()
              .eq('job_id', jobId);

            await supabase
              .from('workedge_project_media')
              .insert(mediaRecords);
          }

          // Update job last sync
          await supabase
            .from('crm_jobs')
            .update({ workedge_last_sync: new Date().toISOString() })
            .eq('id', jobId);

          result = { success: true, media_count: mediaRecords.length };
          break;
        }

        case 'get-equipment': {
          if (!workedgeProjectId) throw new Error('workedgeProjectId is required');

          const response = await fetch(`${apiUrl}/api-projects/${workedgeProjectId}/equipment`, {
            method: 'GET',
            headers: {
              'x-api-key': WORKEDGE_API_KEY
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const equipmentData = await response.json();
          result = { success: true, equipment: equipmentData.items || [] };
          break;
        }

        case 'create-service-record': {
          if (!jobId || !workedgeProjectId) throw new Error('jobId and workedgeProjectId are required');

          const { data: job } = await supabase
            .from('crm_jobs')
            .select('*, current_stage:crm_job_stages(*)')
            .eq('id', jobId)
            .single();

          const servicePayload = {
            project_id: workedgeProjectId,
            date: new Date().toISOString(),
            status: job?.current_stage?.name || 'In Progress',
            notes: job?.internal_notes
          };

          const response = await fetch(`${apiUrl}/api-service-records`, {
            method: 'POST',
            headers: {
              'x-api-key': WORKEDGE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(servicePayload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          result = { success: true };
          break;
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Update sync log as success
      if (logData) {
        await supabase
          .from('workedge_sync_log')
          .update({ 
            sync_status: 'success',
            response_payload: result,
            workedge_id: result?.workedge_project_id || result?.workedge_customer_id
          })
          .eq('id', logData.id);
      }

      // Update last sync on integration config
      await supabase
        .from('integration_configs')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('integration_name', 'workedge');

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (syncError: any) {
      // Update sync log as failed
      if (logData) {
        await supabase
          .from('workedge_sync_log')
          .update({ 
            sync_status: 'failed',
            error_message: syncError.message
          })
          .eq('id', logData.id);
      }

      throw syncError;
    }

  } catch (error: any) {
    console.error('WorkEdge sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
