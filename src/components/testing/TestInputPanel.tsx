import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMCP } from '@/hooks/useMCP';
import { useRAG } from '@/hooks/useRAG';
import { useA2A } from '@/hooks/useA2A';
import { useAgents } from '@/hooks/useAgents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2 } from 'lucide-react';

export const TestInputPanel = () => {
  const { toast } = useToast();
  const { servers, executeMCPTool } = useMCP();
  const { vectorIndexes, performRAGQuery } = useRAG();
  const { workflows, executeA2AWorkflow } = useA2A();
  const { agents, sendMessage } = useAgents();

  const [mcpLoading, setMcpLoading] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);
  const [a2aLoading, setA2aLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  const [mcpQuery, setMcpQuery] = useState('latest AI news');
  const [mcpServerId, setMcpServerId] = useState('');
  
  const [ragQuery, setRagQuery] = useState('What are the key benefits of AI?');
  const [ragIndexId, setRagIndexId] = useState('');
  
  const [a2aWorkflowId, setA2aWorkflowId] = useState('');
  
  const [agentMessage, setAgentMessage] = useState('Hello! Can you help me?');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const handleMCPTest = async () => {
    if (!mcpServerId) {
      toast({
        title: "Error",
        description: "Please select an MCP server",
        variant: "destructive",
      });
      return;
    }

    setMcpLoading(true);
    try {
      const result = await executeMCPTool(mcpServerId, 'web_search', { query: mcpQuery });
      toast({
        title: "MCP Test Successful",
        description: `Query: "${mcpQuery}" - Results received in real-time`,
      });
      console.log('MCP Test Result:', result);
    } catch (error) {
      console.error('MCP test error:', error);
    } finally {
      setMcpLoading(false);
    }
  };

  const handleRAGTest = async () => {
    if (!ragIndexId) {
      toast({
        title: "Error",
        description: "Please select a vector index",
        variant: "destructive",
      });
      return;
    }

    setRagLoading(true);
    try {
      await performRAGQuery(ragQuery, ragIndexId);
      toast({
        title: "RAG Test Successful",
        description: `Query processed and results stored in real-time`,
      });
    } catch (error) {
      console.error('RAG test error:', error);
    } finally {
      setRagLoading(false);
    }
  };

  const handleA2ATest = async () => {
    if (!a2aWorkflowId) {
      toast({
        title: "Error",
        description: "Please select a workflow",
        variant: "destructive",
      });
      return;
    }

    setA2aLoading(true);
    try {
      await executeA2AWorkflow(a2aWorkflowId);
      toast({
        title: "A2A Test Successful",
        description: "Workflow executed and messages tracked in real-time",
      });
    } catch (error) {
      console.error('A2A test error:', error);
    } finally {
      setA2aLoading(false);
    }
  };

  const handleAgentTest = async () => {
    if (!selectedAgentId) {
      toast({
        title: "Error",
        description: "Please select an agent",
        variant: "destructive",
      });
      return;
    }

    setAgentLoading(true);
    try {
      const result = await sendMessage(selectedAgentId, agentMessage);
      if (result.error) throw result.error;
      toast({
        title: "Agent Test Successful",
        description: "Message sent and response received in real-time",
      });
      console.log('Agent Response:', result.response);
    } catch (error) {
      console.error('Agent test error:', error);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Input Panel</CardTitle>
        <CardDescription>
          Send test inputs and observe real-time outputs across all systems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mcp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mcp">MCP</TabsTrigger>
            <TabsTrigger value="rag">RAG</TabsTrigger>
            <TabsTrigger value="a2a">A2A</TabsTrigger>
            <TabsTrigger value="agent">Agent</TabsTrigger>
          </TabsList>

          {/* MCP Test */}
          <TabsContent value="mcp" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select MCP Server</label>
              <Select value={mcpServerId} onValueChange={setMcpServerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map(server => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} ({server.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                value={mcpQuery}
                onChange={(e) => setMcpQuery(e.target.value)}
                placeholder="Enter search query..."
              />
            </div>
            <Button onClick={handleMCPTest} disabled={mcpLoading} className="w-full">
              {mcpLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute MCP Search
            </Button>
          </TabsContent>

          {/* RAG Test */}
          <TabsContent value="rag" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vector Index</label>
              <Select value={ragIndexId} onValueChange={setRagIndexId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an index" />
                </SelectTrigger>
                <SelectContent>
                  {vectorIndexes.map(index => (
                    <SelectItem key={index.id} value={index.id}>
                      {index.name} ({index.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Query</label>
              <Textarea
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Enter your query..."
                rows={3}
              />
            </div>
            <Button onClick={handleRAGTest} disabled={ragLoading} className="w-full">
              {ragLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute RAG Query
            </Button>
          </TabsContent>

          {/* A2A Test */}
          <TabsContent value="a2a" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Workflow</label>
              <Select value={a2aWorkflowId} onValueChange={setA2aWorkflowId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map(workflow => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name} ({workflow.is_active ? 'Active' : 'Inactive'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleA2ATest} disabled={a2aLoading} className="w-full">
              {a2aLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute A2A Workflow
            </Button>
          </TabsContent>

          {/* Agent Test */}
          <TabsContent value="agent" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={agentMessage}
                onChange={(e) => setAgentMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>
            <Button onClick={handleAgentTest} disabled={agentLoading} className="w-full">
              {agentLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Send Message to Agent
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};