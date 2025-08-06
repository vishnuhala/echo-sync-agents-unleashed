-- Enable real-time functionality for existing tables
ALTER TABLE a2a_messages REPLICA IDENTITY FULL;
ALTER TABLE a2a_workflows REPLICA IDENTITY FULL;
ALTER TABLE mcp_servers REPLICA IDENTITY FULL;
ALTER TABLE agents REPLICA IDENTITY FULL;
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER TABLE agent_interactions REPLICA IDENTITY FULL;
ALTER TABLE external_integrations REPLICA IDENTITY FULL;

-- Create vector_indexes table for RAG system
CREATE TABLE public.vector_indexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  documents_count INTEGER NOT NULL DEFAULT 0,
  vectors_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'building' CHECK (status IN ('building', 'ready', 'error')),
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  config JSONB NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vector_indexes
ALTER TABLE public.vector_indexes ENABLE ROW LEVEL SECURITY;

-- Create policies for vector_indexes
CREATE POLICY "Users can create their own vector indexes"
ON public.vector_indexes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vector indexes"
ON public.vector_indexes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vector indexes"
ON public.vector_indexes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vector indexes"
ON public.vector_indexes
FOR DELETE
USING (auth.uid() = user_id);

-- Create rag_queries table
CREATE TABLE public.rag_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  vector_index_id UUID NOT NULL REFERENCES public.vector_indexes(id) ON DELETE CASCADE,
  results JSONB NOT NULL DEFAULT '[]',
  response_time_ms INTEGER,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rag_queries
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for rag_queries
CREATE POLICY "Users can create their own RAG queries"
ON public.rag_queries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own RAG queries"
ON public.rag_queries
FOR SELECT
USING (auth.uid() = user_id);

-- Enable real-time for new tables
ALTER TABLE public.vector_indexes REPLICA IDENTITY FULL;
ALTER TABLE public.rag_queries REPLICA IDENTITY FULL;

-- Create trigger for updating updated_at column on vector_indexes
CREATE TRIGGER update_vector_indexes_updated_at
  BEFORE UPDATE ON public.vector_indexes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_vector_indexes_user_id ON public.vector_indexes(user_id);
CREATE INDEX idx_vector_indexes_status ON public.vector_indexes(status);
CREATE INDEX idx_rag_queries_user_id ON public.rag_queries(user_id);
CREATE INDEX idx_rag_queries_vector_index_id ON public.rag_queries(vector_index_id);