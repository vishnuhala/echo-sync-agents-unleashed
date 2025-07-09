import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, MessageSquare, Plus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Agents() {
  const { profile } = useAuth();
  const { agents, userAgents, loading, activateAgent, deactivateAgent } = useAgents();
  const [activatingAgent, setActivatingAgent] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAgentActivated = (agentId: string) => {
    return userAgents.some(ua => ua.agent_id === agentId);
  };

  const handleActivateAgent = async (agentId: string) => {
    setActivatingAgent(agentId);
    const { error } = await activateAgent(agentId);
    
    if (error) {
      console.error('Agent activation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to activate agent. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agent Activated",
        description: "You can now start chatting with this agent!",
      });
    }
    
    setActivatingAgent(null);
  };

  const handleDeactivateAgent = async (agentId: string) => {
    setActivatingAgent(agentId);
    const { error } = await deactivateAgent(agentId);
    
    if (error) {
      console.error('Agent deactivation error:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to deactivate agent. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agent Deactivated",
        description: "Agent has been removed from your active agents.",
      });
    }
    
    setActivatingAgent(null);
  };

  const handleChatWithAgent = (agentId: string) => {
    navigate(`/chat/${agentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (!profile?.role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please complete your profile setup first.</p>
          <Button onClick={() => navigate('/role-selection')} className="mt-4">
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Agents</h1>
          <p className="text-muted-foreground text-lg">
            Activate and chat with specialized AI agents designed for {profile.role}s
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const isActivated = isAgentActivated(agent.id);
            const isLoading = activatingAgent === agent.id;

            return (
              <Card key={agent.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        {agent.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-3">
                        {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    {isActivated && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {agent.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2">
                    {isActivated ? (
                      <>
                        <Button
                          onClick={() => handleChatWithAgent(agent.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          onClick={() => handleDeactivateAgent(agent.id)}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleActivateAgent(agent.id)}
                        className="flex-1"
                        size="sm"
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isLoading ? 'Activating...' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Agents Available</h3>
            <p className="text-muted-foreground">
              No agents are currently available for {profile.role}s. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}