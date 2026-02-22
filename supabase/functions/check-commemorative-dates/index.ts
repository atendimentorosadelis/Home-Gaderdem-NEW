import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Commemorative dates configuration - must match frontend
interface CommemorativeDate {
  id: string;
  label: string;
  labelEn: string;
  month: number;
  day: number | null;
  getDate?: string; // Function name for mobile dates
  topicSuggestion: string;
  color: string;
}

const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  { id: 'ano-novo', label: 'Ano Novo', labelEn: 'New Year', month: 1, day: 1, topicSuggestion: 'Decoração e plantas para renovar a casa no ano novo', color: 'yellow' },
  { id: 'carnaval', label: 'Carnaval', labelEn: 'Carnival', month: 2, day: null, getDate: 'carnival', topicSuggestion: 'Decoração tropical e colorida para o Carnaval', color: 'purple' },
  { id: 'valentines-day', label: "Valentine's Day", labelEn: "Valentine's Day", month: 2, day: 14, topicSuggestion: "Jardim romântico e flores para o Valentine's Day", color: 'pink' },
  { id: 'dia-mulher', label: 'Dia da Mulher', labelEn: "Women's Day", month: 3, day: 8, topicSuggestion: 'As melhores flores para presentear no Dia da Mulher', color: 'pink' },
  { id: 'st-patricks', label: "St. Patrick's Day", labelEn: "St. Patrick's Day", month: 3, day: 17, topicSuggestion: "Plantas verdes e trevos para decorar no St. Patrick's Day", color: 'green' },
  { id: 'pascoa', label: 'Páscoa', labelEn: 'Easter', month: 4, day: null, getDate: 'easter', topicSuggestion: 'Decoração de Páscoa para jardim e casa', color: 'purple' },
  { id: 'dia-maes', label: 'Dia das Mães', labelEn: "Mother's Day", month: 5, day: null, getDate: 'mothers-day', topicSuggestion: 'Plantas e flores para presentear no Dia das Mães', color: 'pink' },
  { id: 'memorial-day', label: 'Memorial Day', labelEn: 'Memorial Day', month: 5, day: null, getDate: 'memorial-day', topicSuggestion: 'Jardim patriótico para o Memorial Day', color: 'blue' },
  { id: 'dia-namorados-br', label: 'Dia dos Namorados', labelEn: "Valentine's Day (BR)", month: 6, day: 12, topicSuggestion: 'Jardim romântico para o Dia dos Namorados', color: 'red' },
  { id: 'festa-junina', label: 'Festa Junina', labelEn: 'June Festival', month: 6, day: 24, topicSuggestion: 'Decoração junina para jardim e varanda', color: 'orange' },
  { id: 'independence-day-us', label: '4 de Julho', labelEn: '4th of July', month: 7, day: 4, topicSuggestion: 'Decoração patriótica americana para o jardim', color: 'blue' },
  { id: 'dia-pais', label: 'Dia dos Pais', labelEn: "Father's Day", month: 8, day: null, getDate: 'fathers-day', topicSuggestion: 'Horta e ferramentas para presentear no Dia dos Pais', color: 'blue' },
  { id: 'independencia-br', label: 'Independência do Brasil', labelEn: 'Brazil Independence Day', month: 9, day: 7, topicSuggestion: 'Decoração verde e amarela para o jardim', color: 'green' },
  { id: 'labor-day', label: 'Labor Day', labelEn: 'Labor Day', month: 9, day: null, getDate: 'labor-day', topicSuggestion: 'Preparando o jardim para o outono', color: 'blue' },
  { id: 'dia-criancas', label: 'Dia das Crianças', labelEn: "Children's Day", month: 10, day: 12, topicSuggestion: 'Jardim seguro e divertido para crianças', color: 'cyan' },
  { id: 'halloween', label: 'Halloween', labelEn: 'Halloween', month: 10, day: 31, topicSuggestion: 'Decoração de Halloween para jardim e entrada', color: 'orange' },
  { id: 'thanksgiving', label: 'Thanksgiving', labelEn: 'Thanksgiving', month: 11, day: null, getDate: 'thanksgiving', topicSuggestion: 'Mesa e decoração de Thanksgiving com plantas', color: 'amber' },
  { id: 'natal', label: 'Natal', labelEn: 'Christmas', month: 12, day: 25, topicSuggestion: 'Decoração natalina para jardim e fachada', color: 'red' },
];

const ALERT_DAYS_BEFORE = 3;

// Date calculation helpers
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getCarnivalDate(year: number): Date {
  const easter = getEasterDate(year);
  return new Date(easter.getTime() - 47 * 24 * 60 * 60 * 1000);
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekday = firstDay.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month - 1, day);
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month, 0);
  const lastWeekday = lastDay.getDay();
  const diff = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month - 1, lastDay.getDate() - diff);
}

