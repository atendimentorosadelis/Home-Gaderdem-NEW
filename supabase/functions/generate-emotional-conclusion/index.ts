import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 50 templates de abertura OBRIGATÓRIOS - máxima diversidade
const OPENING_TEMPLATES = [
  "Existe algo de mágico quando",
  "Poucos momentos na vida são tão",
  "Houve um tempo em que",
  "Nas entrelinhas do cotidiano",
  "O silêncio de um lar revela",
  "Entre as paredes do que chamamos casa",
  "A verdade sobre transformar um espaço é",
  "Quando olho para um ambiente que ganha vida",
  "Algo desperta em nós quando",
  "O tempo ensinou que",
  "Debaixo de cada decisão de decorar há",
  "Certas escolhas carregam mais do que",
  "Na delicadeza dos detalhes mora",
  "Existe uma poesia silenciosa em",
  "O que realmente transforma um espaço não é",
  "Por trás de cada ambiente há",
  "A beleza das pequenas mudanças está em",
  "Alguns cantos de uma casa guardam",
  "Quando a luz atravessa um cômodo renovado",
  "O segredo que poucos percebem é",
  "Cada escolha de design carrega",
  "Na jornada de criar um lar",
  "O que torna um espaço especial é",
  "Às vezes, um simples arranjo revela",
  "A magia acontece quando entendemos que",
  "Entre cores e texturas existe",
  "O verdadeiro significado de um lar vem de",
  "Quando nos permitimos sonhar com",
  "A essência de um ambiente acolhedor está em",
  "Por trás de cada reforma bem-sucedida há",
  "O que realmente importa ao criar",
  "Nas escolhas que fazemos para nosso lar",
  "A transformação mais profunda acontece quando",
  "O que muitos não percebem sobre decoração é",
  "Entre o sonho e a realidade de um ambiente",
  "A verdadeira beleza de um espaço revela-se em",
  "Quando dedicamos atenção ao nosso lar",
  "O encanto de um ambiente bem planejado é",
  "Nas sutilezas de cada detalhe decorativo",
  "A arte de criar um espaço acolhedor começa quando",
  "Há uma sabedoria antiga em",
  "O coração de uma casa pulsa quando",
  "Cada parede conta uma história sobre",
  "A harmonia de um ambiente nasce de",
  "Existe uma conexão profunda entre",
  "O lar se transforma em refúgio quando",
  "A verdadeira elegância de um espaço vem de",
  "Quando permitimos que a luz dance pelos ambientes",
  "A alma de uma decoração está em",
  "O que diferencia um espaço comum de um extraordinário é"
];

