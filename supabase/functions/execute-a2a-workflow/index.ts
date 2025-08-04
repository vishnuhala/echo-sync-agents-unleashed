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
    const { workflowId, userId } = await req.json();

    if (!workflowId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabase
      .from('a2a_workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found or access denied');
    }

    if (!workflow.is_active) {
      throw new Error('Workflow is not active');
    }

    console.log(`Executing A2A workflow: ${workflow.name}`);

    const results = [];
    const steps = Array.isArray(workflow.steps) ? workflow.steps : [];

    // Execute each step in the workflow
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`Executing step ${i + 1}: ${step.action}`);

      try {
        if (step.action === 'send_message') {
          // Send A2A message
          const { data: message, error: messageError } = await supabase
            .from('a2a_messages')
            .insert({
              sender_agent_id: step.sender_agent_id,
              receiver_agent_id: step.receiver_agent_id,
              content: step.content,
              message_type: 'workflow',
              workflow_id: workflowId,
              user_id: userId,
              status: 'sent'
            })
            .select()
            .single();

          if (messageError) {
            throw new Error(`Failed to send message: ${messageError.message}`);
          }

          // Process the message through A2A communication
          const a2aResponse = await fetch(`${supabaseUrl}/functions/v1/a2a-communication`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messageId: message.id,
              senderAgentId: step.sender_agent_id,
              receiverAgentId: step.receiver_agent_id,
              content: step.content,
              messageType: 'workflow',
              userId: userId
            }),
          });

          const a2aResult = await a2aResponse.json();
          
          results.push({
            step: i + 1,
            action: step.action,
            success: true,
            messageId: message.id,
            response: a2aResult.response,
            metadata: a2aResult.metadata
          });

          // Wait for specified delay if provided
          if (step.delay_ms) {
            await new Promise(resolve => setTimeout(resolve, step.delay_ms));
          }

        } else if (step.action === 'process_data') {
          // Simulate data processing
          console.log(`Processing data: ${step.data_source}`);
          
          results.push({
            step: i + 1,
            action: step.action,
            success: true,
            data_source: step.data_source,
            processed: true
          });

        } else if (step.action === 'external_api') {
          // Make external API call
          if (step.url && step.method) {
            const response = await fetch(step.url, {
              method: step.method,
              headers: step.headers || {},
              body: step.body ? JSON.stringify(step.body) : undefined
            });

            const responseData = await response.json();
            
            results.push({
              step: i + 1,
              action: step.action,
              success: response.ok,
              url: step.url,
              response: responseData,
              status: response.status
            });
          }

        } else {
          console.log(`Unknown action: ${step.action}`);
          results.push({
            step: i + 1,
            action: step.action,
            success: false,
            error: 'Unknown action type'
          });
        }

      } catch (stepError) {
        console.error(`Error in step ${i + 1}:`, stepError);
        results.push({
          step: i + 1,
          action: step.action,
          success: false,
          error: stepError.message
        });
      }
    }

    // Log workflow execution
    await supabase
      .from('agent_interactions')
      .insert({
        user_id: userId,
        agent_id: workflow.agent_ids[0] || null,
        input: `A2A Workflow execution: ${workflow.name}`,
        output: `Executed ${results.length} steps`,
        metadata: {
          workflow_id: workflowId,
          workflow_name: workflow.name,
          steps_executed: results.length,
          results: results
        }
      });

    console.log(`A2A workflow ${workflow.name} completed with ${results.length} steps`);

    return new Response(JSON.stringify({ 
      success: true,
      workflow_name: workflow.name,
      steps_executed: results.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error executing A2A workflow:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});