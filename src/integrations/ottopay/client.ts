/**
 * Otto Pay API Client
 * Routes all requests through the api-sync edge function instead of direct DB access.
 */

const API_BASE = import.meta.env.VITE_OTTOPAY_SUPABASE_URL;
const SYNC_KEY = import.meta.env.VITE_OTTOPAY_SYNC_KEY;
const BUSINESS_ID = import.meta.env.VITE_OTTOPAY_BUSINESS_ID;

const API_URL = API_BASE ? `${API_BASE}/functions/v1/api-sync` : '';

const isConfigured = !!(API_BASE && SYNC_KEY && BUSINESS_ID);

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': SYNC_KEY || '',
    'x-business-id': BUSINESS_ID || '',
  };
}

export interface OttoApiResponse<T = any> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * GET a resource (list or single by id)
 */
export async function ottoGet<T = any>(
  resource: string,
  params?: {
    id?: string;
    select?: string;
    order?: string;
    limit?: number;
    filters?: Record<string, string>;
  }
): Promise<OttoApiResponse<T>> {
  if (!isConfigured) {
    return { data: null, error: { message: 'Otto Pay not configured' } };
  }

  const url = new URL(API_URL);
  url.searchParams.set('resource', resource);
  if (params?.id) url.searchParams.set('id', params.id);
  if (params?.select) url.searchParams.set('select', params.select);
  if (params?.order) url.searchParams.set('order', params.order);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      url.searchParams.set(`filter.${key}`, value);
    }
  }

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    return { data: null, error: { message: `API error ${res.status}: ${body}` } };
  }
  return res.json();
}

/**
 * POST — create a new record
 */
export async function ottoPost<T = any>(
  resource: string,
  data: Record<string, any>
): Promise<OttoApiResponse<T>> {
  if (!isConfigured) {
    return { data: null, error: { message: 'Otto Pay not configured' } };
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ resource, data }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { data: null, error: { message: `API error ${res.status}: ${body}` } };
  }
  return res.json();
}

/**
 * PATCH — update an existing record
 */
export async function ottoPatch<T = any>(
  resource: string,
  id: string,
  data: Record<string, any>
): Promise<OttoApiResponse<T>> {
  if (!isConfigured) {
    return { data: null, error: { message: 'Otto Pay not configured' } };
  }

  const res = await fetch(API_URL, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ resource, id, data }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { data: null, error: { message: `API error ${res.status}: ${body}` } };
  }
  return res.json();
}

/**
 * DELETE a record
 */
export async function ottoDelete(
  resource: string,
  id: string
): Promise<OttoApiResponse<null>> {
  if (!isConfigured) {
    return { data: null, error: { message: 'Otto Pay not configured' } };
  }

  const url = new URL(API_URL);
  url.searchParams.set('resource', resource);
  url.searchParams.set('id', id);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) {
    const body = await res.text();
    return { data: null, error: { message: `API error ${res.status}: ${body}` } };
  }
  return res.json();
}

/**
 * Upload a file (still uses the Supabase storage directly if needed,
 * but can be routed through api-sync if the endpoint supports it)
 */
export async function ottoUpload(
  bucket: string,
  path: string,
  file: File
): Promise<OttoApiResponse<{ publicUrl: string }>> {
  if (!isConfigured) {
    return { data: null, error: { message: 'Otto Pay not configured' } };
  }

  // For file uploads, we POST multipart to a dedicated upload resource
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('path', path);

  const res = await fetch(`${API_URL}?resource=upload`, {
    method: 'POST',
    headers: {
      'x-api-key': SYNC_KEY || '',
      'x-business-id': BUSINESS_ID || '',
      // Don't set Content-Type — browser sets multipart boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    return { data: null, error: { message: `Upload error ${res.status}: ${body}` } };
  }
  return res.json();
}

// Re-export for backward compatibility checks
export const isOttoPayConfigured = isConfigured;
