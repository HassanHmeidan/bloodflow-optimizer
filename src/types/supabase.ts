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
      blood_inventory: {
        Row: {
          id: string
          blood_type: string
          units: number
          expiry_date: string
          donation_date: string
          donor_id: string | null
          location_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          blood_type: string
          units: number
          expiry_date: string
          donation_date: string
          donor_id?: string | null
          location_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          blood_type?: string
          units?: number
          expiry_date?: string
          donation_date?: string
          donor_id?: string | null
          location_id?: string | null
          status?: string
          created_at?: string
        }
      }
      blood_requests: {
        Row: {
          id: string
          hospital_id: string
          blood_type: string
          units: number
          priority: string
          status: string
          request_date: string
          approval_date: string | null
          fulfillment_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hospital_id: string
          blood_type: string
          units: number
          priority: string
          status?: string
          request_date?: string
          approval_date?: string | null
          fulfillment_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hospital_id?: string
          blood_type?: string
          units?: number
          priority?: string
          status?: string
          request_date?: string
          approval_date?: string | null
          fulfillment_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      donation_centers: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email: string | null
          operating_hours: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email?: string | null
          operating_hours?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          email?: string | null
          operating_hours?: string | null
          created_at?: string
        }
      }
      donor_profiles: {
        Row: {
          id: string
          user_id: string
          blood_type: string
          last_donation_date: string | null
          eligible_to_donate: boolean
          medical_history: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blood_type: string
          last_donation_date?: string | null
          eligible_to_donate?: boolean
          medical_history?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blood_type?: string
          last_donation_date?: string | null
          eligible_to_donate?: boolean
          medical_history?: Json | null
          created_at?: string
        }
      }
      donation_appointments: {
        Row: {
          id: string
          donor_id: string
          center_id: string
          appointment_date: string
          time_slot: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          center_id: string
          appointment_date: string
          time_slot: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          center_id?: string
          appointment_date?: string
          time_slot?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          subject: string | null
          message: string
          event_type: string
          blood_type: string | null
          units: number | null
          is_bulk: boolean
          status: string
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          subject?: string | null
          message: string
          event_type: string
          blood_type?: string | null
          units?: number | null
          is_bulk?: boolean
          status?: string
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          subject?: string | null
          message?: string
          event_type?: string
          blood_type?: string | null
          units?: number | null
          is_bulk?: boolean
          status?: string
          sent_at?: string
          created_at?: string
        }
      }
      user_notification_preferences: {
        Row: {
          id: string
          user_id: string
          email: boolean
          sms: boolean
          app: boolean
          bulk_notifications: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: boolean
          sms?: boolean
          app?: boolean
          bulk_notifications?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: boolean
          sms?: boolean
          app?: boolean
          bulk_notifications?: boolean
          created_at?: string
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email: string
          contact_person: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          postal_code: string
          phone: string
          email: string
          contact_person?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          email?: string
          contact_person?: string | null
          created_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          setting_name: string
          setting_value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          setting_name: string
          setting_value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          setting_name?: string
          setting_value?: Json
          description?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
          email: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
