import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Upload, FileText, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Chat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agents, userAgents, interactions, sendMessage, refreshInteractions } = useAgents();
  const { documents } = useDocuments();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string>('none');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agents.find(a => a.id === agentId);
  const isAgentActivated = userAgents.some(ua => ua.agent_id === agentId);
  const agentInteractions = interactions.filter(i => i.agent_id === agentId);

  useEffect(() => {
    if (agentId) {
      refreshInteractions(agentId);
    }
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentInteractions]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Agent not found</p>
          <Button onClick={() => navigate('/agents')} className="mt-4">
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  if (!isAgentActivated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You need to activate this agent first</p>
          <Button onClick={() => navigate('/agents')}>
            Go to Agents
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    const messageText = message;
    setMessage('');

    const { error } = await sendMessage(agentId!, messageText, selectedDocument && selectedDocument !== 'none' ? selectedDocument : undefined);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessage(messageText); // Restore message on error
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/agents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{agent.name}</h1>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Selection */}
      {documents.length > 0 && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Reference Document:</label>
              <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a document (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No document</SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.filename}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/documents')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pb-4">
            {agentInteractions.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Ask {agent.name} anything related to {agent.description.toLowerCase()}
                </p>
              </div>
            ) : (
              agentInteractions.map((interaction) => (
                <div key={interaction.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
                        <p className="text-sm">{interaction.input}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm whitespace-pre-wrap">{interaction.output}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(interaction.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${agent.name} anything...`}
                disabled={sending}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {selectedDocument && selectedDocument !== 'none' && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Reference: {documents.find(d => d.id === selectedDocument)?.filename}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}