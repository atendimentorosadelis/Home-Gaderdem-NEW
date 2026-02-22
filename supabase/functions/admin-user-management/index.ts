import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminUserRequest {
  action: 'delete' | 'update_password' | 'update_name';
  targetUserId: string;
  newPassword?: string;
  newUsername?: string;
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

    // Decode JWT to get user email
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
      console.error("No email in JWT");
      return new Response(
        JSON.stringify({ error: "Invalid token - no email" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User email from JWT:", userEmail);

    // Create service client for external database
    const externalClient = createClient(externalUrl, externalServiceKey);

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
    const { action, targetUserId, newPassword }: AdminUserRequest = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Target user ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for user management (using external Supabase)
    const adminClient = createClient(externalUrl, externalServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if target user is Super Admin (Walliston) - cannot be deleted
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("username")
      .eq("user_id", targetUserId)
      .single();

    const targetIsSuperAdmin = targetProfile?.username?.toLowerCase().includes('walliston') || false;

    // Check if current user is Super Admin (by email or username in profiles)
    const { data: currentProfile } = await adminClient
      .from("profiles")
      .select("username")
      .eq("email", userEmail)
      .maybeSingle();
    
    const currentIsSuperAdmin = 
      userEmail.toLowerCase() === 'wallistonluiz@gmail.com' || 
      currentProfile?.username?.toLowerCase().includes('walliston') || 
      false;

    if (action === 'delete') {
      // Prevent deleting Super Admin
      if (targetIsSuperAdmin) {
        return new Response(
          JSON.stringify({ error: "Não é possível excluir o Super Admin" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent self-deletion (check by email matching target user's email)
      const { data: targetUserProfile } = await adminClient
        .from("profiles")
        .select("email")
        .eq("user_id", targetUserId)
        .single();

      if (targetUserProfile?.email === userEmail) {
        return new Response(
          JSON.stringify({ error: "Você não pode excluir sua própria conta" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if target is admin - only Super Admin can delete other admins
      const { data: targetRole } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId)
        .eq("role", "admin")
        .single();

      if (targetRole && !currentIsSuperAdmin) {
        return new Response(
          JSON.stringify({ error: "Somente o Super Admin pode excluir outros administradores" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete user from auth (this will cascade to profiles and user_roles due to FK)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: `Erro ao excluir usuário: ${deleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User ${targetUserId} deleted by ${userEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: "Usuário excluído com sucesso" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === 'update_password') {
      // Check if updating own password or if Super Admin Master updating others
      const isUpdatingSelf = profile.user_id === targetUserId;
      
      if (!isUpdatingSelf && !currentIsSuperAdmin) {
        return new Response(
          JSON.stringify({ error: "Somente o Super Admin Master pode alterar senhas de outros usuários" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!newPassword) {
        return new Response(
          JSON.stringify({ error: "Nova senha é obrigatória" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "A senha deve ter pelo menos 6 caracteres" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update user password and confirm email (grants immediate access)
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        targetUserId,
        { 
          password: newPassword,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error("Error updating password:", updateError);
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar senha: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Password updated for user ${targetUserId} by ${userEmail} (self: ${isUpdatingSelf})`);

      return new Response(
        JSON.stringify({ success: true, message: "Senha atualizada com sucesso" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === 'update_name') {
      const { newUsername }: AdminUserRequest = await req.json().catch(() => ({}));
      
      // Only Super Admin Master can update names (including their own or others)
      if (!currentIsSuperAdmin) {
        return new Response(
          JSON.stringify({ error: "Somente o Super Admin Master pode alterar nomes de usuários" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update username in profiles table
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({ username: newUsername })
        .eq("user_id", targetUserId);

      if (updateError) {
        console.error("Error updating username:", updateError);
        return new Response(
          JSON.stringify({ error: `Erro ao atualizar nome: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Username updated for user ${targetUserId} by ${userEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: "Nome atualizado com sucesso" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in admin-user-management function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
