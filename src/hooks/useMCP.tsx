import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  status: string;
  resources: MCPResource[];
  tools: MCPTool[];
  user_id: string;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export const useMCP = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch MCP servers
  const fetchServers = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type the data properly for MCPServer interface
      const typedServers: MCPServer[] = (data || []).map(server => ({
        ...server,
        resources: Array.isArray(server.resources) ? (server.resources as unknown as MCPResource[]) : [],
        tools: Array.isArray(server.tools) ? (server.tools as unknown as MCPTool[]) : []
      }));
      
      setServers(typedServers);
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch MCP servers",
        variant: "destructive",
      });
    }
  };

  // Add MCP server
  const addMCPServer = async (name: string, endpoint: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mcp_servers')
        .insert({
          name,
          endpoint,
          status: 'disconnected',
          resources: [],
          tools: [],
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Server Added",
        description: "MCP server added successfully",
      });

      return data;
    } catch (error) {
      console.error('Error adding MCP server:', error);
      toast({
        title: "Error",
        description: "Failed to add MCP server",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Connect to MCP server
  const connectMCPServer = async (serverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('mcp-server-connect', {
        body: {
          serverId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Server Connected",
        description: "Successfully connected to MCP server",
      });

      return data;
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MCP server",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Disconnect from MCP server
  const disconnectMCPServer = async (serverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('mcp-server-disconnect', {
        body: {
          serverId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Server Disconnected",
        description: "Successfully disconnected from MCP server",
      });

      return data;
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from MCP server",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Execute MCP tool
  const executeMCPTool = async (serverId: string, toolName: string, parameters: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('mcp-tool-execute', {
        body: {
          serverId,
          toolName,
          parameters,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Tool Executed",
        description: `Successfully executed ${toolName}`,
      });

      return data;
    } catch (error) {
      console.error('Error executing MCP tool:', error);
      toast({
        title: "Execution Failed",
        description: `Failed to execute ${toolName}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchServers();

    // Subscribe to MCP server changes
    const serversChannel = supabase
      .channel('mcp_servers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mcp_servers'
        },
        () => {
          fetchServers();
        }
      )
      .subscribe();

    setLoading(false);

    return () => {
      supabase.removeChannel(serversChannel);
    };
  }, []);

  return {
    servers,
    loading,
    addMCPServer,
    connectMCPServer,
    disconnectMCPServer,
    executeMCPTool,
    refetch: fetchServers
  };
};