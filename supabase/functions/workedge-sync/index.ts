import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to extract items from various API response structures
function extractItems(response: any): any[] {
  if (!response || typeof response !== 'object') return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.photos)) return response.photos;
  if (Array.isArray(response.media)) return response.media;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  if (response.data && Array.isArray(response.data.photos)) return response.data.photos;
  if (response.data && Array.isArray(response.data.media)) return response.data.media;
  return [];
}

interface WorkEdgeSyncRequest {
  action: 'create-project' | 'sync-customer' | 'get-project-media' | 'get-equipment' | 'create-service-record' | 'list-projects' | 'link-project' | 'unlink-project' | 'create-property';
  jobId?: string;
  customerId?: string;
  locationId?: string;
  workedgeProjectId?: string;
  searchQuery?: string;
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

          const addressParts = [
            customer.billing_address,
            customer.billing_city,
            customer.billing_state,
            customer.billing_zip
          ].filter(Boolean);

          const customerPayload = {
            name: customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
            email: customer.email,
            phone: customer.phone,
            company: customer.company_name || null,
            address: addressParts.length > 0 ? addressParts.join(', ') : null,
            contact_type: customer.customer_type === 'commercial' ? 'business' : 'homeowner'
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
          const weCustomerId = customerData?.customer?.id || customerData?.id;

          await supabase
            .from('crm_customers')
            .update({ workedge_customer_id: weCustomerId })
            .eq('id', customerId);

          result = { success: true, workedge_customer_id: weCustomerId };
          break;
        }

        case 'create-property': {
          if (!locationId) throw new Error('locationId is required');

          const { data: location, error: locationError } = await supabase
            .from('crm_locations')
            .select('*, customer:crm_customers(*)')
            .eq('id', locationId)
            .single();

          if (locationError || !location) throw new Error('Location not found');

          const customerName = location.customer?.company_name || 
            `${location.customer?.first_name || ''} ${location.customer?.last_name || ''}`.trim();

          const propertyName = location.location_name || `${customerName} - ${location.address_line1}`;
          const propertyAddress = `${location.address_line1}, ${location.city}, ${location.state} ${location.zip_code}`;
          
          const descParts: string[] = [];
          if (location.square_footage) descParts.push(`Sq ft: ${location.square_footage}`);
          if (location.year_built) descParts.push(`Year built: ${location.year_built}`);
          if (location.stories) descParts.push(`Stories: ${location.stories}`);
          if (location.gate_code) descParts.push(`Gate: ${location.gate_code}`);
          if (location.access_notes) descParts.push(`Access: ${location.access_notes}`);

          const propertyPayload = {
            name: propertyName,
            address: propertyAddress,
            property_type: location.location_type || 'residential',
            description: descParts.length > 0 ? descParts.join(' | ') : null
          };

          const response = await fetch(`${apiUrl}/api-properties`, {
            method: 'POST',
            headers: {
              'x-api-key': WORKEDGE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyPayload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const propertyData = await response.json();
          const wePropertyId = propertyData?.property?.id || propertyData?.id;

          await supabase
            .from('crm_locations')
            .update({ workedge_property_id: wePropertyId })
            .eq('id', locationId);

          result = { success: true, workedge_property_id: wePropertyId };
          break;
        }

        case 'get-project-media': {
          if (!workedgeProjectId || !jobId) throw new Error('workedgeProjectId and jobId are required');

          const endpoints = [
            { path: 'media', defaultType: 'photo' },
            { path: 'videos', defaultType: 'video' },
            { path: 'notes', defaultType: 'note' },
            { path: 'files', defaultType: 'document' },
          ];

          const fetchEndpoint = async (ep: { path: string; defaultType: string }) => {
            try {
              const res = await fetch(`${apiUrl}/api-projects/${workedgeProjectId}/${ep.path}`, {
                method: 'GET',
                headers: { 'x-api-key': WORKEDGE_API_KEY }
              });
              if (!res.ok) {
                console.log(`WorkEdge /${ep.path} returned ${res.status}, skipping`);
                return [];
              }
              const data = await res.json();
              const items = extractItems(data);
              console.log(`WorkEdge /${ep.path}: ${items.length} items`);
              return items.map((item: any) => ({ ...item, _defaultType: ep.defaultType }));
            } catch (e: any) {
              console.log(`WorkEdge /${ep.path} fetch error: ${e.message}`);
              return [];
            }
          };

          const allItems = (await Promise.all(endpoints.map(fetchEndpoint))).flat();
          console.log(`Total items from all endpoints: ${allItems.length}`);

          const mediaRecords = allItems.map((item: any) => ({
            job_id: jobId,
            workedge_project_id: workedgeProjectId,
            media_type: item.type || item.media_type || item.file_type || item._defaultType,
            media_url: item.url || item.media_url || item.file_url || item.src || (item._defaultType === 'note' ? 'note://' + (item.id || 'no-id') : null),
            thumbnail_url: item.thumbnail_url || item.thumb_url || item.thumbnail || item.preview_url,
            title: item.title || item.name || item.filename || item.file_name,
            description: item.description || item.caption || item.content || item.notes || item.body || item.text,
            transcription: item.transcription || item.transcript,
            captured_by: item.captured_by || item.author || item.created_by || item.user_name,
            captured_at: item.captured_at || item.created_at || item.taken_at || item.date,
            synced_at: new Date().toISOString()
          })).filter((record: any) => record.media_url);

          console.log(`Created ${mediaRecords.length} valid media records`);

          await supabase
            .from('workedge_project_media')
            .delete()
            .eq('job_id', jobId);

          if (mediaRecords.length > 0) {
            await supabase
              .from('workedge_project_media')
              .insert(mediaRecords);
          }

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

        case 'list-projects': {
          const response = await fetch(`${apiUrl}/api-projects`, {
            method: 'GET',
            headers: { 'x-api-key': WORKEDGE_API_KEY }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WorkEdge API error: ${response.status} ${errorText}`);
          }

          const projectsData = await response.json();
          result = { 
            success: true, 
            projects: projectsData.items || projectsData || [] 
          };
          break;
        }

        case 'link-project': {
          if (!jobId || !workedgeProjectId) {
            throw new Error('jobId and workedgeProjectId are required');
          }

          await supabase
            .from('crm_jobs')
            .update({ 
              workedge_project_id: workedgeProjectId,
              workedge_last_sync: new Date().toISOString()
            })
            .eq('id', jobId);

          result = { success: true, workedge_project_id: workedgeProjectId };
          break;
        }

        case 'unlink-project': {
          if (!jobId) {
            throw new Error('jobId is required');
          }

          // Clear the WorkEdge project ID from the job
          await supabase
            .from('crm_jobs')
            .update({ 
              workedge_project_id: null,
              workedge_last_sync: null
            })
            .eq('id', jobId);

          // Delete synced media from local table
          await supabase
            .from('workedge_project_media')
            .delete()
            .eq('job_id', jobId);

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
