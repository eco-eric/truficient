 import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
 import { User, Session, AuthError } from '@supabase/supabase-js';
 import { supabase } from '@/integrations/supabase/client';
 import { lovable } from '@/integrations/lovable';
  import { diagnoseAuthFetchFailure } from '@/utils/authDiagnostics';
 
 interface AuthState {
   user: User | null;
   session: Session | null;
   loading: boolean;
   isAdmin: boolean;
 }
 
 interface AuthContextType extends AuthState {
   signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
   signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
   signOut: () => Promise<{ error: AuthError | null }>;
   signInWithGoogle: () => Promise<{ error: Error | null }>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [authState, setAuthState] = useState<AuthState>({
     user: null,
     session: null,
     loading: true,
     isAdmin: false,
   });
 
   const checkAdminRole = useCallback(async (userId: string) => {
     try {
       const { data, error } = await supabase
         .from('user_roles' as any)
         .select('role')
         .eq('user_id', userId)
         .eq('role', 'admin')
         .maybeSingle();
 
       return !error && data !== null;
     } catch {
       return false;
     }
   }, []);
 
   // SINGLE auth subscription for the entire app
   useEffect(() => {
     // Set up auth state listener FIRST
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         if (session?.user) {
           // Defer admin check to prevent potential deadlock
           const isAdmin = await checkAdminRole(session.user.id);
           setAuthState({
             session,
             user: session.user,
             isAdmin,
             loading: false,
           });
         } else {
           setAuthState({
             session: null,
             user: null,
             isAdmin: false,
             loading: false,
           });
         }
       }
     );
 
     // THEN check for existing session
     supabase.auth.getSession().then(async ({ data: { session } }) => {
       if (session?.user) {
         const isAdmin = await checkAdminRole(session.user.id);
         setAuthState({
           session,
           user: session.user,
           isAdmin,
           loading: false,
         });
       } else {
         setAuthState({
           session: null,
           user: null,
           isAdmin: false,
           loading: false,
         });
       }
     });
 
     return () => subscription.unsubscribe();
   }, [checkAdminRole]);

    const normalizeNetworkAuthError = async (err: unknown, context: string) => {
      if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('Failed to fetch'))) {
        throw await diagnoseAuthFetchFailure(context);
      }
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    };
 
   const signIn = async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error };
      } catch (err) {
        await normalizeNetworkAuthError(err, 'signInWithPassword');
        // unreachable
        return { error: null };
      }
   };
 
   const signUp = async (email: string, password: string, fullName?: string) => {
     const redirectUrl = `${window.location.origin}/admin`;
     
      try {
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
      } catch (err) {
        await normalizeNetworkAuthError(err, 'signUp');
        return { error: null };
      }
   };
 
   const signOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        return { error };
      } catch (err) {
        await normalizeNetworkAuthError(err, 'signOut');
        return { error: null };
      }
   };
 
   const signInWithGoogle = async () => {
      try {
        const { error } = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin + "/admin",
        });
        return { error: error ?? null };
      } catch (err) {
        await normalizeNetworkAuthError(err, 'googleOAuth');
        return { error: null };
      }
   };
 
   return (
     <AuthContext.Provider value={{ ...authState, signIn, signUp, signOut, signInWithGoogle }}>
       {children}
     </AuthContext.Provider>
   );
 };
 
 export const useAuthContext = () => {
   const context = useContext(AuthContext);
   if (!context) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 };