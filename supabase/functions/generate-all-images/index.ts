import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lovable Cloud URL for Edge Functions (functions are deployed here)
const LOVABLE_FUNCTIONS_URL = 'https://gcdwdjacrxmdsciwqtlc.supabase.co';
const LOVABLE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZHdkamFjcnhtZHNjaXdxdGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDIxOTcsImV4cCI6MjA4NDQxODE5N30.mxryA4KPolNzIZQXo-ZSyp18n8OliIrhabKpLljf1vU';

interface ImageResult {
  index: number;
  type: 'cover' | 'gallery';
  success: boolean;
  imageUrl?: string;
  error?: string;
}

interface GenerateAllImagesRequest {
  articleId: string;
  title: string;
  slug: string;
  mainSubject: string;
  visualContext: string;
  coverPrompt?: string;
  galleryPrompts: string[];
}

/**
 * Generate a single image by calling the generate-article-image function
 */
async function generateSingleImage(params: {
  index: number;
  type: 'cover' | 'gallery';
  prompt: string;
  title: string;
  slug: string;
  mainSubject: string;
  visualContext: string;
  articleId: string;
}): Promise<ImageResult> {
  const { index, type, prompt, title, slug, mainSubject, visualContext, articleId } = params;
  
  console.log(`[Image ${index}] Starting ${type} generation...`);
  
  try {
    const response = await fetch(
      `${LOVABLE_FUNCTIONS_URL}/functions/v1/generate-article-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_ANON_KEY}`,
          'apikey': LOVABLE_ANON_KEY,
        },
        body: JSON.stringify({
          customPrompt: prompt,
          mainSubject,
          visualContext,
          title,
          type,
          slug,
          articleId,
          imageIndex: type === 'gallery' ? index - 1 : 0, // gallery images are 0-indexed (cover is index 0 in our loop)
          fromQueue: false,
          regenerate: true, // Enable direct DB update
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Image ${index}] HTTP error: ${response.status} - ${errorText}`);
      return {
        index,
        type,
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
      };
    }

    const result = await response.json();
    
    if (!result.success || !result.imageUrl) {
      console.error(`[Image ${index}] Generation failed:`, result.error);
      return {
        index,
        type,
        success: false,
        error: result.error || 'No image URL returned',
      };
    }

    console.log(`[Image ${index}] Success: ${result.imageUrl.substring(0, 80)}...`);
    return {
      index,
      type,
      success: true,
      imageUrl: result.imageUrl,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Image ${index}] Exception:`, errorMessage);
    return {
      index,
      type,
      success: false,
      error: errorMessage,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      articleId,
      title,
      slug,
      mainSubject,
      visualContext,
      coverPrompt,
      galleryPrompts,
    }: GenerateAllImagesRequest = await req.json();

    // Validation
    if (!articleId) {
      throw new Error('articleId is required');
    }
    if (!galleryPrompts || !Array.isArray(galleryPrompts)) {
      throw new Error('galleryPrompts must be an array');
    }
    
    console.log(`[GenerateAllImages] Starting parallel generation for article ${articleId}`);
    console.log(`[GenerateAllImages] Main subject: ${mainSubject}`);
    console.log(`[GenerateAllImages] Gallery prompts count: ${galleryPrompts.length}`);

    // Build the cover prompt if not provided
    const finalCoverPrompt = coverPrompt || 
      `${mainSubject}, professional hero photograph for home design magazine. Environment: ${visualContext}. Wide 16:9 cinematic composition, ultra high resolution, professional interior photography, sharp focus, beautiful lighting. no text, no words, no watermarks, no logos.`;

    // Ensure we have exactly 5 gallery prompts (plus 1 cover = 6 total)
    const normalizedGalleryPrompts = [...galleryPrompts];
    while (normalizedGalleryPrompts.length < 5) {
      normalizedGalleryPrompts.push(
        `${mainSubject}, detail shot ${normalizedGalleryPrompts.length + 1}, ${visualContext}, natural lighting, ultra realistic, professional photography`
      );
    }
    // Take only first 5 for gallery
    const finalGalleryPrompts = normalizedGalleryPrompts.slice(0, 5);

    console.log(`[GenerateAllImages] Generating 6 images in parallel (1 cover + 5 gallery)...`);

    // Create all 6 image generation promises
    const imagePromises: Promise<ImageResult>[] = [];

    // 1. Cover image (index 0)
    imagePromises.push(
      generateSingleImage({
        index: 0,
        type: 'cover',
        prompt: finalCoverPrompt,
        title,
        slug,
        mainSubject,
        visualContext,
        articleId,
      })
    );

    // 2-6. Gallery images (indices 1-5)
    for (let i = 0; i < finalGalleryPrompts.length; i++) {
      imagePromises.push(
        generateSingleImage({
          index: i + 1,
          type: 'gallery',
          prompt: finalGalleryPrompts[i],
          title,
          slug,
          mainSubject,
          visualContext,
          articleId,
        })
      );
    }

    // Execute ALL in parallel using Promise.all
    const startTime = Date.now();
    const results = await Promise.all(imagePromises);
    const duration = Date.now() - startTime;

    console.log(`[GenerateAllImages] All images processed in ${duration}ms`);

    // Separate results
    const coverResult = results.find(r => r.type === 'cover');
    const galleryResults = results.filter(r => r.type === 'gallery').sort((a, b) => a.index - b.index);

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[GenerateAllImages] Results: ${succeeded} succeeded, ${failed} failed`);

    // Update article in database with all image URLs
    const EXTERNAL_URL = Deno.env.get('EXTERNAL_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '';
    const EXTERNAL_KEY = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(EXTERNAL_URL, EXTERNAL_KEY);

    // Build gallery_images array
    const galleryImages: string[] = [];
    for (let i = 0; i < 5; i++) {
      const result = galleryResults.find(r => r.index === i + 1);
      galleryImages.push(result?.success && result.imageUrl ? result.imageUrl : '');
    }

    // Update article with cover and gallery images
    const updateData: Record<string, unknown> = {
      gallery_images: galleryImages,
      updated_at: new Date().toISOString(),
    };

    if (coverResult?.success && coverResult.imageUrl) {
      updateData.cover_image = coverResult.imageUrl;
    }

    const { error: updateError } = await supabase
      .from('content_articles')
      .update(updateData)
      .eq('id', articleId);

    if (updateError) {
      console.error(`[GenerateAllImages] Failed to update article: ${updateError.message}`);
    } else {
      console.log(`[GenerateAllImages] Article updated with ${succeeded} images`);
    }

    // Send notification if all complete
    if (succeeded > 0 || failed > 0) {
      try {
        await fetch(`${LOVABLE_FUNCTIONS_URL}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOVABLE_ANON_KEY}`,
            'apikey': LOVABLE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'notify-admins',
            payload: {
              title: failed === 0 ? '✅ Imagens geradas com sucesso' : `⚠️ ${succeeded}/6 imagens geradas`,
              body: `Artigo "${title.substring(0, 40)}..." - ${succeeded} imagens prontas${failed > 0 ? `, ${failed} falharam` : ''}`,
              type: failed === 0 ? 'success' : 'warning',
              url: `/admin/articles/${articleId}`,
            },
          }),
        });
      } catch (notifError) {
        console.error('[GenerateAllImages] Notification error:', notifError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        articleId,
        totalImages: 6,
        succeeded,
        failed,
        durationMs: duration,
        coverImage: coverResult?.imageUrl || null,
        galleryImages,
        results: results.map(r => ({
          index: r.index,
          type: r.type,
          success: r.success,
          imageUrl: r.imageUrl || null,
          error: r.error || null,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GenerateAllImages] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
