import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExternalIntegration } from '@/types/database';

interface IntegrationsContextType {
  integrations: ExternalIntegration[];
  loading: boolean;
  createIntegration: (integration: Omit<ExternalIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateIntegration: (serviceName: string, updates: Partial<ExternalIntegration>) => Promise<{ error: any }>;
  deleteIntegration: (serviceName: string) => Promise<{ error: any }>;
  getIntegration: (serviceName: string) => ExternalIntegration | undefined;
  refreshIntegrations: () => Promise<void>;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<ExternalIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data || []).map(item => ({
        ...item,
        config: item.config as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshIntegrations = async () => {
    await fetchIntegrations();
  };

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const createIntegration = async (integration: Omit<ExternalIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('external_integrations')
      .insert({
        ...integration,
        user_id: user.id,
      });

    if (!error) {
      await fetchIntegrations();
    }

    return { error };
  };

  const updateIntegration = async (serviceName: string, updates: Partial<ExternalIntegration>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('external_integrations')
      .update(updates)
      .eq('service_name', serviceName)
      .eq('user_id', user.id);

    if (!error) {
      await fetchIntegrations();
    }

    return { error };
  };

  const deleteIntegration = async (serviceName: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('external_integrations')
      .delete()
      .eq('service_name', serviceName)
      .eq('user_id', user.id);

    if (!error) {
      await fetchIntegrations();
    }

    return { error };
  };

  const getIntegration = (serviceName: string) => {
    return integrations.find(integration => integration.service_name === serviceName);
  };

  const value = {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    getIntegration,
    refreshIntegrations,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
}