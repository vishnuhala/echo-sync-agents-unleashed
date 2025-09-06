import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { generateEnhancedGoogleMockResponse } from './google-mock-helper.ts';

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

    // Allow execution even if not connected for demo purposes
    console.log(`Executing tool ${toolName} on MCP server: ${server.name} (status: ${server.status})`);

    // Find the tool in the server's tools
    const tools = Array.isArray(server.tools) ? server.tools : [];
    const tool = tools.find((t: any) => t.name === toolName);

    // If tool not found but this is a Google service, allow execution
    if (!tool && !server.name.toLowerCase().includes('google')) {
      throw new Error(`Tool ${toolName} not found on server ${server.name}`);
    }

    try {
      // Real MCP tool execution - connect to actual server and execute tool
      let result: any = {};
      
      console.log(`Executing MCP tool: ${toolName} on server: ${server.name} at endpoint: ${server.endpoint}`);
      
      // Validate that the tool exists on the server
      const availableTools = Array.isArray(server.tools) ? server.tools : [];
      const targetTool = availableTools.find((t: any) => t.name === toolName);
      
      if (!targetTool) {
        throw new Error(`Tool '${toolName}' not available on server '${server.name}'. Available tools: ${availableTools.map((t: any) => t.name).join(', ')}`);
      }
      
      // Check if server is actually connected
      if (server.status !== 'connected') {
        throw new Error(`Server '${server.name}' is not connected. Current status: ${server.status}. Please connect the server first.`);
      }
      
      // For real MCP servers, we need to make actual HTTP/WebSocket connections
      // This is a simplified implementation - in production you'd use the MCP SDK
      
      try {
        if (server.endpoint) {
          // Attempt to connect to the real MCP server endpoint
          console.log(`Connecting to MCP server at: ${server.endpoint}`);
          
          // Create a proper MCP protocol request
          const mcpRequest = {
            jsonrpc: "2.0",
            id: crypto.randomUUID(),
            method: "tools/call",
            params: {
              name: toolName,
              arguments: parameters
            }
          };
          
          console.log('Sending MCP request:', mcpRequest);
          
          // Make the actual call to the MCP server
          const response = await fetch(server.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(mcpRequest),
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(30000)
          });
          
          if (!response.ok) {
            throw new Error(`MCP server responded with status ${response.status}: ${response.statusText}`);
          }
          
          const mcpResponse = await response.json();
          console.log('MCP server response:', mcpResponse);
          
          if (mcpResponse.error) {
            throw new Error(`MCP server error: ${mcpResponse.error.message || 'Unknown error'}`);
          }
          
          // Return the actual result from the MCP server
          result = {
            success: true,
            data: mcpResponse.result,
            server_response: mcpResponse,
            execution_time: new Date().toISOString(),
            server_endpoint: server.endpoint,
            tool_name: toolName,
            real_execution: true
          };
          
        } else {
          throw new Error(`Server '${server.name}' has no endpoint configured`);
        }
        
      } catch (connectionError) {
        console.error(`Failed to connect to MCP server '${server.name}':`, connectionError);
        
        // Don't fall back to mock data - return the real error
        throw new Error(`Cannot execute tool on MCP server '${server.name}': ${connectionError.message}. This appears to be a real MCP server that is not responding. Please check the server status and endpoint configuration.`);
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