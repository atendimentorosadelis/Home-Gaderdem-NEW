import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error' | 'cancelled';
  detail?: string;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  topic: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
  steps: GenerationStep[];
  article_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * This hook is a placeholder for background generation job tracking.
 * 
 * The actual article generation in this project happens through 
 * useFullArticleGeneration hook (foreground generation) which is used
 * by the GenerateManualContent page.
 * 
 * The BackgroundGenerationBanner in DashboardLayout will only show
 * when there's an active job, but since we use foreground generation,
 * this banner typically won't appear during normal operation.
 */
export function useGenerationJob() {
  const [job] = useState<GenerationJob | null>(null);
  const [currentJobId] = useState<string | null>(null);
  const [isPolling] = useState(false);
  const { toast } = useToast();

  // No-op functions since we use foreground generation
  const startGeneration = useCallback(async (_topic: string): Promise<string | null> => {
    toast({
      title: 'Use a página de geração',
      description: 'Por favor, use a página "Gerar Conteúdo" para criar artigos.',
    });
    return null;
  }, [toast]);

  const cancelJob = useCallback(async () => {
    // No-op - foreground generation handles its own cancellation
  }, []);

  const clearJob = useCallback(() => {
    // No-op
  }, []);

  // Derived state - all false/empty since we don't use background jobs
  const isGenerating = false;
  const isComplete = false;
  const hasFailed = false;
  const steps: GenerationStep[] = [];
  const startTime = null;

  return {
    job,
    jobId: currentJobId,
    isGenerating,
    isComplete,
    hasFailed,
    isPolling,
    steps,
    startTime,
    articleId: null,
    topic: '',
    startGeneration,
    cancelJob,
    clearJob,
  };
}
