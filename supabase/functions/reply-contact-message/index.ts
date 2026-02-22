import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReplyRequest {
  message_id: string;
  reply_text: string;
  send_email: boolean;
  is_ai_generated?: boolean;
  recipient_email: string;
  recipient_name: string;
  original_subject: string;
  original_message: string;
}

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

// Default template if none found in database
const getDefaultTemplate = () => `<!DOCTYPE html>
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message_id, 
      reply_text, 
      send_email, 
      is_ai_generated = false,
      recipient_email,
      recipient_name,
      original_subject,
      original_message
    }: ReplyRequest = await req.json();

    if (!message_id || !reply_text) {
      return new Response(
        JSON.stringify({ error: "message_id e reply_text são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header if available
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let emailSent = false;

    // Send email if requested
    if (send_email && recipient_email) {
      console.log("Sending reply email to:", recipient_email);
      
      // Fetch the default email template from database
      let htmlTemplate = getDefaultTemplate();
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
      
      // Format reply content as paragraphs
      const formattedContent = reply_text.split('\n').map(p => `<p>${p}</p>`).join('');
      
      // Truncate original message if too long
      const truncatedOriginal = original_message.substring(0, 500) + (original_message.length > 500 ? '...' : '');
      
      // Replace template placeholders
      const emailHtml = htmlTemplate
        .replace(/\{\{logo_url\}\}/g, logoUrl)
        .replace(/\{\{logo_url_light\}\}/g, "https://homegardenmanual.lovable.app/images/logo-email-light.png")
        .replace(/\{\{logo_url_dark\}\}/g, "https://homegardenmanual.lovable.app/images/logo-email-dark.png")
        .replace(/\{\{name\}\}/g, recipient_name)
        .replace(/\{\{content\}\}/g, formattedContent)
        .replace(/\{\{original_message\}\}/g, truncatedOriginal)
        .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
        .replace(/\{\{email\}\}/g, encodeURIComponent(recipient_email))
        .replace(/\{\{social_icons\}\}/g, socialIconsHtml);
      
      const emailResponse = await resend.emails.send({
        from: "Home Garden Manual <equipe@homegardenmanual.com>",
        to: [recipient_email],
        subject: `Re: ${original_subject}`,
        html: emailHtml,
      });

      if (emailResponse.error) {
        console.error("Error sending reply email:", emailResponse.error);
      } else {
        emailSent = true;
        console.log("Reply email sent successfully");
      }
    }

    // Save reply to database
    const { error: insertError } = await supabase
      .from("contact_message_replies")
      .insert({
        message_id,
        reply_text,
        replied_by: userId,
        is_ai_generated,
        sent_via_email: emailSent,
      });

    if (insertError) {
      console.error("Error saving reply:", insertError);
      throw new Error("Failed to save reply");
    }

    // Update message status to 'replied'
    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ status: "replied" })
      .eq("id", message_id);

    if (updateError) {
      console.error("Error updating message status:", updateError);
    }

    console.log("Reply saved successfully for message:", message_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_sent: emailSent,
        message: emailSent ? "Resposta enviada por e-mail e salva com sucesso!" : "Resposta salva com sucesso!"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reply-contact-message function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar resposta" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
