import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueItem {
  id: string;
  article_id: string;
  image_type: 'cover' | 'gallery';
  image_index: number;
  prompt: string;
  status: string;
  retry_count: number;
  max_retries: number;
  metadata: {
    mainSubject?: string;
    visualContext?: string;
    articleTitle?: string;
    slug?: string;
  };
}

function calculateNextRetryTime(retryCount: number): Date {
  const baseDelay = 30000;
  const maxDelay = 300000;
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  return new Date(Date.now() + delay);
}

// Send notification to admins when queue processing is complete
async function sendQueueCompletionNotification(
  supabaseUrl: string,
  supabaseKey: string,
  articleId: string,
  succeeded: number,
  failed: number
): Promise<void> {
  try {
    // Get article title for the notification
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: article } = await supabase
      .from('content_articles')
      .select('title')
      .eq('id', articleId)
      .single();

    const articleTitle = (article as any)?.title || 'Artigo';
    const totalProcessed = succeeded + failed;
    
    let notificationTitle: string;
    let notificationBody: string;
    let notificationType: string;

    if (failed === 0) {
      notificationTitle = '✅ Imagens geradas com sucesso';
      notificationBody = `Todas as ${succeeded} imagens do artigo "${articleTitle}" foram geradas.`;
      notificationType = 'success';
    } else if (succeeded === 0) {
      notificationTitle = '❌ Falha na geração de imagens';
      notificationBody = `Todas as ${failed} imagens do artigo "${articleTitle}" falharam.`;
      notificationType = 'error';
    } else {
      notificationTitle = '⚠️ Geração parcial de imagens';
      notificationBody = `${succeeded} de ${totalProcessed} imagens do artigo "${articleTitle}" foram geradas. ${failed} falharam.`;
      notificationType = 'warning';
    }

    // Call the send-push-notification function on Lovable Cloud
    const LOVABLE_CLOUD_URL = 'https://gcdwdjacrxmdsciwqtlc.supabase.co';
    const LOVABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZHdkamFjcnhtZHNjaXdxdGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDIxOTcsImV4cCI6MjA4NDQxODE5N30.mxryA4KPolNzIZQXo-ZSyp18n8OliIrhabKpLljf1vU';
    
    await fetch(`${LOVABLE_CLOUD_URL}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_KEY}`,
        'apikey': LOVABLE_KEY,
      },
      body: JSON.stringify({
        action: 'notify-admins',
        payload: {
          title: notificationTitle,
          body: notificationBody,
          type: notificationType,
          url: `/admin/articles/${articleId}`,
        },
      }),
    });

    console.log('Queue completion notification sent');
  } catch (error) {
    console.error('Error sending queue completion notification:', error);
  }
}

// Lovable Cloud URL for Edge Functions (functions are deployed here)
const LOVABLE_FUNCTIONS_URL = 'https://gcdwdjacrxmdsciwqtlc.supabase.co';
const LOVABLE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZHdkamFjcnhtZHNjaXdxdGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDIxOTcsImV4cCI6MjA4NDQxODE5N30.mxryA4KPolNzIZQXo-ZSyp18n8OliIrhabKpLljf1vU';

// Delay configurations to avoid rate limiting (especially for Cloudflare AI)
// Cloudflare Workers AI has stricter rate limits, so we need longer delays
const DELAY_BETWEEN_IMAGES_MS = 5000; // 5 seconds between each image (reduced from 8s)
const DELAY_CLOUDFLARE_MS = 10000; // 10 seconds when using Cloudflare AI (reduced from 15s)

// Maximum retries for individual image generation within the queue
const MAX_INLINE_RETRIES = 2; // Retry up to 2 times before moving to next image

