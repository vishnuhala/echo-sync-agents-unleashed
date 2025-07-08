import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Workflow } from '@/types/database';

interface WorkflowsContextType {
  workflows: Workflow[];
  loading: boolean;
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<{ error: any }>;
  deleteWorkflow: (id: string) => Promise<{ error: any }>;
  executeWorkflow: (id: string) => Promise<{ error: any }>;
  refreshWorkflows: () => Promise<void>;
}

const WorkflowsContext = createContext<WorkflowsContextType | undefined>(undefined);

export function WorkflowsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows((data || []).map(item => ({
        ...item,
        config: item.config as Record<string, any>,
        trigger_config: item.trigger_config as Record<string, any>,
        trigger_type: item.trigger_type as 'manual' | 'scheduled' | 'event'
      })));
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkflows = async () => {
    await fetchWorkflows();
  };

  useEffect(() => {
    if (user) {
      fetchWorkflows();
    }
  }, [user]);

  const createWorkflow = async (workflow: Omit<Workflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('workflows')
      .insert({
        ...workflow,
        user_id: user.id,
      });

    if (!error) {
      await fetchWorkflows();
    }

    return { error };
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      await fetchWorkflows();
    }

    return { error };
  };

  const deleteWorkflow = async (id: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      await fetchWorkflows();
    }

    return { error };
  };

  const executeWorkflow = async (id: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: id, userId: user.id },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error executing workflow:', error);
      return { error };
    }
  };

  const value = {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    refreshWorkflows,
  };

  return (
    <WorkflowsContext.Provider value={value}>
      {children}
    </WorkflowsContext.Provider>
  );
}

export function useWorkflows() {
  const context = useContext(WorkflowsContext);
  if (context === undefined) {
    throw new Error('useWorkflows must be used within a WorkflowsProvider');
  }
  return context;
}