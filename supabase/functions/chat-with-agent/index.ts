import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID format'),
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
  documentId: z.string().uuid('Invalid document ID format').optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const { agentId, message, documentId } = validated;
    const userId = user.id; // Use server-verified user ID

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Get document content if provided
    let documentContent = '';
    if (documentId) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('content, filename')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (document && document.content) {
        documentContent = `\n\nDocument "${document.filename}":\n${document.content}`;
      }
    }

    // Prepare the prompt
    const systemPrompt = agent.system_prompt;
    const userPrompt = message + documentContent;

    let response, aiResponse, metadata;

    // Check for LangChain integration
    const langchainApiKey = Deno.env.get('LANGCHAIN_API_KEY');
    const llamaIndexApiKey = Deno.env.get('LLAMAINDEX_API_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (agent.type === 'langchain' && langchainApiKey) {
      // Use LangChain API
      console.log('Using LangChain API for agent:', agent.name);
      
      response = await fetch('https://api.smith.langchain.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${langchainApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.choices[0].message.content;
        metadata = {
          model: 'langchain-gpt-4o-mini',
          tokens_used: data.usage?.total_tokens || 0,
          agent_type: 'langchain',
          api_used: 'langchain'
        };
      }
    } 
    
    if (!aiResponse && llamaIndexApiKey && agent.type === 'llamaindex') {
      // Use LlamaIndex API (if available)
      console.log('Using LlamaIndex API for agent:', agent.name);
      // Note: LlamaIndex doesn't have a direct chat API like OpenAI
      // This would typically involve local processing or custom endpoints
      aiResponse = `LlamaIndex RAG Response: Processing query "${userPrompt}" with document context. ${documentContent ? 'Document context included.' : 'No document context.'}`;
      metadata = {
        model: 'llamaindex-local',
        agent_type: 'llamaindex',
        api_used: 'llamaindex'
      };
    }
    
    if (!aiResponse && openAIApiKey) {
      // Fallback to OpenAI
      console.log('Using OpenAI API as fallback for agent:', agent.name);
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      aiResponse = data.choices[0].message.content;
      metadata = {
        model: 'gpt-4o-mini',
        tokens_used: data.usage?.total_tokens || 0,
        agent_type: agent.type,
        api_used: 'openai'
      };
    }

    if (!aiResponse) {
      throw new Error('No API keys configured for agent processing');
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      metadata: metadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-agent function:', error);
    
    // Return sanitized error
    let statusCode = 500;
    let errorMessage = 'An error occurred processing your request';
    
    if (error.name === 'ZodError') {
      statusCode = 400;
      errorMessage = 'Invalid input provided';
    } else if (error.message?.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Resource not found';
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});