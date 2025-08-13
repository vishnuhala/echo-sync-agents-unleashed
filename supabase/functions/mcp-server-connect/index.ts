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
    const { serverId, userId } = await req.json();

    if (!serverId || !userId) {
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

    console.log(`Connecting to MCP server: ${server.name} at ${server.endpoint}`);

    try {
      // For demo purposes, we'll simulate successful connections to popular MCP servers
      // In a real implementation, you would use the actual MCP protocol
      
      let resources: any[] = [];
      let tools: any[] = [];
      let status = 'connected';

      // Create mock data based on server name for demo purposes
      if (server.name.toLowerCase().includes('brave') || server.name.toLowerCase().includes('search')) {
        tools = [
          {
            name: 'web_search',
            description: 'Search the web using Brave Search',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                count: { type: 'number', description: 'Number of results', default: 10 }
              },
              required: ['query']
            }
          }
        ];
        resources = [
          {
            uri: 'brave://search',
            name: 'Web Search',
            description: 'Access to web search capabilities',
            mimeType: 'application/json'
          }
        ];
      } else if (server.name.toLowerCase().includes('github')) {
        tools = [
          {
            name: 'search_repositories',
            description: 'Search GitHub repositories',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                language: { type: 'string', description: 'Programming language filter' }
              },
              required: ['query']
            }
          },
          {
            name: 'get_repository',
            description: 'Get repository information',
            inputSchema: {
              type: 'object',
              properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' }
              },
              required: ['owner', 'repo']
            }
          }
        ];
        resources = [
          {
            uri: 'github://api',
            name: 'GitHub API',
            description: 'Access to GitHub API endpoints',
            mimeType: 'application/json'
          }
        ];
      } else if (server.name.toLowerCase().includes('file') || server.name.toLowerCase().includes('filesystem')) {
        tools = [
          {
            name: 'read_file',
            description: 'Read file contents',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'File path to read' }
              },
              required: ['path']
            }
          },
          {
            name: 'write_file',
            description: 'Write content to a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'File path to write' },
                content: { type: 'string', description: 'Content to write' }
              },
              required: ['path', 'content']
            }
          }
        ];
        resources = [
          {
            uri: 'file://system',
            name: 'File System',
            description: 'Access to local file system',
            mimeType: 'application/json'
          }
        ];
      } else {
        // Generic tools for other servers
        tools = [
          {
            name: 'execute_command',
            description: 'Execute a command on the server',
            inputSchema: {
              type: 'object',
              properties: {
                command: { type: 'string', description: 'Command to execute' },
                args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' }
              },
              required: ['command']
            }
          }
        ];
        resources = [
          {
            uri: `${server.name.toLowerCase()}://api`,
            name: `${server.name} API`,
            description: `Access to ${server.name} capabilities`,
            mimeType: 'application/json'
          }
        ];
      }

      // Update server status in database
      const { error: updateError } = await supabase
        .from('mcp_servers')
        .update({
          status: status,
          resources: resources,
          tools: tools,
          last_connected_at: new Date().toISOString()
        })
        .eq('id', serverId);

      if (updateError) {
        throw new Error(`Failed to update server status: ${updateError.message}`);
      }

      console.log(`Successfully connected to MCP server: ${server.name}`);

      return new Response(JSON.stringify({ 
        success: true,
        server_name: server.name,
        status: status,
        resources: resources,
        tools: tools,
        connected_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (connectionError) {
      console.error(`Failed to connect to MCP server ${server.name}:`, connectionError);
      
      // Update server status to failed
      await supabase
        .from('mcp_servers')
        .update({
          status: 'failed',
          resources: [],
          tools: []
        })
        .eq('id', serverId);

      throw new Error(`Connection failed: ${connectionError.message}`);
    }

  } catch (error) {
    console.error('Error connecting to MCP server:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});