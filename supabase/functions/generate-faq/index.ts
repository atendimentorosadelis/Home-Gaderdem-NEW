import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { articleId } = await req.json();
    
    if (!articleId) {
      return new Response(
        JSON.stringify({ success: false, error: 'articleId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[GenerateFAQ] Starting FAQ generation for article: ${articleId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('EXTERNAL_SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the article
    const { data: article, error: fetchError } = await supabase
      .from('content_articles')
      .select('id, title, body, category, tags')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      console.error('[GenerateFAQ] Article not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[GenerateFAQ] Found article: "${article.title}"`);

    // Check if FAQ already exists
    const hasFAQ = /##\s*(FAQ|Perguntas\s+Frequentes)/i.test(article.body || '');
    const hasFAQItems = /\d+\.\s+\*\*[^*]+\?\*\*/m.test(article.body || '');

    if (hasFAQ && hasFAQItems) {
      console.log('[GenerateFAQ] FAQ already exists in article');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Este artigo já possui uma seção de FAQ',
          alreadyExists: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_IA_API_KEY');
    
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate FAQ using OpenAI
    const faqPrompt = `Você é Keven Costa Vieira, estudante de Arquitetura na PUC Minas.

Gere uma seção de FAQ (Perguntas Frequentes) para o seguinte artigo:

**Título:** ${article.title}
**Categoria:** ${article.category || 'Decoração'}
**Tags:** ${(article.tags || []).join(', ')}

Regras OBRIGATÓRIAS:
1. Gere exatamente 8 perguntas relevantes ao tema do artigo
2. Use um tom pessoal e acolhedor, como se estivesse conversando com o leitor
3. Inclua experiências pessoais quando apropriado (mencione a PUC Minas ocasionalmente)
4. As respostas devem ser práticas e úteis
5. Cada resposta deve ter 2-4 frases
6. Use valores em reais (R$) quando falar de custos
7. Nunca use frases genéricas demais - seja específico ao tema

Formato OBRIGATÓRIO (Markdown):

## Perguntas Frequentes

1. **[Pergunta relevante ao tema]?**

[Resposta detalhada e pessoal]

2. **[Próxima pergunta]?**

[Resposta detalhada e pessoal]

... (continue até 8 perguntas)

Gere APENAS o bloco de FAQ, sem introdução ou conclusão adicional.`;

    console.log('[GenerateFAQ] Calling OpenAI API...');

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é Keven Costa Vieira, estudante de Arquitetura na PUC Minas. Gere FAQs úteis e pessoais para artigos sobre casa e jardim.'
          },
          {
            role: 'user',
            content: faqPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error('[GenerateFAQ] OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAiResponse.status}`);
    }

    const openAiData = await openAiResponse.json();
    const generatedFAQ = openAiData.choices?.[0]?.message?.content;

    if (!generatedFAQ) {
      throw new Error('Failed to generate FAQ content');
    }

    console.log('[GenerateFAQ] FAQ generated successfully');

    // Validate generated FAQ format
    const generatedHasFAQ = /##\s*(FAQ|Perguntas\s+Frequentes)/i.test(generatedFAQ);
    const generatedHasItems = /\d+\.\s+\*\*[^*]+\?\*\*/m.test(generatedFAQ);

    if (!generatedHasFAQ || !generatedHasItems) {
      console.warn('[GenerateFAQ] Generated FAQ has invalid format, using fallback');
      // Use fallback FAQ
      const topicLower = article.title.toLowerCase();
      const fallbackFAQ = generateFallbackFAQ(topicLower);
      
      // Update article with fallback
      const updatedBody = injectFAQ(article.body || '', fallbackFAQ);
      
      const { error: updateError } = await supabase
        .from('content_articles')
        .update({ body: updatedBody })
        .eq('id', articleId);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'FAQ gerado com sucesso (fallback)',
          usedFallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inject FAQ into article body
    const updatedBody = injectFAQ(article.body || '', generatedFAQ);

    // Update article in database
    const { error: updateError } = await supabase
      .from('content_articles')
      .update({ body: updatedBody })
      .eq('id', articleId);

    if (updateError) {
      console.error('[GenerateFAQ] Update error:', updateError);
      throw updateError;
    }

    console.log(`[GenerateFAQ] ✅ Article updated successfully: ${articleId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'FAQ gerado e adicionado ao artigo com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GenerateFAQ] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function injectFAQ(body: string, faq: string): string {
  // Find insertion point - before signature or at end
  const signaturePatterns = [
    /\n---\s*\n\*\*Keven/i,
    /\n\*\*Com carinho,/i,
    /\n---\s*$/,
  ];
  
  let insertionPoint = body.length;
  for (const pattern of signaturePatterns) {
    const match = body.match(pattern);
    if (match && match.index !== undefined) {
      insertionPoint = Math.min(insertionPoint, match.index);
    }
  }
  
  // Ensure proper spacing
  const cleanFAQ = '\n\n' + faq.trim() + '\n\n';
  
  return body.substring(0, insertionPoint) + cleanFAQ + body.substring(insertionPoint);
}

function generateFallbackFAQ(topic: string): string {
  return `## Perguntas Frequentes

1. **Qual é o orçamento ideal para ${topic}?**

Depende muito do tamanho do projeto e dos materiais escolhidos. Na minha experiência, é possível começar com investimentos a partir de R$ 500 para projetos menores. O importante é planejar bem e priorizar o que faz mais diferença no resultado final.

2. **Quanto tempo leva para fazer ${topic}?**

Projetos simples podem ser concluídos em um fim de semana. Já reformas mais complexas podem levar de 2 a 4 semanas. Sempre recomendo adicionar uma margem de 20% no cronograma para imprevistos.

3. **Preciso contratar um profissional para ${topic}?**

Para projetos básicos, você mesmo pode fazer com as orientações certas. Mas para instalações elétricas, hidráulicas ou estruturais, sempre contrate profissionais qualificados. A segurança vem em primeiro lugar!

4. **Quais materiais são mais recomendados?**

Depende do seu orçamento e do resultado desejado. Materiais de qualidade intermediária costumam oferecer o melhor custo-benefício. Evite os mais baratos que podem dar dor de cabeça depois.

5. **Como economizar sem perder qualidade?**

Compare preços em pelo menos 3 lojas diferentes, aproveite promoções sazonais e considere materiais alternativos que dão o mesmo efeito. Às vezes, uma pintura bem feita faz mais diferença que um revestimento caro.

6. **Vale a pena fazer ${topic} eu mesmo?**

Se você tem habilidades manuais e tempo disponível, pode economizar bastante fazendo você mesmo. Mas seja honesto sobre suas limitações - um trabalho mal feito pode sair mais caro no final.

7. **Quais são os erros mais comuns que devo evitar?**

Os principais erros são: não medir corretamente, economizar demais em materiais essenciais, pular etapas de preparação e não considerar a iluminação do ambiente. Planejamento é tudo!

8. **Como saber se o resultado vai ficar bom?**

Antes de começar, faça um projeto visual mesmo que simples. Use aplicativos de decoração ou recorte fotos de revistas. Ter uma referência visual ajuda muito a tomar decisões durante a execução.`;
}
