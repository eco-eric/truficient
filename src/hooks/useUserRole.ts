import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'admin' | 'manager';

interface UserRoleState {
  role: AppRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  hasAccess: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      // Wait for auth to complete first
      if (authLoading) {
        return; // Keep loading=true, don't proceed
      }

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Reset loading when starting fetch
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // No role found - user doesn't have admin access
          console.log('No role found for user');
          setRole(null);
        } else {
          setRole(data.role as AppRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading]);

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isManager = role === 'manager';

  return {
    role,
    loading,
    isSuperAdmin,
    isAdmin,
    isManager,
    hasAccess: isSuperAdmin || isAdmin || isManager,
  };
};
