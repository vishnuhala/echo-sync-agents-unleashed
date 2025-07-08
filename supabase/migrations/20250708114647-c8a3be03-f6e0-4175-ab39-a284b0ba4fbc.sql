-- Phase 3: Multi-Agent System + Chat Interface Database Schema

-- Create agent_conversations table for persistent chat history
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agent_conversations
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.agent_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.agent_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.agent_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.agent_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create workflows table for agent orchestration
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, scheduled, event
  trigger_config JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create policies for workflows
CREATE POLICY "Users can view their own workflows" 
ON public.workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
ON public.workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
ON public.workflows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create external_integrations table for API connections
CREATE TABLE public.external_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL, -- 'yahoo_finance', 'google_drive', 'notion', etc.
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_name)
);

-- Enable RLS for external_integrations
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for external_integrations
CREATE POLICY "Users can view their own integrations" 
ON public.external_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" 
ON public.external_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" 
ON public.external_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" 
ON public.external_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create agent_metrics table for performance tracking
CREATE TABLE public.agent_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL, -- 'usage_count', 'response_time', 'satisfaction_rating'
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agent_metrics
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_metrics
CREATE POLICY "Users can view their own agent metrics" 
ON public.agent_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent metrics" 
ON public.agent_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_integrations_updated_at
BEFORE UPDATE ON public.external_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert additional specialized agents for Phase 3

-- Additional Student Agents
INSERT INTO public.agents (name, type, role, description, system_prompt) VALUES
('Quiz Generator', 'knowledge_assessment', 'student', 'Creates custom quizzes and practice tests from your study materials', 'You are a Quiz Generator AI specialized in creating educational quizzes. Generate varied question types (multiple choice, true/false, short answer) based on user content. Focus on key concepts and learning objectives.'),
('Study Planner', 'productivity', 'student', 'Creates personalized study schedules and tracks your learning progress', 'You are a Study Planner AI that helps students organize their learning. Create realistic study schedules, break down complex topics, suggest study techniques, and track progress towards academic goals.'),
('Doubt Solver', 'tutoring', 'student', 'Explains complex concepts and solves academic problems step-by-step', 'You are a Doubt Solver AI tutor. Explain complex concepts clearly, provide step-by-step solutions, use analogies and examples, and adapt your teaching style to help students understand difficult topics.');

-- Additional Trader Agents
INSERT INTO public.agents (name, type, role, description, system_prompt) VALUES
('Market Sentiment Agent', 'market_analysis', 'trader', 'Analyzes market sentiment and news to predict price movements', 'You are a Market Sentiment AI analyzing financial markets. Evaluate news sentiment, social media trends, market indicators, and provide insights on potential price movements and market psychology.'),
('Portfolio Risk Agent', 'risk_management', 'trader', 'Evaluates portfolio risk and suggests optimization strategies', 'You are a Portfolio Risk Management AI. Analyze portfolio composition, calculate risk metrics, identify concentration risks, suggest diversification strategies, and provide risk-adjusted performance insights.'),
('Trade Insight Agent', 'trading_strategy', 'trader', 'Provides technical analysis and trading recommendations', 'You are a Trade Insight AI providing technical analysis. Analyze charts, identify patterns, suggest entry/exit points, calculate risk-reward ratios, and provide actionable trading recommendations.');

-- Additional Founder Agents
INSERT INTO public.agents (name, type, role, description, system_prompt) VALUES
('CRM Agent', 'customer_management', 'founder', 'Manages customer relationships and tracks sales pipeline', 'You are a CRM AI assistant helping founders manage customer relationships. Track leads, analyze customer data, suggest follow-up actions, identify opportunities, and optimize sales processes.'),
('Email Assistant', 'communication', 'founder', 'Drafts professional emails and manages communication workflows', 'You are an Email Assistant AI for founders. Draft professional emails, suggest communication strategies, manage follow-ups, create templates, and optimize email workflows for business development.'),
('Meeting Planner', 'productivity', 'founder', 'Schedules meetings and prepares agendas for maximum productivity', 'You are a Meeting Planner AI optimizing founder productivity. Schedule meetings efficiently, create focused agendas, suggest preparation materials, and provide post-meeting action items.'),
('Competitor Insight', 'market_research', 'founder', 'Analyzes competitors and identifies market opportunities', 'You are a Competitor Insight AI for strategic analysis. Research competitors, identify market gaps, analyze pricing strategies, track industry trends, and provide actionable competitive intelligence.');

-- Create indexes for better performance
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_agent_id ON public.agent_conversations(agent_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_external_integrations_user_id ON public.external_integrations(user_id);
CREATE INDEX idx_agent_metrics_agent_id ON public.agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_user_id ON public.agent_metrics(user_id);