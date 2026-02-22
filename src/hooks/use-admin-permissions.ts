import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from './use-audit-log';
import { toast } from 'sonner';

export interface AdminPermissions {
  id: string;
  user_id: string;
  can_manage_articles: boolean;
  can_generate_content: boolean;
  can_use_autopilot: boolean;
  can_use_video_autopilot: boolean;
  can_manage_affiliates: boolean;
  can_manage_videos: boolean;
  can_manage_image_queue: boolean;
  can_manage_image_library: boolean;
  can_manage_messages: boolean;
  can_manage_newsletter: boolean;
  can_manage_email_templates: boolean;
  can_manage_users: boolean;
  can_manage_settings: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminWithPermissions {
  user_id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  permissions: AdminPermissions | null;
  isSuperAdmin: boolean;
}

// Default permissions for new admins
export const DEFAULT_PERMISSIONS: Omit<AdminPermissions, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  can_manage_articles: true,
  can_generate_content: true,
  can_use_autopilot: true,
  can_use_video_autopilot: true,
  can_manage_affiliates: true,
  can_manage_videos: true,
  can_manage_image_queue: true,
  can_manage_image_library: true,
  can_manage_messages: true,
  can_manage_newsletter: true,
  can_manage_email_templates: true,
  can_manage_users: false,
  can_manage_settings: false,
  is_super_admin: false,
};

// Permission labels for UI (excluding is_super_admin which is handled separately)
export const PERMISSION_LABELS: Record<Exclude<keyof typeof DEFAULT_PERMISSIONS, 'is_super_admin'>, { label: string; description: string; category: string }> = {
  can_manage_articles: {
    label: 'Gerenciar Artigos',
    description: 'Criar, editar e excluir artigos',
    category: 'Conteúdo',
  },
  can_generate_content: {
    label: 'Gerar Conteúdo',
    description: 'Usar o gerador de conteúdo com IA',
    category: 'Conteúdo',
  },
  can_manage_affiliates: {
    label: 'Gerenciar Afiliados',
    description: 'Configurar banners e links de afiliados',
    category: 'Conteúdo',
  },
  can_manage_videos: {
    label: 'Gerenciar Vídeos',
    description: 'Configurar e gerenciar vídeos dos artigos',
    category: 'Conteúdo',
  },
  can_use_autopilot: {
    label: 'Piloto Automático',
    description: 'Configurar e usar geração automática de artigos',
    category: 'Automação',
  },
  can_use_video_autopilot: {
    label: 'Vídeo AutoPilot',
    description: 'Configurar e usar geração automática de vídeos',
    category: 'Automação',
  },
  can_manage_image_queue: {
    label: 'Fila de Imagens',
    description: 'Gerenciar fila de geração de imagens',
    category: 'Imagens',
  },
  can_manage_image_library: {
    label: 'Biblioteca de Imagens',
    description: 'Acessar e gerenciar biblioteca de imagens',
    category: 'Imagens',
  },
  can_manage_messages: {
    label: 'Mensagens',
    description: 'Visualizar e responder mensagens de contato',
    category: 'Comunicação',
  },
  can_manage_newsletter: {
    label: 'Newsletter',
    description: 'Gerenciar assinantes e enviar newsletters',
    category: 'Comunicação',
  },
  can_manage_email_templates: {
    label: 'Templates de E-mail',
    description: 'Criar e editar templates de e-mail',
    category: 'Comunicação',
  },
  can_manage_users: {
    label: 'Gerenciar Usuários',
    description: 'Adicionar, editar e remover usuários',
    category: 'Sistema',
  },
  can_manage_settings: {
    label: 'Configurações',
    description: 'Acessar configurações do sistema',
    category: 'Sistema',
  },
};

