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
      // Attempt to connect to the MCP server
      // This is a simplified connection test - in a real implementation,
      // you would use the actual MCP protocol
      const response = await fetch(server.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      let resources: any[] = [];
      let tools: any[] = [];
      let status = 'connected';

      if (response.ok) {
        // Try to get server capabilities
        try {
          const serverInfo = await response.json();
          resources = serverInfo.resources || [];
          tools = serverInfo.tools || [];
        } catch {
          // If parsing fails, use mock data for demonstration
          resources = [
            {
              uri: `${server.endpoint}/resource1`,
              name: 'Sample Resource',
              description: 'A sample MCP resource',
              mimeType: 'application/json'
            }
          ];
          tools = [
            {
              name: 'sample_tool',
              description: 'A sample MCP tool',
              inputSchema: {
                type: 'object',
                properties: {
                  input: { type: 'string' }
                }
              }
            }
          ];
        }
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
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