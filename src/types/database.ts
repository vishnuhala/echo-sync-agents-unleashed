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