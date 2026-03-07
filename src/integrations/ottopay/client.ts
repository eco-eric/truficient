import { createClient } from '@supabase/supabase-js';

const OTTOPAY_URL = import.meta.env.VITE_OTTOPAY_SUPABASE_URL;
const OTTOPAY_KEY = import.meta.env.VITE_OTTOPAY_SERVICE_KEY;

export const ottopay = createClient(OTTOPAY_URL, OTTOPAY_KEY);
