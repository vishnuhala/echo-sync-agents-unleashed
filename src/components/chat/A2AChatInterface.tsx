import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { useA2A } from '@/hooks/useA2A';
import { useMCP } from '@/hooks/useMCP';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  User, 
  Send, 
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Zap,
  Network,
  Search
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  metadata?: any;
}

export const A2AChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the A2A Communication Hub! I can coordinate multiple AI agents to help you with complex tasks. Select an agent to start a conversation or ask me to orchestrate multi-agent workflows.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { agents, userAgents } = useAgents();
  const { sendA2AMessage } = useA2A();
  const { servers, executeMCPTool } = useMCP();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activeAgents = userAgents?.filter(ua => 
    agents.some(a => a.id === ua.agent_id && a.active)
  ) || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const findRelevantAgents = (query: string) => {
    const relevantAgents = [];
    
    // Trading related queries
    if (query.toLowerCase().match(/market|stock|trading|price|financial|investment|portfolio/)) {
      const traderAgent = activeAgents.find(ua => {
        const agent = agents.find(a => a.id === ua.agent_id);
        return agent?.role === 'trader';
      });
      if (traderAgent) relevantAgents.push(traderAgent);
    }
    
    // Academic/research related queries
    if (query.toLowerCase().match(/research|study|academic|learn|education|paper|analysis/)) {
      const studentAgent = activeAgents.find(ua => {
        const agent = agents.find(a => a.id === ua.agent_id);
        return agent?.role === 'student';
      });
      if (studentAgent) relevantAgents.push(studentAgent);
    }
    
    // Business/startup related queries
    if (query.toLowerCase().match(/business|startup|company|product|strategy|growth|founder/)) {
      const founderAgent = activeAgents.find(ua => {
        const agent = agents.find(a => a.id === ua.agent_id);
        return agent?.role === 'founder';
      });
      if (founderAgent) relevantAgents.push(founderAgent);
    }
    
    return relevantAgents;
  };

  const orchestrateAgentResponse = async (userQuery: string) => {
    // If a specific agent is selected, send directly to that agent
    if (selectedAgentId) {
      try {
        const result = await sendA2AMessage(
          activeAgents[0]?.agent_id || '', // Use first agent as sender
          selectedAgentId,
          userQuery,
          'direct'
        );
        
        const selectedAgent = agents.find(a => a.id === selectedAgentId);
        return {
          content: `Message sent to ${selectedAgent?.name || 'selected agent'}. The agent will process your request and respond accordingly.`,
          metadata: { agentId: selectedAgentId, agentName: selectedAgent?.name }
        };
      } catch (error: any) {
        return {
          content: `Failed to send message to agent: ${error.message}`,
          metadata: { error: error.message }
        };
      }
    }
    
    // Auto-select relevant agents based on query
    const relevantAgents = findRelevantAgents(userQuery);
    
    if (relevantAgents.length === 0) {
      return {
        content: "I couldn't find any agents that match your query. Please activate some agents first or select a specific agent to chat with.",
        metadata: { noAgents: true }
      };
    }
    
    if (relevantAgents.length === 1) {
      // Single agent - send directly
      const targetAgent = relevantAgents[0];
      try {
        await sendA2AMessage(
          activeAgents[0]?.agent_id || '',
          targetAgent.agent_id,
          userQuery,
          'direct'
        );
        
        const agent = agents.find(a => a.id === targetAgent.agent_id);
        return {
          content: `I've forwarded your query to the ${agent?.role} agent (${agent?.name}). They are best suited to help with "${userQuery.substring(0, 50)}..."\n\nThe agent will analyze your request and provide a specialized response.`,
          metadata: { agentId: targetAgent.agent_id, agentName: agent?.name, agentRole: agent?.role }
        };
      } catch (error: any) {
        return {
          content: `Failed to communicate with agent: ${error.message}`,
          metadata: { error: error.message }
        };
      }
    }
    
    // Multiple agents - orchestrate workflow
    const agentNames = relevantAgents.map(ua => {
      const agent = agents.find(a => a.id === ua.agent_id);
      return agent?.name || 'Unknown';
    }).join(', ');
    
    return {
      content: `I've identified ${relevantAgents.length} relevant agents for your query: ${agentNames}.\n\nI'm coordinating between them to provide you with comprehensive insights. Each agent will contribute their expertise:\n\n${relevantAgents.map(ua => {
        const agent = agents.find(a => a.id === ua.agent_id);
        return `• ${agent?.name} (${agent?.role}): Will provide ${agent?.role}-specific insights`;
      }).join('\n')}\n\nPlease wait while they collaborate on your request...`,
      metadata: { 
        multiAgent: true, 
        agentCount: relevantAgents.length,
        agentIds: relevantAgents.map(ua => ua.agent_id)
      }
    };
  };

  const processWithSearch = async (query: string) => {
    // Try to use MCP servers for enhanced responses
    const connectedServers = servers.filter(s => s.status === 'connected');
    const searchServer = connectedServers.find(s => 
      s.tools.some(t => t.name.includes('search') || t.name.includes('web'))
    );
    
    if (searchServer) {
      const searchTool = searchServer.tools.find(t => 
        t.name.includes('search') || t.name.includes('web')
      );
      
      if (searchTool) {
        try {
          const result = await executeMCPTool(searchServer.id, searchTool.name, { 
            query, 
            count: 3 
          });
          
          if (result && result.results && Array.isArray(result.results)) {
            const searchResults = result.results.slice(0, 3).map((item: any, index: number) => 
              `${index + 1}. ${item.title || 'Result'}: ${item.description || item.url || 'No description'}`
            ).join('\n');
            
            return `I found some relevant information from the web:\n\n${searchResults}\n\nBased on this information, `;
          }
        } catch (error) {
          console.error('Search error:', error);
        }
      }
    }
    
    return '';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // First try to get additional context through search
      const searchContext = await processWithSearch(userMessage.content);
      
      // Then orchestrate agent response
      const response = await orchestrateAgentResponse(userMessage.content);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: searchContext + response.content,
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, agentMessage]);
      
      if (!response.metadata?.error) {
        toast({
          title: "Message Processed",
          description: response.metadata?.multiAgent 
            ? `Coordinating ${response.metadata.agentCount} agents`
            : `Message sent to ${response.metadata?.agentName || 'agent'}`,
        });
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `I apologize, but I encountered an error processing your request: ${error.message}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`p-2 rounded-full ${
            isUser ? 'bg-primary' : isSystem ? 'bg-muted' : 'bg-gradient-primary'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-primary-foreground" />
            ) : isSystem ? (
              <MessageSquare className="h-4 w-4" />
            ) : (
              <Users className="h-4 w-4 text-white" />
            )}
          </div>
          <div className={`p-3 rounded-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : isSystem
              ? 'bg-muted border'
              : 'bg-gradient-card border border-primary/20'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.metadata && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {message.metadata.agentName && (
                    <Badge variant="outline" className="text-xs">
                      <Bot className="h-3 w-3 mr-1" />
                      {message.metadata.agentName}
                    </Badge>
                  )}
                  {message.metadata.agentRole && (
                    <Badge variant="outline" className="text-xs">
                      {message.metadata.agentRole}
                    </Badge>
                  )}
                  {message.metadata.multiAgent && (
                    <Badge variant="outline" className="text-xs">
                      <Network className="h-3 w-3 mr-1" />
                      Multi-agent
                    </Badge>
                  )}
                  {message.metadata.error && (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] bg-gradient-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          A2A Communication Hub
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {activeAgents.length} agents active
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-80px)] flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-primary">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="p-3 rounded-lg bg-gradient-card border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Coordinating agents...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-border/50">
          <div className="mb-3">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select specific agent (optional) or let me auto-route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-route to best agent</SelectItem>
                {activeAgents.length > 0 ? (
                  activeAgents.map((ua) => {
                    const agent = agents.find(a => a.id === ua.agent_id);
                    if (!agent) return null;
                    return (
                      <SelectItem key={ua.agent_id} value={ua.agent_id}>
                        {agent.name} ({agent.role})
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="no-agents" disabled>
                    No active agents available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything or request agent coordination..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="bg-gradient-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Network className="h-3 w-3" />
            Connected to {activeAgents.length} active agents with intelligent routing
          </div>
        </div>
      </CardContent>
    </Card>
  );
};