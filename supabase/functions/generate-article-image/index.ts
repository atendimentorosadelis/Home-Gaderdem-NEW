import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Convert PNG to WebP using imagescript library
async function convertPngToWebP(pngBytes: Uint8Array): Promise<Uint8Array> {
  try {
    console.log(`[Convert] Converting PNG (${pngBytes.length} bytes) to WebP...`);
    
    // Decode PNG image
    const image = await Image.decode(pngBytes);
    
    // Encode to WebP with 85% quality
    const webpBytes = await image.encodeWebP(85);
    
    console.log(`[Convert] Conversion complete: ${pngBytes.length} -> ${webpBytes.length} bytes (${Math.round((1 - webpBytes.length / pngBytes.length) * 100)}% smaller)`);
    
    return webpBytes;
  } catch (error) {
    console.error("[Convert] Failed to convert PNG to WebP:", error);
    // Return original if conversion fails
    return pngBytes;
  }
}

// ============================================
// CLOUDFLARE WORKERS AI FALLBACK LOGIC
// ============================================

interface CloudflareImageResult {
  success: boolean;
  imageBytes: Uint8Array | null;
  error?: string;
}

/**
 * Generate image using Cloudflare Workers AI as fallback
 * Uses @cf/stabilityai/stable-diffusion-xl-base-1.0 model
 */
