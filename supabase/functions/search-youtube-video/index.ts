import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleData {
  id: string;
  title: string;
  category_slug: string;
  tags: string[];
  excerpt: string;
}

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelName: string;
}

// Search YouTube using public search page scraping
async function searchYouTubePublic(query: string): Promise<YouTubeSearchResult[]> {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  
  console.log(`[search-youtube-video] Searching YouTube for: "${query}"`);
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`[search-youtube-video] YouTube search failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Extract video IDs from the YouTube search results page
    // YouTube embeds video data in ytInitialData JSON
    const ytDataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    
    if (!ytDataMatch) {
      // Fallback: extract video IDs from watch URLs
      const videoIdMatches = html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g);
      const results: YouTubeSearchResult[] = [];
      const seenIds = new Set<string>();
      
      for (const match of videoIdMatches) {
        const videoId = match[1];
        if (!seenIds.has(videoId)) {
          seenIds.add(videoId);
          results.push({
            videoId,
            title: '',
            channelName: '',
          });
          if (results.length >= 10) break;
        }
      }
      
      console.log(`[search-youtube-video] Found ${results.length} videos via fallback method`);
      return results;
    }

    try {
      const ytData = JSON.parse(ytDataMatch[1]);
      const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      
      if (!contents) {
        console.log(`[search-youtube-video] No search contents found in ytInitialData`);
        return [];
      }

      const results: YouTubeSearchResult[] = [];
      
      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const videoRenderer = item?.videoRenderer;
          if (videoRenderer?.videoId) {
            results.push({
              videoId: videoRenderer.videoId,
              title: videoRenderer.title?.runs?.[0]?.text || '',
              channelName: videoRenderer.ownerText?.runs?.[0]?.text || '',
            });
            if (results.length >= 10) break;
          }
        }
        if (results.length >= 10) break;
      }

      console.log(`[search-youtube-video] Found ${results.length} videos via ytInitialData`);
      return results;
    } catch (parseError) {
      console.error(`[search-youtube-video] Error parsing ytInitialData:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`[search-youtube-video] Error searching YouTube:`, error);
    return [];
  }
}

// Verify video is available using oEmbed
async function verifyVideoAvailable(videoId: string): Promise<{ available: boolean; title?: string; author?: string }> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
  
  try {
    const response = await fetch(oEmbedUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return { available: false };
    }

    const data = await response.json();
    return {
      available: true,
      title: data.title,
      author: data.author_name,
    };
  } catch {
    return { available: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const EXTERNAL_SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const EXTERNAL_SUPABASE_SERVICE_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_SERVICE_KEY) {
      throw new Error("External Supabase credentials not configured");
    }

    const supabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_SERVICE_KEY);

    const { articleId, title, category, tags, excerpt, saveToDb = true } = await req.json();

    console.log(`[search-youtube-video] Processing request for article: ${articleId || 'manual'}`);

    // Fetch or build article data
    let articleData: ArticleData | null = null;
    if (articleId) {
      const { data, error } = await supabase
        .from('content_articles')
        .select('id, title, category_slug, tags, excerpt')
        .eq('id', articleId)
        .maybeSingle();

      if (error) {
        console.error(`[search-youtube-video] Error fetching article:`, error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error(`Article not found: ${articleId}`);
      }
      
      articleData = data;
    } else if (title) {
      articleData = {
        id: '',
        title: title || '',
        category_slug: category || '',
        tags: tags || [],
        excerpt: excerpt || '',
      };
    } else {
      throw new Error('Either articleId or title must be provided');
    }

    // Generate search queries using OpenAI
    const categoryTranslations: Record<string, string> = {
      'jardim': 'jardinagem',
      'decoracao': 'decoração de interiores',
      'plantas': 'plantas',
      'diy': 'faça você mesmo',
      'sustentabilidade': 'sustentabilidade',
    };

    const categoryName = categoryTranslations[articleData.category_slug] || articleData.category_slug;

    const systemPrompt = `Você é um especialista em SEO e busca do YouTube.
Sua tarefa é gerar 3 termos de busca otimizados para encontrar vídeos relevantes no YouTube.

REGRAS:
1. Os termos devem ser em PORTUGUÊS BRASILEIRO
2. Cada termo deve ter 3-6 palavras
3. Foque em termos que trarão vídeos educativos e tutoriais
4. Retorne APENAS um JSON válido com um array de 3 strings
5. Não inclua nomes de canais específicos

FORMATO (JSON puro, sem markdown):
["termo de busca 1", "termo de busca 2", "termo de busca 3"]`;

    const userPrompt = `Gere 3 termos de busca para encontrar vídeos sobre:

TÍTULO: ${articleData.title}
CATEGORIA: ${categoryName}
TAGS: ${articleData.tags?.join(', ') || 'nenhuma'}

Retorne apenas o JSON com os termos.`;

    console.log(`[search-youtube-video] Generating search terms for: "${articleData.title}"`);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    let searchQueries: string[] = [];
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      searchQueries = JSON.parse(cleanContent);
    } catch {
      // Fallback: use article title
      searchQueries = [`${articleData.title} tutorial`, `como ${categoryName}`, `dicas ${categoryName}`];
    }

    console.log(`[search-youtube-video] Search queries:`, searchQueries);

    // Search YouTube and find available videos
    let foundVideo: { videoId: string; title: string; channelName: string; searchQuery: string } | null = null;

    for (const query of searchQueries) {
      if (foundVideo) break;

      const searchResults = await searchYouTubePublic(query);
      
      for (const result of searchResults) {
        console.log(`[search-youtube-video] Verifying video: ${result.videoId}`);
        
        const verification = await verifyVideoAvailable(result.videoId);
        
        if (verification.available) {
          foundVideo = {
            videoId: result.videoId,
            title: verification.title || result.title,
            channelName: verification.author || result.channelName,
            searchQuery: query,
          };
          console.log(`[search-youtube-video] Found available video: "${foundVideo.title}" by ${foundVideo.channelName}`);
          break;
        } else {
          console.log(`[search-youtube-video] Video ${result.videoId} not available, trying next`);
        }
      }
    }

    if (!foundVideo) {
      throw new Error('Could not find any available YouTube videos for this topic');
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${foundVideo.videoId}`;

    // Save to database if requested
    if (articleId && saveToDb) {
      const { data: existing } = await supabase
        .from('article_videos')
        .select('id')
        .eq('article_id', articleId)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('article_videos')
          .update({
            youtube_video_id: foundVideo.videoId,
            youtube_url: youtubeUrl,
            is_enabled: true,
          })
          .eq('article_id', articleId);

        if (updateError) {
          throw new Error(`Failed to update video: ${updateError.message}`);
        }
        console.log(`[search-youtube-video] Updated video for article: ${articleId}`);
      } else {
        const { error: insertError } = await supabase
          .from('article_videos')
          .insert({
            article_id: articleId,
            youtube_video_id: foundVideo.videoId,
            youtube_url: youtubeUrl,
            is_enabled: true,
          });

        if (insertError) {
          throw new Error(`Failed to save video: ${insertError.message}`);
        }
        console.log(`[search-youtube-video] Saved new video for article: ${articleId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoId: foundVideo.videoId,
        youtubeUrl,
        videoTitle: foundVideo.title,
        channelName: foundVideo.channelName,
        searchQuery: foundVideo.searchQuery,
        savedToDb: articleId && saveToDb,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`[search-youtube-video] Error:`, error);
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
