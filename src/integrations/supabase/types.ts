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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string
          city: string
          created_at: string
          house: string
          id: string
          is_default: boolean
          label: string
          landmark: string | null
          lat: number | null
          lng: number | null
          phone: string
          pincode: string
          receiver_name: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: string
          city: string
          created_at?: string
          house: string
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          phone: string
          pincode: string
          receiver_name: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string
          city?: string
          created_at?: string
          house?: string
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string
          pincode?: string
          receiver_name?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "BHOOMix ai": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      booomixspace: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          image: string
          price: number
          product_id: number
          product_name: string
          product_name_hi: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          price: number
          product_id: number
          product_name: string
          product_name_hi: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          price?: number
          product_id?: number
          product_name?: string
          product_name_hi?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_id: string | null
          assigned_partner: string | null
          created_at: string
          delivery_address: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          items: Json
          order_number: string
          phone_number: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          assigned_partner?: string | null
          created_at?: string
          delivery_address?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          items: Json
          order_number: string
          phone_number?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          assigned_partner?: string | null
          created_at?: string
          delivery_address?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          items?: Json
          order_number?: string
          phone_number?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean | null
          phone_number: string | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          phone: string | null
          phone_verified: boolean
          account_type: 'farmer' | 'buyer' | 'partner' | 'manager' | 'admin'
          preferred_language: string
          city: string | null
          district: string | null
          state: string | null
          pincode: string | null
          onboarded_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      farm_profiles: {
        Row: {
          id: string
          user_id: string
          farm_type: 'rural' | 'peri_urban' | 'urban'
          growing_method: string
          total_area: number | null
          area_unit: string
          soil_type: string | null
          irrigation: string | null
          state: string | null
          district: string | null
          village: string | null
          pincode: string | null
          lat: number | null
          lng: number | null
          kisan_id: string | null
          aadhaar_linked: boolean
          has_soil_card: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          land_size_acres?: number | null
          crops_grown?: string[] | null
          soil_type?: string | null
          irrigation?: string | null
          state?: string | null
          district?: string | null
          village?: string | null
          pincode?: string | null
          lat?: number | null
          lng?: number | null
          kisan_id?: string | null
          aadhaar_linked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          land_size_acres?: number | null
          crops_grown?: string[] | null
          soil_type?: string | null
          irrigation?: string | null
          state?: string | null
          district?: string | null
          village?: string | null
          pincode?: string | null
          lat?: number | null
          lng?: number | null
          kisan_id?: string | null
          aadhaar_linked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Hand-corrected against supabase/migrations/20260808000100_schema.sql
      // and 20260808000000_schema_enums.sql (2026-09-08): the generator's
      // output predated that migration and disagreed with it in three ways
      // that all surfaced as real `tsc` errors in useDiagnoses.ts —
      //   - the column is `treatment`, not `treatment_text`
      //   - severity_level is 'none'|'low'|'medium'|'high'|'critical'
      //     ('none' is the column's own DEFAULT, and was missing here)
      //   - treatment_outcome includes 'not_treated', which was missing here
      // `plot_id`/`cycle_id` were absent from the generated type entirely.
      // No project has run `supabase gen types` since; regenerate for real
      // once there is a live database to point it at.
      crop_diagnoses: {
        Row: {
          id: string
          user_id: string
          plot_id: string | null
          cycle_id: string | null
          crop_name: string | null
          image_url: string | null
          disease_name: string | null
          disease_name_hi: string | null
          confidence: number | null
          severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
          treatment: string | null
          treatment_hi: string | null
          is_healthy: boolean
          lat: number | null
          lng: number | null
          state: string | null
          district: string | null
          outcome: 'cured' | 'improved' | 'no_change' | 'worsened' | 'not_treated' | null
          outcome_notes: string | null
          outcome_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plot_id?: string | null
          cycle_id?: string | null
          crop_name?: string | null
          image_url?: string | null
          disease_name?: string | null
          disease_name_hi?: string | null
          confidence?: number | null
          severity?: 'none' | 'low' | 'medium' | 'high' | 'critical'
          treatment?: string | null
          treatment_hi?: string | null
          is_healthy?: boolean
          lat?: number | null
          lng?: number | null
          state?: string | null
          district?: string | null
          outcome?: 'cured' | 'improved' | 'no_change' | 'worsened' | 'not_treated' | null
          outcome_notes?: string | null
          outcome_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plot_id?: string | null
          cycle_id?: string | null
          crop_name?: string | null
          image_url?: string | null
          disease_name?: string | null
          disease_name_hi?: string | null
          confidence?: number | null
          severity?: 'none' | 'low' | 'medium' | 'high' | 'critical'
          treatment?: string | null
          treatment_hi?: string | null
          is_healthy?: boolean
          lat?: number | null
          lng?: number | null
          state?: string | null
          district?: string | null
          outcome?: 'cured' | 'improved' | 'no_change' | 'worsened' | 'not_treated' | null
          outcome_notes?: string | null
          outcome_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      damage_reports: {
        Row: {
          id: string
          user_id: string
          crop_name: string | null
          cause_of_loss: string | null
          area_affected: string | null
          lat: number | null
          lng: number | null
          state: string | null
          district: string | null
          photo_urls: string[]
          first_photo_at: string | null
          rainfall_json: Json | null
          status: 'draft' | 'submitted' | 'acknowledged' | 'approved' | 'rejected'
          insurer_name: string | null
          policy_number: string | null
          claim_reference: string | null
          submitted_at: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crop_name?: string | null
          cause_of_loss?: string | null
          area_affected?: string | null
          lat?: number | null
          lng?: number | null
          state?: string | null
          district?: string | null
          photo_urls?: string[]
          first_photo_at?: string | null
          rainfall_json?: Json | null
          status?: 'draft' | 'submitted' | 'acknowledged' | 'approved' | 'rejected'
          insurer_name?: string | null
          policy_number?: string | null
          claim_reference?: string | null
          submitted_at?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crop_name?: string | null
          cause_of_loss?: string | null
          area_affected?: string | null
          lat?: number | null
          lng?: number | null
          state?: string | null
          district?: string | null
          photo_urls?: string[]
          first_photo_at?: string | null
          rainfall_json?: Json | null
          status?: 'draft' | 'submitted' | 'acknowledged' | 'approved' | 'rejected'
          insurer_name?: string | null
          policy_number?: string | null
          claim_reference?: string | null
          submitted_at?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      kisan_help_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          messages: Json
          topic: string | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          messages?: Json
          topic?: string | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          messages?: Json
          topic?: string | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          title_hi: string | null
          body: string
          body_hi: string | null
          link: string | null
          is_read: boolean
          ref_table: string | null
          ref_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          title_hi?: string | null
          body: string
          body_hi?: string | null
          link?: string | null
          is_read?: boolean
          ref_table?: string | null
          ref_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          title_hi?: string | null
          body?: string
          body_hi?: string | null
          link?: string | null
          is_read?: boolean
          ref_table?: string | null
          ref_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          id: string
          user_id: string
          catalogue: 'agri_market' | 'kisan_mart'
          product_id: number
          product_name: string
          rating: number
          review_text: string | null
          review_text_hi: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          catalogue: 'agri_market' | 'kisan_mart'
          product_id: number
          product_name: string
          rating: number
          review_text?: string | null
          review_text_hi?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          catalogue?: 'agri_market' | 'kisan_mart'
          product_id?: number
          product_name?: string
          rating?: number
          review_text?: string | null
          review_text_hi?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          name_hi: string | null
          category: 'general' | 'seeds' | 'fertiliser' | 'pesticide' | 'equipment' | 'vet'
          address: string
          city: string
          state: string
          pincode: string | null
          phone: string | null
          open_hours: string | null
          lat: number
          lng: number
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          name_hi?: string | null
          category?: 'general' | 'seeds' | 'fertiliser' | 'pesticide' | 'equipment' | 'vet'
          address: string
          city: string
          state: string
          pincode?: string | null
          phone?: string | null
          open_hours?: string | null
          lat: number
          lng: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          name_hi?: string | null
          category?: 'general' | 'seeds' | 'fertiliser' | 'pesticide' | 'equipment' | 'vet'
          address?: string
          city?: string
          state?: string
          pincode?: string | null
          phone?: string | null
          open_hours?: string | null
          lat?: number
          lng?: number
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string | null
          region: string | null
          employee_code: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          region?: string | null
          employee_code?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          region?: string | null
          employee_code?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_audit: {
        Row: {
          id: string
          actor_id: string | null
          actor_role: string
          action: 'create' | 'activate' | 'deactivate' | 'update' | 'delete'
          target_user_id: string | null
          target_role: string | null
          target_email: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_role: string
          action: 'create' | 'activate' | 'deactivate' | 'update' | 'delete'
          target_user_id?: string | null
          target_role?: string | null
          target_email?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          actor_role?: string
          action?: 'create' | 'activate' | 'deactivate' | 'update' | 'delete'
          target_user_id?: string | null
          target_role?: string | null
          target_email?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      product_avg_ratings: {
        Row: {
          catalogue: string | null
          product_id: number | null
          review_count: number | null
          avg_rating: number | null
        }
        Relationships: []
      }
      staff_roster: {
        Row: {
          user_id: string | null
          role: string | null
          full_name: string | null
          phone: string | null
          region: string | null
          employee_code: string | null
          is_active: boolean | null
          created_by: string | null
          created_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_partner_orders: {
        Args: never
        Returns: {
          assigned_partner: string
          created_at: string
          delivery_address: string
          gps_lat: number
          gps_lng: number
          id: string
          items: Json
          order_number: string
          phone_number: string
          status: string
          total_amount: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: Record<never, never>; Returns: boolean }
      is_manager: { Args: Record<never, never>; Returns: boolean }
      my_role: { Args: Record<never, never>; Returns: string }
      is_partner: { Args: { check_user_id: string }; Returns: boolean }
      my_unread_notification_count: { Args: Record<never, never>; Returns: number }
      nearby_shops: {
        Args: { p_lat: number; p_lng: number; radius_km?: number; max_rows?: number }
        Returns: {
          id: string
          owner_id: string | null
          name: string
          name_hi: string | null
          category: string
          address: string
          city: string
          state: string
          pincode: string | null
          phone: string | null
          open_hours: string | null
          lat: number
          lng: number
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "manager" | "partner"
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
      // Was missing the two roles added by
      // 20260808000000_schema_enums.sql (`ALTER TYPE ... ADD VALUE`).
      app_role: ["admin", "moderator", "user", "manager", "partner"],
    },
  },
} as const