async function generateImageWithCloudflare(prompt: string): Promise<CloudflareImageResult> {
  const workerUrl = Deno.env.get("CLOUDFLARE_AI_WORKER_URL");
  
  if (!workerUrl) {
    console.error("[Cloudflare Fallback] CLOUDFLARE_AI_WORKER_URL not configured");
    return { success: false, imageBytes: null, error: "Cloudflare Worker URL not configured" };
  }

  console.log("[Cloudflare Fallback] Calling Cloudflare Workers AI...");
  console.log(`[Cloudflare Fallback] Worker URL: ${workerUrl.substring(0, 50)}...`);
  
  // Enhance prompt for Stable Diffusion (different from Flux)
  const enhancedPrompt = enhancePromptForStableDiffusion(prompt);
  console.log(`[Cloudflare Fallback] Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Cloudflare Fallback] Worker error: ${response.status} - ${errorText}`);
      return { success: false, imageBytes: null, error: `Worker error: ${response.status}` };
    }

    // The worker should return the image as binary data or base64
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("image/")) {
      // Direct binary image response
      const imageBytes = new Uint8Array(await response.arrayBuffer());
      console.log(`[Cloudflare Fallback] Received image: ${imageBytes.length} bytes`);
      
      // Minimal validation - just ensure we got some data (at least 100 bytes)
      // No size restrictions - accept any valid image regardless of file size
      if (imageBytes.length < 100) {
        console.error(`[Cloudflare Fallback] Response too small (${imageBytes.length} bytes) - not an image`);
        return { 
          success: false, 
          imageBytes: null, 
          error: `Invalid response: only ${imageBytes.length} bytes. Not a valid image.` 
        };
      }
      console.log(`[Cloudflare Fallback] Image accepted: ${imageBytes.length} bytes`);
      
      
      return { success: true, imageBytes };
    } else if (contentType.includes("application/json")) {
      // JSON response with base64 image
      const data = await response.json();
      
      if (data.image) {
        // Handle base64 encoded image
        const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
        const binaryString = atob(base64Data);
        const imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
        console.log(`[Cloudflare Fallback] Decoded base64 image: ${imageBytes.length} bytes`);
        return { success: true, imageBytes };
      } else if (data.error) {
        return { success: false, imageBytes: null, error: data.error };
      }
    }

    console.error("[Cloudflare Fallback] Unexpected response format");
    return { success: false, imageBytes: null, error: "Unexpected response format from worker" };

  } catch (error) {
    console.error("[Cloudflare Fallback] Error:", error);
    return { 
      success: false, 
      imageBytes: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Enhance prompt for Stable Diffusion XL (different optimization than Flux)
 */
function enhancePromptForStableDiffusion(originalPrompt: string): string {
  // Stable Diffusion responds better to specific quality tags
  const qualityTags = [
    "masterpiece",
    "best quality", 
    "ultra-detailed",
    "professional photography",
    "8k uhd",
    "sharp focus",
    "natural lighting",
  ];
  
  // Add quality tags if not already present
  let enhanced = originalPrompt;
  
  // Check if prompt already has quality indicators
  const hasQuality = /\b(8k|uhd|masterpiece|professional|high quality)\b/i.test(originalPrompt);
  
  if (!hasQuality) {
    enhanced = `${qualityTags.join(", ")}, ${originalPrompt}`;
  }
  
  // Ensure anti-text clause is present for SDXL too
  if (!enhanced.includes("no text")) {
    enhanced += ", no text, no words, no watermarks, no logos";
  }
  
  return enhanced;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    const CLOUDFLARE_WORKER_URL = Deno.env.get("CLOUDFLARE_AI_WORKER_URL");
    
    if (!REPLICATE_API_KEY && !CLOUDFLARE_WORKER_URL) {
      console.error("No image generation service configured");
      throw new Error("Neither REPLICATE_API_KEY nor CLOUDFLARE_AI_WORKER_URL is configured");
    }

    // Use EXTERNAL Supabase for data operations
    const EXTERNAL_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY");
    const SUPABASE_URL = EXTERNAL_URL || Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = EXTERNAL_KEY || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log(`[Config] Using external DB: ${!!EXTERNAL_URL}, URL prefix: ${SUPABASE_URL?.substring(0, 30)}...`);
    console.log(`[Config] Replicate available: ${!!REPLICATE_API_KEY}, Cloudflare fallback: ${!!CLOUDFLARE_WORKER_URL}`);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch AI settings from database to determine which provider to use
    let imageProvider: 'auto' | 'replicate' | 'cloudflare' = 'auto';
    try {
      const { data: aiSettingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'ai_settings')
        .maybeSingle();
      
      if (aiSettingsData?.value && typeof aiSettingsData.value === 'object') {
        const value = aiSettingsData.value as { image_provider?: string };
        if (value.image_provider === 'replicate' || value.image_provider === 'cloudflare') {
          imageProvider = value.image_provider;
        }
      }
      console.log(`[Config] Image provider setting: ${imageProvider}`);
    } catch (settingsError) {
      console.warn('[Config] Could not fetch AI settings, using auto mode:', settingsError);
    }

    const { 
      title, 
      category, 
      tags, 
      type = 'cover', 
      customPrompt, 
      visualContext, 
      mainSubject, 
      slug,
      articleId,
      imageType,
      imageIndex = 0,
      fromQueue = false,
      regenerate = false
    } = await req.json();
    
    // Use imageType if provided (for regeneration), otherwise use type
    const finalType = imageType || type;
    
    if (!title && !customPrompt) {
      throw new Error("Title or customPrompt is required");
    }

    console.log(`Generating ${finalType} image for: ${title || customPrompt}, category: ${category}`);
    console.log(`Main subject provided: ${mainSubject || 'No'}`);
    console.log(`Visual context provided: ${visualContext ? 'Yes' : 'No'}`);
    console.log(`Article ID: ${articleId || 'Not provided'}`);
    console.log(`Regenerate mode: ${regenerate}`);

    // Portuguese to English translation map for common terms (fallback)
    const subjectTranslations: Record<string, string> = {
      'lareira': 'fireplace',
      'lareiras': 'fireplaces',
      'jardim': 'garden',
      'jardins': 'gardens',
      'plantas': 'plants',
      'planta': 'plant',
      'suculentas': 'succulent plants',
      'suculenta': 'succulent plant',
      'cactos': 'cactus plants',
      'cacto': 'cactus',
      'orquídeas': 'orchids',
      'orquídea': 'orchid',
      'samambaias': 'ferns',
      'samambaia': 'fern',
      'decoração': 'home decor',
      'pergolado': 'pergola',
      'varanda': 'balcony',
      'terraço': 'terrace',
      'piscina': 'swimming pool',
      'churrasqueira': 'barbecue grill',
      'cozinha': 'kitchen',
      'sala de jantar': 'dining room',
      'salas de jantar': 'dining rooms',
      'sala de estar': 'living room',
      'salas de estar': 'living rooms',
      'sala de tv': 'TV room',
      'sala': 'living room',
      'quarto': 'bedroom',
      'quartos': 'bedrooms',
      'banheiro': 'bathroom',
      'banheiros': 'bathrooms',
      'lavabo': 'powder room',
      'lavabos': 'powder rooms',
      'escritório': 'home office',
      'escritórios': 'home offices',
      'home office': 'home office',
      'home theater': 'home theater',
      'closet': 'walk-in closet',
      'closets': 'walk-in closets',
      'área gourmet': 'gourmet area',
      'áreas gourmet': 'gourmet areas',
      'espaço gourmet': 'gourmet space',
      'área de lazer': 'leisure area',
      'área de serviço': 'laundry room',
      'lavanderia': 'laundry room',
      'despensa': 'pantry',
      'hall de entrada': 'entrance hall',
      'hall': 'hallway',
      'corredor': 'hallway',
      'escada': 'staircase',
      'escadas': 'staircases',
      'sótão': 'attic',
      'porão': 'basement',
      'garagem': 'garage',
      'móveis': 'furniture',
      'iluminação': 'lighting',
      'cortinas': 'curtains',
      'persianas': 'blinds',
      'tapetes': 'rugs',
      'carpete': 'carpet',
      'quadros': 'wall art',
      'espelhos': 'mirrors',
      'prateleiras': 'shelves',
      'estantes': 'bookshelves',
      'sofá': 'sofa',
      'sofás': 'sofas',
      'poltrona': 'armchair',
      'poltronas': 'armchairs',
      'mesa de centro': 'coffee table',
      'mesa de jantar': 'dining table',
      'cadeiras': 'chairs',
      'luminária': 'lamp',
      'luminárias': 'lamps',
      'lustre': 'chandelier',
      'lustres': 'chandeliers',
      'pendente': 'pendant light',
      'pendentes': 'pendant lights',
    };

    // Function to extract and translate subject from Portuguese title
    function extractSubjectFromTitle(title: string): string {
      const lowerTitle = title.toLowerCase();
      
      // Find matching translations
      for (const [pt, en] of Object.entries(subjectTranslations)) {
        if (lowerTitle.includes(pt)) {
          // Build a more complete subject based on context
          const isIndoor = lowerTitle.includes('interior') || lowerTitle.includes('interno') || lowerTitle.includes('sala') || lowerTitle.includes('quarto');
          const isOutdoor = lowerTitle.includes('externo') || lowerTitle.includes('jardim') || lowerTitle.includes('quintal');
          
          if (isIndoor) {
            return `${en} in modern indoor setting`;
          } else if (isOutdoor) {
            return `${en} in beautiful outdoor garden`;
          }
          return en;
        }
      }
      
      // Default fallback based on category
      return 'home interior design element';
    }

    // Category-specific style prompts (used as fallback when no visualContext)
    const categoryPrompts: Record<string, string> = {
      'decoracao': 'modern interior design, elegant home decor, professional photography, warm natural lighting, 8K quality, magazine style',
      'jardim': 'beautiful garden, lush green plants, natural light, botanical photography, serene atmosphere, professional quality',
      'diy': 'handmade home project, rustic aesthetic, workshop setting, DIY crafts, cozy atmosphere, natural materials',
      'tendencias': 'contemporary home design 2026, minimalist luxury, editorial style, architectural photography, modern aesthetic',
      'plantas-internas': 'indoor plants arrangement, urban jungle, natural home decoration, green living space, botanical interior, INDOOR SETTING',
    };

    // Determine the main subject - prioritize provided mainSubject, then extract from title
    const subject = mainSubject || extractSubjectFromTitle(title || '');
    
    // Use visualContext as setting description
    const setting = visualContext || categoryPrompts[category] || 'beautiful home interior, professional photography, warm lighting';
    
    const tagsContext = tags?.slice(0, 3).join(', ') || '';
    
    // Build prompt based on type - ALWAYS put subject first
    let prompt: string;
    
    // Anti-text clause to prevent text/watermarks in generated images
    const antiTextClause = "no text, no words, no letters, no typography, no watermarks, no logos, no labels, no signs";
    
    if (finalType === 'cover') {
      // For cover images: Subject first, then hero-style composition
      prompt = `${subject}, professional hero photograph for home design magazine. Environment: ${setting}. Wide 16:9 cinematic composition, ultra high resolution, professional interior photography, sharp focus, beautiful lighting. ${antiTextClause}.`;
    } else {
      // For gallery images: customPrompt should already have subject first (from GPT)
      // But we ensure the setting is added as context
      const galleryPrompt = customPrompt || `${subject}, detailed professional photography`;
      prompt = `${galleryPrompt}. Setting: ${setting}. Professional interior photography, sharp focus, beautiful natural lighting, magazine quality. ${antiTextClause}.`;
    }

    console.log(`Final prompt: ${prompt}`);

    // Determine aspect ratio based on image type
    const aspectRatio = finalType === 'cover' ? '16:9' : '4:3';

    // ============================================
    // IMAGE GENERATION WITH PROVIDER SELECTION
    // ============================================
    
    let imageBytes: Uint8Array | null = null;
    let usedFallback = false;
    let generationError: string | null = null;

    // Determine which provider(s) to try based on settings
    const shouldTryReplicate = imageProvider === 'auto' || imageProvider === 'replicate';
    const shouldTryCloudflare = imageProvider === 'auto' || imageProvider === 'cloudflare';
    const cloudflareOnly = imageProvider === 'cloudflare';

    console.log(`[Provider] Mode: ${imageProvider}, Try Replicate: ${shouldTryReplicate}, Try Cloudflare: ${shouldTryCloudflare}`);

    // Try Replicate first if configured and allowed by settings
    if (shouldTryReplicate && REPLICATE_API_KEY && !cloudflareOnly) {
      try {
        console.log("[Replicate] Calling Replicate API with Flux model (WebP output)...");
        
        const replicateResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "wait"
          },
          body: JSON.stringify({
            input: {
              prompt: prompt,
              aspect_ratio: aspectRatio,
              output_format: "webp",
              output_quality: 85,
              num_outputs: 1,
              go_fast: true
            }
          })
        });

        if (!replicateResponse.ok) {
          const errorText = await replicateResponse.text();
          console.error(`[Replicate] API error: ${replicateResponse.status} - ${errorText}`);
          
          // Check for specific errors that indicate we should use fallback
          if (replicateResponse.status === 429) {
            generationError = "Rate limit exceeded";
          } else if (replicateResponse.status === 401 || replicateResponse.status === 403) {
            generationError = "Invalid API key or insufficient balance";
          } else if (replicateResponse.status === 402) {
            generationError = "Payment required - insufficient balance";
          } else {
            generationError = `API error: ${replicateResponse.status}`;
          }
          
          throw new Error(generationError);
        }

        const prediction = await replicateResponse.json();
        console.log("[Replicate] Prediction response status:", prediction.status);

        // Handle async prediction - poll for result if needed
        let imageUrl: string | null = null;
        
        if (prediction.status === 'succeeded' && prediction.output) {
          imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        } else if (prediction.status === 'processing' || prediction.status === 'starting') {
          console.log("[Replicate] Prediction still processing, polling for result...");
          const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
          
          let attempts = 0;
          const maxAttempts = 60;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const pollResponse = await fetch(pollUrl, {
              headers: {
                "Authorization": `Bearer ${REPLICATE_API_KEY}`,
              }
            });
            
            if (!pollResponse.ok) {
              throw new Error(`Failed to poll prediction: ${pollResponse.status}`);
            }
            
            const pollResult = await pollResponse.json();
            console.log(`[Replicate] Poll attempt ${attempts + 1}: status = ${pollResult.status}`);
            
            if (pollResult.status === 'succeeded') {
              imageUrl = Array.isArray(pollResult.output) ? pollResult.output[0] : pollResult.output;
              break;
            } else if (pollResult.status === 'failed' || pollResult.status === 'canceled') {
              throw new Error(`Prediction failed: ${pollResult.error || 'Unknown error'}`);
            }
            
            attempts++;
          }
          
          if (!imageUrl) {
            throw new Error("Prediction timed out");
          }
        } else if (prediction.status === 'failed') {
          throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
        }

        if (!imageUrl) {
          throw new Error("No image was generated");
        }

        console.log(`[Replicate] Generated image URL: ${imageUrl}`);

        // Download the image with retry logic
        const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
          let lastError: Error | null = null;
          
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                return response;
              }
              throw new Error(`Failed to download image: ${response.status}`);
            } catch (error) {
              lastError = error instanceof Error ? error : new Error(String(error));
              const isDnsError = lastError.message.includes('dns error') || 
                                lastError.message.includes('name resolution') ||
                                lastError.message.includes('Connect');
              
              if (isDnsError && attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`[Replicate] DNS error on attempt ${attempt + 1}, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              throw lastError;
            }
          }
          throw lastError || new Error('Failed to fetch image after retries');
        };

        const imageResponse = await fetchWithRetry(imageUrl);
        imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
        
        console.log(`[Replicate] Downloaded image: ${imageBytes.length} bytes (WebP format)`);
        
      } catch (error) {
        console.error("[Replicate] Failed:", error);
        generationError = error instanceof Error ? error.message : "Unknown Replicate error";
        
        // Will try fallback below
      }
    }

    // Try Cloudflare if Replicate failed, wasn't configured, or if Cloudflare is the only provider
    if (!imageBytes && shouldTryCloudflare && CLOUDFLARE_WORKER_URL) {
      const reason = cloudflareOnly ? 'configured as primary provider' : `Replicate failed (${generationError})`;
      console.log(`[Cloudflare] Using Cloudflare Workers AI: ${reason}`);
      usedFallback = !cloudflareOnly; // Only mark as fallback if it wasn't the primary choice
      
      const cloudflareResult = await generateImageWithCloudflare(prompt);
      
      if (cloudflareResult.success && cloudflareResult.imageBytes) {
        imageBytes = cloudflareResult.imageBytes;
        console.log(`[Cloudflare] Generated image: ${imageBytes.length} bytes`);
      } else {
        const cloudflareError = cloudflareResult.error || 'Unknown error';
        console.error(`[Cloudflare] Failed: ${cloudflareError}`);
        
        if (cloudflareOnly) {
          throw new Error(`Cloudflare failed: ${cloudflareError}`);
        } else {
          throw new Error(`Both Replicate and Cloudflare failed. Replicate: ${generationError}. Cloudflare: ${cloudflareError}`);
        }
      }
    }

    // If still no image, throw error
    if (!imageBytes) {
      throw new Error(generationError || "No image generation service available");
    }

    // Convert PNG to WebP if from Cloudflare fallback
    let finalImageBytes = imageBytes;
    let imageFormat = 'webp';
    
    if (usedFallback) {
      console.log(`[Fallback] Converting Cloudflare PNG to WebP...`);
      finalImageBytes = await convertPngToWebP(imageBytes);
      // Check if conversion was successful (WebP should be smaller or at least valid)
      if (finalImageBytes.length > 0) {
        imageFormat = 'webp';
        console.log(`[Fallback] PNG converted to WebP successfully`);
      } else {
        // Fallback to PNG if conversion failed
        finalImageBytes = imageBytes;
        imageFormat = 'png';
        console.warn(`[Fallback] Keeping PNG format (conversion failed)`);
      }
    }

    const fileSize = finalImageBytes.length;
    console.log(`[Success] Image ready: ${fileSize} bytes, format: ${imageFormat}, used fallback: ${usedFallback}`);

    // Generate unique filename - always use .webp extension now
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const safeSlug = (slug || 'article').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const fileName = `${safeSlug}/${type}-${timestamp}-${randomId}.${imageFormat}`;

    console.log(`Uploading image to storage: ${fileName}`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(fileName, finalImageBytes, {
        contentType: `image/${imageFormat}`,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    console.log(`Generated ${type} image URL: ${publicUrl}`);

    // Save metadata and update article if regenerating
    if (articleId) {
      console.log(`Saving image metadata for article ${articleId}`);
      
      // If regenerating, update the article directly
      if (regenerate) {
        if (finalType === 'cover') {
          // First check if article exists
          const { data: existingArticle, error: selectError } = await supabase
            .from('content_articles')
            .select('id, cover_image')
            .eq('id', articleId)
            .maybeSingle();
          
          console.log(`[DB Check] Article ${articleId} exists: ${!!existingArticle}, select error: ${selectError?.message || 'none'}`);
          
          if (existingArticle) {
            const { error: updateError, data: updateData, status: updateStatus } = await supabase
              .from('content_articles')
              .update({ cover_image: publicUrl })
              .eq('id', articleId)
              .select();
            
            console.log(`[DB Update] Status: ${updateStatus}, Error: ${updateError?.message || 'none'}, Updated rows: ${updateData?.length || 0}`);
            
            if (updateError) {
              console.error(`Failed to update cover_image: ${updateError.message}`);
            } else if (updateData && updateData.length > 0) {
              console.log(`Cover image updated successfully for article ${articleId}`);
            } else {
              console.warn(`No rows updated for article ${articleId} - RLS may be blocking`);
            }
          } else {
            console.warn(`Article ${articleId} not found in database`);
          }
        } else {
          // Update gallery image at specific index
          const { data: article } = await supabase
            .from('content_articles')
            .select('gallery_images')
            .eq('id', articleId)
            .maybeSingle();
          
          if (article) {
            const gallery = (article.gallery_images as string[] | null) || [];
            gallery[imageIndex] = publicUrl;
            const { error: galleryError } = await supabase
              .from('content_articles')
              .update({ gallery_images: gallery })
              .eq('id', articleId);
            
            if (galleryError) {
              console.error(`Failed to update gallery: ${galleryError.message}`);
            }
          }
        }
        console.log("Article updated with regenerated image");
      }
      
      const { error: metadataError } = await supabase
        .from('article_images')
        .insert({
          article_id: articleId,
          image_type: finalType,
          image_index: finalType === 'cover' ? 0 : imageIndex,
          storage_path: fileName,
          public_url: publicUrl,
          file_size: fileSize,
          format: imageFormat,
          original_prompt: prompt,
        });

      if (metadataError) {
        console.error("Error saving image metadata:", metadataError);
      } else {
        console.log("Image metadata saved successfully");
      }
    }

    // Determine provider name for UI feedback
    const providerName = usedFallback ? 'Cloudflare' : (REPLICATE_API_KEY ? 'Replicate' : 'Cloudflare');
    console.log(`[Response] Provider used: ${providerName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl, 
        prompt, 
        type,
        fileSize,
        format: imageFormat,
        storagePath: fileName,
        usedFallback,
        provider: providerName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error generating image:", error);
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
