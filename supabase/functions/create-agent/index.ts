import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  name: z.string().min(1).max(200, 'Name too long'),
  description: z.string().min(1).max(1000, 'Description too long'),
  framework: z.string().min(1).max(100),
  role: z.string().optional().default('assistant'),
  capabilities: z.array(z.string()).optional().default([]),
  ragEnabled: z.boolean().optional().default(false),
  tools: z.array(z.string()).optional().default([]),
  systemPrompt: z.string().max(10000, 'System prompt too long').optional().default(''),
  model: z.string().optional().default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Validate request body
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const userId = user.id; // Use server-verified user ID
    
    const {
      name,
      description,
      framework,
      role,
      capabilities,
      ragEnabled,
      tools,
      systemPrompt,
      model,
      temperature
    } = validated;

    console.log(`Creating agent: ${name} for user: ${userId}`);

    // Create system prompt based on configuration
    const generatedSystemPrompt = systemPrompt || `You are ${name}, a ${role} AI agent specialized in ${description}. 
Your capabilities include: ${capabilities.join(', ')}.
${ragEnabled ? 'You have access to RAG (Retrieval-Augmented Generation) for enhanced knowledge retrieval.' : ''}
${tools.length > 0 ? `You have access to these tools: ${tools.join(', ')}.` : ''}
Framework: ${framework}
Model: ${model}
Temperature: ${temperature}

Be helpful, accurate, and professional in all interactions.`;

    // Map provided role to valid enum values from the database enum (user_role)
    const validRoles = new Set(['trader', 'student', 'founder']);
    const dbRole = validRoles.has(String(role)) ? String(role) as 'trader' | 'student' | 'founder' : 'student';

    // Insert agent into the agents table
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name,
        type: framework,
        role: dbRole,
        description,
        system_prompt: generatedSystemPrompt,
        active: true
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error creating agent:', agentError);
      throw new Error(`Failed to create agent: ${agentError.message}`);
    }

    // Activate the agent for the user
    const { data: userAgent, error: userAgentError } = await supabase
      .from('user_agents')
      .insert({
        user_id: userId,
        agent_id: agent.id,
        config: {
          framework,
          role,
          capabilities,
          ragEnabled,
          tools,
          model,
          temperature,
          systemPrompt: generatedSystemPrompt
        }
      })
      .select()
      .single();

    if (userAgentError) {
      console.error('Error activating agent for user:', userAgentError);
      // Clean up: delete the agent if user activation fails
      await supabase.from('agents').delete().eq('id', agent.id);
      throw new Error(`Failed to activate agent: ${userAgentError.message}`);
    }

    console.log(`Agent ${name} created successfully with ID: ${agent.id}`);

    return new Response(JSON.stringify({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: agent.type,
        active: agent.active,
        userAgent: userAgent
      },
      message: `Agent "${name}" created and activated successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-agent function:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Invalid input provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to create agent' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});