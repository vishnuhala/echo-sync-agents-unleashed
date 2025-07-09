-- Allow users to delete their own agents (for proper deactivation)
DROP POLICY IF EXISTS "Users can deactivate agents for themselves" ON public.user_agents;

CREATE POLICY "Users can deactivate agents for themselves" 
ON public.user_agents 
FOR DELETE 
USING (auth.uid() = user_id);