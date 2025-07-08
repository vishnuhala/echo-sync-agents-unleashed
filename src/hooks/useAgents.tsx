import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Agent, UserAgent, AgentInteraction } from '@/types/database';

interface AgentsContextType {
  agents: Agent[];
  userAgents: UserAgent[];
  interactions: AgentInteraction[];
  loading: boolean;
  activateAgent: (agentId: string) => Promise<{ error: any }>;
  deactivateAgent: (agentId: string) => Promise<{ error: any }>;
  sendMessage: (agentId: string, message: string, documentId?: string) => Promise<{ response?: string; error: any }>;
  refreshAgents: () => Promise<void>;
  refreshInteractions: (agentId?: string) => Promise<void>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export function AgentsProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userAgents, setUserAgents] = useState<UserAgent[]>([]);
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    if (!profile?.role) return;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('role', profile.role)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchUserAgents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAgents((data || []).map(item => ({
        ...item,
        config: item.config as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching user agents:', error);
    }
  };

  const fetchInteractions = async (agentId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('agent_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setInteractions((data || []).map(item => ({
        ...item,
        metadata: item.metadata as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const refreshAgents = async () => {
    await Promise.all([
      fetchAgents(),
      fetchUserAgents(),
    ]);
  };

  const refreshInteractions = async (agentId?: string) => {
    await fetchInteractions(agentId);
  };

  useEffect(() => {
    const loadData = async () => {
      if (profile?.role) {
        setLoading(true);
        await Promise.all([
          fetchAgents(),
          fetchUserAgents(),
          fetchInteractions(),
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.role, user]);

  const activateAgent = async (agentId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('user_agents')
      .insert({
        user_id: user.id,
        agent_id: agentId,
      });

    if (!error) {
      await fetchUserAgents();
    }

    return { error };
  };

  const deactivateAgent = async (agentId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('user_agents')
      .delete()
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (!error) {
      await fetchUserAgents();
    }

    return { error };
  };

  const sendMessage = async (agentId: string, message: string, documentId?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Call the AI agent via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          agentId,
          message,
          documentId,
          userId: user.id,
        },
      });

      if (error) throw error;

      // Store the interaction
      await supabase
        .from('agent_interactions')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          document_id: documentId,
          input: message,
          output: data.response,
          metadata: data.metadata || {},
        });

      // Refresh interactions to show the new message
      await fetchInteractions();

      return { response: data.response, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  };

  const value = {
    agents,
    userAgents,
    interactions,
    loading,
    activateAgent,
    deactivateAgent,
    sendMessage,
    refreshAgents,
    refreshInteractions,
  };

  return (
    <AgentsContext.Provider value={value}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}