// Frases ABSOLUTAMENTE PROIBIDAS - regex para capturar variações
const BANNED_PATTERNS = [
  /eu sei que/i,
  /pode parecer/i,
  /pesadelo/i,
  /não precisa ser/i,
  /você não está sozinho/i,
  /você não está sozinha/i,
  /nessa jornada/i,
  /assustador/i,
  /intimidador/i,
  /outro dia percebi/i,
  /estava pensando/i,
  /descubra/i,
  /transforme sua/i,
  /deixa sua pergunta/i,
  /ainda tem dúvidas/i,
  /reformar ou decorar/i,
  /difícil ou complicado/i
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { theme, article_id } = await req.json();

    if (!theme || typeof theme !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Campo "theme" é obrigatório e deve ser uma string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    
    // SEMPRE usar Supabase EXTERNO (lhtetfcujdzulfyekiub) para salvar
    const EXTERNAL_SUPABASE_URL = 'https://lhtetfcujdzulfyekiub.supabase.co';
    const externalServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY');
    
    console.log(`[EmotionalConclusion] Using EXTERNAL Supabase: ${EXTERNAL_SUPABASE_URL}`);
    console.log(`[EmotionalConclusion] EXTERNAL_SUPABASE_SERVICE_KEY present: ${!!externalServiceKey}`);
    
    if (!externalServiceKey) {
      console.error('[EmotionalConclusion] ⚠️ EXTERNAL_SUPABASE_SERVICE_KEY not configured - save will fail');
    }

    // Selecionar template aleatório OBRIGATÓRIO
    const randomIndex = Math.floor(Math.random() * OPENING_TEMPLATES.length);
    const mandatoryOpening = OPENING_TEMPLATES[randomIndex];
    const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-v3-template${randomIndex}`;

    console.log(`[EmotionalConclusion] Tema: "${theme}" | Template obrigatório: "${mandatoryOpening}"`);

    const systemPrompt = `Você é um escritor literário de elite, autor de best-sellers com domínio profundo da escrita emocional.

REGRA CRÍTICA - ABERTURA OBRIGATÓRIA:
Você DEVE iniciar o texto com EXATAMENTE estas palavras: "${mandatoryOpening}"
Complete esta frase de forma natural e poética, conectando-a ao tema fornecido.

EXPRESSÕES ABSOLUTAMENTE PROIBIDAS (JAMAIS USE NENHUMA DESTAS):
- "Eu sei que" (qualquer variação)
- "pode parecer" (qualquer variação)
- "pesadelo"
- "não precisa ser difícil/complicado"
- "você não está sozinho/sozinha"
- "nessa jornada"
- "assustador" ou "intimidador"
- "Outro dia percebi"
- "Eu estava pensando"
- "Descubra"
- "Transforme sua"
- "reformar ou decorar"

ESTILO OBRIGATÓRIO:
- Escreva com sensibilidade literária e poesia
- Provoque emoção genuína no leitor
- Use metáforas e imagens poéticas
- Máximo 200 palavras
- Português brasileiro elegante
- Tom caloroso e inspirador
- NÃO mencione IA ou algoritmos`;

    const userPrompt = `[Seed: ${uniqueSeed}]

TEMA: "${theme}"

INSTRUÇÃO OBRIGATÓRIA: Comece o texto EXATAMENTE com "${mandatoryOpening}" e desenvolva de forma literária e emocional sobre o tema acima.

Escreva agora uma conclusão emocional única, poética e tocante.`;

    // Função para validar texto contra padrões banidos
    const containsBannedPattern = (text: string): boolean => {
      return BANNED_PATTERNS.some(pattern => pattern.test(text));
    };

    // Helper para delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Função para gerar texto com retry para rate limiting
    const generateText = async (isRetry: boolean = false): Promise<string> => {
      const retryAddendum = isRetry 
        ? `\n\nATENÇÃO CRÍTICA: A geração anterior continha frases proibidas. Você DEVE começar com "${mandatoryOpening}" e JAMAIS usar "Eu sei que", "pode parecer", ou qualquer expressão da lista proibida.`
        : '';

      const maxApiRetries = 3;
      let lastError: Error | null = null;

      for (let apiAttempt = 1; apiAttempt <= maxApiRetries; apiAttempt++) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt + retryAddendum }
              ],
              temperature: isRetry ? 0.99 : 0.95,
              max_tokens: 800,
              presence_penalty: isRetry ? 1.2 : 1.0,
              frequency_penalty: isRetry ? 1.0 : 0.8,
            }),
          });

          if (response.status === 429) {
            const waitTime = Math.pow(2, apiAttempt) * 1000; // 2s, 4s, 8s
            console.log(`[EmotionalConclusion] Rate limited (429), waiting ${waitTime}ms before retry ${apiAttempt}/${maxApiRetries}`);
            await delay(waitTime);
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[EmotionalConclusion] OpenAI error:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          return data.choices?.[0]?.message?.content?.trim() || '';
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (apiAttempt < maxApiRetries) {
            const waitTime = Math.pow(2, apiAttempt) * 1000;
            console.log(`[EmotionalConclusion] API error, waiting ${waitTime}ms before retry ${apiAttempt}/${maxApiRetries}`);
            await delay(waitTime);
          }
        }
      }

      throw lastError || new Error('Failed after max retries');
    };

    // Tentar gerar até 4 vezes
    let emotionalText = '';
    let attempts = 0;
    const maxAttempts = 4;

    while (attempts < maxAttempts) {
      attempts++;
      emotionalText = await generateText(attempts > 1);
      
      if (!containsBannedPattern(emotionalText)) {
        console.log(`[EmotionalConclusion] ✅ Texto válido na tentativa ${attempts}`);
        break;
      }
      
      console.log(`[EmotionalConclusion] ⚠️ Tentativa ${attempts}: Padrão banido detectado, regenerando...`);
    }

    // CORREÇÃO FORÇADA: Se ainda tiver padrão banido, substituir início manualmente
    if (containsBannedPattern(emotionalText)) {
      console.log(`[EmotionalConclusion] ⚠️ Aplicando correção forçada após ${maxAttempts} tentativas`);
      
      // Remover primeiras frases problemáticas e reconstruir
      const sentences = emotionalText.split(/(?<=[.!?])\s+/);
      const cleanSentences = sentences.filter(s => !containsBannedPattern(s));
      
      // Reconstruir com abertura obrigatória
      emotionalText = `${mandatoryOpening} ${theme.toLowerCase()}, descobrimos que os pequenos detalhes são os que mais importam. ${cleanSentences.slice(0, 4).join(' ')}`;
    }

    // Validação final de que começa com o template
    if (!emotionalText.toLowerCase().startsWith(mandatoryOpening.toLowerCase().substring(0, 15))) {
      console.log(`[EmotionalConclusion] ⚠️ Forçando abertura correta`);
      const restOfText = emotionalText.replace(/^[^.!?]+[.!?]\s*/, '');
      emotionalText = `${mandatoryOpening} ${theme.toLowerCase()}, percebemos a importância de cada escolha. ${restOfText}`;
    }

    if (!emotionalText) {
      throw new Error('Falha ao gerar texto emocional');
    }

    console.log(`[EmotionalConclusion] ✅ Texto final: ${emotionalText.substring(0, 80)}...`);

    // Save to EXTERNAL Supabase database if article_id is provided
    let saved = false;
    if (article_id && externalServiceKey) {
      try {
        console.log(`[EmotionalConclusion] Saving to EXTERNAL database for article: ${article_id}`);
        
        const saveResponse = await fetch(
          `${EXTERNAL_SUPABASE_URL}/rest/v1/article_emotional_conclusions`,
          {
            method: 'POST',
            headers: {
              'apikey': externalServiceKey,
              'Authorization': `Bearer ${externalServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              article_id: article_id,
              conclusion_text: emotionalText,
              generated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (saveResponse.ok) {
          saved = true;
          console.log(`[EmotionalConclusion] ✅ Saved to EXTERNAL database successfully`);
        } else {
          const errorText = await saveResponse.text();
          console.error(`[EmotionalConclusion] ⚠️ Save failed: ${saveResponse.status} - ${errorText}`);
        }
      } catch (saveError) {
        console.error('[EmotionalConclusion] Save error:', saveError);
      }
    } else {
      console.log('[EmotionalConclusion] ⚠️ Skipping save - missing article_id or service key');
    }

    return new Response(
      JSON.stringify({ 
        emotional_text: emotionalText,
        saved: saved,
        article_id: article_id || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[EmotionalConclusion] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
