import { Check, Loader2, X, Circle, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import type { GenerationStep } from '@/hooks/use-full-article-generation';

interface GenerationProgressProps {
  steps: GenerationStep[];
  className?: string;
  startTime?: number;
  isGenerating?: boolean;
}

function calculateProgress(steps: GenerationStep[]): number {
  if (steps.length === 0) return 0;
  
  let totalProgress = 0;
  
  for (const step of steps) {
    const stepWeight = 100 / steps.length;
    
    if (step.status === 'done') {
      totalProgress += stepWeight;
    } else if (step.status === 'error') {
      totalProgress += stepWeight;
    } else if (step.status === 'loading') {
      if (step.detail && step.detail.includes('/')) {
        const [current, total] = step.detail.split('/').map(Number);
        if (!isNaN(current) && !isNaN(total) && total > 0) {
          totalProgress += stepWeight * (current / total);
        } else {
          totalProgress += stepWeight * 0.5;
        }
      } else {
        totalProgress += stepWeight * 0.5;
      }
    }
  }
  
  return Math.round(totalProgress);
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.ceil(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  if (remainingSeconds === 0) {
    return `~${minutes}min`;
  }
  return `~${minutes}min ${remainingSeconds}s`;
}

export function GenerationProgress({ steps, className, startTime, isGenerating = false }: GenerationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const progress = calculateProgress(steps);
  const isComplete = progress === 100;
  const hasError = steps.some(step => step.status === 'error');
  const wasCancelled = steps.some(step => step.status === 'cancelled');

  const statusText = (() => {
    if (isComplete) {
      return hasError ? 'Geração finalizada com erros' : 'Geração concluída!';
    }
    if (isGenerating) {
      return 'Gerando artigo...';
    }
    return 'Aguardando geração de artigo';
  })();

  useEffect(() => {
    if (!startTime || isComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = (() => {
    if (isComplete || progress === 0 || elapsedTime === 0) return null;
    
    const progressDecimal = progress / 100;
    const estimatedTotal = elapsedTime / progressDecimal;
    const remaining = estimatedTotal - elapsedTime;
    
    return Math.max(0, remaining);
  })();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {statusText}
            </span>
            {isGenerating && !isComplete && estimatedTimeRemaining !== null && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                {formatTime(estimatedTimeRemaining)}
              </span>
            )}
          </div>
          <span className={cn(
            "font-mono font-semibold",
            isComplete && !hasError && "text-primary",
            hasError && "text-destructive"
          )}>
            {progress}%
            {isComplete && !hasError && (
              <Check className="inline-block ml-1 h-4 w-4" />
            )}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <Progress 
            value={progress} 
            className={cn(
              "h-3 transition-all duration-500",
              isGenerating && !isComplete && "animate-pulse"
            )}
          />
          {isGenerating && !isComplete && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          )}
        </div>

        {/* Elapsed time indicator */}
        {isGenerating && startTime && elapsedTime > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Tempo decorrido: {formatTime(elapsedTime).replace('~', '')}
          </p>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              step.status === 'loading' && "bg-primary/5 border-primary/30",
              step.status === 'done' && "bg-accent border-accent",
              step.status === 'error' && "bg-destructive/10 border-destructive/30",
              step.status === 'pending' && "bg-muted/30 border-border/50",
              step.status === 'cancelled' && "bg-muted/50 border-muted"
            )}
          >
            <div className="flex-shrink-0">
              {step.status === 'pending' && (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {step.status === 'loading' && (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
              {step.status === 'done' && (
                <Check className="h-5 w-5 text-primary" />
              )}
              {step.status === 'error' && (
                <X className="h-5 w-5 text-destructive" />
              )}
              {step.status === 'cancelled' && (
                <Ban className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                step.status === 'pending' && "text-muted-foreground",
                step.status === 'loading' && "text-foreground",
                step.status === 'done' && "text-foreground",
                step.status === 'error' && "text-destructive",
                step.status === 'cancelled' && "text-muted-foreground line-through"
              )}>
                {step.label}
              </p>
            </div>

            {step.detail && (
              <span className={cn(
                "text-xs font-mono px-2 py-0.5 rounded",
                step.status === 'loading' && "bg-primary/10 text-primary",
                step.status === 'done' && "bg-primary/10 text-primary",
                step.status === 'error' && "bg-destructive/10 text-destructive",
                step.status === 'pending' && "bg-muted text-muted-foreground",
                step.status === 'cancelled' && "bg-muted text-muted-foreground"
              )}>
                {step.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
