export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      blood_inventory: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          donation_date: string
          donor_id: string | null
          expiry_date: string
          id: string
          location_id: string | null
          location_name: string | null
          status: string
          units: number
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          donation_date: string
          donor_id?: string | null
          expiry_date: string
          id?: string
          location_id?: string | null
          location_name?: string | null
          status?: string
          units: number
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          donation_date?: string
          donor_id?: string | null
          expiry_date?: string
          id?: string
          location_id?: string | null
          location_name?: string | null
          status?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          approval_date: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          fulfillment_date: string | null
          hospital_id: string
          id: string
          notes: string | null
          priority: string
          request_date: string
          status: string
          units: number
        }
        Insert: {
          approval_date?: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          fulfillment_date?: string | null
          hospital_id: string
          id?: string
          notes?: string | null
          priority: string
          request_date?: string
          status?: string
          units: number
        }
        Update: {
          approval_date?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          fulfillment_date?: string | null
          hospital_id?: string
          id?: string
          notes?: string | null
          priority?: string
          request_date?: string
          status?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_responses: {
        Row: {
          category: string
          created_at: string | null
          id: string
          keywords: string[]
          query_pattern: string
          response_text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          keywords: string[]
          query_pattern: string
          response_text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          keywords?: string[]
          query_pattern?: string
          response_text?: string
        }
        Relationships: []
      }
      donation_appointments: {
        Row: {
          appointment_date: string
          center_id: string
          created_at: string
          donor_id: string
          id: string
          notes: string | null
          status: string
          time_slot: string
        }
        Insert: {
          appointment_date: string
          center_id: string
          created_at?: string
          donor_id: string
          id?: string
          notes?: string | null
          status?: string
          time_slot: string
        }
        Update: {
          appointment_date?: string
          center_id?: string
          created_at?: string
          donor_id?: string
          id?: string
          notes?: string | null
          status?: string
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "donation_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_appointments_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_centers: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          id: string
          location_coordinates: Json | null
          name: string
          operating_hours: string | null
          operating_status: string | null
          phone: string
          postal_code: string
          state: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          id?: string
          location_coordinates?: Json | null
          name: string
          operating_hours?: string | null
          operating_status?: string | null
          phone: string
          postal_code: string
          state: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          location_coordinates?: Json | null
          name?: string
          operating_hours?: string | null
          operating_status?: string | null
          phone?: string
          postal_code?: string
          state?: string
        }
        Relationships: []
      }
      donor_profiles: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string
          eligible_to_donate: boolean
          id: string
          last_donation_date: string | null
          medical_history: Json | null
          user_id: string
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          eligible_to_donate?: boolean
          id?: string
          last_donation_date?: string | null
          medical_history?: Json | null
          user_id: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string
          eligible_to_donate?: boolean
          id?: string
          last_donation_date?: string | null
          medical_history?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      email_configuration: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          sender_email: string
          service_name: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          sender_email: string
          service_name: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sender_email?: string
          service_name?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          city: string
          contact_person: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          postal_code: string
          state: string
        }
        Insert: {
          address: string
          city: string
          contact_person?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          postal_code: string
          state: string
        }
        Update: {
          address?: string
          city?: string
          contact_person?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          postal_code?: string
          state?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"] | null
          created_at: string
          event_type: string
          id: string
          is_bulk: boolean
          message: string
          recipient_id: string
          sent_at: string
          status: string
          subject: string | null
          units: number | null
        }
        Insert: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          event_type: string
          id?: string
          is_bulk?: boolean
          message: string
          recipient_id: string
          sent_at?: string
          status?: string
          subject?: string | null
          units?: number | null
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          event_type?: string
          id?: string
          is_bulk?: boolean
          message?: string
          recipient_id?: string
          sent_at?: string
          status?: string
          subject?: string | null
          units?: number | null
        }
        Relationships: []
      }
      predictive_demand: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          id: string
          last_updated: string | null
          medium_term_demand: number
          short_term_demand: number
          urgency_level: string
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          id?: string
          last_updated?: string | null
          medium_term_demand: number
          short_term_demand: number
          urgency_level: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          id?: string
          last_updated?: string | null
          medium_term_demand?: number
          short_term_demand?: number
          urgency_level?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          app: boolean
          bulk_notifications: boolean
          created_at: string
          email: boolean
          id: string
          sms: boolean
          user_id: string
        }
        Insert: {
          app?: boolean
          bulk_notifications?: boolean
          created_at?: string
          email?: boolean
          id?: string
          sms?: boolean
          user_id: string
        }
        Update: {
          app?: boolean
          bulk_notifications?: boolean
          created_at?: string
          email?: boolean
          id?: string
          sms?: boolean
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
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      request_status: "pending" | "approved" | "rejected" | "fulfilled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      request_status: ["pending", "approved", "rejected", "fulfilled"],
    },
  },
} as const
