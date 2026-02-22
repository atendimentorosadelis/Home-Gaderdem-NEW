import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de temas disponíveis com prompts
const TOPIC_PROMPTS: Record<string, string> = {
  // Design Interno - Áreas Sociais
  'sala': 'Decoração e design de salas de estar: sofás, poltronas, tapetes, iluminação, cores, disposição de móveis, estilos decorativos',
  'sala-jantar': 'Design de salas de jantar: mesas, cadeiras, aparadores, iluminação pendente, decoração de mesa, integração com cozinha',
  'lareira': 'Lareiras na decoração: tipos de lareiras, posicionamento, materiais, decoração ao redor, ambientes aconchegantes',
  'area-gourmet': 'Áreas gourmet e espaços de churrasco: churrasqueiras, bancadas, mobiliário, decoração, iluminação, integração com jardim',
  
  // Design Interno - Áreas Íntimas
  'quarto': 'Decoração de quartos: camas, cabeceiras, iluminação, cores relaxantes, organização, estilos de decoração para dormitórios',
  'banheiro': 'Design de banheiros: revestimentos, louças, metais, iluminação, cores, organização, banheiros pequenos e grandes',
  'escritorio': 'Home office e escritórios em casa: mesas, cadeiras ergonômicas, organização, iluminação, produtividade, decoração profissional',
  
  // Design Interno - Áreas de Serviço/Externas
  'cozinha': 'Design de cozinhas: layouts, armários, bancadas, eletrodomésticos, iluminação, cores, cozinhas modernas e funcionais',
  'varanda': 'Decoração de varandas e sacadas: móveis externos, plantas, iluminação, cortinas, integração com a sala',
  'area-servico': 'Áreas de serviço e lavanderias: organização, armários, bancadas, iluminação, soluções para espaços compactos',
  'piscina': 'Áreas de piscina: paisagismo, mobiliário externo, iluminação, decks, pérgolas, integração com a casa',
  
  // Jardim
  'jardim': 'Paisagismo e jardinagem: plantas ornamentais, canteiros, gramados, caminhos, iluminação de jardim',
  'decoracao': 'Dicas de decoração para jardins: vasos, esculturas, fontes, móveis de jardim, iluminação decorativa',
  'cuidados': 'Cuidados com plantas e jardins: adubação, poda, irrigação, controle de pragas, manutenção sazonal',
  'jardim-vertical': 'Jardins verticais: técnicas de montagem, melhores plantas, irrigação automatizada, paredes verdes internas e externas',
  'jardim-suculentas': 'Cultivo de suculentas e cactos: tipos populares, cuidados básicos, propagação, arranjos decorativos, jardim de pedras',
  'jardim-ervas': 'Horta de ervas aromáticas em casa: manjericão, alecrim, hortelã, cultivo em vasos, temperos frescos na cozinha',
  'jardim-flores': 'Flores e plantas ornamentais para jardim: espécies sazonais, combinações de cores, canteiros, bordaduras floridas',
  'jardim-paisagismo': 'Paisagismo residencial: projeto de jardins, caminhos, pergolados, fontes, iluminação externa, espaços de convívio',
  'jardim-hidroponia': 'Hidroponia caseira: sistemas NFT e DFT, nutrientes, vegetais sem solo, produção sustentável em pequenos espaços',
  'jardim-sustentavel': 'Jardim sustentável: compostagem, captação de água da chuva, plantas nativas, biodiversidade, baixa manutenção',
  'jardim-halloween': 'Decoração de Halloween para jardim: abóboras decorativas, iluminação assustadora, plantas temáticas como dálias negras e moreia, caveiras, teias de aranha artificiais, esqueletos, lanternas, caminhos iluminados com velas, árvores decoradas, atmosfera misteriosa',
  
  // Arquitetura
  'colonial': 'Arquitetura colonial: fachadas tradicionais, varandas, telhados coloniais, elementos históricos, restauração',
  'industrial': 'Arquitetura industrial residencial: lofts, tijolos aparentes, estruturas metálicas, espaços amplos',
  'moderno': 'Arquitetura moderna: linhas retas, grandes janelas, integração interior-exterior, materiais contemporâneos',
  'neolitico': 'Arquitetura inspirada em construções antigas: pedras naturais, materiais rústicos, integração com a natureza',
  'europeu': 'Arquitetura europeia: estilos mediterrâneo, francês, inglês, fachadas clássicas, jardins formais',
  'nordico': 'Arquitetura nórdica: madeira, grandes janelas, integração com natureza, design escandinavo, eficiência energética',
  'neo-classico': 'Arquitetura neoclássica: colunas, frontões, simetria, ornamentos clássicos, elegância atemporal',
  'arq-moderna': 'Arquitetura moderna residencial: volumes puros, grandes aberturas, integração interior-exterior, concreto aparente',
  'arq-classica': 'Arquitetura clássica: simetria, colunas, ornamentos, molduras, proporções áureas, elegância atemporal',
  'arq-sustentavel': 'Arquitetura sustentável: telhados verdes, energia solar, ventilação cruzada, materiais reciclados, certificações verdes',
  'arq-minimalista': 'Arquitetura minimalista: formas puras, materiais honestos, ausência de excessos, luz como elemento principal',
  'arq-brutalista': 'Arquitetura brutalista residencial: concreto aparente, formas geométricas ousadas, estrutura como expressão',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logId: string | null = null;

  try {
    // Parse request body for force parameter
    let forceRun = false;
    try {
      const body = await req.json();
      forceRun = body?.force === true;
    } catch {
      // No body or invalid JSON, that's fine
    }

    // Initialize Supabase client - use EXTERNAL database
    const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[AutoGenerate] Starting execution... (force: ${forceRun})`);

    // 1. Check if auto-pilot is enabled
    const { data: config, error: configError } = await supabase
      .from('auto_generation_config')
      .select('*')
      .single();

    if (configError || !config) {
      console.log('[AutoGenerate] Config not found or error:', configError);
      return new Response(
        JSON.stringify({ success: false, message: 'Config not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip enabled check if force mode
    if (!config.enabled && !forceRun) {
      console.log('[AutoGenerate] Auto-pilot is disabled');
      return new Response(
        JSON.stringify({ success: false, message: 'Auto-pilot is disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if there's a schedule for current time (within 5 minutes window)
    // Skip schedule check if force mode
    if (!forceRun) {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      const { data: schedules } = await supabase
        .from('auto_generation_schedules')
        .select('*')
        .eq('day_of_week', currentDay)
        .eq('is_active', true);

      // Check if any schedule matches current time (within 5 minute window)
      const matchingSchedule = schedules?.find(s => {
        const [schedHour, schedMin] = s.time_slot.split(':').map(Number);
        const schedMinutes = schedHour * 60 + schedMin;
        const currentMinutes = currentHour * 60 + currentMinute;
        return Math.abs(currentMinutes - schedMinutes) <= 5;
      });

      if (!matchingSchedule) {
        console.log(`[AutoGenerate] No schedule for current time: ${currentTimeStr}, day: ${currentDay}`);
        return new Response(
          JSON.stringify({ success: false, message: 'No schedule for current time' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[AutoGenerate] Schedule matched: ${matchingSchedule.time_slot}`);
    } else {
      console.log('[AutoGenerate] Force mode - skipping schedule check');
    }

    // 3. Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
      .from('auto_generation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('executed_at', todayStart.toISOString());

    if ((todayCount || 0) >= config.daily_limit) {
      console.log(`[AutoGenerate] Daily limit reached: ${todayCount}/${config.daily_limit}`);
      
      // Log skipped
      await supabase.from('auto_generation_logs').insert({
        topic_used: 'N/A',
        status: 'skipped',
        error_message: `Limite diário atingido (${todayCount}/${config.daily_limit})`,
        duration_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Daily limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Select random topic from enabled topics
    const enabledTopics = config.topics as string[];
    if (!enabledTopics || enabledTopics.length === 0) {
      console.log('[AutoGenerate] No topics enabled');
      return new Response(
        JSON.stringify({ success: false, message: 'No topics enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const randomTopic = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
    const topicPrompt = TOPIC_PROMPTS[randomTopic] || randomTopic;

    console.log(`[AutoGenerate] Selected topic: ${randomTopic}`);

    // 5. Create log entry (running status)
    const { data: logEntry, error: logError } = await supabase
      .from('auto_generation_logs')
      .insert({
        topic_used: randomTopic,
        status: 'running',
      })
      .select()
      .single();

    if (logEntry) {
      logId = logEntry.id;
    }

    // 6. Call generate-full-article function
    // IMPORTANT: Edge functions are deployed on Lovable Cloud, not the external database
    const lovableFunctionsUrl = 'https://gcdwdjacrxmdsciwqtlc.supabase.co';
    const lovableAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZHdkamFjcnhtZHNjaXdxdGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDIxOTcsImV4cCI6MjA4NDQxODE5N30.mxryA4KPolNzIZQXo-ZSyp18n8OliIrhabKpLljf1vU';
    
    console.log('[AutoGenerate] Calling generate-full-article...');
    
    const generateResponse = await fetch(`${lovableFunctionsUrl}/functions/v1/generate-full-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableAnonKey}`,
        'apikey': lovableAnonKey,
      },
      body: JSON.stringify({ topic: topicPrompt }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Generate article failed: ${errorText}`);
    }

    const generateResult = await generateResponse.json();
    
    if (!generateResult.success || !generateResult.article) {
      throw new Error(`Generate article failed: ${generateResult.error || 'No article returned'}`);
    }

    const articleData = generateResult.article;
    
    // Validate article data before saving
    if (!articleData.title || articleData.title.trim() === '') {
      throw new Error('Generated article has no valid title - OpenAI returned incomplete data');
    }
    
    console.log(`[AutoGenerate] Article generated: ${articleData.title}`);

    // 7. Get admin user for author_id
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', adminRole?.user_id)
      .single();

    // 8. Save article to database
    const { data: savedArticle, error: saveError } = await supabase
      .from('content_articles')
      .insert({
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        body: articleData.content,
        category: articleData.category,
        category_slug: articleData.categorySlug,
        tags: articleData.tags,
        keywords: articleData.keywords,
        read_time: articleData.readTime,
        external_links: articleData.externalLinks,
        cover_image: articleData.coverImage?.url || null,
        gallery_images: articleData.galleryImages || [],
        status: config.publish_immediately ? 'published' : 'draft',
        published_at: config.publish_immediately ? new Date().toISOString() : null,
        author_id: authorProfile?.id,
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Save article failed: ${saveError.message}`);
    }

    console.log(`[AutoGenerate] Article saved with id: ${savedArticle.id}`);

    // 9. Queue cover image generation if not already generated
    // Use mainSubject + visualContext (correct field names from generate-full-article)
    const coverPrompt = articleData.mainSubject && articleData.visualContext
      ? `${articleData.mainSubject}, ${articleData.visualContext}, professional interior photography, high quality, 4k`
      : null;

    console.log(`[AutoGenerate] Image data: mainSubject=${articleData.mainSubject?.substring(0,40) || 'N/A'}, visualContext=${articleData.visualContext?.substring(0,40) || 'N/A'}, galleryPrompts=${articleData.galleryPrompts?.length || 0}`);

    if (!articleData.coverImage?.url && coverPrompt) {
      await supabase.from('image_generation_queue').insert({
        article_id: savedArticle.id,
        image_type: 'cover',
        prompt: coverPrompt,
        priority: 10,
        metadata: { 
          articleTitle: articleData.title,
          mainSubject: articleData.mainSubject,
          visualContext: articleData.visualContext,
        },
      });
      console.log(`[AutoGenerate] Queued cover image: ${coverPrompt.substring(0, 60)}...`);
    }

    // 10. Queue gallery images if prompts available (correct field: galleryPrompts)
    if (articleData.galleryPrompts && articleData.galleryPrompts.length > 0) {
      const galleryInserts = articleData.galleryPrompts.map((prompt: string, index: number) => ({
        article_id: savedArticle.id,
        image_type: 'gallery',
        image_index: index,
        prompt: prompt,
        priority: 5,
        metadata: { 
          articleTitle: articleData.title,
          mainSubject: articleData.mainSubject,
          visualContext: articleData.visualContext,
        },
      }));

      await supabase.from('image_generation_queue').insert(galleryInserts);
      console.log(`[AutoGenerate] Queued ${galleryInserts.length} gallery images`);
    }

    // 11. Update log with success
    const duration = Date.now() - startTime;
    await supabase
      .from('auto_generation_logs')
      .update({
        article_id: savedArticle.id,
        status: 'success',
        duration_ms: duration,
      })
      .eq('id', logId);

    // 12. Notify admins with autopilot info (using Lovable Cloud functions URL)
    try {
      await fetch(`${lovableFunctionsUrl}/functions/v1/notify-article-ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableAnonKey}`,
          'apikey': lovableAnonKey,
        },
        body: JSON.stringify({
          articleId: savedArticle.id,
          articleTitle: savedArticle.title,
          articleSlug: savedArticle.slug,
          isAutoPilot: true,
          autoPilotData: {
            topicUsed: randomTopic,
            publishedImmediately: config.publish_immediately,
            duration: duration,
            todayCount: (todayCount || 0) + 1,
            dailyLimit: config.daily_limit,
          },
        }),
      });
    } catch (notifyError) {
      console.error('[AutoGenerate] Failed to notify admins:', notifyError);
    }

    console.log(`[AutoGenerate] Completed successfully in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        articleId: savedArticle.id,
        title: savedArticle.title,
        status: savedArticle.status,
        duration: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AutoGenerate] Error:', errorMessage);

    // Update log with error if we have a logId (use external database)
    if (logId) {
      const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
      const externalKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(externalUrl, externalKey);

      await supabase
        .from('auto_generation_logs')
        .update({
          status: 'error',
          error_message: errorMessage,
          duration_ms: duration,
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
