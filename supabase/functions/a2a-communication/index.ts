import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
  senderAgentId: z.string().uuid('Invalid sender agent ID'),
  receiverAgentId: z.string().uuid('Invalid receiver agent ID'),
  content: z.string().min(1).max(100000, 'Content too large'),
  messageType: z.enum(['direct', 'workflow', 'response']).optional(),
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
    const { messageId, senderAgentId, receiverAgentId, content, messageType } = validated;
    const userId = user.id; // Use server-verified user ID

    // Get sender agent details
    const { data: senderAgent, error: senderError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', senderAgentId)
      .single();

    if (senderError || !senderAgent) {
      throw new Error('Sender agent not found');
    }

    // Get receiver agent details
    const { data: receiverAgent, error: receiverError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', receiverAgentId)
      .single();

    if (receiverError || !receiverAgent) {
      throw new Error('Receiver agent not found');
    }

    console.log(`Processing A2A message from ${senderAgent.name} to ${receiverAgent.name}`);

    // Update message status to processing
    await supabase
      .from('a2a_messages')
      .update({ status: 'processing' })
      .eq('id', messageId);

    // Simulate processing based on receiver agent type
    let response = '';
    let responseMetadata = {};

    if (receiverAgent.type === 'langchain') {
      // Process with LangChain agent
      const langchainApiKey = Deno.env.get('LANGCHAIN_API_KEY');
      if (langchainApiKey) {
        const systemPrompt = `You are ${receiverAgent.name}. ${receiverAgent.system_prompt}. You are receiving a message from another agent (${senderAgent.name}) in an A2A communication. Respond appropriately to the message.`;
        
        const apiResponse = await fetch('https://api.smith.langchain.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${langchainApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: content }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          response = data.choices[0].message.content;
          responseMetadata = {
            model: 'langchain-gpt-4o-mini',
            tokens_used: data.usage?.total_tokens || 0,
            api_used: 'langchain'
          };
        }
      }
    } else if (receiverAgent.type === 'llamaindex') {
      // Process with LlamaIndex (mock response for now)
      response = `LlamaIndex A2A Response from ${receiverAgent.name}: Processing message "${content}" from ${senderAgent.name}`;
      responseMetadata = {
        model: 'llamaindex-local',
        api_used: 'llamaindex'
      };
    } else {
      // Fallback to OpenAI
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openAIApiKey) {
        const systemPrompt = `You are ${receiverAgent.name}. ${receiverAgent.system_prompt}. You are receiving a message from another agent (${senderAgent.name}) in an A2A communication. Respond appropriately to the message.`;
        
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: content }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await apiResponse.json();
        response = data.choices[0].message.content;
        responseMetadata = {
          model: 'gpt-4o-mini',
          tokens_used: data.usage?.total_tokens || 0,
          api_used: 'openai'
        };
      }
    }

    if (!response) {
      throw new Error('No API keys configured for agent processing');
    }

    // Update original message status to completed
    await supabase
      .from('a2a_messages')
      .update({ status: 'completed' })
      .eq('id', messageId);

    // Create response message from receiver to sender
    const { data: responseMessage, error: responseError } = await supabase
      .from('a2a_messages')
      .insert({
        sender_agent_id: receiverAgentId,
        receiver_agent_id: senderAgentId,
        content: response,
        message_type: 'response',
        status: 'sent',
        user_id: userId
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating response message:', responseError);
    }

    // Log the interaction
    await supabase
      .from('agent_interactions')
      .insert({
        user_id: userId,
        agent_id: receiverAgentId,
        input: `A2A message from ${senderAgent.name}: ${content}`,
        output: response,
        metadata: {
          ...responseMetadata,
          a2a_communication: true,
          sender_agent_id: senderAgentId,
          receiver_agent_id: receiverAgentId,
          original_message_id: messageId,
          response_message_id: responseMessage?.id
        }
      });

    console.log(`A2A communication completed: ${senderAgent.name} -> ${receiverAgent.name}`);

    return new Response(JSON.stringify({ 
      success: true,
      response,
      responseMessageId: responseMessage?.id,
      metadata: responseMetadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in A2A communication:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Invalid input provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to process A2A communication' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});