import { useState, useEffect } from 'react';
import { Bot, Zap, FileText, Image, CheckCircle2, Loader2, Clock, Sparkles, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutoGenerationLog {
  id: string;
  article_id: string | null;
  topic_used: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  error_message: string | null;
  executed_at: string;
  duration_ms: number | null;
}

// Etapas simuladas do processo de geração
const GENERATION_STEPS = [
  { id: 'init', label: 'Iniciando geração', icon: Zap },
  { id: 'topic', label: 'Selecionando tema', icon: Sparkles },
  { id: 'content', label: 'Gerando conteúdo', icon: FileText },
  { id: 'images', label: 'Enfileirando imagens', icon: Image },
  { id: 'save', label: 'Salvando artigo', icon: CheckCircle2 },
  { id: 'notify', label: 'Enviando notificações', icon: Send },
];

export function AutoPilotProgressCard() {
  const [currentLog, setCurrentLog] = useState<AutoGenerationLog | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Realtime subscription para detectar logs "running"
  useEffect(() => {
    const fetchRunningLog = async () => {
      const { data } = await supabase
        .from('auto_generation_logs')
        .select('*')
        .eq('status', 'running')
        .order('executed_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setCurrentLog(data[0] as AutoGenerationLog);
        setStartTime(new Date(data[0].executed_at).getTime());
      }
    };

    fetchRunningLog();

    const channel = supabase
      .channel('autopilot-progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auto_generation_logs' },
        (payload) => {
          const log = payload.new as AutoGenerationLog;
          
          if (payload.eventType === 'INSERT' && log.status === 'running') {
            setCurrentLog(log);
            setStartTime(new Date(log.executed_at).getTime());
            setProgress(0);
            setCurrentStep(0);
          } else if (payload.eventType === 'UPDATE') {
            if (log.status === 'success' || log.status === 'error') {
              // Completar animação
              setProgress(100);
              setCurrentStep(GENERATION_STEPS.length - 1);
              
              // Limpar após 5 segundos
              setTimeout(() => {
                setCurrentLog(null);
                setStartTime(null);
                setProgress(0);
                setCurrentStep(0);
                setElapsedTime(0);
              }, 5000);
            } else {
              setCurrentLog(log);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simular progresso durante execução
  useEffect(() => {
    if (!currentLog || currentLog.status !== 'running') return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        // Progresso mais lento conforme avança
        const increment = Math.max(0.5, (100 - prev) / 50);
        return Math.min(95, prev + increment);
      });
    }, 500);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= GENERATION_STEPS.length - 2) return prev;
        return prev + 1;
      });
    }, 8000); // Muda de step a cada 8 segundos

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [currentLog]);

  // Atualizar tempo decorrido
  useEffect(() => {
    if (!startTime || !currentLog) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, currentLog]);

  if (!currentLog) return null;

  const isComplete = currentLog.status === 'success';
  const isError = currentLog.status === 'error';
  const isRunning = currentLog.status === 'running';

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500 border-2",
      isRunning && "border-blue-500/50 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent shadow-xl shadow-blue-500/10",
      isComplete && "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent",
      isError && "border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent"
    )}>
      {/* Animated background */}
      {isRunning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}

      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl transition-all",
              isRunning && "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50 animate-pulse",
              isComplete && "bg-gradient-to-br from-emerald-500 to-green-600",
              isError && "bg-destructive"
            )}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Piloto Automático</h3>
                <Badge variant={isRunning ? "default" : isComplete ? "outline" : "destructive"} className={cn(
                  isRunning && "bg-blue-500 animate-pulse"
                )}>
                  {isRunning ? 'Executando' : isComplete ? 'Concluído' : 'Erro'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tema: <span className="font-medium text-foreground">{currentLog.topic_used}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{elapsedTime}s</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(currentLog.executed_at), { addSuffix: true, locale: ptBR })}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className={cn(
              "font-mono font-semibold",
              isComplete && "text-emerald-500",
              isError && "text-destructive"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={progress} 
              className={cn(
                "h-3",
                isRunning && "[&>div]:bg-blue-500",
                isComplete && "[&>div]:bg-emerald-500",
                isError && "[&>div]:bg-destructive"
              )}
            />
            {isRunning && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-2">
          {GENERATION_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index || isComplete;
            const isPending = currentStep < index && !isComplete;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
                  isActive && "bg-blue-500/20 border border-blue-500/50",
                  isCompleted && "bg-emerald-500/10",
                  isPending && "opacity-40"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full",
                  isActive && "bg-blue-500 text-white animate-pulse",
                  isCompleted && "bg-emerald-500 text-white",
                  isPending && "bg-muted"
                )}>
                  {isActive && isRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <StepIcon className="h-3 w-3" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium truncate",
                  isActive && "text-blue-500",
                  isCompleted && "text-emerald-500",
                  isPending && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {isError && currentLog.error_message && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{currentLog.error_message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