function getEventDate(date: CommemorativeDate, year: number): Date {
  if (date.day !== null) {
    return new Date(year, date.month - 1, date.day);
  }
  
  switch (date.getDate) {
    case 'easter': return getEasterDate(year);
    case 'carnival': return getCarnivalDate(year);
    case 'mothers-day': return getNthWeekdayOfMonth(year, 5, 0, 2);
    case 'fathers-day': return getNthWeekdayOfMonth(year, 8, 0, 2);
    case 'memorial-day': return getLastWeekdayOfMonth(year, 5, 1);
    case 'labor-day': return getNthWeekdayOfMonth(year, 9, 1, 1);
    case 'thanksgiving': return getNthWeekdayOfMonth(year, 11, 4, 4);
    default: return new Date(year, date.month - 1, 1);
  }
}

function differenceInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
}

function getColorEmoji(color: string): string {
  const emojiMap: Record<string, string> = {
    red: '🔴', orange: '🟠', yellow: '🟡', green: '🟢',
    blue: '🔵', purple: '🟣', pink: '💗', cyan: '🩵', amber: '🟡'
  };
  return emojiMap[color] || '📅';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting commemorative dates check...");

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Find dates that are exactly 3 days away (entering the alert window)
    const datesToNotify: CommemorativeDate[] = [];

    for (const date of COMMEMORATIVE_DATES) {
      let eventDate = getEventDate(date, currentYear);
      eventDate.setHours(0, 0, 0, 0);
      let daysUntil = differenceInDays(eventDate, today);

      // If past, check next year
      if (daysUntil < 0) {
        eventDate = getEventDate(date, currentYear + 1);
        eventDate.setHours(0, 0, 0, 0);
        daysUntil = differenceInDays(eventDate, today);
      }

      // Notify when entering the 3-day window
      if (daysUntil === ALERT_DAYS_BEFORE) {
        datesToNotify.push(date);
        console.log(`Found date to notify: ${date.label} (${daysUntil} days away)`);
      }
    }

    if (datesToNotify.length === 0) {
      console.log("No commemorative dates to notify about today");
      return new Response(
        JSON.stringify({ success: true, message: "No dates to notify", notified: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    console.log(`Found ${adminRoles?.length || 0} admins to notify`);

    // Create in-app notifications for each admin and each date
    const notifications = [];
    for (const date of datesToNotify) {
      for (const role of adminRoles || []) {
        notifications.push({
          user_id: role.user_id,
          title: `${getColorEmoji(date.color)} ${date.label} em 3 dias!`,
          message: `Aproveite para criar conteúdo temático: ${date.topicSuggestion}`,
          type: "info",
          link: "/admin/generate",
        });
      }
    }

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error creating notifications:", notifError);
      } else {
        console.log(`Created ${notifications.length} in-app notifications`);
      }
    }

    // Send emails to admins using Resend API directly
    if (resendApiKey) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email, user_id")
        .in("user_id", adminRoles?.map(r => r.user_id) || []);

      if (profilesError) {
        console.error("Error fetching admin profiles:", profilesError);
      } else {
        for (const profile of profiles || []) {
          if (!profile.email) continue;

          const datesList = datesToNotify.map(d => 
            `<li style="margin-bottom: 8px;">
              <strong>${getColorEmoji(d.color)} ${d.label}</strong><br/>
              <span style="color: #666;">${d.topicSuggestion}</span>
            </li>`
          ).join('');

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Datas Comemorativas - Home Garden Manual</title>
            </head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">📅 Datas Comemorativas</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Home Garden Manual</p>
                </div>
                
                <div style="padding: 30px;">
                  <h2 style="color: #1f2937; margin-top: 0;">Olá, Admin!</h2>
                  
                  <p style="color: #4b5563; line-height: 1.6;">
                    As seguintes datas comemorativas estão chegando em <strong>3 dias</strong>. 
                    É uma ótima oportunidade para criar conteúdo temático!
                  </p>
                  
                  <ul style="padding-left: 20px; color: #1f2937;">
                    ${datesList}
                  </ul>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://homegardenmanual.lovable.app/admin/generate" 
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      Gerar Artigos Agora
                    </a>
                  </div>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Home Garden Manual • Notificação Automática
                  </p>
                </div>
              </div>
            </body>
            </html>
          `;

          try {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Home Garden Manual <onboarding@resend.dev>",
                to: [profile.email],
                subject: `📅 ${datesToNotify.map(d => d.label).join(', ')} em 3 dias!`,
                html: emailHtml,
              }),
            });
            
            if (emailResponse.ok) {
              console.log(`Email sent to ${profile.email}`);
            } else {
              const errorData = await emailResponse.text();
              console.error(`Failed to send email to ${profile.email}:`, errorData);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (emailError) {
            console.error(`Failed to send email to ${profile.email}:`, emailError);
          }
        }
      }
    } else {
      console.log("Resend API key not configured, skipping email notifications");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified about ${datesToNotify.length} commemorative dates`,
        dates: datesToNotify.map(d => d.label),
        notificationsCreated: notifications.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in check-commemorative-dates:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
