import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OTTOPAY_URL = import.meta.env.VITE_OTTOPAY_SUPABASE_URL;
const OTTOPAY_KEY = import.meta.env.VITE_OTTOPAY_SERVICE_KEY;

const notConfiguredResult = {
  data: null,
  error: { message: 'Otto Pay not configured (missing VITE_OTTOPAY_SUPABASE_URL or VITE_OTTOPAY_SERVICE_KEY)' },
};

// Guard: only create a real client when env vars are present
const createQueryBuilderProxy = (): any => {
  const proxy = new Proxy(
    {},
    {
      get: (_target, prop) => {
        // Make awaited chains resolve immediately with a deterministic error
        if (prop === 'then') {
          return (resolve: (value: typeof notConfiguredResult) => void) => resolve(notConfiguredResult);
        }
        if (prop === 'catch') {
          return () => proxy;
        }
        if (prop === 'finally') {
          return () => Promise.resolve(notConfiguredResult);
        }

        // Allow arbitrary chain calls: .select().eq().order().single() etc.
        return () => proxy;
      },
    }
  );

  return proxy;
};

const notConfiguredProxy: any = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    if (prop === 'from') {
      return () => createQueryBuilderProxy();
    }

    // Any direct method calls should fail fast with the same result shape
    return async () => notConfiguredResult;
  },
});

export const ottopay: SupabaseClient = OTTOPAY_URL && OTTOPAY_KEY
  ? createClient(OTTOPAY_URL, OTTOPAY_KEY)
  : notConfiguredProxy;

