import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Site URL for links
const SITE_URL = "https://homegardenmanual.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  articleId?: string;
  articleTitle?: string;
  articleExcerpt?: string;
  articleSlug?: string;
  articleCategory?: string;
  coverImage?: string;
  testEmail?: string;
}

// Social icon configurations
const socialIconConfig: Record<string, { icon: string; alt: string }> = {
  facebook: { icon: 'https://cdn-icons-png.flaticon.com/24/733/733547.png', alt: 'Facebook' },
  instagram: { icon: 'https://cdn-icons-png.flaticon.com/24/2111/2111463.png', alt: 'Instagram' },
  twitter: { icon: 'https://cdn-icons-png.flaticon.com/24/733/733579.png', alt: 'Twitter' },
  youtube: { icon: 'https://cdn-icons-png.flaticon.com/24/1384/1384060.png', alt: 'YouTube' },
  linkedin: { icon: 'https://cdn-icons-png.flaticon.com/24/3536/3536505.png', alt: 'LinkedIn' },
  pinterest: { icon: 'https://cdn-icons-png.flaticon.com/24/145/145808.png', alt: 'Pinterest' },
  tiktok: { icon: 'https://cdn-icons-png.flaticon.com/24/3046/3046121.png', alt: 'TikTok' },
};

// Generate social icons HTML from settings
function generateSocialIconsHtml(socialSettings: Record<string, unknown>): string {
  const platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'pinterest', 'tiktok'];
  let html = '';

  for (const platform of platforms) {
    const enabled = socialSettings[`${platform}_enabled`] !== false;
    const url = socialSettings[platform] as string;

    if (enabled && url && url.trim() !== '') {
      const config = socialIconConfig[platform];
      html += `<a href="${url}" style="display: inline-block; margin: 0 8px;"><img src="${config.icon}" alt="${config.alt}" width="24" height="24" /></a>`;
    }
  }

  return html || '<!-- No social links configured -->';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations (database, storage)
    const externalSupabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const externalSupabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(externalSupabaseUrl, externalSupabaseServiceKey);

    // Use CLOUD Supabase (Lovable) for authentication
    const cloudSupabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const cloudSupabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAuth = createClient(cloudSupabaseUrl, cloudSupabaseServiceKey);

    // Verify JWT token using Cloud Supabase (where Auth lives)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("[send-newsletter] Validating token with Cloud Supabase");
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error("[send-newsletter] Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[send-newsletter] User authenticated:", user.email);

    // Check if user is admin in EXTERNAL database (where user_roles table lives)
    // First, find the user in the external profiles table by email
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", user.email)
      .maybeSingle();

    if (!profileData) {
      console.error("[send-newsletter] User not found in external database:", user.email);
      return new Response(
        JSON.stringify({ error: "User not found in database" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profileData.user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.error("[send-newsletter] User is not admin:", user.email);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[send-newsletter] Admin access confirmed for:", user.email);

    const body: NewsletterRequest = await req.json();
    const { articleId, articleTitle, articleExcerpt, articleSlug, articleCategory, coverImage, testEmail } = body;

    if (!articleTitle || !articleSlug) {
      return new Response(
        JSON.stringify({ error: "Article title and slug are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch social settings
    const { data: socialData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single();

    const socialSettings = (socialData?.value as Record<string, unknown>) || {};
    const socialIconsHtml = generateSocialIconsHtml(socialSettings);

    // Get active subscribers
    let subscribersQuery = supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (testEmail) {
      subscribersQuery = subscribersQuery.eq("email", testEmail);
    }

    const { data: subscribers, error: subError } = await subscribersQuery;

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No active subscribers found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending newsletter to ${subscribers.length} subscribers`);

    // Create send history record
    const { data: historyRecord, error: historyError } = await supabase
      .from("newsletter_send_history")
      .insert({
        article_id: articleId || null,
        article_title: articleTitle,
        article_slug: articleSlug,
        total_recipients: subscribers.length,
        status: "sending",
        sent_by: user.id,
      })
      .select()
      .single();

    if (historyError) {
      console.error("Error creating history record:", historyError);
    }

    const historyId = historyRecord?.id;
    const baseUrl = SITE_URL;
    const unsubscribeBaseUrl = `${supabaseUrl}/functions/v1/newsletter-unsubscribe`;
    const trackingBaseUrl = `${supabaseUrl}/functions/v1/newsletter-tracking`;

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];
    const trackingRecords: any[] = [];

    // Prepare tracking records
    for (const subscriber of subscribers) {
      const trackingToken = crypto.randomUUID();
      trackingRecords.push({
        send_history_id: historyId,
        subscriber_email: subscriber.email,
        tracking_token: trackingToken,
        status: "pending",
      });
    }

    // Insert tracking records
    if (historyId && trackingRecords.length > 0) {
      await supabase.from("newsletter_email_tracking").insert(trackingRecords);
    }

    // Build tracking records map for quick lookup
    const trackingMap = new Map(trackingRecords.map(r => [r.subscriber_email, r.tracking_token]));

    // Send emails in batches
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const promises = batch.map(async (subscriber) => {
        try {
          const trackingToken = trackingMap.get(subscriber.email);
          // Use automatic unsubscribe via edge function with token
          const unsubscribeUrl = trackingToken 
            ? `${unsubscribeBaseUrl}?token=${trackingToken}`
            : `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
          const articleUrl = `${baseUrl}/artigo/${articleSlug}`;
          
          // Tracking URLs
          const openTrackingPixel = trackingToken 
            ? `${trackingBaseUrl}?action=open&token=${trackingToken}`
            : '';
          const clickTrackingUrl = trackingToken
            ? `${trackingBaseUrl}?action=click&token=${trackingToken}&redirect=${encodeURIComponent(articleUrl)}`
            : articleUrl;

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
                }
                .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: white;
                }
                .header { 
                  background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); 
                  color: white; 
                  padding: 30px; 
                  text-align: center; 
                }
                .header h1 { 
                  margin: 0; 
                  font-size: 24px; 
                }
                .content { 
                  padding: 30px; 
                }
                .article-card {
                  background: #f9f9f9;
                  border-radius: 8px;
                  overflow: hidden;
                  margin-bottom: 20px;
                }
                .article-image {
                  width: 100%;
                  height: 200px;
                  object-fit: cover;
                }
                .article-content {
                  padding: 20px;
                }
                .category {
                  display: inline-block;
                  background: #4a7c23;
                  color: white;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  text-transform: uppercase;
                  margin-bottom: 10px;
                }
                .article-title {
                  font-size: 20px;
                  font-weight: bold;
                  color: #2d5016;
                  margin: 10px 0;
                  text-decoration: none;
                }
                .article-excerpt {
                  color: #666;
                  margin-bottom: 15px;
                }
                .button { 
                  display: inline-block; 
                  background: #4a7c23; 
                  color: white !important; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 4px;
                  font-weight: 600;
                }
                .footer { 
                  text-align: center; 
                  padding: 20px; 
                  color: #999; 
                  font-size: 12px;
                  background: #f9f9f9;
                  border-top: 1px solid #eee;
                }
                .unsubscribe {
                  color: #999;
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="${SITE_URL}/images/logo-email-light.png" alt="Home Garden Manual" style="max-width: 180px; height: auto;" />
                </div>
                <div class="content">
                  <p>Olá!</p>
                  <p>Acabamos de publicar um novo artigo que você vai adorar:</p>
                  
                  <div class="article-card">
                    ${coverImage ? `<img src="${coverImage}" alt="${articleTitle}" class="article-image" />` : ''}
                    <div class="article-content">
                      ${articleCategory ? `<span class="category">${articleCategory}</span>` : ''}
                      <h2 class="article-title">${articleTitle}</h2>
                      ${articleExcerpt ? `<p class="article-excerpt">${articleExcerpt}</p>` : ''}
                      <a href="${clickTrackingUrl}" class="button">Ler Artigo Completo</a>
                    </div>
                  </div>
                  
                  <p>Continue acompanhando nossas dicas para deixar seu jardim e sua casa ainda mais bonitos!</p>
                </div>
                <div class="footer">
                  <p style="margin-bottom: 15px;"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
                  
                  <p style="margin-bottom: 15px;">
                    Visite nosso <a href="${SITE_URL}" style="color: #4a7c23; text-decoration: underline;">site</a>, 
                    um lugar para você explorar dicas de jardinagem, decoração e muito mais!
                  </p>
                  
                  <p style="font-size: 11px; color: #888; margin-bottom: 15px;">
                    Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
                    e não é possível dar continuidade ao seu atendimento por aqui.
                  </p>
                  
                <div style="margin: 20px 0;">
                    ${socialIconsHtml}
                  </div>
                  
                  <p>© ${new Date().getFullYear()} Home Garden Manual. Todos os direitos reservados.</p>
                  
                  <p style="margin-top: 15px;">
                    <a href="${unsubscribeUrl}" class="unsubscribe">Cancelar inscrição</a>
                  </p>
                </div>
              </div>
              ${openTrackingPixel ? `<img src="${openTrackingPixel}" width="1" height="1" style="display:none;" alt="" />` : ''}
            </body>
            </html>
          `;

          const { error: emailError } = await resend.emails.send({
            from: "Home Garden Manual <equipe@homegardenmanual.com>",
            to: [subscriber.email],
            subject: `🌿 Novo artigo: ${articleTitle}`,
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Error sending to ${subscriber.email}:`, emailError);
            errors.push(`${subscriber.email}: ${emailError.message}`);
            failCount++;
            
            // Update tracking record status
            if (historyId && trackingToken) {
              await supabase
                .from("newsletter_email_tracking")
                .update({ status: "failed" })
                .eq("tracking_token", trackingToken);
            }
          } else {
            successCount++;
            
            // Update tracking record status
            if (historyId && trackingToken) {
              await supabase
                .from("newsletter_email_tracking")
                .update({ status: "sent", sent_at: new Date().toISOString() })
                .eq("tracking_token", trackingToken);
            }
          }
        } catch (err: any) {
          console.error(`Error sending to ${subscriber.email}:`, err);
          errors.push(`${subscriber.email}: ${err.message}`);
          failCount++;
        }
      });

      await Promise.all(promises);
      
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update history record with final stats
    if (historyId) {
      await supabase
        .from("newsletter_send_history")
        .update({
          successful_sends: successCount,
          failed_sends: failCount,
          status: failCount === subscribers.length ? "failed" : "completed",
          error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
        })
        .eq("id", historyId);
    }

    console.log(`Newsletter sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total: subscribers.length,
        historyId,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
