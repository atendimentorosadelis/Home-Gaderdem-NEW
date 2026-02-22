import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { useArticleVideos } from '@/hooks/use-article-videos';
import { useVideoStats } from '@/hooks/use-video-stats';
import { useVideoGenerationLogs, VideoGenerationLog } from '@/hooks/use-video-generation-logs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Youtube,
  Power,
  Loader2,
  Zap,
  Video,
  VideoOff,
  TrendingUp,
  Calendar,
  Settings2,
  PlayCircle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

function VideoAutoPilotContent() {
  const {
    settings,
    isLoading,
    isProcessing,
    toggleGlobalEnabled,
    updateDailyLimit,
    processQueue,
    getStats,
  } = useArticleVideos();

  const { data: videoStats, isLoading: isLoadingStats } = useVideoStats();
  const { 
    logs, 
    isLoading: isLoadingLogs, 
    page, 
    setPage, 
    totalPages, 
    totalCount,
    refetch: refetchLogs,
    clearLogs 
  } = useVideoGenerationLogs(10);
  const isMobile = useIsMobile();

  const [dailyLimitInput, setDailyLimitInput] = useState('');
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false);
  const [batchSize, setBatchSize] = useState('5');
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const stats = getStats();

  // Sync dailyLimitInput with settings
  useEffect(() => {
    if (settings.daily_limit) {
      setDailyLimitInput(settings.daily_limit.toString());
    }
  }, [settings.daily_limit]);

  const handleDailyLimitSave = () => {
    const limit = parseInt(dailyLimitInput, 10);
    if (!isNaN(limit) && limit > 0) {
      updateDailyLimit(limit);
    }
  };

  const handleProcessQueue = async () => {
    const size = parseInt(batchSize, 10);
    await processQueue(isNaN(size) || size < 1 ? 5 : size);
    refetchLogs();
  };

  const handleClearLogs = async () => {
    setIsClearingLogs(true);
    const success = await clearLogs();
    if (success) {
      toast.success('Logs limpos com sucesso');
    } else {
      toast.error('Erro ao limpar logs');
    }
    setIsClearingLogs(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Youtube className="h-8 w-8 text-red-500" />
            Vídeos Automáticos
          </h1>
          <p className="text-muted-foreground">
            Geração automática de vídeos do YouTube para artigos publicados
          </p>
        </div>

        {/* Main Power Toggle Card */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-700 border-2",
          settings.enabled 
            ? "border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 via-green-500/5 to-transparent shadow-2xl shadow-emerald-500/20" 
            : "border-border bg-card"
        )}>
          {/* Animated background effects when active */}
          {settings.enabled && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/25 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-green-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          )}

          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Power Button - Large and Central */}
              <button
                onClick={async () => {
                  setIsTogglingEnabled(true);
                  await toggleGlobalEnabled(!settings.enabled);
                  setIsTogglingEnabled(false);
                }}
                disabled={isTogglingEnabled}
                className={cn(
                  "relative w-28 h-28 md:w-32 md:h-32 rounded-3xl flex items-center justify-center transition-all duration-500 cursor-pointer group",
                  settings.enabled
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105"
                    : "bg-muted hover:bg-muted/80 hover:scale-105 border-2 border-dashed border-muted-foreground/30"
                )}
              >
                {isTogglingEnabled ? (
                  <Loader2 className="h-12 w-12 md:h-14 md:w-14 text-white animate-spin" />
                ) : (
                  <>
                    <Power className={cn(
                      "h-12 w-12 md:h-14 md:w-14 transition-all duration-300",
                      settings.enabled ? "text-white drop-shadow-lg" : "text-muted-foreground"
                    )} />
                    {settings.enabled && (
                      <>
                        <div className="absolute inset-0 rounded-3xl animate-ping bg-emerald-500/30" style={{ animationDuration: '2s' }} />
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-green-500/20 blur-md" />
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Status Text */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <span className={cn(
                    "text-3xl md:text-4xl font-black tracking-tight transition-colors duration-300",
                    settings.enabled ? "text-emerald-500" : "text-foreground"
                  )}>
                    {settings.enabled ? 'ATIVO' : 'PAUSADO'}
                  </span>
                  {settings.enabled && (
                    <div className="relative">
                      <Youtube className="h-7 w-7 text-emerald-500" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                  {settings.enabled 
                    ? 'Buscando vídeos do YouTube automaticamente para artigos sem vídeo' 
                    : 'Clique no botão acima para ativar a busca automática de vídeos'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Hoje
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-500">
                {isLoadingStats ? <Skeleton className="h-9 w-12" /> : videoStats?.videosAddedToday || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">vídeos processados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Limite
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {settings.daily_limit}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">por dia</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <VideoOff className="h-4 w-4" />
                Pendentes
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-500">
                {stats.withoutVideo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">artigos sem vídeo</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Total
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">
                {isLoadingStats ? <Skeleton className="h-9 w-12" /> : videoStats?.totalVideos || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">vídeos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Cobertura de Vídeos
            </CardTitle>
            <CardDescription>
              Porcentagem de artigos publicados com vídeo associado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress 
                value={isLoadingStats ? 0 : videoStats?.coveragePercentage || 0} 
                className="flex-1 h-4"
              />
              <span className="text-2xl font-bold text-emerald-500 min-w-[4rem] text-right">
                {isLoadingStats ? <Skeleton className="h-8 w-12" /> : `${videoStats?.coveragePercentage || 0}%`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Com vídeo: {stats.withVideo}</span>
              <span>Sem vídeo: {stats.withoutVideo}</span>
              <span>Total: {stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily Limit Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Limite diário de processamento</Label>
                <div className="flex gap-2">
                  <Input
                    id="daily-limit"
                    type="number"
                    min="1"
                    max="100"
                    value={dailyLimitInput}
                    onChange={(e) => setDailyLimitInput(e.target.value)}
                    className="flex-1"
                    placeholder="Ex: 10"
                  />
                  <Button onClick={handleDailyLimitSave} variant="default">
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Define quantos vídeos serão buscados automaticamente por dia
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlayCircle className="h-5 w-5" />
                Processamento Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch-size">Quantidade de artigos a processar</Label>
                <div className="flex gap-2">
                  <Input
                    id="batch-size"
                    type="number"
                    min="1"
                    max="20"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="flex-1"
                    placeholder="Ex: 5"
                  />
                  <Button 
                    onClick={handleProcessQueue} 
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {isMobile ? 'Processar' : 'Processar Agora'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Executa a busca de vídeos imediatamente para os artigos pendentes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Execution Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Histórico de Execuções
              </CardTitle>
              <CardDescription>
                {totalCount} execuções registradas
              </CardDescription>
            </div>
            {totalCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" disabled={isClearingLogs}>
                    {isClearingLogs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {!isMobile && 'Limpar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover todos os {totalCount} registros de execução. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearLogs}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingLogs ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma execução registrada ainda</p>
                <p className="text-sm mt-1">Execute o processamento manual para ver os logs aqui</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Página {page + 1} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Youtube className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Como funciona?</p>
                <p>
                  O sistema utiliza IA para gerar termos de busca otimizados baseados no título e conteúdo de cada artigo, 
                  encontra vídeos relevantes no YouTube e salva automaticamente para exibição ao final dos artigos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Log item component
function LogItem({ log }: { log: VideoGenerationLog }) {
  const isSuccess = log.status === 'success';
  const isError = log.status === 'error';
  const isPending = log.status === 'pending';

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      isSuccess && "bg-emerald-500/5 border-emerald-500/20",
      isError && "bg-destructive/5 border-destructive/20",
      isPending && "bg-muted/50 border-border"
    )}>
      {/* Status Icon */}
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isSuccess && "bg-emerald-500/20 text-emerald-500",
        isError && "bg-destructive/20 text-destructive",
        isPending && "bg-muted text-muted-foreground"
      )}>
        {isSuccess && <CheckCircle2 className="h-4 w-4" />}
        {isError && <XCircle className="h-4 w-4" />}
        {isPending && <Clock className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground text-sm line-clamp-1">
            {log.article_title || 'Artigo desconhecido'}
          </p>
          <Badge variant={isSuccess ? 'default' : isError ? 'destructive' : 'secondary'} className="shrink-0 text-xs">
            {isSuccess ? 'Sucesso' : isError ? 'Erro' : 'Pendente'}
          </Badge>
        </div>
        
        {log.error_message && (
          <p className="text-xs text-destructive mt-1 line-clamp-2">{log.error_message}</p>
        )}
        
        {log.video_id && isSuccess && (
          <p className="text-xs text-muted-foreground mt-1">
            Vídeo: {log.video_id}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true, locale: ptBR })}
          </span>
          {log.duration_ms && (
            <span>{(log.duration_ms / 1000).toFixed(1)}s</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoAutoPilot() {
  return (
    <PermissionGate permission="can_use_video_autopilot">
      <VideoAutoPilotContent />
    </PermissionGate>
  );
}
