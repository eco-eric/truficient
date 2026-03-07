import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OTTOPAY_URL = import.meta.env.VITE_OTTOPAY_SUPABASE_URL;
const OTTOPAY_KEY = import.meta.env.VITE_OTTOPAY_SERVICE_KEY;

// Guard: only create a real client when env vars are present
export const ottopay: SupabaseClient = OTTOPAY_URL && OTTOPAY_KEY
  ? createClient(OTTOPAY_URL, OTTOPAY_KEY)
  : new Proxy({} as SupabaseClient, {
      get: () => () => ({ data: null, error: { message: 'Otto Pay not configured' } }),
    });
