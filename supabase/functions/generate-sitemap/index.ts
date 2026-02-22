import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

interface Article {
  slug: string;
  category_slug: string;
  updated_at: string | null;
  published_at: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sitemap...');

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all published articles
    const { data: articles, error } = await supabase
      .from('content_articles')
      .select('slug, category_slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    console.log(`Found ${articles?.length || 0} published articles`);

    // Base URL - using the published URL
    const baseUrl = 'https://homegardenmanual.lovable.app';

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/garden-tips', priority: '0.8', changefreq: 'weekly' },
      { url: '/indoor-plants', priority: '0.8', changefreq: 'weekly' },
      { url: '/manuals', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-of-use', priority: '0.3', changefreq: 'yearly' },
      { url: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
    ];

    // Current date for lastmod
    const currentDate = new Date().toISOString().split('T')[0];

    // Build XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add dynamic article pages
    if (articles && articles.length > 0) {
      for (const article of articles as Article[]) {
        if (!article.slug || !article.category_slug) continue;

        const lastmod = article.updated_at 
          ? new Date(article.updated_at).toISOString().split('T')[0]
          : article.published_at 
            ? new Date(article.published_at).toISOString().split('T')[0]
            : currentDate;

        sitemap += `  <url>
    <loc>${baseUrl}/${article.category_slug}/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
