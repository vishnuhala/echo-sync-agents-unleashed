import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, MessageSquare, Network, Activity, Loader2 } from 'lucide-react';

export const SampleDataGenerator = () => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const generateMCPServer = async () => {
    setGenerating('mcp');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const sampleServers = [
        { name: 'Google MCP Server', endpoint: 'https://mcp.google.com' },
        { name: 'OpenAI MCP Server', endpoint: 'https://mcp.openai.com' },
        { name: 'Anthropic MCP Server', endpoint: 'https://mcp.anthropic.com' },
      ];

      const randomServer = sampleServers[Math.floor(Math.random() * sampleServers.length)];

      await supabase.from('mcp_servers').insert({
        name: `${randomServer.name} (Test)`,
        endpoint: randomServer.endpoint,
        status: 'connected',
        user_id: user.id,
        resources: [
          { uri: '/test/resource', name: 'Test Resource', description: 'Sample resource for testing' }
        ],
        tools: [
          { name: 'web_search', description: 'Search the web for information' }
        ],
        last_connected_at: new Date().toISOString()
      });

      toast({
        title: "MCP Server Created",
        description: "Sample MCP server added successfully",
      });
    } catch (error) {
      console.error('Error generating MCP server:', error);
      toast({
        title: "Error",
        description: "Failed to generate MCP server",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateVectorIndex = async () => {
    setGenerating('rag');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const topics = ['AI Research', 'Medical Documents', 'Legal Contracts', 'Product Manuals'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      await supabase.from('vector_indexes').insert({
        name: `${randomTopic} Index (Test)`,
        description: `Test vector index for ${randomTopic.toLowerCase()}`,
        user_id: user.id,
        status: 'ready',
        documents_count: Math.floor(Math.random() * 100) + 10,
        vectors_count: Math.floor(Math.random() * 1000) + 100,
        embedding_model: 'text-embedding-3-small',
        config: { dimension: 1536, similarity: 'cosine' }
      });

      toast({
        title: "Vector Index Created",
        description: "Sample vector index added successfully",
      });
    } catch (error) {
      console.error('Error generating vector index:', error);
      toast({
        title: "Error",
        description: "Failed to generate vector index",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateA2AWorkflow = async () => {
    setGenerating('a2a');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get available agents
      const { data: agents } = await supabase
        .from('agents')
        .select('id')
        .eq('active', true)
        .limit(3);

      if (!agents || agents.length < 2) {
        toast({
          title: "Error",
          description: "Need at least 2 agents to create a workflow",
          variant: "destructive",
        });
        return;
      }

      const agentIds = agents.map(a => a.id);

      await supabase.from('a2a_workflows').insert({
        name: `Workflow ${Math.floor(Math.random() * 1000)} (Test)`,
        description: 'Automated test workflow for agent collaboration',
        user_id: user.id,
        agent_ids: agentIds,
        is_active: true,
        steps: [
          { order: 1, agent_id: agentIds[0], action: 'analyze', next: 2 },
          { order: 2, agent_id: agentIds[1], action: 'review', next: null }
        ]
      });

      toast({
        title: "A2A Workflow Created",
        description: "Sample workflow added successfully",
      });
    } catch (error) {
      console.error('Error generating A2A workflow:', error);
      toast({
        title: "Error",
        description: "Failed to generate A2A workflow",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateAgentInteraction = async () => {
    setGenerating('agent');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get available agents
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name')
        .eq('active', true)
        .limit(1)
        .single();

      if (!agents) {
        toast({
          title: "Error",
          description: "No active agents found",
          variant: "destructive",
        });
        return;
      }

      const sampleQuestions = [
        "What are the latest trends in AI?",
        "Can you summarize this document?",
        "How can I improve my workflow?",
        "What's the status of my projects?"
      ];

      const sampleAnswers = [
        "Based on recent data, AI trends show increased adoption of multimodal models.",
        "The document discusses key strategies for business growth.",
        "I recommend automating repetitive tasks and using AI assistants.",
        "Your projects are on track with 3 completed and 2 in progress."
      ];

      const randomQ = Math.floor(Math.random() * sampleQuestions.length);

      await supabase.from('agent_interactions').insert({
        user_id: user.id,
        agent_id: agents.id,
        input: sampleQuestions[randomQ],
        output: sampleAnswers[randomQ],
        metadata: { test: true, timestamp: new Date().toISOString() }
      });

      toast({
        title: "Agent Interaction Created",
        description: "Sample interaction added successfully",
      });
    } catch (error) {
      console.error('Error generating agent interaction:', error);
      toast({
        title: "Error",
        description: "Failed to generate agent interaction",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Data Generator</CardTitle>
        <CardDescription>
          Generate sample data to see real-time updates in action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={generateMCPServer}
          disabled={generating !== null}
          className="w-full justify-start"
          variant="outline"
        >
          {generating === 'mcp' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Network className="h-4 w-4 mr-2 text-blue-500" />
          )}
          Generate MCP Server
        </Button>

        <Button
          onClick={generateVectorIndex}
          disabled={generating !== null}
          className="w-full justify-start"
          variant="outline"
        >
          {generating === 'rag' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2 text-green-500" />
          )}
          Generate Vector Index
        </Button>

        <Button
          onClick={generateA2AWorkflow}
          disabled={generating !== null}
          className="w-full justify-start"
          variant="outline"
        >
          {generating === 'a2a' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
          )}
          Generate A2A Workflow
        </Button>

        <Button
          onClick={generateAgentInteraction}
          disabled={generating !== null}
          className="w-full justify-start"
          variant="outline"
        >
          {generating === 'agent' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Activity className="h-4 w-4 mr-2 text-orange-500" />
          )}
          Generate Agent Interaction
        </Button>
      </CardContent>
    </Card>
  );
};
