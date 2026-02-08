import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

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
    // If super_admin, they have all permissions - no need to query
    if (isSuperAdmin) {
      setPermissions(new Set(['*'])); // Special marker for "all permissions"
      setLoading(false);
      return;
    }

    // If no role or still loading, wait
    if (!role || roleLoading) {
      return;
    }

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
  // Super admins always have all permissions
  if (isSuperAdmin || permissions.has('*')) {
    return true;
  }
  return permissions.has(permissionKey);
};
