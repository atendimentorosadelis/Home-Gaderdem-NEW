import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to log video generation result
async function logVideoGeneration(
  supabase: any,
  articleId: string | null,
  articleTitle: string | null,
  status: 'success' | 'error' | 'pending',
  videoId: string | null,
  errorMessage: string | null,
  durationMs: number | null
) {
  try {
    await supabase.from('video_generation_logs').insert({
      article_id: articleId,
      article_title: articleTitle,
      status,
      video_id: videoId,
      error_message: errorMessage,
      duration_ms: durationMs,
      executed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[process-video-queue] Error logging:', err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EXTERNAL_SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_SUPABASE_SERVICE_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY");

    if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_SERVICE_KEY) {
      throw new Error("External Supabase credentials not configured");
    }

    // Create Supabase client for external database
    const supabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_SERVICE_KEY);

    const { batchSize = 5, force = false } = await req.json().catch(() => ({}));

    console.log(`[process-video-queue] Starting with batchSize: ${batchSize}, force: ${force}`);

    // Check if video generation is enabled globally
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'video_auto_generation')
      .maybeSingle();

    const videoSettings = settings?.value ? 
      (typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value) : 
      { enabled: false, daily_limit: 10 };

    if (!videoSettings.enabled && !force) {
      console.log(`[process-video-queue] Video generation is disabled`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Video generation is disabled",
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from('article_videos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    const dailyLimit = videoSettings.daily_limit || 10;
    const remaining = Math.max(0, dailyLimit - (todayCount || 0));

    if (remaining === 0 && !force) {
      console.log(`[process-video-queue] Daily limit reached (${dailyLimit})`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Daily limit reached (${dailyLimit})`,
          processed: 0,
          dailyCount: todayCount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get published articles without videos
    const { data: articlesWithoutVideos, error: fetchError } = await supabase
      .from('content_articles')
      .select(`
        id,
        title,
        category_slug,
        tags,
        excerpt
      `)
      .eq('status', 'published')
      .not('id', 'in', `(SELECT article_id FROM article_videos)`)
      .limit(Math.min(batchSize, remaining));

    if (fetchError) {
      console.error(`[process-video-queue] Error fetching articles:`, fetchError);
      
      // Fallback: fetch articles and filter manually
      const { data: allArticles } = await supabase
        .from('content_articles')
        .select('id, title, category_slug, tags, excerpt')
        .eq('status', 'published')
        .limit(50);

      const { data: existingVideos } = await supabase
        .from('article_videos')
        .select('article_id');

      const existingArticleIds = new Set(existingVideos?.map(v => v.article_id) || []);
      const articlesToProcess = (allArticles || [])
        .filter(a => !existingArticleIds.has(a.id))
        .slice(0, Math.min(batchSize, remaining));

      if (articlesToProcess.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "No articles without videos found",
            processed: 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process each article
      const results = [];
      for (const article of articlesToProcess) {
        const startTime = Date.now();
        try {
          console.log(`[process-video-queue] Processing: ${article.title}`);

          // Call search-youtube-video function
          const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/search-youtube-video`;
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              articleId: article.id,
              saveToDb: true,
            }),
          });

          const result = await response.json();
          const durationMs = Date.now() - startTime;

          // Log the result
          await logVideoGeneration(
            supabase,
            article.id,
            article.title,
            result.success ? 'success' : 'error',
            result.videoId || null,
            result.error || null,
            durationMs
          );

          results.push({
            articleId: article.id,
            title: article.title,
            success: result.success,
            videoId: result.videoId,
            error: result.error,
          });

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          const durationMs = Date.now() - startTime;
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          
          console.error(`[process-video-queue] Error processing ${article.id}:`, err);
          
          // Log the error
          await logVideoGeneration(
            supabase,
            article.id,
            article.title,
            'error',
            null,
            errorMsg,
            durationMs
          );

          results.push({
            articleId: article.id,
            title: article.title,
            success: false,
            error: errorMsg,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return new Response(
        JSON.stringify({
          success: true,
          processed: results.length,
          successful: successCount,
          failed: results.length - successCount,
          results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!articlesWithoutVideos || articlesWithoutVideos.length === 0) {
      console.log(`[process-video-queue] No articles without videos found`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "No articles without videos found",
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-video-queue] Found ${articlesWithoutVideos.length} articles to process`);

    // Process each article
    const results = [];
    for (const article of articlesWithoutVideos) {
      const startTime = Date.now();
      try {
        console.log(`[process-video-queue] Processing: ${article.title}`);

        // Call search-youtube-video function
        const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/search-youtube-video`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            articleId: article.id,
            saveToDb: true,
          }),
        });

        const result = await response.json();
        const durationMs = Date.now() - startTime;

        // Log the result
        await logVideoGeneration(
          supabase,
          article.id,
          article.title,
          result.success ? 'success' : 'error',
          result.videoId || null,
          result.error || null,
          durationMs
        );

        results.push({
          articleId: article.id,
          title: article.title,
          success: result.success,
          videoId: result.videoId,
          error: result.error,
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';

        console.error(`[process-video-queue] Error processing ${article.id}:`, err);
        
        // Log the error
        await logVideoGeneration(
          supabase,
          article.id,
          article.title,
          'error',
          null,
          errorMsg,
          durationMs
        );

        results.push({
          articleId: article.id,
          title: article.title,
          success: false,
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`[process-video-queue] Completed. Success: ${successCount}/${results.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: successCount,
        failed: results.length - successCount,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`[process-video-queue] Error:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
