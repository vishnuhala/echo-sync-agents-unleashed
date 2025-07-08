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