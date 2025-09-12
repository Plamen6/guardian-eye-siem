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
      alert_events: {
        Row: {
          alert_id: string | null
          created_at: string
          event_id: string | null
          id: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          assigned_to: string | null
          correlation_data: Json | null
          count: number
          created_at: string
          entity_keys: string[] | null
          id: string
          notes: string | null
          resolution: string | null
          rule_id: string | null
          rule_title: string
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["alert_status"]
          timestamp_first: string
          timestamp_last: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          correlation_data?: Json | null
          count?: number
          created_at?: string
          entity_keys?: string[] | null
          id?: string
          notes?: string | null
          resolution?: string | null
          rule_id?: string | null
          rule_title: string
          severity: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"]
          timestamp_first: string
          timestamp_last: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          correlation_data?: Json | null
          count?: number
          created_at?: string
          entity_keys?: string[] | null
          id?: string
          notes?: string | null
          resolution?: string | null
          rule_id?: string | null
          rule_title?: string
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"]
          timestamp_first?: string
          timestamp_last?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
      connectors: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          name: string
          state: Json
          type: Database["public"]["Enums"]["connector_type"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name: string
          state?: Json
          type: Database["public"]["Enums"]["connector_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          name?: string
          state?: Json
          type?: Database["public"]["Enums"]["connector_type"]
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          destination_ip: unknown | null
          destination_port: number | null
          dns_question_name: string | null
          event_action: string | null
          event_dataset: string | null
          event_id: string | null
          event_outcome: Database["public"]["Enums"]["event_outcome"] | null
          event_severity: Database["public"]["Enums"]["severity_level"] | null
          file_name: string | null
          host_ip: unknown | null
          host_name: string | null
          http_request_method: string | null
          http_request_url: string | null
          id: string
          ingest_connector_id: string | null
          ingest_source: string | null
          metadata: Json | null
          process_name: string | null
          raw_log: string | null
          source_ip: unknown | null
          source_port: number | null
          timestamp: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          dns_question_name?: string | null
          event_action?: string | null
          event_dataset?: string | null
          event_id?: string | null
          event_outcome?: Database["public"]["Enums"]["event_outcome"] | null
          event_severity?: Database["public"]["Enums"]["severity_level"] | null
          file_name?: string | null
          host_ip?: unknown | null
          host_name?: string | null
          http_request_method?: string | null
          http_request_url?: string | null
          id?: string
          ingest_connector_id?: string | null
          ingest_source?: string | null
          metadata?: Json | null
          process_name?: string | null
          raw_log?: string | null
          source_ip?: unknown | null
          source_port?: number | null
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          destination_ip?: unknown | null
          destination_port?: number | null
          dns_question_name?: string | null
          event_action?: string | null
          event_dataset?: string | null
          event_id?: string | null
          event_outcome?: Database["public"]["Enums"]["event_outcome"] | null
          event_severity?: Database["public"]["Enums"]["severity_level"] | null
          file_name?: string | null
          host_ip?: unknown | null
          host_name?: string | null
          http_request_method?: string | null
          http_request_url?: string | null
          id?: string
          ingest_connector_id?: string | null
          ingest_source?: string | null
          metadata?: Json | null
          process_name?: string | null
          raw_log?: string | null
          source_ip?: unknown | null
          source_port?: number | null
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_ingest_connector_id_fkey"
            columns: ["ingest_connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_tables: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          entries: Json
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entries?: Json
          id?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entries?: Json
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          expression: string | null
          fields: string[] | null
          id: string
          last_triggered: string | null
          level: Database["public"]["Enums"]["severity_level"]
          python_code: string | null
          tags: string[] | null
          threshold: number | null
          timeframe: number | null
          title: string
          trigger_count: number
          type: Database["public"]["Enums"]["rule_type"]
          updated_at: string
          yaml: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          expression?: string | null
          fields?: string[] | null
          id?: string
          last_triggered?: string | null
          level?: Database["public"]["Enums"]["severity_level"]
          python_code?: string | null
          tags?: string[] | null
          threshold?: number | null
          timeframe?: number | null
          title: string
          trigger_count?: number
          type?: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
          yaml?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          expression?: string | null
          fields?: string[] | null
          id?: string
          last_triggered?: string | null
          level?: Database["public"]["Enums"]["severity_level"]
          python_code?: string | null
          tags?: string[] | null
          threshold?: number | null
          timeframe?: number | null
          title?: string
          trigger_count?: number
          type?: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
          yaml?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      alert_status: "open" | "investigating" | "resolved" | "false_positive"
      connector_type:
        | "file_tail"
        | "syslog_udp"
        | "syslog_tcp"
        | "api"
        | "database"
      event_outcome: "success" | "failure" | "unknown"
      rule_type: "sigma" | "cel" | "python"
      severity_level: "critical" | "high" | "medium" | "low" | "informational"
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
      alert_status: ["open", "investigating", "resolved", "false_positive"],
      connector_type: [
        "file_tail",
        "syslog_udp",
        "syslog_tcp",
        "api",
        "database",
      ],
      event_outcome: ["success", "failure", "unknown"],
      rule_type: ["sigma", "cel", "python"],
      severity_level: ["critical", "high", "medium", "low", "informational"],
    },
  },
} as const
