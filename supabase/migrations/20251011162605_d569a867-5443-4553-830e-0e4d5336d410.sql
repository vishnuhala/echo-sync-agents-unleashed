-- Fix warn-level security issues

-- 1. Fix agents table RLS: Restrict to only agents user has activated
DROP POLICY IF EXISTS "Authenticated users can view active agents" ON public.agents;

CREATE POLICY "Users can view their activated agents"
ON public.agents
FOR SELECT
USING (
  active = true AND
  id IN (
    SELECT agent_id FROM public.user_agents
    WHERE user_id = auth.uid()
  )
);

-- 2. Fix handle_new_user function: Add SET search_path = public for SECURITY DEFINER protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;