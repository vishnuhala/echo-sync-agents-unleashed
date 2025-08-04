-- Create A2A Messages table for real agent-to-agent communication
CREATE TABLE public.a2a_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_agent_id UUID NOT NULL,
  receiver_agent_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'direct',
  status VARCHAR(20) DEFAULT 'sent',
  workflow_id UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A2A Workflows table
CREATE TABLE public.a2a_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_ids UUID[] NOT NULL,
  steps JSONB NOT NULL,
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MCP Servers table
CREATE TABLE public.mcp_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  endpoint TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'disconnected',
  resources JSONB DEFAULT '[]',
  tools JSONB DEFAULT '[]',
  user_id UUID NOT NULL,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.a2a_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a2a_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for A2A Messages
CREATE POLICY "Users can view their own A2A messages" 
ON public.a2a_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own A2A messages" 
ON public.a2a_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A2A messages" 
ON public.a2a_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for A2A Workflows
CREATE POLICY "Users can view their own A2A workflows" 
ON public.a2a_workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own A2A workflows" 
ON public.a2a_workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A2A workflows" 
ON public.a2a_workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for MCP Servers
CREATE POLICY "Users can view their own MCP servers" 
ON public.mcp_servers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own MCP servers" 
ON public.mcp_servers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCP servers" 
ON public.mcp_servers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_a2a_messages_updated_at
BEFORE UPDATE ON public.a2a_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_a2a_workflows_updated_at
BEFORE UPDATE ON public.a2a_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mcp_servers_updated_at
BEFORE UPDATE ON public.mcp_servers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.a2a_messages REPLICA IDENTITY FULL;
ALTER TABLE public.a2a_workflows REPLICA IDENTITY FULL;
ALTER TABLE public.mcp_servers REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.a2a_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.a2a_workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mcp_servers;