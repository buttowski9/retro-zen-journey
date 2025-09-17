export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quest_assignments: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: string
          main_qod: string | null
          punishment_quests: string[] | null
          small_quests: string[] | null
          user_id: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          main_qod?: string | null
          punishment_quests?: string[] | null
          small_quests?: string[] | null
          user_id?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          main_qod?: string | null
          punishment_quests?: string[] | null
          small_quests?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_quest_assignments_main_qod_fkey"
            columns: ["main_qod"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_quest_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_punishment: boolean | null
          quest_category: string | null
          requires_validation: boolean | null
          title: string
          type: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_punishment?: boolean | null
          quest_category?: string | null
          requires_validation?: boolean | null
          title: string
          type?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_punishment?: boolean | null
          quest_category?: string | null
          requires_validation?: boolean | null
          title?: string
          type?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      user_inputs: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          question: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_inputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quests: {
        Row: {
          assigned_date: string | null
          completed_at: string | null
          id: string
          is_main_qod: boolean | null
          quest_id: string | null
          status: string | null
          streak_count: number | null
          user_id: string | null
          validation_status: string | null
        }
        Insert: {
          assigned_date?: string | null
          completed_at?: string | null
          id?: string
          is_main_qod?: boolean | null
          quest_id?: string | null
          status?: string | null
          streak_count?: number | null
          user_id?: string | null
          validation_status?: string | null
        }
        Update: {
          assigned_date?: string | null
          completed_at?: string | null
          id?: string
          is_main_qod?: boolean | null
          quest_id?: string | null
          status?: string | null
          streak_count?: number | null
          user_id?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          daily_availability: string | null
          email: string | null
          happy_activities: string[] | null
          id: string
          level: number | null
          lifestyle_habits: string[] | null
          motivation_style: string | null
          name: string | null
          onboarding_completed: boolean | null
          preferred_quest_types: string[] | null
          stress_level: number | null
          wellness_goals: string[] | null
          xp_points: number | null
        }
        Insert: {
          created_at?: string | null
          daily_availability?: string | null
          email?: string | null
          happy_activities?: string[] | null
          id?: string
          level?: number | null
          lifestyle_habits?: string[] | null
          motivation_style?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_quest_types?: string[] | null
          stress_level?: number | null
          wellness_goals?: string[] | null
          xp_points?: number | null
        }
        Update: {
          created_at?: string | null
          daily_availability?: string | null
          email?: string | null
          happy_activities?: string[] | null
          id?: string
          level?: number | null
          lifestyle_habits?: string[] | null
          motivation_style?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_quest_types?: string[] | null
          stress_level?: number | null
          wellness_goals?: string[] | null
          xp_points?: number | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          created_at: string | null
          id: string
          quest_id: string | null
          transaction_type: string
          user_id: string | null
          xp_change: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          quest_id?: string | null
          transaction_type: string
          user_id?: string | null
          xp_change: number
        }
        Update: {
          created_at?: string | null
          id?: string
          quest_id?: string | null
          transaction_type?: string
          user_id?: string | null
          xp_change?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_daily_quests_to_user: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      assign_personalized_daily_quests: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
