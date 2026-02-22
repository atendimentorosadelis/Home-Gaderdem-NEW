import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error' | 'cancelled';
  detail?: string;
}

const DEFAULT_STEPS: GenerationStep[] = [
  { id: 'metadata', label: 'Gerando metadados e conteúdo', status: 'pending' },
  { id: 'cover', label: 'Criando imagem de capa', status: 'pending' },
  { id: 'gallery', label: 'Gerando galeria de imagens', status: 'pending', detail: '0/6' },
  { id: 'conclusion', label: 'Gerando conclusão emocional', status: 'pending' },
];

// Helper to update job status in database
async function updateJobProgress(
  supabase: any,
  jobId: string, 
  updates: { 
    status?: string; 
    steps?: GenerationStep[];
    article_id?: string;
    error_message?: string;
  }
) {
  const { error } = await supabase
    .from('generation_jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
    
  if (error) {
    console.error(`[Orchestrator] Failed to update job ${jobId}:`, error);
  }
}

// Helper to update a specific step
function updateStep(steps: GenerationStep[], stepId: string, updates: Partial<GenerationStep>): GenerationStep[] {
  return steps.map(step => 
    step.id === stepId ? { ...step, ...updates } : step
  );
}

// Call another edge function on Lovable Cloud (local)
async function callLocalEdgeFunction(functionName: string, body: any) {
  const localUrl = Deno.env.get('SUPABASE_URL')!;
  const localKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const response = await fetch(`${localUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localKey}`,
      'apikey': localKey,
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${functionName} failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Main generation process - runs in background
async function runGenerationProcess(
  supabase: any,
  jobId: string,
  topic: string,
  userId: string
) {
  let steps = [...DEFAULT_STEPS];
  let articleData: any = null;
  let savedArticleId: string | null = null;
  
  try {
    // Step 1: Generate article content
    steps = updateStep(steps, 'metadata', { status: 'loading' });
    await updateJobProgress(supabase, jobId, { status: 'generating', steps });
    
    console.log(`[Orchestrator] Job ${jobId}: Generating article content for topic: ${topic}`);
    
    const articleResult = await callLocalEdgeFunction('generate-full-article', { topic });
    
    if (!articleResult?.success || !articleResult?.article) {
      throw new Error(articleResult?.error || 'Failed to generate article content');
    }
    
    articleData = articleResult.article;
    steps = updateStep(steps, 'metadata', { status: 'done' });
    await updateJobProgress(supabase, jobId, { steps });
    
    console.log(`[Orchestrator] Job ${jobId}: Article content generated: ${articleData.title}`);
    
    // Get user profile for author_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Save article draft first (without images)
    const { data: savedArticle, error: saveError } = await supabase
      .from('content_articles')
      .insert({
        author_id: profile.id,
        title: articleData.title,
        body: articleData.content,
        excerpt: articleData.excerpt,
        category: articleData.category,
        category_slug: articleData.categorySlug,
        slug: articleData.slug,
        tags: articleData.tags,
        keywords: articleData.keywords,
        external_links: articleData.externalLinks,
        read_time: articleData.readTime,
        status: 'draft',
        main_subject: articleData.mainSubject || null,
        visual_context: articleData.visualContext || null,
        gallery_prompts: articleData.galleryPrompts || null,
      })
      .select()
      .single();
      
    if (saveError) {
      console.error(`[Orchestrator] Job ${jobId}: Save error:`, saveError);
      throw new Error('Failed to save article draft');
    }
    
    savedArticleId = savedArticle.id;
    await updateJobProgress(supabase, jobId, { article_id: savedArticleId });
    
    console.log(`[Orchestrator] Job ${jobId}: Article saved with ID: ${savedArticleId}`);
    
    // Step 2: Generate cover image
    steps = updateStep(steps, 'cover', { status: 'loading', detail: 'Iniciando...' });
    await updateJobProgress(supabase, jobId, { steps });
    
    try {
      const coverResult = await callLocalEdgeFunction('generate-article-image', {
        title: articleData.title,
        category: articleData.categorySlug,
        tags: articleData.tags,
        type: 'cover',
        mainSubject: articleData.mainSubject,
        visualContext: articleData.visualContext,
      });
      
      if (coverResult?.success && coverResult?.imageUrl) {
        // Update article with cover image
        await supabase
          .from('content_articles')
          .update({ cover_image: coverResult.imageUrl })
          .eq('id', savedArticleId);
          
        const providerLabel = coverResult.provider || 'Replicate';
        steps = updateStep(steps, 'cover', { status: 'done', detail: providerLabel });
        console.log(`[Orchestrator] Job ${jobId}: Cover image generated`);
      } else {
        steps = updateStep(steps, 'cover', { status: 'error', detail: 'Falha' });
        console.error(`[Orchestrator] Job ${jobId}: Cover image failed`);
      }
    } catch (coverError) {
      console.error(`[Orchestrator] Job ${jobId}: Cover error:`, coverError);
      steps = updateStep(steps, 'cover', { status: 'error', detail: 'Erro' });
    }
    
    await updateJobProgress(supabase, jobId, { steps });
    
    // Step 3: Generate gallery images (6 images)
    steps = updateStep(steps, 'gallery', { status: 'loading', detail: '0/6' });
    await updateJobProgress(supabase, jobId, { steps });
    
    const galleryPrompts = articleData.galleryPrompts || [];
    const galleryImages: string[] = [];
    let lastProvider = '';
    
    for (let i = 0; i < Math.min(galleryPrompts.length, 6); i++) {
      try {
        const galleryResult = await callLocalEdgeFunction('generate-article-image', {
          title: articleData.title,
          category: articleData.categorySlug,
          tags: articleData.tags,
          type: 'gallery',
          customPrompt: galleryPrompts[i],
          mainSubject: articleData.mainSubject,
          visualContext: articleData.visualContext,
        });
        
        if (galleryResult?.success && galleryResult?.imageUrl) {
          galleryImages.push(galleryResult.imageUrl);
          lastProvider = galleryResult.provider || 'Replicate';
        }
        
        const providerInfo = lastProvider ? ` (${lastProvider})` : '';
        steps = updateStep(steps, 'gallery', { detail: `${galleryImages.length}/6${providerInfo}` });
        await updateJobProgress(supabase, jobId, { steps });
        
      } catch (galleryError) {
        console.error(`[Orchestrator] Job ${jobId}: Gallery image ${i + 1} error:`, galleryError);
      }
    }
    
    // Update article with gallery images
    if (galleryImages.length > 0) {
      await supabase
        .from('content_articles')
        .update({ gallery_images: galleryImages })
        .eq('id', savedArticleId);
    }
    
    steps = updateStep(steps, 'gallery', { 
      status: galleryImages.length > 0 ? 'done' : 'error',
      detail: `${galleryImages.length}/6`
    });
    await updateJobProgress(supabase, jobId, { steps });
    
    console.log(`[Orchestrator] Job ${jobId}: Gallery complete: ${galleryImages.length}/6 images`);
    
    // Step 4: Generate emotional conclusion
    steps = updateStep(steps, 'conclusion', { status: 'loading' });
    await updateJobProgress(supabase, jobId, { steps });
    
    try {
      const conclusionResult = await callLocalEdgeFunction('generate-emotional-conclusion', {
        theme: articleData.title || articleData.mainSubject,
        article_id: savedArticleId,
      });
      
      if (conclusionResult?.emotional_text) {
        steps = updateStep(steps, 'conclusion', { status: 'done' });
        console.log(`[Orchestrator] Job ${jobId}: Emotional conclusion generated`);
      } else {
        steps = updateStep(steps, 'conclusion', { status: 'error', detail: 'Falha' });
      }
    } catch (conclusionError) {
      console.error(`[Orchestrator] Job ${jobId}: Conclusion error:`, conclusionError);
      steps = updateStep(steps, 'conclusion', { status: 'error', detail: 'Erro' });
    }
    
    await updateJobProgress(supabase, jobId, { steps });
    
    // Mark job as completed
    await updateJobProgress(supabase, jobId, { 
      status: 'completed',
      steps,
    });
    
    console.log(`[Orchestrator] Job ${jobId}: Generation completed successfully!`);
    
    // Notify admins
    try {
      await callLocalEdgeFunction('notify-article-ready', {
        articleId: savedArticleId,
        articleTitle: articleData.title,
        articleSlug: articleData.slug,
      });
    } catch (notifyError) {
      console.error(`[Orchestrator] Job ${jobId}: Notification error:`, notifyError);
    }
    
  } catch (error) {
    console.error(`[Orchestrator] Job ${jobId}: Fatal error:`, error);
    
    // Mark failed steps
    steps = steps.map(step => 
      step.status === 'loading' || step.status === 'pending'
        ? { ...step, status: 'error' as const }
        : step
    );
    
    await updateJobProgress(supabase, jobId, { 
      status: 'failed',
      steps,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use external Supabase credentials
    const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL')!;
    const serviceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    const { topic, user_id } = await req.json();
    
    if (!topic || !user_id) {
      return new Response(
        JSON.stringify({ error: 'topic and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a new job record
    const { data: job, error: jobError } = await supabase
      .from('generation_jobs')
      .insert({
        user_id,
        topic,
        status: 'pending',
        steps: DEFAULT_STEPS,
      })
      .select()
      .single();
      
    if (jobError || !job) {
      console.error('[Orchestrator] Failed to create job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Failed to create generation job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[Orchestrator] Created job ${job.id} for topic: ${topic}`);
    
    // Start the generation process in the background
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      runGenerationProcess(supabase, job.id, topic, user_id)
    );
    
    // Return immediately with the job ID
    return new Response(
      JSON.stringify({ 
        success: true,
        job_id: job.id,
        message: 'Generation started in background'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Orchestrator] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
