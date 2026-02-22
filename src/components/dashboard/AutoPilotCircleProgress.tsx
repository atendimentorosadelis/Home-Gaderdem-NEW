import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Check, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AutoGenerationLog {
  id: string;
  article_id: string | null;
  topic_used: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  error_message: string | null;
  executed_at: string;
  duration_ms: number | null;
}

interface AutoPilotCircleProgressProps {
  nextExecution: Date | null;
  isEnabled: boolean;
}

export function AutoPilotCircleProgress({ nextExecution, isEnabled }: AutoPilotCircleProgressProps) {
  const [currentLog, setCurrentLog] = useState<AutoGenerationLog | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const isRunning = currentLog?.status === 'running';
  const isSuccess = currentLog?.status === 'success';
  const isError = currentLog?.status === 'error';

  // Fetch current running log on mount
  useEffect(() => {
    const fetchCurrentLog = async () => {
      const { data } = await supabase
        .from('auto_generation_logs')
        .select('*')
        .eq('status', 'running')
        .order('executed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setCurrentLog(data as AutoGenerationLog);
        setStartTime(new Date(data.executed_at));
        setProgress(10);
      }
    };
    
    fetchCurrentLog();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('autopilot-circle-progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auto_generation_logs' },
        (payload) => {
          const log = payload.new as AutoGenerationLog;
          
          if (log.status === 'running') {
            setCurrentLog(log);
            setStartTime(new Date());
            setProgress(5);
            setElapsedTime(0);
          } else if (log.status === 'success' || log.status === 'error') {
            setCurrentLog(log);
            setProgress(100);
            
            // Reset after 8 seconds
            setTimeout(() => {
              setCurrentLog(null);
              setProgress(0);
              setElapsedTime(0);
              setStartTime(null);
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Progress simulation when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        // Slow down as we get higher
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Elapsed time counter
  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusColor = () => {
    if (isError) return 'stroke-destructive';
    if (isSuccess) return 'stroke-emerald-500';
    if (isRunning) return 'stroke-emerald-500';
    return 'stroke-muted-foreground/30';
  };

  const getGlowClass = () => {
    if (isError) return 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    if (isSuccess) return 'drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]';
    if (isRunning) return 'drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    return '';
  };

  const getStatusText = () => {
    if (isError) return 'Erro na geração';
    if (isSuccess) return 'Concluído!';
    if (isRunning) return 'Gerando artigo...';
    if (!isEnabled) return 'Desativado';
    if (nextExecution) {
      return `Próximo: ${format(nextExecution, "EEE HH:mm", { locale: ptBR })}`;
    }
    return 'Aguardando agenda';
  };

  const getStatusIcon = () => {
    if (isError) return <AlertCircle className="h-6 w-6 text-destructive" />;
    if (isSuccess) return <Check className="h-6 w-6 text-emerald-500" />;
    if (isRunning) return <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />;
    return <Clock className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <Card className={cn(
      "transition-all duration-500",
      isRunning && "ring-2 ring-emerald-500/50 bg-emerald-500/5",
      isSuccess && "ring-2 ring-emerald-500/50 bg-emerald-500/10",
      isError && "ring-2 ring-destructive/50 bg-destructive/5"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          Progresso da Geração
          {isRunning && (
            <Badge variant="outline" className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              Executando
            </Badge>
          )}
          {isSuccess && (
            <Badge variant="outline" className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              Sucesso
            </Badge>
          )}
          {isError && (
            <Badge variant="destructive" className="ml-auto">
              Erro
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          {/* Circle Progress */}
          <div className="relative">
            <svg 
              className={cn("w-44 h-44 -rotate-90 transition-all duration-500", getGlowClass())}
              viewBox="0 0 160 160"
            >
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                className="stroke-muted-foreground/20"
                strokeWidth={strokeWidth}
              />
              
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                className={cn("transition-all duration-700 ease-out", getStatusColor())}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {getStatusIcon()}
              <span className={cn(
                "text-3xl font-bold mt-1 transition-colors",
                isError && "text-destructive",
                isSuccess && "text-emerald-500",
                isRunning && "text-emerald-500"
              )}>
                {Math.round(progress)}%
              </span>
              {isRunning && elapsedTime > 0 && (
                <span className="text-xs text-muted-foreground">
                  {formatElapsed(elapsedTime)}
                </span>
              )}
            </div>
          </div>
          
          {/* Status text */}
          <p className={cn(
            "text-sm font-medium mt-4 text-center",
            isError && "text-destructive",
            isSuccess && "text-emerald-600",
            isRunning && "text-emerald-600",
            !isRunning && !isSuccess && !isError && "text-muted-foreground"
          )}>
            {getStatusText()}
          </p>
          
          {/* Topic being used */}
          {isRunning && currentLog?.topic_used && (
            <p className="text-xs text-muted-foreground mt-1">
              Tema: {currentLog.topic_used}
            </p>
          )}
          
          {/* Error message */}
          {isError && currentLog?.error_message && (
            <p className="text-xs text-destructive/80 mt-2 text-center max-w-[200px]">
              {currentLog.error_message}
            </p>
          )}
          
          {/* Duration on success */}
          {isSuccess && currentLog?.duration_ms && (
            <p className="text-xs text-muted-foreground mt-1">
              Duração: {Math.round(currentLog.duration_ms / 1000)}s
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
