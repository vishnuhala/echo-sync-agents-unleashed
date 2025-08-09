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
    const {
      name,
      description,
      framework,
      role = 'assistant',
      capabilities = [],
      ragEnabled = false,
      tools = [],
      systemPrompt = '',
      model = 'gpt-4o-mini',
      temperature = 0.7,
      userId
    } = await req.json();

    if (!name || !description || !userId) {
      throw new Error('Missing required fields: name, description, or userId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Insert agent into the agents table
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name,
        type: framework,
        role: 'admin', // Use valid enum value from the database
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
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});