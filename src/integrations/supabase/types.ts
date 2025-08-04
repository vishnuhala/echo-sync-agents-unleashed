export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      a2a_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          receiver_agent_id: string
          sender_agent_id: string
          status: string | null
          updated_at: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          receiver_agent_id: string
          sender_agent_id: string
          status?: string | null
          updated_at?: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          receiver_agent_id?: string
          sender_agent_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      a2a_workflows: {
        Row: {
          agent_ids: string[]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_ids: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent_id: string
          context: Json | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          context?: Json | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          context?: Json | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_interactions: {
        Row: {
          agent_id: string
          created_at: string
          document_id: string | null
          id: string
          input: string
          metadata: Json | null
          output: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          document_id?: string | null
          id?: string
          input: string
          metadata?: Json | null
          output: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          document_id?: string | null
          id?: string
          input?: string
          metadata?: Json | null
          output?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_interactions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_metrics: {
        Row: {
          agent_id: string
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string
          user_id: string
          value: number
        }
        Insert: {
          agent_id: string
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string
          user_id: string
          value: number
        }
        Update: {
          agent_id?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      agents: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          system_prompt: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          system_prompt: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          system_prompt?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          filename: string
          id: string
          processed_at: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename: string
          id?: string
          processed_at?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          filename?: string
          id?: string
          processed_at?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      external_integrations: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          id: string
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string
          id?: string
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          id?: string
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcp_servers: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          last_connected_at: string | null
          name: string
          resources: Json | null
          status: string | null
          tools: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          last_connected_at?: string | null
          name: string
          resources?: Json | null
          status?: string | null
          tools?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          last_connected_at?: string | null
          name?: string
          resources?: Json | null
          status?: string | null
          tools?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_agents: {
        Row: {
          activated_at: string
          agent_id: string
          config: Json | null
          id: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          agent_id: string
          config?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          agent_id?: string
          config?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "trader" | "student" | "founder"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["trader", "student", "founder"],
    },
  },
} as const