export function useAdminPermissions() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [admins, setAdmins] = useState<AdminWithPermissions[]>([]);
  const [currentUserPermissions, setCurrentUserPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super admin
  const checkSuperAdmin = useCallback(async () => {
    if (!user) return false;
    
    // First check is_super_admin field in permissions
    const { data: permissions } = await supabase
      .from('admin_permissions')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (permissions?.is_super_admin) {
      setIsSuperAdmin(true);
      return true;
    }
    
    // Fallback: username contains "walliston"
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();
    
    const isSuper = profile?.username?.toLowerCase().includes('walliston') || false;
    setIsSuperAdmin(isSuper);
    return isSuper;
  }, [user]);

  // Fetch all admins with their permissions
  const fetchAdmins = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all admin user_ids
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) {
        setAdmins([]);
        setIsLoading(false);
        return;
      }

      const adminUserIds = adminRoles.map(r => r.user_id);

      // Get profiles for admins
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, username, avatar_url')
        .in('user_id', adminUserIds);

      if (profilesError) throw profilesError;

      // Get permissions for admins
      const { data: permissions, error: permissionsError } = await supabase
        .from('admin_permissions')
        .select('*')
        .in('user_id', adminUserIds);

      if (permissionsError) throw permissionsError;

      // Merge data
      const adminsWithPermissions: AdminWithPermissions[] = (profiles || []).map(profile => {
        const perm = permissions?.find(p => p.user_id === profile.user_id) || null;
        // Check is_super_admin field first, then fallback to username
        const isSuper = perm?.is_super_admin || profile.username?.toLowerCase().includes('walliston') || false;
        
        return {
          user_id: profile.user_id,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url,
          permissions: perm,
          isSuperAdmin: isSuper,
        };
      });

      // Sort: Super Admin first, then by username
      adminsWithPermissions.sort((a, b) => {
        if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
        if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
        return (a.username || a.email || '').localeCompare(b.username || b.email || '');
      });

      setAdmins(adminsWithPermissions);

      // Set current user permissions
      const currentUserPerm = permissions?.find(p => p.user_id === user.id) || null;
      setCurrentUserPermissions(currentUserPerm);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update permission for an admin
  const updatePermission = async (
    targetUserId: string, 
    permissionKey: keyof typeof DEFAULT_PERMISSIONS, 
    value: boolean
  ): Promise<boolean> => {
    try {
      // Check if permissions record exists
      const { data: existing, error: existingError } = await supabase
        .from('admin_permissions')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error checking existing permissions:', existingError);
        throw existingError;
      }

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('admin_permissions')
          .update({ [permissionKey]: value, updated_at: new Date().toISOString() })
          .eq('user_id', targetUserId);

        if (error) throw error;
      } else {
        // Insert new with defaults
        const { error } = await supabase
          .from('admin_permissions')
          .insert({
            user_id: targetUserId,
            ...DEFAULT_PERMISSIONS,
            [permissionKey]: value,
          });

        if (error) throw error;
      }

      // Update local state
      setAdmins(prev => prev.map(admin => {
        if (admin.user_id === targetUserId) {
          const updatedPermissions = admin.permissions 
            ? { ...admin.permissions, [permissionKey]: value }
            : { ...DEFAULT_PERMISSIONS, user_id: targetUserId, [permissionKey]: value } as any;
          return { ...admin, permissions: updatedPermissions };
        }
        return admin;
      }));

      // Show success toast for individual permission change
      const permLabel = PERMISSION_LABELS[permissionKey as keyof typeof PERMISSION_LABELS]?.label || permissionKey;
      toast.success(`${permLabel} ${value ? 'ativado' : 'desativado'}`);

      // Log audit
      const targetAdmin = admins.find(a => a.user_id === targetUserId);
      await logAction({
        action_type: 'permission_changed',
        target_user_id: targetUserId,
        details: {
          permission_key: permissionKey,
          permission_label: permLabel,
          new_value: value,
          target_username: targetAdmin?.username,
          target_email: targetAdmin?.email,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissão');
      return false;
    }
  };

  // Toggle all permissions for an admin
  const setAllPermissions = async (targetUserId: string, enabled: boolean): Promise<boolean> => {
    try {
      const allPermissions: Record<string, boolean> = {};
      Object.keys(DEFAULT_PERMISSIONS).forEach(key => {
        // Don't change is_super_admin with bulk toggle
        if (key !== 'is_super_admin') {
          allPermissions[key] = enabled;
        }
      });

      const { data: existing, error: existingError } = await supabase
        .from('admin_permissions')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error checking existing permissions:', existingError);
        throw existingError;
      }

      if (existing) {
        const { error } = await supabase
          .from('admin_permissions')
          .update({ ...allPermissions, updated_at: new Date().toISOString() })
          .eq('user_id', targetUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_permissions')
          .insert({
            user_id: targetUserId,
            ...allPermissions,
          });

        if (error) throw error;
      }

      // Update local state
      setAdmins(prev => prev.map(admin => {
        if (admin.user_id === targetUserId) {
          const updatedPermissions = { 
            ...admin.permissions, 
            ...allPermissions,
            user_id: targetUserId,
          } as AdminPermissions;
          return { ...admin, permissions: updatedPermissions };
        }
        return admin;
      }));

      toast.success(enabled ? 'Todas permissões ativadas' : 'Todas permissões desativadas');

      // Log audit
      const targetAdmin = admins.find(a => a.user_id === targetUserId);
      await logAction({
        action_type: 'all_permissions_changed',
        target_user_id: targetUserId,
        details: {
          all_enabled: enabled,
          target_username: targetAdmin?.username,
          target_email: targetAdmin?.email,
        },
      });

      return true;
    } catch (error) {
      console.error('Error setting all permissions:', error);
      toast.error('Erro ao atualizar permissões');
      return false;
    }
  };

  // Toggle super admin status for an admin
  const toggleSuperAdmin = async (targetUserId: string, isSuperAdminValue: boolean): Promise<boolean> => {
    try {
      const { data: existing } = await supabase
        .from('admin_permissions')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('admin_permissions')
          .update({ is_super_admin: isSuperAdminValue, updated_at: new Date().toISOString() })
          .eq('user_id', targetUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_permissions')
          .insert({
            user_id: targetUserId,
            ...DEFAULT_PERMISSIONS,
            is_super_admin: isSuperAdminValue,
          });

        if (error) throw error;
      }

      // Update local state
      setAdmins(prev => prev.map(admin => {
        if (admin.user_id === targetUserId) {
          const updatedPermissions = admin.permissions 
            ? { ...admin.permissions, is_super_admin: isSuperAdminValue }
            : { ...DEFAULT_PERMISSIONS, user_id: targetUserId, is_super_admin: isSuperAdminValue } as any;
          return { ...admin, permissions: updatedPermissions, isSuperAdmin: isSuperAdminValue };
        }
        return admin;
      }));

      toast.success(isSuperAdminValue ? 'Promovido a Super Admin' : 'Super Admin revogado');

      // Log audit
      const targetAdmin = admins.find(a => a.user_id === targetUserId);
      await logAction({
        action_type: isSuperAdminValue ? 'super_admin_promoted' : 'super_admin_revoked',
        target_user_id: targetUserId,
        details: {
          target_username: targetAdmin?.username,
          target_email: targetAdmin?.email,
        },
      });

      return true;
    } catch (error) {
      console.error('Error toggling super admin:', error);
      toast.error('Erro ao alterar status de Super Admin');
      return false;
    }
  };

  // Check if current user has a specific permission
  const hasPermission = (permissionKey: keyof typeof DEFAULT_PERMISSIONS): boolean => {
    // Super admin has all permissions
    if (isSuperAdmin) return true;
    
    // If no permissions record, use defaults
    if (!currentUserPermissions) return DEFAULT_PERMISSIONS[permissionKey];
    
    return currentUserPermissions[permissionKey];
  };

  // Initialize
  useEffect(() => {
    if (user) {
      checkSuperAdmin();
      fetchAdmins();
    } else {
      // No user - set loading to false immediately
      setIsLoading(false);
      setIsSuperAdmin(false);
    }
  }, [user, checkSuperAdmin, fetchAdmins]);

  return {
    admins,
    currentUserPermissions,
    isLoading,
    isSuperAdmin,
    hasPermission,
    updatePermission,
    setAllPermissions,
    toggleSuperAdmin,
    refetch: fetchAdmins,
  };
}