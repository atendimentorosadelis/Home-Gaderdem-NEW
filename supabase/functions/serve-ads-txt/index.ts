import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try external Supabase first, fall back to local
    let supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL') || '';
    let supabaseKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') || '';

    // Validate URL format, fallback to local if invalid
    try {
      if (supabaseUrl) new URL(supabaseUrl);
    } catch {
      console.warn('Invalid EXTERNAL_SUPABASE_URL, falling back to local Supabase');
      supabaseUrl = '';
    }

    if (!supabaseUrl) {
      supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    }

    console.log('Using Supabase URL:', supabaseUrl.substring(0, 30) + '...');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching ads.txt content from database...');

    // Fetch SEO settings from database
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'seo_settings')
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    let adsTxtContent = '';

    if (data?.value && typeof data.value === 'object') {
      const seoSettings = data.value as Record<string, unknown>;
      adsTxtContent = (seoSettings.ads_txt_content as string) || '';
      
      // If no custom content but has publisher ID, generate default
      if (!adsTxtContent && seoSettings.adsense_publisher_id) {
        const publisherId = (seoSettings.adsense_publisher_id as string).replace('ca-pub-', '');
        adsTxtContent = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`;
      }
    }

    // If still empty, return a comment explaining
    if (!adsTxtContent.trim()) {
      adsTxtContent = '# ads.txt not configured\n# Configure in Admin Panel > Settings > SEO > Google AdSense';
    }

    console.log('Serving ads.txt content:', adsTxtContent.substring(0, 100) + '...');

    return new Response(adsTxtContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving ads.txt:', error);
    
    // Return a fallback response
    return new Response(
      '# Error loading ads.txt configuration\n# Please try again later',
      {
        status: 200, // Return 200 to avoid crawler errors
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
});
