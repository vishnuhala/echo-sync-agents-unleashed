import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMCP } from '@/hooks/useMCP';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  User, 
  Send, 
  Search, 
  Database, 
  Globe,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'mcp' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export const MCPChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Hello! I\'m your MCP assistant. I can help you search the web, access databases, and retrieve information from various sources. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { servers, executeMCPTool } = useMCP();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const findBestServer = (query: string) => {
    const connectedServers = servers.filter(s => s.status === 'connected');
    
    // Search for specific capabilities based on query
    if (query.toLowerCase().includes('search') || query.toLowerCase().includes('web')) {
      return connectedServers.find(s => 
        s.tools.some(t => t.name.includes('search') || t.name.includes('web'))
      );
    }
    
    if (query.toLowerCase().includes('database') || query.toLowerCase().includes('sql')) {
      return connectedServers.find(s => 
        s.tools.some(t => t.name.includes('query') || t.name.includes('database'))
      );
    }
    
    if (query.toLowerCase().includes('file') || query.toLowerCase().includes('document')) {
      return connectedServers.find(s => 
        s.tools.some(t => t.name.includes('file') || t.name.includes('read') || t.name.includes('write'))
      );
    }
    
    // Default to first available server with search capability
    return connectedServers.find(s => s.tools.length > 0) || connectedServers[0];
  };

  const generateSearchParameters = (query: string, toolName: string) => {
    if (toolName.includes('search') || toolName.includes('web')) {
      return { query, count: 5 };
    }
    
    if (toolName.includes('query') || toolName.includes('database')) {
      // Generate a safe SQL query based on the user input
      return { query: `SELECT * FROM data WHERE content LIKE '%${query}%' LIMIT 10` };
    }
    
    if (toolName.includes('file')) {
      return { path: '/documents', filter: query };
    }
    
    // Default parameters
    return { input: query };
  };

  const processWithMCP = async (userQuery: string) => {
    const server = findBestServer(userQuery);
    
    if (!server) {
      return {
        content: "I don't have any connected MCP servers right now. Please connect some servers first to enable me to help you with searches, database queries, or file operations.",
        metadata: { error: 'No connected servers' }
      };
    }

    const availableTools = server.tools;
    if (availableTools.length === 0) {
      return {
        content: `Server "${server.name}" is connected but has no available tools.`,
        metadata: { server: server.name, error: 'No tools' }
      };
    }

    // Select the best tool for the query
    let selectedTool = availableTools.find(t => 
      t.name.includes('search') || t.name.includes('web')
    );
    
    if (!selectedTool && userQuery.toLowerCase().includes('database')) {
      selectedTool = availableTools.find(t => 
        t.name.includes('query') || t.name.includes('database')
      );
    }
    
    if (!selectedTool) {
      selectedTool = availableTools[0]; // Use first available tool
    }

    try {
      const parameters = generateSearchParameters(userQuery, selectedTool.name);
      const result = await executeMCPTool(server.id, selectedTool.name, parameters);
      
      let responseContent = `I used ${server.name} with the "${selectedTool.name}" tool to help answer your question.\n\n`;
      
      if (result && typeof result === 'object') {
        if (result.results && Array.isArray(result.results)) {
          responseContent += `Found ${result.results.length} results:\n\n`;
          result.results.slice(0, 3).forEach((item: any, index: number) => {
            responseContent += `${index + 1}. ${item.title || item.name || 'Result'}\n`;
            responseContent += `   ${item.description || item.content || item.url || 'No description'}\n\n`;
          });
        } else if (result.content) {
          responseContent += result.content;
        } else if (result.data) {
          responseContent += `Found data: ${JSON.stringify(result.data, null, 2)}`;
        } else {
          responseContent += `Execution successful. Result: ${JSON.stringify(result, null, 2)}`;
        }
      } else {
        responseContent += `Result: ${result}`;
      }

      return {
        content: responseContent,
        metadata: { 
          server: server.name, 
          tool: selectedTool.name, 
          parameters,
          rawResult: result 
        }
      };
    } catch (error: any) {
      return {
        content: `I encountered an error while trying to help: ${error.message || 'Unknown error'}. Let me try a different approach or please rephrase your question.`,
        metadata: { 
          server: server.name, 
          tool: selectedTool.name, 
          error: error.message 
        }
      };
    }
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
      // Process the message with MCP
      const response = await processWithMCP(userMessage.content);
      
      const mcpMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mcp',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, mcpMessage]);
      
      if (!response.metadata?.error) {
        toast({
          title: "Query Processed",
          description: `Successfully processed using ${response.metadata?.server || 'MCP server'}`,
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
              <Bot className="h-4 w-4 text-white" />
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
                  {message.metadata.server && (
                    <Badge variant="outline" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {message.metadata.server}
                    </Badge>
                  )}
                  {message.metadata.tool && (
                    <Badge variant="outline" className="text-xs">
                      <Search className="h-3 w-3 mr-1" />
                      {message.metadata.tool}
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
          <Bot className="h-5 w-5" />
          MCP Assistant
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {servers.filter(s => s.status === 'connected').length} servers connected
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
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="p-3 rounded-lg bg-gradient-card border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing your request...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything... I can search the web, query databases, and more!"
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
            <Globe className="h-3 w-3" />
            Connected to {servers.filter(s => s.status === 'connected').length} MCP servers with {servers.reduce((acc, s) => acc + s.tools.length, 0)} tools
          </div>
        </div>
      </CardContent>
    </Card>
  );
};