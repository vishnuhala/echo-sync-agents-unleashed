-- Add Brave Search MCP server back (using correct column structure)
INSERT INTO public.mcp_servers (name, endpoint, user_id) 
VALUES (
  'Brave Search API',
  'brave-search',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT (name) DO NOTHING;