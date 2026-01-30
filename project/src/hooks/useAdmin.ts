import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface AdminUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenant_id?: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      setPermissions([]);
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const userRole = (user as any)?.role?.toLowerCase();
      const userEmail = (user as any)?.email?.toLowerCase();

      const adminRoles = ['owner', 'admin', 'super_admin', 'tenant_admin'];
      const isAdminRole = adminRoles.includes(userRole);
      const isAdminEmail = userEmail === 'nedpearson@gmail.com';

      setIsAdmin(isAdminRole || isAdminEmail);
      setRoles(userRole ? [userRole] : []);

      if (userRole === 'owner' || userRole === 'admin' || userRole === 'super_admin' || isAdminEmail) {
        setPermissions(['*']);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error loading admin status:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes('*') || permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role.toLowerCase());
  };

  return {
    isAdmin,
    permissions,
    roles,
    loading,
    hasPermission,
    hasRole,
  };
}

export function logAuditAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  beforeState?: any,
  afterState?: any
) {
  try {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      before_state: beforeState,
      after_state: afterState,
      user_agent: navigator.userAgent,
    };

    console.log('[Audit Log]', auditLog);

    const logs = JSON.parse(localStorage.getItem('pnx_audit_logs') || '[]');
    logs.push(auditLog);

    if (logs.length > 1000) {
      logs.shift();
    }

    localStorage.setItem('pnx_audit_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
}
