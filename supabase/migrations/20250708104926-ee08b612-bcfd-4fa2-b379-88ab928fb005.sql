-- Create agents table for different AI agents
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'note_summarizer', 'market_sentiment', etc.
  role public.user_role NOT NULL, -- which user role can access this agent
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL, -- AI system prompt for this agent
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_agents table for tracking which agents users have activated
CREATE TABLE public.user_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  config JSONB DEFAULT '{}', -- agent-specific configuration
  UNIQUE(user_id, agent_id)
);

-- Create documents table for file uploads
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content TEXT, -- extracted text content
  file_url TEXT, -- storage URL
  file_type TEXT, -- pdf, txt, docx, etc.
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create agent_interactions table for chat history
CREATE TABLE public.agent_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  input TEXT NOT NULL, -- user's input/question
  output TEXT NOT NULL, -- agent's response
  metadata JSONB DEFAULT '{}', -- additional context, tokens used, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents (public read for active agents)
CREATE POLICY "Anyone can view active agents"
ON public.agents
FOR SELECT
USING (active = true);

-- RLS Policies for user_agents
CREATE POLICY "Users can view their own activated agents"
ON public.user_agents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can activate agents for themselves"
ON public.user_agents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent configs"
ON public.user_agents
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.documents
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for agent_interactions
CREATE POLICY "Users can view their own agent interactions"
ON public.agent_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent interactions"
ON public.agent_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies for documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default agents for each role
INSERT INTO public.agents (name, type, role, description, system_prompt) VALUES
-- Student agents
('Note Summarizer', 'note_summarizer', 'student', 'AI assistant that reads your documents and creates concise, well-structured summaries to help you study more effectively.', 'You are a Note Summarizer AI assistant. Your role is to help students by reading their uploaded documents and creating clear, concise summaries. Focus on key concepts, main ideas, and important details. Structure your summaries with headings and bullet points for easy reading. Always maintain accuracy and highlight the most crucial information for studying.'),
('Quiz Generator', 'quiz_generator', 'student', 'Creates practice quizzes and questions based on your study materials to test your knowledge.', 'You are a Quiz Generator AI. Create engaging and educational quizzes based on the content provided. Generate multiple choice, true/false, and short answer questions that test understanding of key concepts. Provide explanations for correct answers to enhance learning.'),

-- Trader agents
('Market Sentiment Analyzer', 'market_sentiment', 'trader', 'Analyzes market sentiment from news, social media, and financial data to help inform trading decisions.', 'You are a Market Sentiment Analyzer AI. Analyze market sentiment from various sources including news articles, social media trends, and financial reports. Provide insights on market mood, potential opportunities, and risk factors. Always remind users that this is analysis only and not financial advice.'),
('Portfolio Risk Assessor', 'portfolio_risk', 'trader', 'Evaluates portfolio risk exposure and suggests optimization strategies.', 'You are a Portfolio Risk Assessment AI. Analyze portfolio compositions, identify risk exposures, and suggest diversification strategies. Focus on risk-adjusted returns and provide data-driven insights for portfolio optimization.'),

-- Founder agents
('Email Assistant', 'email_assistant', 'founder', 'Helps compose professional emails, responses, and outreach messages for business communications.', 'You are an Email Assistant AI for business founders. Help compose professional, clear, and effective emails for various business purposes including client outreach, partnership proposals, team communication, and investor relations. Maintain a professional yet personable tone.'),
('Meeting Planner', 'meeting_planner', 'founder', 'Organizes and structures meetings, creates agendas, and helps coordinate team schedules.', 'You are a Meeting Planner AI assistant. Help founders organize effective meetings by creating structured agendas, suggesting optimal meeting times, and providing templates for different types of business meetings. Focus on productivity and clear outcomes.');