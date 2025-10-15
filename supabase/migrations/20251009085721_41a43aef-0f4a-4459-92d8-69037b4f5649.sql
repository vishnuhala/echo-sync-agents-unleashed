-- Fix security issue: Restrict agents table access to authenticated users only
-- Remove the current public policy that allows anyone to view agents
DROP POLICY IF EXISTS "Anyone can view active agents" ON public.agents;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view active agents" 
ON public.agents 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND active = true);