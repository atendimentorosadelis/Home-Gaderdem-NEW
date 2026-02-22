import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
}

// VAPID keys - you'll need to generate your own
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = 'mailto:admin@homegardenmanual.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations
    const supabaseClient = createClient(
      Deno.env.get('EXTERNAL_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload, userIds } = await req.json();

    console.log('Push notification request:', { action, payload, userIds });

    if (action === 'send') {
      // Get all push subscriptions for specified users (or all if userIds not provided)
      let query = supabaseClient.from('push_subscriptions').select('*');
      
      if (userIds && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }

      const { data: subscriptions, error } = await query;

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }

      console.log(`Found ${subscriptions?.length || 0} subscriptions`);

      if (!subscriptions || subscriptions.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send push notifications
      // Note: In production, you'd use a proper web-push library
      // For now, we'll just log the notifications and create in-app notifications
      let sentCount = 0;

      for (const subscription of subscriptions) {
        try {
          // Create in-app notification
          const { error: notifError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: subscription.user_id,
              title: payload.title,
              message: payload.body,
              type: payload.type || 'info',
              link: payload.url,
            });

          if (notifError) {
            console.error('Error creating notification:', notifError);
          } else {
            sentCount++;
          }

          // TODO: Implement actual web push using web-push library
          // This requires proper VAPID key setup and a web-push Deno package
          console.log(`Would send push to ${subscription.endpoint}`);
        } catch (err) {
          console.error(`Error sending to subscription ${subscription.id}:`, err);
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent: sentCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'notify-admins') {
      // Get all admin user IDs
      const { data: adminRoles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        throw rolesError;
      }

      const adminUserIds = adminRoles?.map(r => r.user_id) || [];
      
      if (adminUserIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: 'No admin users found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create notifications for all admins
      const notifications = adminUserIds.map(userId => ({
        user_id: userId,
        title: payload.title,
        message: payload.body,
        type: payload.type || 'info',
        link: payload.url,
      }));

      const { error: insertError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating notifications:', insertError);
        throw insertError;
      }

      console.log(`Created ${notifications.length} notifications for admins`);

      return new Response(
        JSON.stringify({ success: true, sent: notifications.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-push-notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
