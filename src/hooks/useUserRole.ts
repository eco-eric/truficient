import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'technician' | 'lead_tech' | 'installer' | 'helper';

const CACHE_KEY = 'cached_user_role';

function getCachedRole(): AppRole | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return cached as AppRole;
  } catch {}
  return null;
}

function setCachedRole(role: AppRole | null) {
  try {
    if (role) {
      sessionStorage.setItem(CACHE_KEY, role);
    } else {
      sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {}
}

interface UserRoleState {
  role: AppRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTechnician: boolean;
  isLeadTech: boolean;
  isInstaller: boolean;
  isHelper: boolean;
  isFieldRole: boolean;
  hasAccess: boolean;
}

export const useUserRole = (): UserRoleState => {
  const { user, loading: authLoading } = useAuth();
  const cachedRole = getCachedRole();
  const [role, setRole] = useState<AppRole | null>(cachedRole);
  const [loading, setLoading] = useState(!cachedRole);

  useEffect(() => {
    const fetchRole = async () => {
      if (authLoading) return;

      if (!user) {
        setRole(null);
        setCachedRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('No role found for user');
          setRole(null);
          setCachedRole(null);
        } else {
          const newRole = data.role as AppRole;
          setRole(newRole);
          setCachedRole(newRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
        setCachedRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading]);

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isManager = role === 'manager';
  const isTechnician = role === 'technician';
  const isLeadTech = role === 'lead_tech';
  const isInstaller = role === 'installer';
  const isHelper = role === 'helper';
  const isFieldRole = isTechnician || isLeadTech || isInstaller || isHelper;

  return {
    role,
    loading,
    isSuperAdmin,
    isAdmin,
    isManager,
    isTechnician,
    isLeadTech,
    isInstaller,
    isHelper,
    isFieldRole,
    hasAccess: isSuperAdmin || isAdmin || isManager || isFieldRole,
  };
};
