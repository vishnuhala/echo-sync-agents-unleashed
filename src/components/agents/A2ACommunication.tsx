import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { useA2A } from '@/hooks/useA2A';
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

export const A2ACommunication = () => {
  const { agents, userAgents } = useAgents();
  const { messages, workflows, sendA2AMessage, executeA2AWorkflow, loading } = useA2A();
  const [selectedFromAgent, setSelectedFromAgent] = useState('');
  const [selectedToAgent, setSelectedToAgent] = useState('');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  const activeAgents = userAgents?.filter(ua => 
    agents.some(a => a.id === ua.agent_id && a.active)
  ) || [];

  const handleSendMessage = async () => {
    if (!selectedFromAgent || !selectedToAgent || !messageText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select agents and enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendA2AMessage(selectedFromAgent, selectedToAgent, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending A2A message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="h-4 w-4 text-warning" />;
      case 'processing': return <Zap className="h-4 w-4 text-primary animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-warning/10 text-warning border-warning/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return <div>Loading A2A system...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agent-to-Agent Communication</h2>
        <p className="text-muted-foreground">Real-time communication between AI agents</p>
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
            onClick={handleSendMessage}
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
                    <Badge variant="outline" className={workflow.is_active ? 'bg-success/10 text-success' : 'bg-muted/10'}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => executeA2AWorkflow(workflow.id)}
                      className="bg-gradient-primary"
                      disabled={!workflow.is_active}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Execute
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {workflow.agent_ids.length} agents
                </div>
              </div>
            ))}
          </div>
          {workflows.length === 0 && (
            <div className="text-center py-8">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workflows configured yet</p>
            </div>
          )}
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
              {messages.map((message) => {
                const senderAgent = agents.find(a => a.id === message.sender_agent_id);
                const receiverAgent = agents.find(a => a.id === message.receiver_agent_id);
                
                return (
                  <div key={message.id} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="font-medium">{senderAgent?.name || 'Unknown'}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{receiverAgent?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(message.status)}
                        <Badge variant="outline" className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                );
              })}
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