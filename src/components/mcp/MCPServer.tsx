import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMCP } from '@/hooks/useMCP';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Settings, 
  Play, 
  Square, 
  Plus,
  MessageSquare,
  Bot,
  TrendingUp,
  BookOpen,
  Building,
  Trash2,
  TestTube
} from 'lucide-react';

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPServer {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  resources: MCPResource[];
  tools: MCPTool[];
  endpoint: string;
}

export const MCPServerManager = () => {
  const { servers, loading, addMCPServer, connectMCPServer, disconnectMCPServer, executeMCPTool } = useMCP();
  const [newServerName, setNewServerName] = useState('');
  const [newServerEndpoint, setNewServerEndpoint] = useState('');
  const [showAddServer, setShowAddServer] = useState(false);
  const [testingServer, setTestingServer] = useState<string | null>(null);
  const { toast } = useToast();

  const connectServer = async (serverId: string) => {
    try {
      await connectMCPServer(serverId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const disconnectServer = async (serverId: string) => {
    try {
      await disconnectMCPServer(serverId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const addServer = async () => {
    if (!newServerName.trim() || !newServerEndpoint.trim()) return;
    
    try {
      await addMCPServer(newServerName, newServerEndpoint);
      setNewServerName('');
      setNewServerEndpoint('');
      setShowAddServer(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const testServer = async (serverId: string) => {
    setTestingServer(serverId);
    const server = servers.find(s => s.id === serverId);
    
    if (!server || server.tools.length === 0) {
      toast({
        title: "No Tools Available",
        description: "This server has no tools to test",
        variant: "destructive"
      });
      setTestingServer(null);
      return;
    }

    try {
      // Test the first available tool with empty parameters
      const firstTool = server.tools[0];
      await executeMCPTool(serverId, firstTool.name, {});
      
      toast({
        title: "Test Successful",
        description: `Successfully tested ${firstTool.name} tool`,
      });
    } catch (error) {
      // Error handled in hook
    } finally {
      setTestingServer(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-muted-foreground';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'error': return <WifiOff className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MCP Server Management</h2>
          <p className="text-muted-foreground">Manage Model Context Protocol servers and resources</p>
        </div>
        <Button onClick={() => setShowAddServer(true)} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </div>

      {showAddServer && (
        <Card className="bg-gradient-card border-primary/20">
          <CardHeader>
            <CardTitle>Add MCP Server</CardTitle>
            <CardDescription>Connect to a new Model Context Protocol server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Server Name (e.g., Brave Search Server)"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
            />
            <Input
              placeholder="Server Endpoint (e.g., npx @modelcontextprotocol/server-brave-search)"
              value={newServerEndpoint}
              onChange={(e) => setNewServerEndpoint(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={addServer} className="bg-gradient-primary">Add Server</Button>
              <Button variant="outline" onClick={() => setShowAddServer(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}


      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {servers.map((server) => (
          <Card key={server.id} className="bg-gradient-card border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {server.name}
                      <div className={`flex items-center gap-1 ${getStatusColor(server.status)}`}>
                        {getStatusIcon(server.status)}
                        <span className="text-sm capitalize">{server.status}</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">{server.endpoint}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {server.status === 'connected' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testServer(server.id)}
                        disabled={testingServer === server.id}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectServer(server.id)}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => connectServer(server.id)}
                      className="bg-gradient-primary"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Resources ({server.resources.length})
                </h4>
                {server.resources.length > 0 ? (
                  <div className="space-y-2">
                    {server.resources.map((resource, index) => (
                      <div key={index} className="p-2 rounded bg-muted/50 border border-border/50">
                        <div className="font-medium text-sm">{resource.name}</div>
                        <div className="text-xs text-muted-foreground">{resource.description}</div>
                        <Badge variant="outline" className="mt-1 text-xs">{resource.uri}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resources available</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Tools ({server.tools.length})
                </h4>
                {server.tools.length > 0 ? (
                  <div className="space-y-2">
                    {server.tools.map((tool, index) => (
                      <div key={index} className="p-2 rounded bg-muted/50 border border-border/50">
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tools available</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servers.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No MCP Servers</h3>
          <p className="text-muted-foreground mb-4">
            Add your first Model Context Protocol server to get started
          </p>
          <Button onClick={() => setShowAddServer(true)} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      )}
    </div>
  );
};