// Helper to wait between requests
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processQueueItem(
  supabaseUrl: string,
  supabaseKey: string,
  item: QueueItem
): Promise<{ success: boolean; error?: string; imageUrl?: string; usedFallback?: boolean }> {
  console.log(`Processing queue item ${item.id} (${item.image_type}, index: ${item.image_index}, attempt ${item.retry_count + 1})`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Inline retry function for immediate retries before marking as failed
  async function attemptGeneration(retryNumber: number): Promise<{ success: boolean; error?: string; imageUrl?: string; usedFallback?: boolean }> {
    try {
      if (retryNumber > 0) {
        console.log(`[Retry] Inline retry ${retryNumber}/${MAX_INLINE_RETRIES} for item ${item.id}`);
        // Add exponential backoff delay for retries: 3s, 6s
        const retryDelay = 3000 * Math.pow(2, retryNumber - 1);
        await delay(retryDelay);
      }

      await (supabase.from('image_generation_queue') as any)
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      // IMPORTANT: Edge Functions are deployed on Lovable Cloud, not the external database
      // Use Lovable Cloud URL for function calls, but external DB for data operations
      const generateResponse = await fetch(
        `${LOVABLE_FUNCTIONS_URL}/functions/v1/generate-article-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOVABLE_ANON_KEY}`,
            'apikey': LOVABLE_ANON_KEY,
          },
          body: JSON.stringify({
            customPrompt: item.prompt,
            mainSubject: item.metadata.mainSubject || '',
            visualContext: item.metadata.visualContext || '',
            title: item.metadata.articleTitle || '',
            type: item.image_type,
            slug: item.metadata.slug || '',
            articleId: item.article_id,  // Pass articleId for metadata tracking
            imageIndex: item.image_index, // Pass imageIndex for gallery images
            fromQueue: true,
          }),
        }
      );

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`Image generation failed: ${generateResponse.status} - ${errorText}`);
      }

      const result = await generateResponse.json();

      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'No image URL returned');
      }

      return { success: true, imageUrl: result.imageUrl, usedFallback: result.usedFallback || false };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Attempt ${retryNumber}] Error for item ${item.id}:`, errorMessage);
      
      // Try inline retry if we haven't exceeded inline retry limit
      if (retryNumber < MAX_INLINE_RETRIES) {
        return attemptGeneration(retryNumber + 1);
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Start generation with inline retries
  const result = await attemptGeneration(0);
  
  if (result.success && result.imageUrl) {
    // SUCCESS: Update queue item and article
    await (supabase.from('image_generation_queue') as any)
      .update({
        status: 'completed',
        result_url: result.imageUrl,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    // Update article with the new image URL
    if (item.image_type === 'cover') {
      await (supabase.from('content_articles') as any)
        .update({ cover_image: result.imageUrl })
        .eq('id', item.article_id);
    } else {
      const { data: article } = await supabase
        .from('content_articles')
        .select('gallery_images')
        .eq('id', item.article_id)
        .single();

      if (article) {
        const galleryImages = ((article as any).gallery_images as string[]) || [];
        while (galleryImages.length <= item.image_index) {
          galleryImages.push('');
        }
        galleryImages[item.image_index] = result.imageUrl;
        await (supabase.from('content_articles') as any)
          .update({ gallery_images: galleryImages })
          .eq('id', item.article_id);
      }
    }

    console.log(`Successfully processed queue item ${item.id} (fallback: ${result.usedFallback})`);
    return result;
    
  } else {
    // FAILED after inline retries: Use queue's retry mechanism
    const errorMessage = result.error || 'Unknown error after inline retries';
    const newRetryCount = item.retry_count + 1;
    const shouldRetry = newRetryCount < item.max_retries;

    if (shouldRetry) {
      const nextRetryAt = calculateNextRetryTime(newRetryCount);
      await (supabase.from('image_generation_queue') as any)
        .update({
          status: 'retrying',
          retry_count: newRetryCount,
          error_message: errorMessage,
          next_retry_at: nextRetryAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
      console.log(`Queue item ${item.id} scheduled for retry at ${nextRetryAt.toISOString()}`);
    } else {
      await (supabase.from('image_generation_queue') as any)
        .update({
          status: 'failed',
          retry_count: newRetryCount,
          error_message: `Max retries exceeded. Last error: ${errorMessage}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
      console.log(`Queue item ${item.id} failed permanently after ${newRetryCount} attempts`);
    }

    return { success: false, error: errorMessage };
  }
}

