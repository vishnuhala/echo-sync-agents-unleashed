import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface A2AMessage {
  id: string;
  sender_agent_id: string;
  receiver_agent_id: string;
  content: string;
  message_type: string;
  status: string;
  workflow_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface A2AWorkflow {
  id: string;
  name: string;
  description?: string;
  agent_ids: string[];
  steps: any;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useA2A = () => {
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [workflows, setWorkflows] = useState<A2AWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch A2A messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('a2a_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching A2A messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch A2A messages",
        variant: "destructive",
      });
    }
  };

  // Fetch A2A workflows
  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('a2a_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching A2A workflows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch A2A workflows",
        variant: "destructive",
      });
    }
  };

  // Send A2A message
  const sendA2AMessage = async (
    senderAgentId: string,
    receiverAgentId: string,
    content: string,
    messageType: string = 'direct',
    workflowId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('a2a_messages')
        .insert({
          sender_agent_id: senderAgentId,
          receiver_agent_id: receiverAgentId,
          content,
          message_type: messageType,
          workflow_id: workflowId,
          user_id: user.id,
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      // Process the message through the receiver agent
      await supabase.functions.invoke('a2a-communication', {
        body: {
          messageId: data.id,
          senderAgentId,
          receiverAgentId,
          content,
          messageType,
          userId: user.id
        }
      });

      toast({
        title: "Message Sent",
        description: "A2A message sent successfully",
      });

      return data;
    } catch (error) {
      console.error('Error sending A2A message:', error);
      toast({
        title: "Error",
        description: "Failed to send A2A message",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create A2A workflow
  const createA2AWorkflow = async (
    name: string,
    description: string,
    agentIds: string[],
    steps: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('a2a_workflows')
        .insert({
          name,
          description,
          agent_ids: agentIds,
          steps,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow Created",
        description: "A2A workflow created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating A2A workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create A2A workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Execute A2A workflow
  const executeA2AWorkflow = async (workflowId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('execute-a2a-workflow', {
        body: {
          workflowId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Workflow Executed",
        description: "A2A workflow executed successfully",
      });

      return data;
    } catch (error) {
      console.error('Error executing A2A workflow:', error);
      toast({
        title: "Error",
        description: "Failed to execute A2A workflow",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Incremental realtime apply for messages
  const applyMessageChange = (payload: any) => {
    const { eventType, new: newRow, old: oldRow } = payload || {};
    setMessages((prev) => {
      if (eventType === 'INSERT' && newRow) return [newRow as A2AMessage, ...prev];
      if (eventType === 'UPDATE' && newRow) return prev.map((m) => (m.id === newRow.id ? (newRow as A2AMessage) : m));
      if (eventType === 'DELETE' && oldRow) return prev.filter((m) => m.id !== oldRow.id);
      return prev;
    });
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchMessages();
    fetchWorkflows();

    // Subscribe to A2A messages
    const messagesChannel = supabase
      .channel('a2a_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'a2a_messages'
        },
        (payload) => {
          try {
            applyMessageChange(payload);
          } catch (e) {
            console.warn('Realtime apply failed, refetching.', e);
            fetchMessages();
          }
        }
      )
      .subscribe();

    // Subscribe to A2A workflows
    const workflowsChannel = supabase
      .channel('a2a_workflows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'a2a_workflows'
        },
        () => {
          fetchWorkflows();
        }
      )
      .subscribe();

    setLoading(false);

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(workflowsChannel);
    };
  }, []);

  return {
    messages,
    workflows,
    loading,
    sendA2AMessage,
    createA2AWorkflow,
    executeA2AWorkflow,
    refetch: () => {
      fetchMessages();
      fetchWorkflows();
    }
  };
};