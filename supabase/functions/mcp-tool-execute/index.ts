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

    console.log(`Executing tool ${toolName} on MCP server: ${server.name} (status: ${server.status})`);

    try {
      // Check if this is a demo/built-in server or a real MCP server
      let result: any = {};
      
      console.log(`Executing MCP tool: ${toolName} on server: ${server.name} at endpoint: ${server.endpoint}`);
      
      // Check if this is a Google API proxy server (built-in demo server)
      if (server.name.toLowerCase().includes('google') && server.endpoint === 'google-mcp-proxy') {
        console.log('Executing Google API proxy request');
        
        // Handle Google API proxy requests
        const { data: proxyData, error: proxyError } = await supabase.functions.invoke('google-mcp-proxy', {
          body: {
            service: parameters.service || 'search',
            method: parameters.method || 'search',
            endpoint: parameters.endpoint || '',
            parameters: parameters,
            userId: userId
          }
        });

        if (proxyError) {
          throw new Error(`Google proxy error: ${proxyError.message}`);
        }

        result = {
          success: true,
          data: proxyData?.data || proxyData,
          execution_time: new Date().toISOString(),
          server_name: server.name,
          tool_name: toolName,
          demo_execution: true
        };
        
      } else if (server.name.toLowerCase().includes('brave') && (server.endpoint === 'brave-search-api' || !server.endpoint)) {
        console.log('Executing Brave Search API demo');
        
        // Generate mock search results for demo
        const query = parameters.query || parameters.q || 'demo search';
        result = {
          success: true,
          data: {
            web: {
              results: [
                {
                  title: `Search results for: ${query}`,
                  url: 'https://example.com',
                  description: 'This is a demo search result from Brave Search API integration.',
                  age: '2024-01-01T00:00:00Z'
                },
                {
                  title: `Related to: ${query}`,
                  url: 'https://demo.com', 
                  description: 'Another demo result showing Brave Search API working correctly.',
                  age: '2024-01-01T00:00:00Z'
                }
              ]
            },
            query: query,
            result_count: 2
          },
          execution_time: new Date().toISOString(),
          server_name: server.name,
          tool_name: toolName,
          demo_execution: true
        };
        
      } else if (server.endpoint && server.endpoint !== 'demo' && server.status === 'connected') {
        // This is a real MCP server - try to connect to it
        console.log(`Connecting to real MCP server at: ${server.endpoint}`);
        
        // Validate that the tool exists on the server
        const availableTools = Array.isArray(server.tools) ? server.tools : [];
        const targetTool = availableTools.find((t: any) => t.name === toolName);
        
        if (!targetTool) {
          throw new Error(`Tool '${toolName}' not available on server '${server.name}'. Available tools: ${availableTools.map((t: any) => t.name).join(', ')}`);
        }
        
        try {
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
            signal: AbortSignal.timeout(10000)
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
          
        } catch (connectionError) {
          console.error(`Failed to connect to MCP server '${server.name}':`, connectionError);
          throw new Error(`Cannot execute tool on MCP server '${server.name}': ${connectionError.message}. Please check the server status and endpoint configuration.`);
        }
        
      } else {
        // This is a demo server or disconnected server - provide mock data
        console.log('Providing demo/mock response for disconnected or demo server');
        
        result = {
          success: true,
          data: {
            message: `Demo execution of ${toolName} on ${server.name}`,
            parameters: parameters,
            demo_result: `This is a simulated result from ${toolName}. In a real implementation, this would return actual data from the MCP server.`,
            execution_time: new Date().toISOString()
          },
          demo_execution: true,
          server_name: server.name,
          tool_name: toolName
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