import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Missing 'key' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow specific public keys
    const allowedKeys = ["social_links", "seo_settings"];
    if (!allowedKeys.includes(key)) {
      return new Response(
        JSON.stringify({ error: "Access denied for this key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use external Supabase with service role to bypass RLS
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ value: data?.value || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
