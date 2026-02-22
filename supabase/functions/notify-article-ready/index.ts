import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoPilotData {
  topicUsed: string;
  publishedImmediately: boolean;
  duration: number;
  todayCount: number;
  dailyLimit: number;
}

interface NotifyRequest {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  isAutoPilot?: boolean;
  autoPilotData?: AutoPilotData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations
    const supabase = createClient(
      Deno.env.get('EXTERNAL_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { articleId, articleTitle, articleSlug, isAutoPilot, autoPilotData }: NotifyRequest = await req.json();

    console.log('Notifying admins about article:', articleTitle, 'isAutoPilot:', isAutoPilot);

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      throw rolesError;
    }

    console.log('Found admins:', adminRoles?.length || 0);

    // Create in-app notifications for each admin
    if (adminRoles && adminRoles.length > 0) {
      const notificationTitle = isAutoPilot 
        ? '🤖 Artigo gerado pelo Piloto Automático'
        : '📝 Novo artigo aguardando aprovação';
      
      const notificationMessage = isAutoPilot
        ? `O artigo "${articleTitle}" foi gerado automaticamente (tema: ${autoPilotData?.topicUsed || 'N/A'}) e está ${autoPilotData?.publishedImmediately ? 'publicado' : 'aguardando aprovação'}.`
        : `O artigo "${articleTitle}" foi gerado e está aguardando sua aprovação para publicação.`;

      const notifications = adminRoles.map(role => ({
        user_id: role.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: 'article',
        link: `/admin/articles/${articleId}`,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      } else {
        console.log('In-app notifications created successfully');
      }
    }

    // Get admin emails for email notification
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, user_id')
      .in('user_id', adminRoles?.map(r => r.user_id) || []);

    if (profilesError) {
      console.error('Error fetching admin profiles:', profilesError);
    }

    // Send email to each admin
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Helper function to add delay between requests (avoid Resend rate limit of 2 req/s)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    if (resendApiKey && adminProfiles && adminProfiles.length > 0) {
      const siteUrl = Deno.env.get('SITE_URL') || 'https://homegardenmanual.lovable.app';
      const articleUrl = `${siteUrl}/admin/articles/${articleId}`;

      for (let i = 0; i < adminProfiles.length; i++) {
        const admin = adminProfiles[i];
        if (!admin.email) continue;

        try {
          // Build autopilot info section if applicable
          const autoPilotSection = isAutoPilot && autoPilotData ? `
            <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 10px;">🤖</span>
                <h3 style="color: #22c55e; font-size: 16px; margin: 0;">Gerado pelo Piloto Automático</h3>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #94a3b8; font-size: 14px; padding: 5px 0;">Tema:</td>
                  <td style="color: #ffffff; font-size: 14px; padding: 5px 0; text-align: right; font-weight: 600;">${autoPilotData.topicUsed}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 14px; padding: 5px 0;">Status:</td>
                  <td style="color: ${autoPilotData.publishedImmediately ? '#22c55e' : '#f59e0b'}; font-size: 14px; padding: 5px 0; text-align: right; font-weight: 600;">${autoPilotData.publishedImmediately ? 'Publicado' : 'Rascunho'}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 14px; padding: 5px 0;">Tempo de geração:</td>
                  <td style="color: #ffffff; font-size: 14px; padding: 5px 0; text-align: right;">${(autoPilotData.duration / 1000).toFixed(1)}s</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 14px; padding: 5px 0;">Artigos hoje:</td>
                  <td style="color: #ffffff; font-size: 14px; padding: 5px 0; text-align: right;">${autoPilotData.todayCount} / ${autoPilotData.dailyLimit}</td>
                </tr>
              </table>
            </div>
          ` : '';

          const emailTitle = isAutoPilot 
            ? '🤖 Artigo Gerado pelo Piloto Automático'
            : '📝 Novo Artigo Aguardando Aprovação';

          const emailIntro = isAutoPilot
            ? 'O Piloto Automático gerou um novo artigo com sucesso:'
            : 'Um novo artigo foi gerado pela IA e está aguardando sua aprovação para publicação:';

          const statusText = isAutoPilot && autoPilotData?.publishedImmediately
            ? '<strong style="color: #22c55e;">Publicado Automaticamente</strong>'
            : '<strong style="color: #f59e0b;">Rascunho - Aguardando Aprovação</strong>';

          const buttonText = isAutoPilot && autoPilotData?.publishedImmediately
            ? 'Ver Artigo Publicado'
            : 'Revisar e Publicar';

          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" style="max-width: 180px; height: auto;">
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">
      ${emailTitle}
    </h1>
    
    <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 15px;">
      Olá!
    </p>
    
    <p style="color: #4a4a4a; font-size: 16px; margin-bottom: 20px;">
      ${emailIntro}
    </p>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #22c55e; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 5px 0;">
        ${articleTitle}
      </h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        Status: ${statusText}
      </p>
    </div>
    
    ${autoPilotSection}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${articleUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 16px; font-weight: 600;">
        ${buttonText}
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
      Este é um e-mail automático enviado pelo sistema de geração de conteúdo.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="background-color: #000000; padding: 25px; border-radius: 8px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px 0;">
        Home Garden Manual - Seu guia de casa e jardim
      </p>
      <a href="${siteUrl}" style="color: #86EFAC; font-size: 14px; text-decoration: none;">
        Visitar o site →
      </a>
    </div>
  </div>
</body>
</html>
          `;

          const emailSubject = isAutoPilot
            ? `🤖 Piloto Automático: ${articleTitle}`
            : `📝 Novo artigo aguardando aprovação: ${articleTitle}`;

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Home Garden Manual <equipe@homegardenmanual.com>',
              to: [admin.email],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            console.log(`Email sent to ${admin.email}`);
          } else {
            const errorData = await emailResponse.text();
            console.error(`Failed to send email to ${admin.email}:`, errorData);
          }
        } catch (emailError) {
          console.error(`Error sending email to ${admin.email}:`, emailError);
        }
        
        // Add delay between emails to respect Resend rate limit (2 req/s)
        if (i < adminProfiles.length - 1) {
          console.log('Waiting 600ms before next email...');
          await delay(600);
        }
      }
    } else {
      console.log('Skipping email notification - no RESEND_API_KEY or no admin emails');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admins notified successfully',
        notifiedCount: adminRoles?.length || 0,
        isAutoPilot: isAutoPilot || false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in notify-article-ready:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
