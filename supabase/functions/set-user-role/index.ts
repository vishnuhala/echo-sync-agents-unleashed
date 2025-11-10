import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role } = await req.json();

    const validRoles = new Set(['trader', 'student', 'founder']);
    if (!role || !validRoles.has(String(role))) {
      return new Response(JSON.stringify({ error: 'Invalid role selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use the caller's JWT to identify the user
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });

    const { data: authData, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authData.user.id;

    // Use service role to bypass RLS for secure role assignment
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Ensure a single role per user: remove existing roles then insert the new one
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);

    const { error: insertError } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role: String(role),
    });

    if (insertError) {
      console.error('Failed to set user role:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to set role' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark onboarding completed and sync profile role for UI consistency
    await supabaseAdmin
      .from('profiles')
      .update({ onboarding_completed: true, role: String(role) })
      .eq('user_id', userId);

    return new Response(JSON.stringify({ success: true, role }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in set-user-role function:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
