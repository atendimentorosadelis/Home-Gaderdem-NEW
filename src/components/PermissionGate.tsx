import React from 'react';
import { useAdminPermissions, DEFAULT_PERMISSIONS } from '@/hooks/use-admin-permissions';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface PermissionGateProps {
  permission: keyof typeof DEFAULT_PERMISSIONS;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que verifica se o usuário tem permissão para acessar o conteúdo.
 * Super Admins sempre têm acesso a tudo.
 */
export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { hasPermission, isLoading, isSuperAdmin } = useAdminPermissions();

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Check permission
  const hasAccess = isSuperAdmin || hasPermission(permission);

  if (!hasAccess) {
    // Use custom fallback or default access denied UI
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground max-w-md">
            Você não tem permissão para acessar esta funcionalidade.
            Entre em contato com o Super Administrador para solicitar acesso.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}

/**
 * Hook para verificar permissão de forma imperativa
 */
export function usePermissionCheck(permission: keyof typeof DEFAULT_PERMISSIONS) {
  const { hasPermission, isLoading, isSuperAdmin } = useAdminPermissions();
  
  return {
    hasAccess: isSuperAdmin || hasPermission(permission),
    isLoading,
    isSuperAdmin,
  };
}
