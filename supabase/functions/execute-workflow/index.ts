import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  workflowId: z.string().uuid('Invalid workflow ID'),
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
    const { workflowId } = validated;
    const userId = user.id; // Use server-verified user ID

    // Fetch the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found or access denied');
    }

    if (!workflow.active) {
      throw new Error('Workflow is not active');
    }

    console.log(`Executing workflow: ${workflow.name} for user: ${userId}`);

    // Execute workflow based on configuration
    const workflowConfig = workflow.config as any;
    let result = { success: true, message: 'Workflow executed successfully' };

    // Basic workflow execution logic
    if (workflowConfig.steps && Array.isArray(workflowConfig.steps)) {
      for (const step of workflowConfig.steps) {
        console.log(`Executing step: ${step.type}`);
        
        switch (step.type) {
          case 'agent_interaction':
            // Execute agent interaction
            if (step.agentId && step.message) {
              const { data: agentResponse, error: agentError } = await supabase.functions.invoke('chat-with-agent', {
                body: {
                  agentId: step.agentId,
                  message: step.message,
                  userId: userId,
                  workflowExecution: true
                }
              });

              if (agentError) {
                console.error('Agent interaction failed:', agentError);
                throw new Error(`Agent interaction failed: ${agentError.message}`);
              }

              console.log('Agent response:', agentResponse);
            }
            break;

          case 'data_processing':
            // Process data based on step configuration
            console.log('Processing data step:', step.config);
            break;

          case 'notification':
            // Send notification
            if (step.message) {
              console.log('Sending notification:', step.message);
              // In a real implementation, you'd send actual notifications
            }
            break;

          case 'external_api':
            // Call external API
            if (step.url && step.method) {
              try {
                const apiResponse = await fetch(step.url, {
                  method: step.method,
                  headers: step.headers || {},
                  body: step.body ? JSON.stringify(step.body) : undefined
                });

                const apiData = await apiResponse.json();
                console.log('External API response:', apiData);
              } catch (apiError) {
                console.error('External API call failed:', apiError);
                throw new Error(`External API call failed: ${apiError.message}`);
              }
            }
            break;

          default:
            console.log(`Unknown step type: ${step.type}`);
        }
      }
    }

    // Log workflow execution
    await supabase
      .from('agent_interactions')
      .insert({
        user_id: userId,
        agent_id: workflowConfig.defaultAgentId || null,
        input: `Workflow executed: ${workflow.name}`,
        output: `Workflow "${workflow.name}" completed successfully`,
        metadata: {
          workflow_id: workflowId,
          execution_type: 'workflow',
          trigger_type: workflow.trigger_type
        }
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in execute-workflow function:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Invalid input provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to execute workflow' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});