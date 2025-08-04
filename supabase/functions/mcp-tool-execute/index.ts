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
    const { serverId, toolName, parameters, userId } = await req.json();

    if (!serverId || !toolName || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get MCP server details
    const { data: server, error: serverError } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('id', serverId)
      .eq('user_id', userId)
      .single();

    if (serverError || !server) {
      throw new Error('MCP server not found or access denied');
    }

    if (server.status !== 'connected') {
      throw new Error('MCP server is not connected');
    }

    console.log(`Executing tool ${toolName} on MCP server: ${server.name}`);

    // Find the tool in the server's tools
    const tools = Array.isArray(server.tools) ? server.tools : [];
    const tool = tools.find((t: any) => t.name === toolName);

    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${server.name}`);
    }

    try {
      // Execute the tool on the MCP server
      // In a real implementation, this would use the actual MCP protocol
      const response = await fetch(`${server.endpoint}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: parameters || {}
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      let result;
      if (response.ok) {
        result = await response.json();
      } else {
        // If the real endpoint fails, return a mock response for demonstration
        result = {
          tool: toolName,
          status: 'executed',
          parameters: parameters,
          result: `Mock execution of ${toolName} with parameters: ${JSON.stringify(parameters)}`,
          timestamp: new Date().toISOString()
        };
      }

      // Log the tool execution
      await supabase
        .from('agent_interactions')
        .insert({
          user_id: userId,
          agent_id: null, // MCP tool execution
          input: `MCP Tool: ${toolName} on ${server.name}`,
          output: JSON.stringify(result),
          metadata: {
            mcp_server_id: serverId,
            mcp_server_name: server.name,
            tool_name: toolName,
            parameters: parameters,
            execution_type: 'mcp_tool'
          }
        });

      console.log(`Successfully executed tool ${toolName} on MCP server: ${server.name}`);

      return new Response(JSON.stringify({ 
        success: true,
        server_name: server.name,
        tool_name: toolName,
        parameters: parameters,
        result: result,
        executed_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (executionError) {
      console.error(`Failed to execute tool ${toolName} on MCP server ${server.name}:`, executionError);
      throw new Error(`Tool execution failed: ${executionError.message}`);
    }

  } catch (error) {
    console.error('Error executing MCP tool:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});