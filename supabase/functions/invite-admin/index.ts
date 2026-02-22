import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteAdminRequest {
  email: string;
  username: string;
  password?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use EXTERNAL Supabase for data operations (where user data lives)
    const externalUrl = Deno.env.get("EXTERNAL_SUPABASE_URL")!;
    const externalServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service client for external database
    const externalClient = createClient(externalUrl, externalServiceKey);
    const resend = new Resend(resendApiKey);

    // Extract email from JWT manually (works with both Lovable Cloud and external tokens)
    const token = authHeader.replace("Bearer ", "");
    let userEmail: string | null = null;
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userEmail = payload.email || payload.user_metadata?.email;
    } catch (decodeError) {
      console.error("Failed to decode JWT:", decodeError);
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!userEmail) {
      console.error("No email found in JWT");
      return new Response(
        JSON.stringify({ error: "Invalid token - no email" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("User email from JWT:", userEmail);

    // Check if user is admin in external database - two step query
    // Step 1: Get user_id from profiles by email
    const { data: profile, error: profileError } = await externalClient
      .from("profiles")
      .select("user_id")
      .eq("email", userEmail)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError, "Email:", userEmail);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Check if user has admin role
    const { data: adminRole, error: adminRoleError } = await externalClient
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRoleError || !adminRole) {
      console.error("Admin check failed:", adminRoleError, "User ID:", profile.user_id);
      return new Response(
        JSON.stringify({ error: "Unauthorized - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin verified:", userEmail);

    // Get request body
    const { email, username, password }: InviteAdminRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for user management (using external Supabase)
    const adminClient = createClient(externalUrl, externalServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User exists, just add admin role if not already admin
      const { data: existingRole } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", existingUser.id)
        .eq("role", "admin")
        .single();

      if (existingRole) {
        return new Response(
          JSON.stringify({ error: "Este usuário já é um administrador" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add admin role
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({ user_id: existingUser.id, role: "admin" });

      if (roleError) {
        console.error("Error adding admin role:", roleError);
        return new Response(
          JSON.stringify({ error: "Erro ao adicionar papel de admin" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update username if provided
      if (username) {
        await adminClient
          .from("profiles")
          .update({ username })
          .eq("user_id", existingUser.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Usuário existente promovido a administrador",
          userId: existingUser.id 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If password is provided, create user directly without email confirmation
    if (password) {
      if (password.length < 6) {
        return new Response(
          JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user directly with password (email already confirmed)
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          username: username || null,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: `Erro ao criar usuário: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newUserId = createData.user.id;

      // Add admin role BEFORE the trigger can run
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({ user_id: newUserId, role: "admin" });

      if (roleError) {
        console.error("Error adding admin role:", roleError);
      }

      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update username
      if (username) {
        await adminClient
          .from("profiles")
          .update({ username })
          .eq("user_id", newUserId);
      }

      console.log(`Admin created with password for ${email}, user ID: ${newUserId}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Administrador criado com sucesso! O usuário pode fazer login imediatamente.",
          userId: newUserId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No password provided - Create user and send invite via Resend
    console.log("Creating user without password, will send invite via Resend");
    
    // Generate a temporary password (user will reset via magic link)
    const tempPassword = crypto.randomUUID();
    
    // Create user with temporary password (email NOT confirmed yet)
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false, // Will confirm when they click the link
      user_metadata: {
        username: username || null,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = createData.user.id;
    console.log(`User created: ${newUserId}`);

    // Add admin role IMMEDIATELY (before any trigger)
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUserId, role: "admin" });

    if (roleError) {
      console.error("Error adding admin role:", roleError);
    } else {
      console.log(`Admin role added for user: ${newUserId}`);
    }

    // Generate magic link for the user to confirm and set password
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: "https://homegardenmanual.lovable.app/admin",
      },
    });

    if (linkError || !linkData) {
      console.error("Error generating magic link:", linkError);
      // User was created but link failed - still return partial success
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Usuário criado mas houve erro ao gerar link. Peça para o usuário usar 'Esqueci minha senha'.",
          userId: newUserId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const magicLink = linkData.properties?.action_link;
    console.log("Magic link generated successfully");

    // Update username in profile
    if (username) {
      await adminClient
        .from("profiles")
        .update({ username, email })
        .eq("user_id", newUserId);
    }

    // Send invite email via Resend
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🌿 Home Garden Manual</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Convite de Administrador</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #2d5a27; margin: 0 0 20px 0; font-size: 24px;">Olá${username ? `, ${username}` : ''}! 👋</h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Você foi convidado para ser <strong>Administrador</strong> do Home Garden Manual!
              </p>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Como administrador, você terá acesso ao painel de controle onde poderá gerenciar artigos, usuários, newsletter e muito mais.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${magicLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(45, 90, 39, 0.3);">
                      ✨ Ativar Minha Conta
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              <p style="color: #2d5a27; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                ${magicLink}
              </p>
              
              <p style="color: #888888; font-size: 14px; margin: 20px 0 0 0;">
                ⏰ Este link expira em 24 horas.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #888888; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} Home Garden Manual
              </p>
              <p style="color: #aaaaaa; font-size: 12px; margin: 10px 0 0 0;">
                Se você não solicitou este convite, ignore este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Home Garden Manual <equipe@homegardenmanual.com>",
      to: [email],
      subject: "🌿 Você foi convidado como Administrador - Home Garden Manual",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email via Resend:", emailError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Usuário criado mas houve erro ao enviar email. O link de acesso foi gerado.",
          userId: newUserId,
          // Include link in response for manual sharing if email fails
          fallbackLink: magicLink
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Invite email sent successfully to ${email}. Email ID: ${emailData?.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Convite enviado com sucesso! O usuário receberá um email para ativar a conta.",
        userId: newUserId,
        emailId: emailData?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in invite-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
