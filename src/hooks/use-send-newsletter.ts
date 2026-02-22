import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edge-functions';
import { useToast } from '@/hooks/use-toast';

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  cover_image?: string | null;
}

export const useSendNewsletter = () => {
  const { toast } = useToast();

  const checkAutoSendEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'newsletter_auto_send')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking auto-send settings:', error);
        return false;
      }

      if (data?.value && typeof data.value === 'object') {
        const config = data.value as { enabled?: boolean };
        return config.enabled ?? false;
      }

      return false;
    } catch (error) {
      console.error('Error checking auto-send settings:', error);
      return false;
    }
  }, []);

  const sendNewsletter = useCallback(async (article: ArticleData): Promise<boolean> => {
    try {
      // Get the auth token from the Supabase client (this is the client that has the active session)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        toast({
          title: 'Erro de autenticação',
          description: 'Por favor, faça login novamente.',
          variant: 'destructive',
        });
        return false;
      }

      console.log('[Newsletter] Sending newsletter with auth token');
      
      // Call the edge function with auth token
      const response = await invokeEdgeFunction('send-newsletter', {
        articleId: article.id,
        articleTitle: article.title,
        articleSlug: article.slug,
        articleExcerpt: article.excerpt,
        articleCategory: article.category,
        coverImage: article.cover_image,
      }, true); // Pass true to require auth

      if (response.error) {
        console.error('Error sending newsletter:', response.error);
        toast({
          title: 'Erro no envio da newsletter',
          description: response.error.message || 'Não foi possível enviar a newsletter.',
          variant: 'destructive',
        });
        return false;
      }

      const result = response.data;
      
      if (result?.sent > 0) {
        toast({
          title: '📧 Newsletter enviada!',
          description: `${result.sent} inscrito(s) notificado(s) sobre o novo artigo.`,
        });
      } else if (result?.sent === 0) {
        toast({
          title: 'Nenhum inscrito ativo',
          description: 'Não há inscritos ativos para receber a newsletter.',
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: 'Erro no envio da newsletter',
        description: 'Ocorreu um erro ao enviar a newsletter.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const sendNewsletterIfEnabled = useCallback(async (article: ArticleData): Promise<boolean> => {
    const isEnabled = await checkAutoSendEnabled();
    
    if (!isEnabled) {
      console.log('Auto-send newsletter is disabled');
      return false;
    }

    console.log('Auto-send newsletter is enabled, sending...');
    return sendNewsletter(article);
  }, [checkAutoSendEnabled, sendNewsletter]);

  return {
    sendNewsletter,
    sendNewsletterIfEnabled,
    checkAutoSendEnabled,
  };
};
