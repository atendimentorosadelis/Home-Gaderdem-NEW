import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationResult {
  processed: number;
  converted: number;
  skipped: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations
    const SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let batchSize = 20;
    try {
      const body = await req.json();
      batchSize = body.batchSize || 20;
    } catch { /* use defaults */ }

    console.log(`Starting image migration with batch size: ${batchSize}`);

    const result: MigrationResult = {
      processed: 0,
      converted: 0,
      skipped: 0,
      errors: [],
    };

    // Get all articles with cover_image or gallery_images that are PNG
    const { data: articles, error: articlesError } = await supabase
      .from('content_articles')
      .select('id, slug, title, cover_image, gallery_images')
      .limit(batchSize);

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No articles to process', ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const article of articles) {
      try {
        const imagesToProcess: { type: 'cover' | 'gallery'; index: number; url: string }[] = [];

        // Check cover image
        if (article.cover_image && article.cover_image.includes('.png')) {
          imagesToProcess.push({ type: 'cover', index: 0, url: article.cover_image });
        }

        // Check gallery images
        const galleryImages = (article.gallery_images as string[]) || [];
        galleryImages.forEach((url, index) => {
          if (url && url.includes('.png')) {
            imagesToProcess.push({ type: 'gallery', index, url });
          }
        });

        if (imagesToProcess.length === 0) {
          result.skipped++;
          continue;
        }

        for (const img of imagesToProcess) {
          result.processed++;

          // Check if already registered in article_images
          const { data: existing } = await supabase
            .from('article_images')
            .select('id')
            .eq('article_id', article.id)
            .eq('image_type', img.type)
            .eq('image_index', img.index)
            .single();

          if (existing) {
            console.log(`Image already registered: ${article.id} - ${img.type} ${img.index}`);
            result.skipped++;
            continue;
          }

          // Extract storage path from URL
          const urlParts = img.url.split('/article-images/');
          if (urlParts.length < 2) {
            console.log(`Invalid URL format: ${img.url}`);
            result.errors.push(`Invalid URL: ${img.url}`);
            continue;
          }

          const storagePath = urlParts[1].split('?')[0]; // Remove query params

          // Get file info
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('article-images')
            .download(storagePath);

          if (downloadError || !fileData) {
            console.error(`Failed to download: ${storagePath}`, downloadError);
            result.errors.push(`Download failed: ${storagePath}`);
            continue;
          }

          const fileSize = fileData.size;
          const format = storagePath.endsWith('.webp') ? 'webp' : 'png';

          // Register in article_images table
          const { error: insertError } = await supabase
            .from('article_images')
            .insert({
              article_id: article.id,
              image_type: img.type,
              image_index: img.index,
              storage_path: storagePath,
              public_url: img.url,
              file_size: fileSize,
              format: format,
              original_prompt: null, // We don't have the original prompt for existing images
            });

          if (insertError) {
            console.error(`Failed to register image:`, insertError);
            result.errors.push(`Insert failed: ${insertError.message}`);
            continue;
          }

          result.converted++;
          console.log(`Registered: ${article.id} - ${img.type} ${img.index} (${format}, ${fileSize} bytes)`);
        }
      } catch (articleError) {
        const errorMessage = articleError instanceof Error ? articleError.message : String(articleError);
        console.error(`Error processing article ${article.id}:`, errorMessage);
        result.errors.push(`Article ${article.id}: ${errorMessage}`);
      }
    }

    console.log(`Migration complete: ${result.converted} converted, ${result.skipped} skipped, ${result.errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result,
        message: `Processed ${result.processed} images. Registered ${result.converted}. Skipped ${result.skipped}.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
