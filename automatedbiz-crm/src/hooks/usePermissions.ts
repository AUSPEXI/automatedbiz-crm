import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { PERMISSIONS } from '../types/auth';

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserPermissions() {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select(`
            role:roles (
              permissions:role_permissions (
                permission:permissions (name)
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const userPermissions = userRoles
          ?.flatMap(ur => ur.role?.permissions || [])
          .map(p => p.permission.name);

        setPermissions(userPermissions || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permission: keyof typeof PERMISSIONS) => {
    return permissions.includes(PERMISSIONS[permission]);
  };

  const hasAnyPermission = (requiredPermissions: Array<keyof typeof PERMISSIONS>) => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: Array<keyof typeof PERMISSIONS>) => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions, loading };
}