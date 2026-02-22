import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const subjectLabels: Record<string, string> = {
  question: "Dúvida sobre conteúdo",
  suggestion: "Sugestão de artigo",
  partnership: "Parceria/Colaboração",
  problem: "Reportar problema",
  other: "Outro",
};

// Social icon configurations - white icons hosted locally for email client compatibility
const socialIconConfig: Record<string, { icon: string; alt: string }> = {
  facebook: { icon: 'https://homegardenmanual.lovable.app/images/social/facebook.svg', alt: 'Facebook' },
  instagram: { icon: 'https://homegardenmanual.lovable.app/images/social/instagram.svg', alt: 'Instagram' },
  twitter: { icon: 'https://homegardenmanual.lovable.app/images/social/twitter.svg', alt: 'X' },
  youtube: { icon: 'https://homegardenmanual.lovable.app/images/social/youtube.svg', alt: 'YouTube' },
  linkedin: { icon: 'https://homegardenmanual.lovable.app/images/social/linkedin.svg', alt: 'LinkedIn' },
  pinterest: { icon: 'https://homegardenmanual.lovable.app/images/social/pinterest.svg', alt: 'Pinterest' },
  tiktok: { icon: 'https://homegardenmanual.lovable.app/images/social/tiktok.svg', alt: 'TikTok' },
};

// Generate social icons HTML - perfect circles with white icons
function generateSocialIconsHtml(socialSettings: Record<string, unknown>): string {
  const platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'pinterest', 'tiktok'];
  let html = '';

  for (const platform of platforms) {
    const enabled = socialSettings[`${platform}_enabled`] === true;
    
    if (enabled) {
      const config = socialIconConfig[platform];
      const url = socialSettings[platform] as string;
      const hasUrl = url && url.trim() !== '';
      
      const iconStyle = `display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.15); margin: 0 6px; text-decoration: none;`;
      
      if (hasUrl) {
        html += `<a href="${url}" style="${iconStyle}"><img src="${config.icon}" alt="${config.alt}" width="20" height="20" style="display: block;" /></a>`;
      } else {
        html += `<span style="${iconStyle} opacity: 0.6;"><img src="${config.icon}" alt="${config.alt}" width="20" height="20" style="display: block;" /></span>`;
      }
    }
  }

  return html || '';
}

