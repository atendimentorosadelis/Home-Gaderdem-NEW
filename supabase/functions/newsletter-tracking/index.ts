import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF for tracking pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const token = url.searchParams.get("token");
    const redirect = url.searchParams.get("redirect");

    if (!token || !action) {
      console.log("Missing token or action");
      return new Response("Invalid request", { status: 400 });
    }

    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the tracking record
    const { data: trackingRecord, error: fetchError } = await supabase
      .from("newsletter_email_tracking")
      .select("id, send_history_id, opened_at, clicked_at")
      .eq("tracking_token", token)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching tracking record:", fetchError);
    }

    if (!trackingRecord) {
      console.log("Tracking record not found for token:", token);
      if (action === "click" && redirect) {
        return Response.redirect(redirect, 302);
      }
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif", ...corsHeaders },
      });
    }

    const now = new Date().toISOString();

    if (action === "open") {
      // Track email open (only first time)
      if (!trackingRecord.opened_at) {
        await supabase
          .from("newsletter_email_tracking")
          .update({ opened_at: now })
          .eq("id", trackingRecord.id);

      // Update opened_count in history directly
        const { data: history } = await supabase
          .from("newsletter_send_history")
          .select("opened_count")
          .eq("id", trackingRecord.send_history_id)
          .single();
        
        if (history) {
          await supabase
            .from("newsletter_send_history")
            .update({ opened_count: (history.opened_count || 0) + 1 })
            .eq("id", trackingRecord.send_history_id);
        }

        console.log(`Email opened - token: ${token}`);
      }

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: { 
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders 
        },
      });
    }

    if (action === "click") {
      // Track click (only first time)
      if (!trackingRecord.clicked_at) {
        await supabase
          .from("newsletter_email_tracking")
          .update({ clicked_at: now })
          .eq("id", trackingRecord.id);

        // Also mark as opened if not already
        if (!trackingRecord.opened_at) {
          await supabase
            .from("newsletter_email_tracking")
            .update({ opened_at: now })
            .eq("id", trackingRecord.id);
        }

        // Update clicked_count in history directly
        const { data: history } = await supabase
          .from("newsletter_send_history")
          .select("clicked_count, opened_count")
          .eq("id", trackingRecord.send_history_id)
          .single();
        
        if (history) {
          const updates: Record<string, number> = { clicked_count: (history.clicked_count || 0) + 1 };
          // Also increment opened if this is the first open
          if (!trackingRecord.opened_at) {
            updates.opened_count = (history.opened_count || 0) + 1;
          }
          await supabase
            .from("newsletter_send_history")
            .update(updates)
            .eq("id", trackingRecord.send_history_id);
        }

        console.log(`Link clicked - token: ${token}`);
      }

      // Redirect to actual article
      if (redirect) {
        return Response.redirect(redirect, 302);
      }
      
      return new Response("Redirecting...", { status: 302 });
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error: any) {
    console.error("Error in newsletter-tracking:", error);
    
    // Still return tracking pixel on error to not break email display
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif", ...corsHeaders },
    });
  }
};

serve(handler);
