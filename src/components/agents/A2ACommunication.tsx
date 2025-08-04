import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { 
  ArrowRight, 
  Bot, 
  MessageSquare, 
  Play,
  Users,
  Network,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  response?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: Date;
  type: 'request' | 'response' | 'broadcast';
}

interface A2AWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  steps: Array<{
    agentId: string;
    action: string;
    nextAgent?: string;
  }>;
  status: 'draft' | 'active' | 'paused';
}

export const A2ACommunication = () => {
  const { agents, userAgents } = useAgents();
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [workflows, setWorkflows] = useState<A2AWorkflow[]>([
    {
      id: '1',
      name: 'Document Analysis Pipeline',
      description: 'Multi-agent document processing and analysis',
      agents: ['doc-processor', 'analyzer', 'summarizer'],
      steps: [
        { agentId: 'doc-processor', action: 'extract_text', nextAgent: 'analyzer' },
        { agentId: 'analyzer', action: 'analyze_content', nextAgent: 'summarizer' },
        { agentId: 'summarizer', action: 'generate_summary' }
      ],
      status: 'active'
    }
  ]);
  const [selectedFromAgent, setSelectedFromAgent] = useState('');
  const [selectedToAgent, setSelectedToAgent] = useState('');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  const activeAgents = userAgents?.filter(ua => 
    agents.some(a => a.id === ua.agent_id && a.active)
  ) || [];

  const sendA2AMessage = async () => {
    if (!selectedFromAgent || !selectedToAgent || !messageText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select agents and enter a message",
        variant: "destructive",
      });
      return;
    }

    const newMessage: A2AMessage = {
      id: Date.now().toString(),
      fromAgent: selectedFromAgent,
      toAgent: selectedToAgent,
      message: messageText,
      status: 'pending',
      timestamp: new Date(),
      type: 'request'
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessageText('');

    // Simulate processing
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status: 'processing' }
          : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              status: 'completed',
              response: `Response from ${selectedToAgent}: I've processed your request successfully.`
            }
          : msg
      ));
    }, 3000);

    toast({
      title: "Message Sent",
      description: "Agent-to-Agent communication initiated",
    });
  };

  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    toast({
      title: "Workflow Started",
      description: `Executing ${workflow.name}`,
    });

    // Simulate workflow execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const nextStep = workflow.steps[i + 1];
      
      setTimeout(() => {
        const workflowMessage: A2AMessage = {
          id: `workflow-${Date.now()}-${i}`,
          fromAgent: step.agentId,
          toAgent: nextStep?.agentId || 'system',
          message: `Executing ${step.action}`,
          status: 'processing',
          timestamp: new Date(),
          type: 'request'
        };
        
        setMessages(prev => [workflowMessage, ...prev]);

        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === workflowMessage.id 
              ? { 
                  ...msg, 
                  status: 'completed',
                  response: `${step.action} completed successfully`
                }
              : msg
          ));
        }, 2000);
      }, i * 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'processing': return <Zap className="h-4 w-4 text-primary animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agent-to-Agent Communication</h2>
        <p className="text-muted-foreground">Enable seamless communication between AI agents</p>
      </div>

      {/* Send Message */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send A2A Message
          </CardTitle>
          <CardDescription>Direct communication between agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Agent</label>
              <Select value={selectedFromAgent} onValueChange={setSelectedFromAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source agent" />
                </SelectTrigger>
                <SelectContent>
                  {activeAgents.map((ua) => {
                    const agent = agents.find(a => a.id === ua.agent_id);
                    return (
                      <SelectItem key={ua.agent_id} value={ua.agent_id}>
                        {agent?.name || 'Unknown Agent'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Agent</label>
              <Select value={selectedToAgent} onValueChange={setSelectedToAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target agent" />
                </SelectTrigger>
                <SelectContent>
                  {activeAgents.map((ua) => {
                    const agent = agents.find(a => a.id === ua.agent_id);
                    return (
                      <SelectItem key={ua.agent_id} value={ua.agent_id}>
                        {agent?.name || 'Unknown Agent'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            placeholder="Enter message for agent communication..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={sendA2AMessage} 
            className="bg-gradient-primary"
            disabled={!selectedFromAgent || !selectedToAgent || !messageText.trim()}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* Workflows */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            A2A Workflows
          </CardTitle>
          <CardDescription>Automated multi-agent workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => executeWorkflow(workflow.id)}
                      className="bg-gradient-primary"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Execute
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {workflow.agents.length} agents • {workflow.steps.length} steps
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication History
          </CardTitle>
          <CardDescription>Recent agent-to-agent messages</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">{message.fromAgent}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{message.toAgent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <Badge variant="outline" className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{message.message}</p>
                  {message.response && (
                    <div className="mt-2 p-2 rounded bg-success/10 border border-success/20">
                      <p className="text-sm text-success">{message.response}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Messages</h3>
              <p className="text-muted-foreground">
                Start agent-to-agent communication to see messages here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};