import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VectorIndex {
  id: string;
  name: string;
  description?: string;
  documents_count: number;
  vectors_count: number;
  status: 'building' | 'ready' | 'error';
  embedding_model: string;
  config: Record<string, any>;
  user_id: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface RAGQuery {
  id: string;
  query: string;
  vector_index_id: string;
  results: Array<{
    content: string;
    source: string;
    score: number;
  }>;
  response_time_ms?: number;
  user_id: string;
  created_at: string;
}

export const useRAG = () => {
  const [vectorIndexes, setVectorIndexes] = useState<VectorIndex[]>([]);
  const [queryHistory, setQueryHistory] = useState<RAGQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch vector indexes
  const fetchVectorIndexes = async () => {
    try {
      const { data, error } = await supabase
        .from('vector_indexes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type the data properly for VectorIndex interface
      const typedIndexes: VectorIndex[] = (data || []).map(index => ({
        ...index,
        status: index.status as 'building' | 'ready' | 'error',
        config: typeof index.config === 'object' && index.config !== null ? index.config as Record<string, any> : {}
      }));
      
      setVectorIndexes(typedIndexes);
    } catch (error) {
      console.error('Error fetching vector indexes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vector indexes",
        variant: "destructive",
      });
    }
  };

  // Fetch query history
  const fetchQueryHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('rag_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type the data properly for RAGQuery interface
      const typedQueries: RAGQuery[] = (data || []).map(query => ({
        ...query,
        results: Array.isArray(query.results) ? query.results as Array<{content: string; source: string; score: number}> : []
      }));
      
      setQueryHistory(typedQueries);
    } catch (error) {
      console.error('Error fetching query history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch query history",
        variant: "destructive",
      });
    }
  };

  // Create vector index
  const createVectorIndex = async (
    name: string,
    description: string,
    embeddingModel: string = 'text-embedding-3-small',
    config: Record<string, any> = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vector_indexes')
        .insert({
          name,
          description,
          embedding_model: embeddingModel,
          config,
          user_id: user.id,
          status: 'building'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Index Created",
        description: "Vector index is being built",
      });

      return data;
    } catch (error) {
      console.error('Error creating vector index:', error);
      toast({
        title: "Error",
        description: "Failed to create vector index",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update vector index
  const updateVectorIndex = async (
    indexId: string,
    updates: Partial<VectorIndex>
  ) => {
    try {
      const { data, error } = await supabase
        .from('vector_indexes')
        .update(updates)
        .eq('id', indexId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Index Updated",
        description: "Vector index updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating vector index:', error);
      toast({
        title: "Error",
        description: "Failed to update vector index",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete vector index
  const deleteVectorIndex = async (indexId: string) => {
    try {
      const { error } = await supabase
        .from('vector_indexes')
        .delete()
        .eq('id', indexId);

      if (error) throw error;

      toast({
        title: "Index Deleted",
        description: "Vector index deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting vector index:', error);
      toast({
        title: "Error",
        description: "Failed to delete vector index",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Perform RAG query
  const performRAGQuery = async (
    query: string,
    vectorIndexId: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startTime = Date.now();

      // Call RAG edge function
      const { data, error } = await supabase.functions.invoke('rag-query', {
        body: {
          query,
          vectorIndexId,
          userId: user.id
        }
      });

      if (error) throw error;

      const responseTime = Date.now() - startTime;

      // Store query in database
      const { data: queryData, error: queryError } = await supabase
        .from('rag_queries')
        .insert({
          query,
          vector_index_id: vectorIndexId,
          results: data.results || [],
          response_time_ms: responseTime,
          user_id: user.id
        })
        .select()
        .single();

      if (queryError) throw queryError;

      toast({
        title: "Query Complete",
        description: `Found ${data.results?.length || 0} relevant results`,
      });

      return queryData;
    } catch (error) {
      console.error('Error performing RAG query:', error);
      toast({
        title: "Error",
        description: "Failed to perform RAG query",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Rebuild vector index
  const rebuildVectorIndex = async (indexId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('rag-rebuild-index', {
        body: {
          indexId,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Rebuilding Index",
        description: "Vector index rebuild started",
      });

      return data;
    } catch (error) {
      console.error('Error rebuilding vector index:', error);
      toast({
        title: "Error",
        description: "Failed to rebuild vector index",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Index documents
  const indexDocuments = async (
    indexId: string,
    documentIds: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('rag-index-documents', {
        body: {
          indexId,
          documentIds,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Indexing Started",
        description: "Documents are being indexed",
      });

      return data;
    } catch (error) {
      console.error('Error indexing documents:', error);
      toast({
        title: "Error",
        description: "Failed to index documents",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchVectorIndexes();
    fetchQueryHistory();

    // Subscribe to vector index changes
    const indexesChannel = supabase
      .channel('vector_indexes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vector_indexes'
        },
        () => {
          fetchVectorIndexes();
        }
      )
      .subscribe();

    // Subscribe to query changes
    const queriesChannel = supabase
      .channel('rag_queries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rag_queries'
        },
        () => {
          fetchQueryHistory();
        }
      )
      .subscribe();

    setLoading(false);

    return () => {
      supabase.removeChannel(indexesChannel);
      supabase.removeChannel(queriesChannel);
    };
  }, []);

  return {
    vectorIndexes,
    queryHistory,
    loading,
    createVectorIndex,
    updateVectorIndex,
    deleteVectorIndex,
    performRAGQuery,
    rebuildVectorIndex,
    indexDocuments,
    refetch: () => {
      fetchVectorIndexes();
      fetchQueryHistory();
    }
  };
};