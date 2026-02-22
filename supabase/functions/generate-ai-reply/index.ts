import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateReplyRequest {
  message_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { message_id, name, email, subject, message }: GenerateReplyRequest = await req.json();

    if (!message_id || !name || !message) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let customPrompt = "Você é um assistente do site Home Garden Manual, especializado em jardinagem, plantas e decoração. Responda de forma profissional, amigável e útil em português brasileiro.";
    
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "auto_reply_config")
      .single();

    if (settingsData?.value?.prompt) {
      customPrompt = settingsData.value.prompt;
    }

    // IMPORTANT: Do NOT include greeting - it will be added by the email template
    const systemPrompt = `${customPrompt}

Regras CRÍTICAS para a resposta:
- NÃO inclua saudação inicial como "Olá [nome]" ou "Prezado(a) [nome]" - a saudação será adicionada automaticamente pelo template de e-mail
- Comece a resposta diretamente com o conteúdo (ex: "Muito obrigado por entrar em contato...")
- Responda diretamente à dúvida ou solicitação
- Mantenha a resposta concisa mas completa (2-4 parágrafos)
- Se for uma dúvida técnica, forneça dicas práticas
- Finalize com uma despedida amigável
- Não use formatação markdown, apenas texto simples
- Assine como "Equipe Home Garden Manual"`;

    const userPrompt = `O usuário ${name} (${email}) enviou a seguinte mensagem sobre "${subject}":

"${message}"

Por favor, gere uma resposta apropriada para este e-mail. LEMBRE-SE: NÃO inclua saudação inicial, comece direto com o conteúdo.`;

    console.log("Generating AI reply for message:", message_id);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes." }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let generatedReply = data.choices?.[0]?.message?.content || "";

    if (!generatedReply) {
      throw new Error("No reply generated");
    }

    // Remove any greeting that might have been generated anyway (comprehensive patterns)
    generatedReply = generatedReply
      // Remove "Olá [name]," variations - capture with or without name
      .replace(/^Olá[,!\s]*([^,!\n]*)?[,!]?\s*/i, '')
      // Remove "Prezado(a) [name]," variations
      .replace(/^Prezado\(?a?\)?[,!\s]*([^,!\n]*)?[,!]?\s*/i, '')
      // Remove "Caro(a) [name]," variations
      .replace(/^Caro\(?a?\)?[,!\s]*([^,!\n]*)?[,!]?\s*/i, '')
      // Remove "Querido(a) [name]," variations
      .replace(/^Querido\(?a?\)?[,!\s]*([^,!\n]*)?[,!]?\s*/i, '')
      // Remove "Oi [name]," variations
      .replace(/^Oi[,!\s]*([^,!\n]*)?[,!]?\s*/i, '')
      // Remove standalone "Olá!" or "Olá,"
      .replace(/^Olá[!,]\s*/i, '')
      // Remove any line that starts with common greetings followed by newline
      .replace(/^(Olá|Oi|Prezado|Caro|Querido)[^\n]*\n+/i, '')
      .trim();

    console.log("AI reply generated successfully for message:", message_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: generatedReply 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-ai-reply function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar resposta" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
