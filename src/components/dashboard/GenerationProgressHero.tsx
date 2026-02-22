import { Check, Loader2, X, Circle, Clock, Ban, Sparkles, Zap, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImageProvider } from '@/hooks/use-image-provider';
import type { GenerationStep } from '@/hooks/use-full-article-generation';

interface GenerationProgressHeroProps {
  steps: GenerationStep[];
  startTime?: number;
  isGenerating?: boolean;
  onCancel?: () => void;
  topic?: string;
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
    return `${Math.ceil(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function GenerationProgressHero({ 
  steps, 
  startTime, 
  isGenerating = false, 
  onCancel,
  topic 
}: GenerationProgressHeroProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { provider, getProviderShortLabel } = useImageProvider();
  
  const progress = calculateProgress(steps);
  const isComplete = progress === 100;
  const hasError = steps.some(step => step.status === 'error');
  const wasCancelled = steps.some(step => step.status === 'cancelled');

  const currentStep = steps.find(step => step.status === 'loading');
  const completedSteps = steps.filter(step => step.status === 'done').length;
  
  // Check if currently generating images (cover or gallery step is loading)
  const isGeneratingImages = currentStep?.id === 'cover' || currentStep?.id === 'gallery';

  const statusText = (() => {
    if (wasCancelled) return 'Geração cancelada';
    if (isComplete) {
      return hasError ? 'Finalizado com erros' : 'Artigo gerado com sucesso!';
    }
    if (isGenerating && currentStep) {
      return currentStep.label;
    }
    if (isGenerating) {
      return 'Preparando geração...';
    }
    return 'Aguardando início';
  })();

  useEffect(() => {
    if (!startTime || isComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Auto-scroll to this component when generation starts
  useEffect(() => {
    if (isGenerating && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isGenerating]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = (() => {
    if (isComplete || progress === 0 || elapsedTime === 0) return null;
    
    const progressDecimal = progress / 100;
    const estimatedTotal = elapsedTime / progressDecimal;
    const remaining = estimatedTotal - elapsedTime;
    
    return Math.max(0, remaining);
  })();

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-500",
        isGenerating && !isComplete && "border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg shadow-primary/10",
        isComplete && !hasError && "border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-background",
        hasError && "border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-background",
        !isGenerating && !isComplete && "border-border/50 bg-card/50"
      )}
    >
      {/* Animated background effect when generating */}
      {isGenerating && !isComplete && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )}

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all",
              isGenerating && !isComplete && "bg-primary/20 animate-pulse",
              isComplete && !hasError && "bg-primary/20",
              hasError && "bg-destructive/20",
              !isGenerating && !isComplete && "bg-muted"
            )}>
              {isGenerating && !isComplete ? (
                <Loader2 className="w-6 h-6 md:w-7 md:h-7 text-primary animate-spin" />
              ) : isComplete && !hasError ? (
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              ) : hasError ? (
                <X className="w-6 h-6 md:w-7 md:h-7 text-destructive" />
              ) : (
                <Zap className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {isComplete && !hasError ? 'Geração Concluída!' : 'Geração de Artigo'}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {topic || 'Selecione um tema para começar'}
              </p>
            </div>
          </div>

          {/* Timer & Cancel */}
          <div className="flex items-center gap-3">
            {startTime && (isGenerating || isComplete) && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono",
                isGenerating && !isComplete && "bg-primary/10 text-primary",
                isComplete && "bg-muted text-muted-foreground"
              )}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(elapsedTime)}</span>
                {isGenerating && !isComplete && estimatedTimeRemaining !== null && (
                  <span className="text-primary/60">/ ~{formatTime(estimatedTimeRemaining)}</span>
                )}
              </div>
            )}
            
            {isGenerating && !isComplete && onCancel && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onCancel}
                className="rounded-full"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Cancelar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium",
                isGenerating && !isComplete && "text-primary",
                isComplete && !hasError && "text-primary",
                hasError && "text-destructive"
              )}>
                {statusText}
              </span>
              {/* Show AI provider badge when generating images */}
              {isGeneratingImages && (
                <Badge variant="outline" className="gap-1 text-xs font-normal border-primary/30 bg-primary/5">
                  <Cpu className="w-3 h-3" />
                  {getProviderShortLabel()}
                </Badge>
              )}
            </div>
            <span className={cn(
              "font-mono font-bold text-lg",
              isComplete && !hasError && "text-primary",
              hasError && "text-destructive",
              isGenerating && !isComplete && "text-primary"
            )}>
              {progress}%
            </span>
          </div>
          
          <div className="relative h-4 rounded-full bg-muted/50 overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                isComplete && !hasError && "bg-gradient-to-r from-primary to-primary/80",
                hasError && "bg-gradient-to-r from-destructive to-destructive/80",
                isGenerating && !isComplete && "bg-gradient-to-r from-primary via-primary/90 to-primary/80"
              )}
              style={{ width: `${progress}%` }}
            />
            {isGenerating && !isComplete && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div 
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                  style={{ left: `${progress - 33}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border transition-all",
                step.status === 'loading' && "bg-primary/10 border-primary/30 shadow-sm",
                step.status === 'done' && "bg-primary/5 border-primary/20",
                step.status === 'error' && "bg-destructive/10 border-destructive/30",
                step.status === 'pending' && "bg-muted/30 border-border/30",
                step.status === 'cancelled' && "bg-muted/20 border-muted"
              )}
            >
              <div className="flex-shrink-0">
                {step.status === 'pending' && (
                  <Circle className="h-4 w-4 text-muted-foreground/50" />
                )}
                {step.status === 'loading' && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
                {step.status === 'done' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {step.status === 'error' && (
                  <X className="h-4 w-4 text-destructive" />
                )}
                {step.status === 'cancelled' && (
                  <Ban className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  step.status === 'pending' && "text-muted-foreground/60",
                  step.status === 'loading' && "text-foreground",
                  step.status === 'done' && "text-foreground",
                  step.status === 'error' && "text-destructive",
                  step.status === 'cancelled' && "text-muted-foreground line-through"
                )}>
                  {step.label}
                </p>
                {step.detail && step.status === 'loading' && (
                  <p className="text-[10px] text-primary/70 font-mono">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
