import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_hash?: string;
  status?: string;
  created_at?: string;
}

interface RequestBody {
  action: 'list' | 'get' | 'update_status' | 'delete' | 'insert';
  id?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: string;
  messageData?: ContactMessage;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the EXTERNAL Supabase with service_role to bypass RLS
    const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing external Supabase credentials');
      throw new Error('Server configuration error: Missing external database credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { action, id, status, page = 1, limit = 100, search, statusFilter } = body;

    console.log(`[manage-contact-messages] Action: ${action}, ID: ${id || 'N/A'}`);

    switch (action) {
      case 'list': {
        let query = supabase
          .from('contact_messages')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply search filter
        if (search) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
        }

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }

        console.log(`[manage-contact-messages] Fetched ${data?.length || 0} messages, total: ${count}`);

        return new Response(
          JSON.stringify({ messages: data || [], count: count || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!id) throw new Error('Message ID is required');

        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ message: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_status': {
        if (!id || !status) throw new Error('Message ID and status are required');

        const { data, error } = await supabase
          .from('contact_messages')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        console.log(`[manage-contact-messages] Updated message ${id} status to ${status}`);

        return new Response(
          JSON.stringify({ message: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!id) throw new Error('Message ID is required');

        // First delete related replies
        await supabase
          .from('contact_message_replies')
          .delete()
          .eq('message_id', id);

        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .eq('id', id);

        if (error) throw error;

        console.log(`[manage-contact-messages] Deleted message ${id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'insert': {
        const { messageData } = body;
        if (!messageData) throw new Error('Message data is required');

        const { data, error } = await supabase
          .from('contact_messages')
          .insert({
            id: messageData.id,
            name: messageData.name,
            email: messageData.email,
            subject: messageData.subject,
            message: messageData.message,
            ip_hash: messageData.ip_hash || 'migrated',
            status: messageData.status || 'pending',
            created_at: messageData.created_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[manage-contact-messages] Inserted message ${data?.id}`);

        return new Response(
          JSON.stringify({ message: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[manage-contact-messages] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
