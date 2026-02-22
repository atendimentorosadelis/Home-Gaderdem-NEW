import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template designs
const templates = [
  {
    name: "Clássico Verde",
    description: "Template clássico com cores verdes naturais",
    category: "contact_reply",
    is_active: true,
    is_default: true,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); padding: 30px 20px; text-align: center;">
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 180px; height: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #ffffff;">
      <h2 style="color: #2d5a27; margin: 0 0 20px 0; font-size: 24px;">Olá, {{user_name}}!</h2>
      <div style="color: #333333; font-size: 16px; line-height: 1.8;">
        {{content}}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Atenciosamente,<br><strong>Equipe Home Garden Manual</strong></p>
      <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 12px;">Visite nosso site para mais dicas de jardinagem!</p>
      <div style="margin-bottom: 20px;">{{social_icons}}</div>
      <p style="color: #6b7280; margin: 0; font-size: 11px;">Este é um e-mail automático. Por favor, não responda.</p>
      <p style="margin: 15px 0 0 0;"><a href="{{unsubscribe_url}}" style="background-color: #86EFAC; color: #000000; padding: 8px 20px; border-radius: 25px; text-decoration: none; font-size: 12px;">Cancelar Inscrição</a></p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: "Moderno Minimalista",
    description: "Design limpo e moderno com tons neutros",
    category: "contact_reply",
    is_active: true,
    is_default: false,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #1a1a1a; padding: 25px 20px; text-align: center;">
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 160px; height: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 50px 40px; background-color: #ffffff;">
      <h2 style="color: #1a1a1a; margin: 0 0 25px 0; font-size: 22px; font-weight: 300;">Olá, {{user_name}}</h2>
      <div style="color: #4a4a4a; font-size: 15px; line-height: 1.9; border-left: 3px solid #22c55e; padding-left: 20px;">
        {{content}}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Atenciosamente,<br><strong>Equipe Home Garden Manual</strong></p>
      <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 12px;">Visite nosso site para mais dicas!</p>
      <div style="margin-bottom: 20px;">{{social_icons}}</div>
      <p style="color: #6b7280; margin: 0; font-size: 11px;">Este é um e-mail automático.</p>
      <p style="margin: 15px 0 0 0;"><a href="{{unsubscribe_url}}" style="background-color: #86EFAC; color: #000000; padding: 8px 20px; border-radius: 25px; text-decoration: none; font-size: 12px;">Cancelar Inscrição</a></p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: "Natureza Vibrante",
    description: "Cores vibrantes inspiradas na natureza",
    category: "contact_reply",
    is_active: true,
    is_default: false,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f0fdf4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%); padding: 35px 20px; text-align: center;">
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 180px; height: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #ffffff;">
      <h2 style="color: #15803d; margin: 0 0 20px 0; font-size: 26px; font-style: italic;">Querido(a) {{user_name}},</h2>
      <div style="color: #374151; font-size: 16px; line-height: 1.8;">
        {{content}}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Com carinho,<br><strong>Equipe Home Garden Manual</strong></p>
      <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 12px;">Cultivando sonhos, colhendo conhecimento!</p>
      <div style="margin-bottom: 20px;">{{social_icons}}</div>
      <p style="color: #6b7280; margin: 0; font-size: 11px;">Este é um e-mail automático.</p>
      <p style="margin: 15px 0 0 0;"><a href="{{unsubscribe_url}}" style="background-color: #86EFAC; color: #000000; padding: 8px 20px; border-radius: 25px; text-decoration: none; font-size: 12px;">Cancelar Inscrição</a></p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: "Elegante Escuro",
    description: "Design sofisticado com tema escuro",
    category: "contact_reply",
    is_active: true,
    is_default: false,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1f2937;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #10b981;">
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 180px; height: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #1f2937;">
      <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">Olá, {{user_name}}!</h2>
      <div style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
        {{content}}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Atenciosamente,<br><strong>Equipe Home Garden Manual</strong></p>
      <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 12px;">Seu guia de jardinagem!</p>
      <div style="margin-bottom: 20px;">{{social_icons}}</div>
      <p style="color: #6b7280; margin: 0; font-size: 11px;">Este é um e-mail automático.</p>
      <p style="margin: 15px 0 0 0;"><a href="{{unsubscribe_url}}" style="background-color: #86EFAC; color: #000000; padding: 8px 20px; border-radius: 25px; text-decoration: none; font-size: 12px;">Cancelar Inscrição</a></p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: "Jardim Floral",
    description: "Design acolhedor com tons florais",
    category: "contact_reply",
    is_active: true,
    is_default: false,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; background-color: #fef7f0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fcd5ce;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #be7b5e 0%, #d4a373 100%); padding: 30px 20px; text-align: center;">
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 180px; height: auto;">
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; background-color: #fffbf5;">
      <h2 style="color: #9c6644; margin: 0 0 20px 0; font-size: 24px;">Olá, {{user_name}}! 🌸</h2>
      <div style="color: #5c4033; font-size: 16px; line-height: 1.8;">
        {{content}}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Com carinho,<br><strong>Equipe Home Garden Manual</strong></p>
      <p style="color: #9ca3af; margin: 0 0 20px 0; font-size: 12px;">Florescendo conhecimento!</p>
      <div style="margin-bottom: 20px;">{{social_icons}}</div>
      <p style="color: #6b7280; margin: 0; font-size: 11px;">Este é um e-mail automático.</p>
      <p style="margin: 15px 0 0 0;"><a href="{{unsubscribe_url}}" style="background-color: #86EFAC; color: #000000; padding: 8px 20px; border-radius: 25px; text-decoration: none; font-size: 12px;">Cancelar Inscrição</a></p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: "Aurora Botânica",
    description: "Design futurista premium com gradientes aurora e glassmorphism",
    category: "contact_reply",
    is_active: true,
    is_default: false,
    html_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header com Gradiente Aurora -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #0d9488 35%, #22c55e 70%, #a3e635 100%); padding: 45px 20px; text-align: center; position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
      <img src="{{logo_url}}" alt="{{site_name}}" style="max-width: 200px; height: auto; position: relative; filter: drop-shadow(0 4px 15px rgba(0,0,0,0.3));">
    </div>
    
    <!-- Content com efeito Glass -->
    <div style="padding: 50px 35px; background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #faf5ff 100%);">
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.8) 100%); border: 1px solid rgba(34,197,94,0.2); border-radius: 20px; padding: 35px; box-shadow: 0 8px 32px rgba(99,102,241,0.1), 0 4px 16px rgba(34,197,94,0.08);">
        <h2 style="margin: 0 0 25px 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #0d9488 50%, #22c55e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          Olá, {{user_name}}! ✨
        </h2>
        <div style="color: #374151; font-size: 16px; line-height: 1.9; border-left: 4px solid; border-image: linear-gradient(180deg, #6366f1 0%, #22c55e 100%) 1; padding-left: 20px; margin-top: 20px;">
          {{content}}
        </div>
      </div>
    </div>
    
    <!-- Footer Premium com Glow -->
    <div style="background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%); padding: 40px 20px; text-align: center; position: relative;">
      <!-- Linha de brilho superior -->
      <div style="position: absolute; top: 0; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent 0%, #6366f1 25%, #22c55e 50%, #a3e635 75%, transparent 100%);"></div>
      
      <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 15px; font-weight: 300;">Com gratidão,</p>
      <p style="margin: 0 0 20px 0;"><strong style="background: linear-gradient(90deg, #22c55e, #a3e635); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 16px;">Equipe Home Garden Manual</strong></p>
      <p style="color: #6b7280; margin: 0 0 25px 0; font-size: 12px; font-style: italic;">Onde a natureza encontra a inovação 🌿</p>
      
      <div style="margin-bottom: 25px;">{{social_icons}}</div>
      
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 11px;">Este é um e-mail automático.</p>
      
      <!-- Botão com efeito neon -->
      <p style="margin: 0 0 20px 0;">
        <a href="{{unsubscribe_url}}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: #000000; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-size: 12px; font-weight: 600; box-shadow: 0 0 20px rgba(34,197,94,0.4), 0 0 40px rgba(34,197,94,0.2);">
          Cancelar Inscrição
        </a>
      </p>
      
      <p style="color: #374151; margin: 0; font-size: 10px;">© {{year}} Home Garden Manual</p>
    </div>
  </div>
</body>
</html>`
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const externalSupabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const externalSupabaseKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY");

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      throw new Error("External Supabase credentials not configured");
    }

    const supabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    // Check existing templates by name
    const { data: existing } = await supabase
      .from("email_templates")
      .select("name")
      .eq("category", "contact_reply");

    const existingNames = new Set((existing || []).map((t: { name: string }) => t.name));
    
    // Filter only new templates
    const newTemplates = templates.filter(t => !existingNames.has(t.name));
    
    if (newTemplates.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `All ${existing?.length || 0} templates already exist`,
          count: existing?.length || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert only new templates
    const { data, error } = await supabase
      .from("email_templates")
      .insert(newTemplates)
      .select();

    if (error) {
      console.error("Error inserting templates:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${data.length} new templates created (${existingNames.size} already existed)`,
        templates: data,
        existing: existingNames.size
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-email-templates:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
