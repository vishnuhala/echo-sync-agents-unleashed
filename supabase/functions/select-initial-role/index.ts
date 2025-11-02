import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_INITIAL_ROLES = ['student', 'trader', 'founder'] as const;

const requestSchema = z.object({
  role: z.enum(ALLOWED_INITIAL_ROLES, { 
    errorMap: () => ({ message: 'Invalid role. Must be student, trader, or founder' }) 
  }),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Initialize Supabase client with auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create an auth-aware client (try anon, then fallback to service key)
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    let userId: string | null = null;

    // Attempt with anon key first
    const anonRes = await supabaseAnon.auth.getUser();
    if (anonRes.data?.user) {
      userId = anonRes.data.user.id;
    } else {
      console.warn('Anon auth.getUser() failed, attempting with service role');
      const supabaseServiceAuth = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const svcRes = await supabaseServiceAuth.auth.getUser();
      if (svcRes.data?.user) {
        userId = svcRes.data.user.id;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Use anon client (with JWT) for RLS-aware operations
    const supabase = supabaseAnon;

    // Validate request body
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const { role } = validated;

    console.log(`Role selection request for user ${userId}: ${role}`);

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile?.onboarding_completed) {
      return new Response(JSON.stringify({ 
        error: 'Role already assigned. Contact support to change your role.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use service role client to manage user_roles (bypasses RLS)
    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has a role (during onboarding)
    const { data: existingRole } = await supabaseServiceRole
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRole) {
      // Delete existing role if onboarding not completed (allow role change during onboarding)
      const { error: deleteError } = await supabaseServiceRole
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing role:', deleteError);
        throw new Error('Failed to update role');
      }
    }

    // Insert new role
    const { error: insertError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_by: userId, // Self-assigned during onboarding
      });

    if (insertError) {
      console.error('Error inserting role:', insertError);
      throw new Error('Failed to assign role');
    }

    // Update profile onboarding status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail the request if profile update fails
    }

    console.log(`Successfully assigned role ${role} to user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      role: role,
      message: `Role ${role} assigned successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in select-initial-role function:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ 
        error: 'Invalid role selection' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Failed to assign role' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
