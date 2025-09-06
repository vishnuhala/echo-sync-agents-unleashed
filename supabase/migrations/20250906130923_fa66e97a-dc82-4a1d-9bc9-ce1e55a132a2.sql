-- Add Brave Search MCP server back
INSERT INTO public.mcp_servers (name, endpoint, description, server_type) 
VALUES (
  'Brave Search API',
  'brave-search',
  'Web search using Brave Search API for real-time information retrieval',
  'search'
) ON CONFLICT (name) DO NOTHING;