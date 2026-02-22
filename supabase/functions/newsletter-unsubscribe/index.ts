import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    console.log("Unsubscribe request received:", { token: token ? "present" : "missing", email: email ? "present" : "missing" });

    // Get base URL for redirects
    const baseUrl = Deno.env.get("SITE_URL") || "https://homegardenmanual.lovable.app";

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let subscriberEmail: string | null = null;

    // Method 1: Use tracking token (from newsletter emails)
    if (token) {
      console.log("Looking up subscriber by tracking token");
      
      const { data: trackingRecord, error: trackingError } = await supabase
        .from("newsletter_email_tracking")
        .select("subscriber_email")
        .eq("tracking_token", token)
        .single();

      if (trackingError) {
        console.error("Error fetching tracking record:", trackingError);
      } else if (trackingRecord) {
        subscriberEmail = trackingRecord.subscriber_email;
        console.log("Found subscriber email from token");
      }
    }

    // Method 2: Use email directly (fallback)
    if (!subscriberEmail && email) {
      subscriberEmail = email.toLowerCase().trim();
      console.log("Using email from query param");
    }

    // If no subscriber found, redirect to error page
    if (!subscriberEmail) {
      console.log("No subscriber identifier found");
      return Response.redirect(`${baseUrl}/unsubscribe?error=invalid`, 302);
    }

    // Check if subscriber exists
    const { data: subscriber, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", subscriberEmail)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching subscriber:", fetchError);
      return Response.redirect(`${baseUrl}/unsubscribe?error=server`, 302);
    }

    if (!subscriber) {
      console.log("Subscriber not found:", subscriberEmail);
      return Response.redirect(`${baseUrl}/unsubscribe?error=not-found`, 302);
    }

    // Already unsubscribed
    if (!subscriber.is_active) {
      console.log("Subscriber already unsubscribed");
      return Response.redirect(`${baseUrl}/unsubscribe?already=true`, 302);
    }

    // Unsubscribe the user
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      return Response.redirect(`${baseUrl}/unsubscribe?error=server`, 302);
    }

    console.log("Successfully unsubscribed:", subscriberEmail);

    // Redirect to success page
    return Response.redirect(`${baseUrl}/unsubscribe?success=true`, 302);

  } catch (error) {
    console.error("Unsubscribe error:", error);
    const baseUrl = Deno.env.get("SITE_URL") || "https://homegardenmanual.lovable.app";
    return Response.redirect(`${baseUrl}/unsubscribe?error=server`, 302);
  }
};

serve(handler);
