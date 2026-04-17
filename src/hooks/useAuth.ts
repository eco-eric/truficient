import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let resolved = false;

    const finish = (session: Session | null) => {
      resolved = true;
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
      if (!session?.user) {
        try {
          sessionStorage.removeItem('cached_user_role');
          sessionStorage.removeItem('cached_permissions');
        } catch {}
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => finish(session)
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => finish(session))
      .catch((err) => {
        console.error('getSession failed, clearing auth:', err);
        try {
          // Clear potentially corrupted auth tokens so the user can recover
          Object.keys(localStorage)
            .filter((k) => k.startsWith('sb-') && k.includes('-auth-token'))
            .forEach((k) => localStorage.removeItem(k));
        } catch {}
        finish(null);
      });

    // Safety net: never hang the UI on a stalled getSession() call
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth init timed out after 5s — proceeding as signed out');
        finish(null);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/admin`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear caches before signing out
    try {
      sessionStorage.removeItem('cached_user_role');
      sessionStorage.removeItem('cached_permissions');
    } catch {}
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
