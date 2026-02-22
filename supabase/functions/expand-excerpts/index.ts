import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations
    const SUPABASE_URL = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch published articles with short excerpts (< 120 chars)
    const { data: articles, error: fetchError } = await supabase
      .from("content_articles")
      .select("id, title, excerpt, body")
      .eq("status", "published")
      .not("excerpt", "is", null);

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    // Filter articles with excerpts shorter than 120 characters
    const shortExcerptArticles = articles?.filter(
      (article) => article.excerpt && article.excerpt.length < 120
    ) || [];

    console.log(`Found ${shortExcerptArticles.length} articles with short excerpts`);

    if (shortExcerptArticles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No articles need excerpt expansion",
          updated: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { id: string; title: string; oldLength: number; newLength: number; oldExcerpt: string; newExcerpt: string }[] = [];
    const errors: { id: string; title: string; error: string }[] = [];

    for (const article of shortExcerptArticles) {
      try {
        console.log(`Expanding excerpt for: ${article.title}`);

        // Use OpenAI API to expand the excerpt
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `Você é um especialista em SEO e copywriting para um blog de decoração e jardinagem chamado "Home & Garden Manual". 
Sua tarefa é expandir resumos curtos de artigos para atingir exatamente entre 130 e 150 caracteres.

Regras importantes:
- Mantenha o significado e tom original
- Use palavras-chave relevantes para SEO
- Seja descritivo e atraente para cliques
- Escreva em português brasileiro
- Retorne APENAS o novo resumo, sem explicações ou aspas
- O resumo deve ter entre 130 e 150 caracteres (incluindo espaços)`
              },
              {
                role: "user",
                content: `Título do artigo: "${article.title}"

Resumo atual (${article.excerpt?.length || 0} caracteres):
"${article.excerpt}"

Contexto do artigo (primeiros 500 caracteres):
"${article.body?.substring(0, 500) || ''}"

Expanda este resumo para ter entre 130 e 150 caracteres, mantendo a essência do conteúdo.`
              }
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const aiData = await response.json();
        let newExcerpt = aiData.choices?.[0]?.message?.content?.trim() || "";

        // Clean up the response (remove quotes if present)
        newExcerpt = newExcerpt.replace(/^["']|["']$/g, "").trim();

        // Validate the new excerpt length
        if (newExcerpt.length > 160) {
          newExcerpt = newExcerpt.substring(0, 157) + "...";
        }
        
        console.log(`Generated excerpt: ${newExcerpt.length} chars`);

        // Update the article
        const { error: updateError } = await supabase
          .from("content_articles")
          .update({ excerpt: newExcerpt })
          .eq("id", article.id);

        if (updateError) {
          throw new Error(`Failed to update: ${updateError.message}`);
        }

        results.push({
          id: article.id,
          title: article.title,
          oldLength: article.excerpt?.length || 0,
          newLength: newExcerpt.length,
          oldExcerpt: article.excerpt || "",
          newExcerpt: newExcerpt,
        });

        console.log(`✓ Updated "${article.title}": ${article.excerpt?.length} → ${newExcerpt.length} chars`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        errors.push({
          id: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Expanded ${results.length} excerpts`,
        updated: results.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in expand-excerpts function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
