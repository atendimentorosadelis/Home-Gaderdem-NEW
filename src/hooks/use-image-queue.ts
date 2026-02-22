import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edge-functions';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface QueueItem {
  id: string;
  article_id: string;
  image_type: 'cover' | 'gallery';
  image_index: number;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  result_url: string | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  priority: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  next_retry_at: string | null;
}

interface AddToQueueParams {
  articleId: string;
  imageType: 'cover' | 'gallery';
  imageIndex?: number;
  prompt: string;
  priority?: number;
  metadata?: {
    mainSubject?: string;
    visualContext?: string;
    articleTitle?: string;
    slug?: string;
    [key: string]: string | undefined;
  };
}

export function useImageQueue(articleId?: string) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch queue items
  const fetchQueueItems = useCallback(async () => {
    if (!articleId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('image_generation_queue')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion since the table is new and types haven't regenerated
      setQueueItems((data as unknown as QueueItem[]) || []);
    } catch (error) {
      console.error('Error fetching queue items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  // Add item to queue
  const addToQueue = useCallback(async (params: AddToQueueParams): Promise<string | null> => {
    try {
      const insertData = {
        article_id: params.articleId,
        image_type: params.imageType,
        image_index: params.imageIndex || 0,
        prompt: params.prompt,
        priority: params.priority || 0,
        metadata: (params.metadata || {}) as Json,
        status: 'pending',
      };
      
      const { data, error } = await supabase
        .from('image_generation_queue')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar imagem à fila',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Add multiple items to queue
  const addBatchToQueue = useCallback(async (items: Omit<AddToQueueParams, 'articleId'>[], articleIdParam: string): Promise<string[]> => {
    try {
      const insertData = items.map((item, index) => ({
        article_id: articleIdParam,
        image_type: item.imageType,
        image_index: item.imageIndex ?? index,
        prompt: item.prompt,
        priority: item.priority || (item.imageType === 'cover' ? 10 : 0),
        metadata: (item.metadata || {}) as Json,
        status: 'pending',
      }));

      const { data, error } = await supabase
        .from('image_generation_queue')
        .insert(insertData)
        .select('id');

      if (error) throw error;
      
      return (data || []).map(d => d.id);
    } catch (error) {
      console.error('Error adding batch to queue:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar imagens à fila',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Retry a failed item
  const retryItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('image_generation_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
          next_retry_at: null,
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Retry agendado',
        description: 'A imagem será reprocessada em breve',
      });

      // Trigger queue processing
      triggerQueueProcessing();
      
      return true;
    } catch (error) {
      console.error('Error retrying item:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao agendar retry',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Cancel a pending item
  const cancelItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('image_generation_queue')
        .delete()
        .eq('id', itemId)
        .in('status', ['pending', 'retrying']);

      if (error) throw error;

      toast({
        title: 'Cancelado',
        description: 'Item removido da fila',
      });
      
      return true;
    } catch (error) {
      console.error('Error canceling item:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao cancelar item',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Trigger queue processing
  const triggerQueueProcessing = useCallback(async (targetArticleId?: string): Promise<void> => {
    setIsProcessing(true);
    try {
      const { error } = await invokeEdgeFunction('process-image-queue', { 
        articleId: targetArticleId || articleId,
        batchSize: 5 
      });

      if (error) {
        console.error('Error triggering queue processing:', error);
      }
    } catch (error) {
      console.error('Error triggering queue processing:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [articleId]);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const pending = queueItems.filter(i => i.status === 'pending').length;
    const processing = queueItems.filter(i => i.status === 'processing').length;
    const completed = queueItems.filter(i => i.status === 'completed').length;
    const failed = queueItems.filter(i => i.status === 'failed').length;
    const retrying = queueItems.filter(i => i.status === 'retrying').length;

    return { pending, processing, completed, failed, retrying, total: queueItems.length };
  }, [queueItems]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!articleId) return;

    fetchQueueItems();

    const channel = supabase
      .channel(`queue-${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'image_generation_queue',
          filter: `article_id=eq.${articleId}`,
        },
        (payload) => {
          console.log('Queue update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setQueueItems(prev => [...prev, payload.new as unknown as QueueItem]);
          } else if (payload.eventType === 'UPDATE') {
            setQueueItems(prev => 
              prev.map(item => 
                item.id === (payload.new as { id: string }).id 
                  ? (payload.new as unknown as QueueItem) 
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setQueueItems(prev => 
              prev.filter(item => item.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId, fetchQueueItems]);

  return {
    queueItems,
    isLoading,
    isProcessing,
    addToQueue,
    addBatchToQueue,
    retryItem,
    cancelItem,
    triggerQueueProcessing,
    getQueueStats,
    refetch: fetchQueueItems,
  };
}