// Default template for auto-reply with black footer
const getDefaultAutoReplyTemplate = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .logo { max-width: 180px; height: auto; }
    .content { background: white; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2d5016; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #444; }
    .original { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #555; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; border-radius: 0 0 12px 12px; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p style="color: #cccccc; font-size: 13px; margin-bottom: 15px;">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      <p style="font-size: 11px; color: #888888; margin-bottom: 20px;">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática.
      </p>
      <div class="social-icons">
        {{social_icons}}
      </div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate input
    if (!name || name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Nome inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!email || !email.includes("@") || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || !subjectLabels[subject]) {
      return new Response(
        JSON.stringify({ error: "Assunto inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || message.length < 10 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Mensagem inválida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client - use EXTERNAL database for data storage
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP hash for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clientIP + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
    ).then((buf) => 
      Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
    );

    // Save message to database
    const { data: messageData, error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subjectLabels[subject],
        message,
        ip_hash: ipHash,
        status: "pending",
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save message to database");
    }

    const messageId = messageData?.id;

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Home Garden Manual <equipe@homegardenmanual.com>",
      to: ["mktcriandoconteudo@gmail.com"],
      subject: `[Contato] ${subjectLabels[subject]} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .value { background: white; padding: 15px; border-radius: 4px; border: 1px solid #eee; }
            .message-box { background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #4a7c23; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🌿 Nova Mensagem de Contato</h1>
              <p style="margin: 10px 0 0;">Home Garden Manual</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nome</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">E-mail</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Assunto</div>
                <div class="value">${subjectLabels[subject]}</div>
              </div>
              <div class="field">
                <div class="label">Mensagem</div>
                <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
            <div class="footer">
              Esta mensagem foi enviada através do formulário de contato do site.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Error sending admin email:", adminEmailResponse.error);
    }

    // Fetch the default email template for auto-reply
    let htmlTemplate = getDefaultAutoReplyTemplate();
    let templateName = "default";
    
    try {
      const { data: templateData } = await supabase
        .from("email_templates")
        .select("html_template, name")
        .eq("category", "contact_reply")
        .eq("is_default", true)
        .eq("is_active", true)
        .single();
      
      if (templateData?.html_template) {
        htmlTemplate = templateData.html_template;
        templateName = templateData.name || "default";
        console.log("Using custom email template from database:", templateName);
      }
    } catch (templateError) {
      console.log("No custom template found, using default");
    }
    
    // Determine correct logo based on template theme
    const isDarkThemeTemplate = ['Dark Professional', 'Nature Garden'].includes(templateName);
    const logoUrl = isDarkThemeTemplate 
      ? "https://homegardenmanual.lovable.app/images/logo-email-dark.png"
      : "https://homegardenmanual.lovable.app/images/logo-email-light.png";
    
    console.log(`Template "${templateName}" using logo: ${isDarkThemeTemplate ? 'dark' : 'light'}`);

    // Check if auto-reply is enabled
    let autoReplyEnabled = false;
    let autoReplyPrompt = "Você é um assistente do site Home Garden Manual, especializado em jardinagem, plantas e decoração. Responda de forma profissional e amigável em português brasileiro.";
    
    try {
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "auto_reply_config")
        .single();

      if (settingsData?.value && typeof settingsData.value === 'object') {
        const config = settingsData.value as { enabled?: boolean; prompt?: string };
        autoReplyEnabled = config.enabled ?? false;
        if (config.prompt) {
          autoReplyPrompt = config.prompt;
        }
      }
    } catch (settingsError) {
      console.error("Error fetching auto-reply settings:", settingsError);
    }

    // Fetch social settings from database
    let socialIconsHtml = '<!-- No social links configured -->';
    try {
      const { data: socialData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "social_links")
        .single();

      if (socialData?.value && typeof socialData.value === 'object') {
        socialIconsHtml = generateSocialIconsHtml(socialData.value as Record<string, unknown>);
      }
    } catch (socialError) {
      console.log("No social settings found");
    }

    // If auto-reply is enabled, generate and send AI response
    if (autoReplyEnabled && messageId) {
      console.log("Auto-reply is enabled, generating AI response...");
      
      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        
        if (LOVABLE_API_KEY) {
          // IMPORTANT: Prompt now tells AI NOT to include greeting
          const systemPrompt = `${autoReplyPrompt}

Regras CRÍTICAS para a resposta:
- NÃO inclua saudação inicial como "Olá [nome]" ou "Prezado(a) [nome]" - a saudação será adicionada automaticamente pelo template de e-mail
- Comece a resposta diretamente com o conteúdo (ex: "Muito obrigado por entrar em contato...")
- Responda diretamente à dúvida ou solicitação
- Mantenha a resposta concisa mas completa (2-4 parágrafos)
- Se for uma dúvida técnica, forneça dicas práticas
- Finalize com uma despedida amigável
- Não use formatação markdown, apenas texto simples
- Assine como "Equipe Home Garden Manual"`;

          const userPrompt = `O usuário ${name} (${email}) enviou a seguinte mensagem sobre "${subjectLabels[subject]}":

"${message}"

Por favor, gere uma resposta apropriada para este e-mail. LEMBRE-SE: NÃO inclua saudação inicial, comece direto com o conteúdo.`;

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            let generatedReply = aiData.choices?.[0]?.message?.content || "";

            if (generatedReply) {
              console.log("AI reply generated, sending email...");

              // Remove any greeting that might have been generated anyway
              generatedReply = generatedReply
                .replace(/^Olá\s+[^,!.]+[,!.]\s*/i, '')
                .replace(/^Prezado\(a\)\s+[^,!.]+[,!.]\s*/i, '')
                .replace(/^Caro\(a\)\s+[^,!.]+[,!.]\s*/i, '')
                .replace(/^Querido\(a\)\s+[^,!.]+[,!.]\s*/i, '')
                .trim();

              // Format reply content as paragraphs
              const formattedContent = generatedReply.split('\n').map((p: string) => `<p>${p}</p>`).join('');
              
              // Truncate original message if too long
              const truncatedOriginal = message.substring(0, 500) + (message.length > 500 ? '...' : '');
              
              // Replace template placeholders
              const emailHtml = htmlTemplate
                .replace(/\{\{logo_url\}\}/g, logoUrl)
                .replace(/\{\{logo_url_light\}\}/g, "https://homegardenmanual.lovable.app/images/logo-email-light.png")
                .replace(/\{\{logo_url_dark\}\}/g, "https://homegardenmanual.lovable.app/images/logo-email-dark.png")
                .replace(/\{\{name\}\}/g, name)
                .replace(/\{\{content\}\}/g, formattedContent)
                .replace(/\{\{original_message\}\}/g, truncatedOriginal)
                .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
                .replace(/\{\{email\}\}/g, encodeURIComponent(email))
                .replace(/\{\{social_icons\}\}/g, socialIconsHtml);

              // Send AI-generated reply to user
              const autoReplyEmail = await resend.emails.send({
                from: "Home Garden Manual <equipe@homegardenmanual.com>",
                to: [email],
                subject: `Re: ${subjectLabels[subject]}`,
                html: emailHtml,
              });

              if (!autoReplyEmail.error) {
                console.log("Auto-reply email sent successfully");

                // Save the reply to database
                await supabase
                  .from("contact_message_replies")
                  .insert({
                    message_id: messageId,
                    reply_text: generatedReply,
                    replied_by: "00000000-0000-0000-0000-000000000000", // System/AI user
                    is_ai_generated: true,
                    sent_via_email: true,
                  });

                // Update message status to replied
                await supabase
                  .from("contact_messages")
                  .update({ status: "replied" })
                  .eq("id", messageId);

                console.log("Message status updated to replied");
              } else {
                console.error("Error sending auto-reply email:", autoReplyEmail.error);
              }
            }
          } else {
            console.error("AI gateway error:", await aiResponse.text());
          }
        } else {
          console.log("LOVABLE_API_KEY not configured, skipping auto-reply");
        }
      } catch (autoReplyError) {
        console.error("Error generating auto-reply:", autoReplyError);
        // Don't fail the whole request if auto-reply fails
      }
    } else {
      // Send normal confirmation email to user (when auto-reply is disabled)
      const userEmailResponse = await resend.emails.send({
        from: "Home Garden Manual <equipe@homegardenmanual.com>",
        to: [email],
        subject: "Recebemos sua mensagem! 🌿",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
              .button { display: inline-block; background: #4a7c23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🌿 Obrigado pelo contato!</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${name}</strong>,</p>
                <p>Recebemos sua mensagem e agradecemos por entrar em contato conosco!</p>
                <p>Nossa equipe irá analisar sua solicitação e responderemos o mais breve possível.</p>
                <p><strong>Resumo da sua mensagem:</strong></p>
                <ul>
                  <li><strong>Assunto:</strong> ${subjectLabels[subject]}</li>
                  <li><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</li>
                </ul>
                <p>Enquanto isso, continue explorando nossas dicas de jardinagem e decoração!</p>
                <p style="text-align: center;">
                  <a href="https://homegardenmanual.com" class="button">Visitar o Site</a>
                </p>
                <p>Atenciosamente,<br><strong>Equipe Home Garden Manual</strong></p>
              </div>
              <div class="footer">
                <p>Este e-mail foi enviado automaticamente. Por favor, não responda diretamente a este e-mail.</p>
                <p>© ${new Date().getFullYear()} Home Garden Manual. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (userEmailResponse.error) {
        console.error("Error sending user email:", userEmailResponse.error);
      }
    }

    // Send push notification to admins
    try {
      const pushResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-push-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            action: "notify-admins",
            payload: {
              title: autoReplyEnabled ? "📬 Mensagem respondida automaticamente" : "📬 Nova mensagem de contato",
              body: `${name} enviou uma mensagem: ${subjectLabels[subject]}`,
              type: "contact",
              url: "/admin/messages",
            },
          }),
        }
      );
      
      if (!pushResponse.ok) {
        console.error("Error sending push notification:", await pushResponse.text());
      } else {
        console.log("Push notification sent to admins");
      }
    } catch (pushError) {
      console.error("Error calling push notification function:", pushError);
    }

    console.log("Contact form submission successful:", { name, email, subject, autoReplyEnabled });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mensagem enviada com sucesso!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
