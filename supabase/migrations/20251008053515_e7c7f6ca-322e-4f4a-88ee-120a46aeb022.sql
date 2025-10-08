-- Fix agent_id constraint by making it nullable
ALTER TABLE agent_interactions ALTER COLUMN agent_id DROP NOT NULL;

-- Add a comment to explain why this column is nullable
COMMENT ON COLUMN agent_interactions.agent_id IS 'Agent ID - nullable to allow system-level or cross-agent interactions to be logged';

-- Enable realtime for tables that aren't already enabled
DO $$
BEGIN
  -- Try to add each table, ignore if already exists
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE agents;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_agents;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_interactions;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE a2a_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE a2a_workflows;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE vector_indexes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rag_queries;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;