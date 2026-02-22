import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ShieldCheck,
  ShieldOff,
  Pencil,
  KeyRound,
  FileText,
  Trash2,
  LogIn,
  LogOut,
  RefreshCw,
  Loader2,
  History,
  Shield,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  target_user_id: string | null;
  details: Record<string, any>;
  created_at: string;
  actor?: {
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  target?: {
    username: string | null;
    email: string | null;
  };
}

const actionConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  role_promoted: { label: 'Promovido a Admin', icon: <ShieldCheck className="h-3 w-3" />, variant: 'default' },
  role_revoked: { label: 'Admin Revogado', icon: <ShieldOff className="h-3 w-3" />, variant: 'destructive' },
  user_edited: { label: 'Usuário Editado', icon: <Pencil className="h-3 w-3" />, variant: 'secondary' },
  password_reset_sent: { label: 'Reset de Senha', icon: <KeyRound className="h-3 w-3" />, variant: 'outline' },
  article_published: { label: 'Artigo Publicado', icon: <FileText className="h-3 w-3" />, variant: 'default' },
  article_unpublished: { label: 'Artigo Despublicado', icon: <FileText className="h-3 w-3" />, variant: 'secondary' },
  article_deleted: { label: 'Artigo Excluído', icon: <Trash2 className="h-3 w-3" />, variant: 'destructive' },
  user_login: { label: 'Login', icon: <LogIn className="h-3 w-3" />, variant: 'outline' },
  user_logout: { label: 'Logout', icon: <LogOut className="h-3 w-3" />, variant: 'outline' },
  permission_changed: { label: 'Permissão Alterada', icon: <Shield className="h-3 w-3" />, variant: 'secondary' },
  all_permissions_changed: { label: 'Todas Permissões', icon: <Shield className="h-3 w-3" />, variant: 'secondary' },
  super_admin_promoted: { label: 'Promovido Super Admin', icon: <Crown className="h-3 w-3" />, variant: 'default' },
  super_admin_revoked: { label: 'Super Admin Revogado', icon: <Crown className="h-3 w-3" />, variant: 'destructive' },
  audit_log_cleared: { label: 'Log Limpo', icon: <Trash2 className="h-3 w-3" />, variant: 'destructive' },
};

interface AuditLogTableProps {
  limit?: number;
  showFilters?: boolean;
  actionTypes?: string[];
  isSuperAdmin?: boolean;
}

export function AuditLogTable({ limit = 50, showFilters = true, actionTypes, isSuperAdmin = false }: AuditLogTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch audit logs
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      } else if (actionTypes && actionTypes.length > 0) {
        query = query.in('action_type', actionTypes);
      }

      const { data: auditLogs, error } = await query;

      if (error) throw error;

      // Get unique user IDs
      const userIds = new Set<string>();
      auditLogs?.forEach(log => {
        userIds.add(log.user_id);
        if (log.target_user_id) userIds.add(log.target_user_id);
      });

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, email, avatar_url')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Merge data
      const enrichedLogs: AuditLog[] = (auditLogs || []).map(log => ({
        ...log,
        details: (log.details as Record<string, any>) || {},
        actor: profileMap.get(log.user_id),
        target: log.target_user_id ? profileMap.get(log.target_user_id) : undefined,
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!isSuperAdmin) {
      toast.error('Somente o Super Admin pode limpar o log de auditoria');
      return;
    }

    setClearing(true);
    try {
      // Get current user info for the audit log entry
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, insert a log entry recording this action
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action_type: 'audit_log_cleared',
          details: {
            cleared_count: logs.length,
            cleared_at: new Date().toISOString(),
          },
        });

      if (logError) {
        console.error('Error logging clear action:', logError);
      }

      // Delete all audit logs except the one we just created
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('action_type', 'audit_log_cleared');

      if (error) throw error;

      toast.success('Log de auditoria limpo com sucesso');
      setClearDialogOpen(false);
      fetchLogs();
    } catch (error: any) {
      console.error('Error clearing audit logs:', error);
      toast.error('Erro ao limpar log de auditoria');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, limit]);

  const getInitials = (actor?: { username: string | null; email: string | null }) => {
    if (actor?.username) return actor.username.substring(0, 2).toUpperCase();
    if (actor?.email) return actor.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const getActionConfig = (actionType: string) => {
    return actionConfig[actionType] || { label: actionType, icon: <History className="h-3 w-3" />, variant: 'secondary' as const };
  };

  const formatDetails = (log: AuditLog) => {
    const details = log.details;
    if (!details || Object.keys(details).length === 0) return null;

    // Permission changes - show target user info from details
    if (details.permission_key && details.permission_label) {
      const targetInfo = details.target_username || details.target_email;
      const permInfo = `${details.permission_label}: ${details.new_value ? 'Ativado' : 'Desativado'}`;
      return targetInfo ? `${permInfo}` : permInfo;
    }

    // All permissions toggle
    if (details.all_enabled !== undefined) {
      return details.all_enabled ? 'Todas ativadas' : 'Todas desativadas';
    }

    // Super Admin changes
    if (log.action_type === 'super_admin_promoted' || log.action_type === 'super_admin_revoked') {
      return `Usuário: ${details.target_username || details.target_email || '-'}`;
    }

    if (details.old_username !== undefined || details.new_username !== undefined) {
      return `Nome: "${details.old_username || 'vazio'}" → "${details.new_username || 'vazio'}"`;
    }

    if (details.article_title) {
      return `Artigo: ${details.article_title}`;
    }

    return null;
  };

  // Get target info from details if profile not found
  const getTargetInfo = (log: AuditLog) => {
    if (log.target?.username || log.target?.email) {
      return log.target.username || log.target.email;
    }
    // Fallback to details
    if (log.details?.target_username) return log.details.target_username;
    if (log.details?.target_email) return log.details.target_email;
    return null;
  };

  // Get actor info from details if profile not found
  const getActorInfo = (log: AuditLog) => {
    if (log.actor?.username || log.actor?.email) {
      return log.actor.username || log.actor.email;
    }
    // Fallback to details
    if (log.details?.actor_username) return log.details.actor_username;
    if (log.details?.actor_email) return log.details.actor_email;
    return 'Desconhecido';
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="role_promoted">Promoção a Admin</SelectItem>
              <SelectItem value="role_revoked">Revogação de Admin</SelectItem>
              <SelectItem value="user_edited">Edição de Usuário</SelectItem>
              <SelectItem value="password_reset_sent">Reset de Senha</SelectItem>
              <SelectItem value="article_published">Artigo Publicado</SelectItem>
              <SelectItem value="article_deleted">Artigo Excluído</SelectItem>
              <SelectItem value="audit_log_cleared">Log Limpo</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {isSuperAdmin && logs.length > 0 && (
              <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={clearing}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Log
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Limpar Log de Auditoria
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Esta ação irá <strong>excluir permanentemente</strong> todos os registros do log de auditoria.
                      </p>
                      <p className="text-destructive font-medium">
                        Esta ação não pode ser desfeita!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Um registro desta limpeza será mantido para fins de auditoria.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={clearing}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearLogs}
                      disabled={clearing}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {clearing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Limpando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Limpar Tudo
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Alvo</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro de auditoria encontrado
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const config = getActionConfig(log.action_type);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={log.actor?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(log.actor)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">
                          {getActorInfo(log)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="text-sm truncate max-w-[120px]">
                        {getTargetInfo(log) || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {formatDetails(log) || '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
