/**
 * Cloudflare Worker - Image Generator using Workers AI
 * 
 * This worker generates images using Cloudflare's AI (Stable Diffusion XL)
 * as a fallback when the primary image generation service (Replicate) fails.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Application → Create Worker
 * 2. Name it something like "image-generator" or "home-garden-ai-images"
 * 3. Replace the default code with this file's content
 * 4. Click "Save and Deploy"
 * 5. Go to Settings → Variables → AI Bindings → Add Binding
 *    - Variable name: AI
 *    - Leave other settings as default
 * 6. Save and deploy again
 * 7. Copy the worker URL (e.g., https://image-generator.your-subdomain.workers.dev)
 * 8. Add this URL as CLOUDFLARE_AI_WORKER_URL secret in Supabase
 * 
 * MODEL: @cf/stabilityai/stable-diffusion-xl-base-1.0
 * OUTPUT: PNG image (binary)
 * 
 * MINIMUM VALID IMAGE SIZE: 10KB (anything smaller is likely an error)
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      // Parse the request body
      const { prompt } = await request.json();

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Prompt is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`[Workers AI] Generating image for prompt: ${prompt.substring(0, 100)}...`);

      // Check if AI binding is available
      if (!env.AI) {
        console.error('[Workers AI] AI binding not configured');
        return new Response(
          JSON.stringify({ error: 'AI binding not configured. Add AI binding in Worker settings.' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Call Stable Diffusion XL model
      console.log('[Workers AI] Calling @cf/stabilityai/stable-diffusion-xl-base-1.0...');
      
      const response = await env.AI.run(
        '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        {
          prompt: prompt,
          // Parameters for quality (num_steps max is 20)
          num_steps: 20,         // Maximum allowed value for this model
          guidance: 7.5,         // How closely to follow the prompt (default: 7.5)
        }
      );

      // The response is a ReadableStream containing the PNG image
      if (!response) {
        console.error('[Workers AI] No response from AI model');
        return new Response(
          JSON.stringify({ error: 'No response from AI model' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Convert to array buffer to check size
      const arrayBuffer = await response.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);
      
      console.log(`[Workers AI] Received ${imageBytes.length} bytes`);

      // Validate image size - reduced to 1KB to allow smaller valid images
      // Cloudflare SDXL typically produces images 100KB+ but we accept smaller valid PNG images
      if (imageBytes.length < 1000) {
        console.error(`[Workers AI] Response too small (${imageBytes.length} bytes) - likely an error response, not an image`);
        return new Response(
          JSON.stringify({ 
            error: `Invalid image response: only ${imageBytes.length} bytes received. The AI model may have failed or returned an error message.`,
            size: imageBytes.length
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      console.log(`[Workers AI] Image size validation passed: ${imageBytes.length} bytes`);

      console.log('[Workers AI] Image generated successfully');

      // Return the image directly as PNG
      return new Response(imageBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Content-Length': imageBytes.length.toString(),
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });

    } catch (error) {
      console.error('[Workers AI] Error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Failed to generate image',
          details: error.toString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  },
};
