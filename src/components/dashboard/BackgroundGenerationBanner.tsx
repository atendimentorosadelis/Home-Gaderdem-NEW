import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GenerationStep } from '@/hooks/use-generation-job';
import { useNavigate } from 'react-router-dom';

interface BackgroundGenerationBannerProps {
  isGenerating: boolean;
  isComplete: boolean;
  hasFailed: boolean;
  steps: GenerationStep[];
  topic: string;
  articleId: string | null;
  onClear: () => void;
  onCancel: () => void;
  startTime: number | null;
}

export function BackgroundGenerationBanner({
  isGenerating,
  isComplete,
  hasFailed,
  steps,
  topic,
  articleId,
  onClear,
  onCancel,
  startTime,
}: BackgroundGenerationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (!isGenerating || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, startTime]);

  // Don't show if nothing is happening
  if (!isGenerating && !isComplete && !hasFailed) {
    return null;
  }

  const completedSteps = steps.filter(s => s.status === 'done').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleViewArticle = () => {
    if (articleId) {
      navigate(`/dashboard/articles/${articleId}`);
      onClear();
    }
  };

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 z-50 w-80 shadow-lg border-2 transition-all",
      isGenerating && "border-primary/50 bg-gradient-to-br from-primary/5 to-transparent",
      isComplete && "border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent",
      hasFailed && "border-destructive/50 bg-gradient-to-br from-destructive/5 to-transparent"
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {isComplete && <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            {hasFailed && <AlertCircle className="h-4 w-4 text-destructive" />}
            <span className="font-medium text-sm">
              {isGenerating && 'Gerando artigo...'}
              {isComplete && 'Artigo gerado!'}
              {hasFailed && 'Erro na geração'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={isGenerating ? onCancel : onClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2 mb-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedSteps}/{totalSteps} etapas</span>
              <span>{formatTime(elapsed)}</span>
            </div>
          </div>
        )}

        {/* Topic */}
        <p className="text-xs text-muted-foreground truncate mb-3">
          {topic}
        </p>

        {/* Steps (expanded) */}
        {isExpanded && (
          <div className="space-y-1 mb-3">
            {steps.map((step) => (
              <div 
                key={step.id}
                className="flex items-center gap-2 text-xs"
              >
                {step.status === 'pending' && (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                )}
                {step.status === 'loading' && (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                )}
                {step.status === 'done' && (
                  <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                )}
                {step.status === 'cancelled' && (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={cn(
                  step.status === 'done' && "text-emerald-600 dark:text-emerald-400",
                  step.status === 'error' && "text-destructive",
                  step.status === 'cancelled' && "text-muted-foreground line-through"
                )}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-muted-foreground ml-auto">
                    {step.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {isComplete && articleId && (
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleViewArticle}
          >
            Ver Artigo
          </Button>
        )}
        
        {hasFailed && (
          <Button 
            size="sm" 
            variant="outline"
            className="w-full"
            onClick={onClear}
          >
            Fechar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
