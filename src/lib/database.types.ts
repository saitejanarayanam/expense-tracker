export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          currency: string;
          date_format: string;
          default_view: string;
          theme: string;
          dark_mode: boolean;
          auto_approve_ai: boolean;
          daily_reminder: boolean;
          reminder_time: string | null;
          budget_alerts: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          is_default: boolean;
          monthly_budget: number | null;
          archived: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
        Relationships: [];
      };
      payment_modes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          label: string | null;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payment_modes']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['payment_modes']['Row']>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          upload_date: string;
          parsed_status: string;
          extracted_data: Json | null;
          deleted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['documents']['Row']> & {
          user_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
        };
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          date: string;
          payment_mode: string;
          payment_account_label: string | null;
          vendor: string | null;
          notes: string | null;
          is_recurring: boolean;
          recurrence_interval: string | null;
          source: string;
          ai_confidence: Json | null;
          linked_document_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['expenses']['Row']> & {
          user_id: string;
          amount: number;
          category: string;
          date: string;
          payment_mode: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Row']>;
        Relationships: [];
      };
      saved_reports: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['saved_reports']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['saved_reports']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type PaymentMode = Database['public']['Tables']['payment_modes']['Row'];
export type DocumentRow = Database['public']['Tables']['documents']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type SavedReport = Database['public']['Tables']['saved_reports']['Row'];
