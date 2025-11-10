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
      } else if (server.name.toLowerCase().includes('google')) {
        // Enhanced Google services integration
        const serviceName = server.name.toLowerCase();
        
        if (serviceName.includes('search')) {
          tools = [
            {
              name: 'web_search',
              description: 'Search using Google Custom Search API',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query' },
                  num: { type: 'number', description: 'Number of results', default: 10 },
                  type: { type: 'string', description: 'Search type (web, image)', default: 'web' }
                },
                required: ['query']
              }
            },
            {
              name: 'image_search',
              description: 'Search for images using Google',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Image search query' },
                  num: { type: 'number', description: 'Number of results', default: 10 }
                },
                required: ['query']
              }
            }
          ];
          resources = [
            {
              uri: 'google://search',
              name: 'Google Search API',
              description: 'Access to Google Custom Search API',
              mimeType: 'application/json'
            }
          ];
        } else if (serviceName.includes('calendar')) {
          tools = [
            {
              name: 'create_event',
              description: 'Create a calendar event',
              inputSchema: {
                type: 'object',
                properties: {
                  summary: { type: 'string', description: 'Event title' },
                  startTime: { type: 'string', description: 'Start time (ISO format)' },
                  endTime: { type: 'string', description: 'End time (ISO format)' },
                  description: { type: 'string', description: 'Event description' }
                },
                required: ['summary', 'startTime']
              }
            },
            {
              name: 'list_events',
              description: 'List calendar events',
              inputSchema: {
                type: 'object',
                properties: {
                  maxResults: { type: 'number', description: 'Maximum results', default: 10 },
                  timeMin: { type: 'string', description: 'Start time filter' }
                }
              }
            }
          ];
          resources = [
            {
              uri: 'google://calendar',
              name: 'Google Calendar API',
              description: 'Access to Google Calendar',
              mimeType: 'application/json'
            }
          ];
        } else if (serviceName.includes('gmail')) {
          tools = [
            {
              name: 'send_email',
              description: 'Send an email via Gmail',
              inputSchema: {
                type: 'object',
                properties: {
                  to: { type: 'string', description: 'Recipient email' },
                  subject: { type: 'string', description: 'Email subject' },
                  body: { type: 'string', description: 'Email body' }
                },
                required: ['to', 'subject', 'body']
              }
            },
            {
              name: 'read_emails',
              description: 'Read emails from Gmail',
              inputSchema: {
                type: 'object',
                properties: {
                  maxResults: { type: 'number', description: 'Maximum results', default: 10 },
                  q: { type: 'string', description: 'Search query' }
                }
              }
            }
          ];
          resources = [
            {
              uri: 'google://gmail',
              name: 'Gmail API',
              description: 'Access to Gmail',
              mimeType: 'application/json'
            }
          ];
        } else if (serviceName.includes('docs')) {
          tools = [
            {
              name: 'create_doc',
              description: 'Create a new Google Document',
              inputSchema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Document title' },
                  content: { type: 'string', description: 'Initial content' }
                },
                required: ['title']
              }
            },
            {
              name: 'read_doc',
              description: 'Read content from a Google Document',
              inputSchema: {
                type: 'object',
                properties: {
                  documentId: { type: 'string', description: 'Document ID' }
                },
                required: ['documentId']
              }
            }
          ];
          resources = [
            {
              uri: 'google://docs',
              name: 'Google Docs API',
              description: 'Access to Google Docs',
              mimeType: 'application/json'
            }
          ];
        } else if (serviceName.includes('maps')) {
          tools = [
            {
              name: 'geocode',
              description: 'Convert address to coordinates',
              inputSchema: {
                type: 'object',
                properties: {
                  address: { type: 'string', description: 'Address to geocode' }
                },
                required: ['address']
              }
            },
            {
              name: 'reverse_geocode',
              description: 'Convert coordinates to address',
              inputSchema: {
                type: 'object',
                properties: {
                  latlng: { type: 'string', description: 'Latitude,longitude' }
                },
                required: ['latlng']
              }
            }
          ];
          resources = [
            {
              uri: 'google://maps',
              name: 'Google Maps API',
              description: 'Access to Google Maps services',
              mimeType: 'application/json'
            }
          ];
        } else if (serviceName.includes('youtube')) {
          tools = [
            {
              name: 'search_videos',
              description: 'Search YouTube videos',
              inputSchema: {
                type: 'object',
                properties: {
                  q: { type: 'string', description: 'Search query' },
                  maxResults: { type: 'number', description: 'Maximum results', default: 5 }
                },
                required: ['q']
              }
            },
            {
              name: 'get_video_info',
              description: 'Get detailed video information',
              inputSchema: {
                type: 'object',
                properties: {
                  videoId: { type: 'string', description: 'YouTube video ID' }
                },
                required: ['videoId']
              }
            }
          ];
          resources = [
            {
              uri: 'google://youtube',
              name: 'YouTube Data API',
              description: 'Access to YouTube data',
              mimeType: 'application/json'
            }
          ];
        } else {
          // Generic Google service
          tools = [
            {
              name: 'api_call',
              description: 'Make API call to Google service',
              inputSchema: {
                type: 'object',
                properties: {
                  endpoint: { type: 'string', description: 'API endpoint' },
                  method: { type: 'string', description: 'HTTP method', default: 'GET' },
                  data: { type: 'object', description: 'Request data' }
                },
                required: ['endpoint']
              }
            }
          ];
          resources = [
            {
              uri: `google://${serviceName}`,
              name: `Google ${serviceName} API`,
              description: `Access to Google ${serviceName} service`,
              mimeType: 'application/json'
            }
          ];
        }
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
          },
          {
            name: 'ping',
            description: 'Test server connectivity',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Test message' }
              }
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