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
      // For demo purposes, simulate tool execution with realistic results
      let result: any = {};
      
      if (toolName.includes('search') || toolName === 'web_search') {
        result = {
          success: true,
          results: [
            {
              title: `Search Results for "${parameters.query || 'demo query'}"`,
              url: "https://example.com/result1",
              snippet: `Comprehensive information about ${parameters.query || 'your search topic'}. This is a simulated result showing how MCP search integration works.`,
              rank: 1
            },
            {
              title: "Related Information",
              url: "https://example.com/result2", 
              snippet: "Additional relevant data and insights from the search query.",
              rank: 2
            }
          ],
          query: parameters.query || 'demo query',
          total_results: parameters.count || 5,
          execution_time: "0.245s"
        };
      } else if (toolName.includes('repository') || toolName === 'get_repository') {
        result = {
          success: true,
          repository: {
            name: parameters.repo || 'demo-repo',
            owner: parameters.owner || 'demo-user',
            description: "A demonstration repository showing MCP GitHub integration capabilities",
            stars: 1250,
            forks: 89,
            language: "TypeScript",
            last_updated: new Date().toISOString(),
            topics: ["mcp", "integration", "demo"]
          }
        };
      } else if (toolName.includes('file') || toolName.includes('read') || toolName.includes('list')) {
        result = {
          success: true,
          files: [
            { name: "document1.pdf", size: "2.5MB", modified: "2024-01-15" },
            { name: "notes.txt", size: "45KB", modified: "2024-01-14" },
            { name: "presentation.pptx", size: "8.2MB", modified: "2024-01-13" }
          ],
          path: parameters.path || "/demo-files",
          total_files: 3
        };
      } else if (toolName.includes('memory') || toolName.includes('store')) {
        result = {
          success: true,
          stored: true,
          memory_id: "mem_" + Date.now(),
          content: parameters.content || "Demo content stored",
          context: parameters.context || "Demo context",
          timestamp: new Date().toISOString()
        };
      } else if (toolName.includes('message') || toolName.includes('send')) {
        result = {
          success: true,
          message_sent: true,
          channel: parameters.channel || "#general",
          message: parameters.message || "Hello from MCP!",
          timestamp: new Date().toISOString()
        };
      } else {
        // Generic execution result
        result = {
          success: true,
          tool: toolName,
          parameters: parameters,
          result: "Tool executed successfully",
          timestamp: new Date().toISOString(),
          server: server.name
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