// Check if all items for an article are processed (completed or failed)
async function checkArticleQueueCompletion(
  supabaseUrl: string,
  supabaseKey: string,
  articleId: string
): Promise<{ isComplete: boolean; succeeded: number; failed: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: items } = await supabase
    .from('image_generation_queue')
    .select('status')
    .eq('article_id', articleId);

  if (!items || items.length === 0) {
    return { isComplete: true, succeeded: 0, failed: 0 };
  }

  const pending = items.filter((i: any) => 
    i.status === 'pending' || i.status === 'processing' || i.status === 'retrying'
  ).length;
  
  const succeeded = items.filter((i: any) => i.status === 'completed').length;
  const failed = items.filter((i: any) => i.status === 'failed').length;

  return { 
    isComplete: pending === 0, 
    succeeded, 
    failed 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try EXTERNAL first, then fall back to built-in Supabase secrets
    let supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    let supabaseKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY');
    
    // If EXTERNAL not configured, use the built-in Lovable Cloud Supabase
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      console.log('[process-image-queue] Using Lovable Cloud Supabase');
    } else {
      console.log('[process-image-queue] Using External Supabase');
    }
    
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      throw new Error('No valid Supabase URL configured. Set EXTERNAL_SUPABASE_URL or SUPABASE_URL.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let batchSize = 5;
    let articleId: string | null = null;
    
    try {
      const body = await req.json();
      batchSize = body.batchSize || 5;
      articleId = body.articleId || null;
    } catch { /* use defaults */ }

    let pendingQuery = supabase
      .from('image_generation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (articleId) pendingQuery = pendingQuery.eq('article_id', articleId);

    const { data: pendingItems, error: pendingError } = await pendingQuery;
    if (pendingError) throw new Error(`Failed to fetch pending items: ${pendingError.message}`);

    let retryQuery = supabase
      .from('image_generation_queue')
      .select('*')
      .eq('status', 'retrying')
      .lte('next_retry_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(batchSize);

    if (articleId) retryQuery = retryQuery.eq('article_id', articleId);

    const { data: retryItems, error: retryError } = await retryQuery;
    if (retryError) throw new Error(`Failed to fetch retry items: ${retryError.message}`);

    const itemsToProcess = [...(pendingItems || []), ...(retryItems || [])].slice(0, batchSize);

    if (itemsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No items in queue' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track which articles we're processing
    const articlesProcessed = new Set<string>();
    const results: { id: string; success: boolean; error?: string; usedFallback?: boolean }[] = [];
    
    // Process items sequentially with delays to avoid rate limiting
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      articlesProcessed.add(item.article_id);
      
      console.log(`Processing item ${i + 1}/${itemsToProcess.length}: ${item.id} (${item.image_type})`);
      
      const result = await processQueueItem(supabaseUrl, supabaseKey, item as QueueItem);
      results.push({ id: item.id, success: result.success, error: result.error, usedFallback: result.usedFallback });
      
      // Add delay between requests to avoid rate limiting
      if (i < itemsToProcess.length - 1) {
        const delayTime = result.usedFallback ? DELAY_CLOUDFLARE_MS : DELAY_BETWEEN_IMAGES_MS;
        console.log(`Waiting ${delayTime / 1000}s before next image (Cloudflare: ${result.usedFallback || false})...`);
        await delay(delayTime);
      }
    }

    // Check completion status for each article and send notifications
    for (const artId of articlesProcessed) {
      const completion = await checkArticleQueueCompletion(supabaseUrl, supabaseKey, artId);
      
      if (completion.isComplete && (completion.succeeded > 0 || completion.failed > 0)) {
        await sendQueueCompletionNotification(
          supabaseUrl,
          supabaseKey,
          artId,
          completion.succeeded,
          completion.failed
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: itemsToProcess.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
