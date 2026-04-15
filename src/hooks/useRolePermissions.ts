import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

const CACHE_KEY = 'cached_permissions';

function getCachedPermissions(): Set<string> | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return new Set(JSON.parse(cached) as string[]);
  } catch {}
  return null;
}

function setCachedPermissions(perms: Set<string>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify([...perms]));
  } catch {}
}

interface UseRolePermissionsResult {
  permissions: Set<string>;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useRolePermissions = (): UseRolePermissionsResult => {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { role, isSuperAdmin, loading: roleLoading } = useUserRole();

  const fetchPermissions = async () => {
    if (isSuperAdmin) {
      const perms = new Set(['*']);
      setPermissions(perms);
      setCachedPermissions(perms);
      setLoading(false);
      return;
    }

    if (!role || roleLoading) return;

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled')
        .eq('role', role)
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching permissions:', error);
        setPermissions(new Set());
        return;
      }

      const enabledPermissions = new Set(
        data?.map(p => p.permission_key) || []
      );
      setPermissions(enabledPermissions);
      setCachedPermissions(enabledPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      fetchPermissions();
    }
  }, [role, isSuperAdmin, roleLoading]);

  return {
    permissions,
    loading: loading || roleLoading,
    refetch: fetchPermissions,
  };
};

// Utility to check if user has a specific permission
export const hasPermission = (
  permissions: Set<string>,
  permissionKey: string,
  isSuperAdmin: boolean
): boolean => {
  if (isSuperAdmin || permissions.has('*')) return true;
  return permissions.has(permissionKey);
};
