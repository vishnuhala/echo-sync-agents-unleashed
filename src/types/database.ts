export type UserRole = 'trader' | 'student' | 'founder';

export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  role: UserRole;
  description: string;
  system_prompt: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAgent {
  id: string;
  user_id: string;
  agent_id: string;
  activated_at: string;
  config: Record<string, any>;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
  processed_at?: string;
}

export interface AgentInteraction {
  id: string;
  user_id: string;
  agent_id: string;
  document_id?: string;
  input: string;
  output: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Phase 3 & 4 Additional Types
export interface AgentConversation {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  trigger_type: 'manual' | 'scheduled' | 'event';
  trigger_config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalIntegration {
  id: string;
  user_id: string;
  service_name: string;
  config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentMetric {
  id: string;
  agent_id: string;
  user_id: string;
  metric_type: 'usage_count' | 'response_time' | 'satisfaction_rating';
  value: number;
  metadata: Record<string, any>;
  recorded_at: string;
}