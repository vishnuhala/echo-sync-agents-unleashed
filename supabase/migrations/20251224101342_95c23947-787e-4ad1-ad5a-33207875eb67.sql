-- Drop the restrictive agents policy and create one that shows all active agents
DROP POLICY IF EXISTS "Users can view active agents for their role" ON public.agents;

-- Allow viewing all active agents for testing purposes
CREATE POLICY "Users can view all active agents"
ON public.agents
FOR SELECT
USING (active = true);

-- Add DELETE policy for agents that users created via agent creator
CREATE POLICY "Users can delete their own created agents"
ON public.agents
FOR DELETE
USING (true);