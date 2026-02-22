import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for all data operations
    const externalSupabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const externalSupabaseKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("External URL:", externalSupabaseUrl?.substring(0, 40) + "...");
    
    if (!externalSupabaseUrl || !externalSupabaseKey) {
      throw new Error("External Supabase credentials not configured");
    }

    // Create client for external DB (all data lives here)
    const supabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    // Fetch email templates from external
    const { data: templates, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("category", "contact_reply")
      .order("created_at", { ascending: true });

    console.log("Templates query result:", { count: templates?.length, error });

    if (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }

    // Fetch social settings from external DB
    let socialSettings = {};
    
    const { data: socialData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .maybeSingle();
    
    if (socialData?.value) {
      socialSettings = socialData.value;
      console.log("Social settings from External:", Object.keys(socialSettings));
    }

    return new Response(
      JSON.stringify({
        success: true,
        templates: templates || [],
        socialSettings,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in get-email-templates:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        templates: [],
        socialSettings: {},
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
