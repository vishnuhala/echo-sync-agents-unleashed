-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their activated agents" ON agents;

-- Create a new policy that allows users to view all active agents for their role
CREATE POLICY "Users can view active agents for their role" 
ON agents 
FOR SELECT 
USING (
  active = true 
  AND role IN (
    SELECT role 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);