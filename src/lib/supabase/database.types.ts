export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          role: Database['public']['Enums']['user_role'];
          status: string;
          profile_image_url: string | null;
          kvkk_accepted_at: string | null;
          created_at: string;
          updated_at: string;
          national_id: string | null;
          member_no: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['user_status'];
          kvkk_accepted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'USER' | 'DRIVER' | 'PLATE_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
      user_status: 'ACTIVE' | 'PASSIVE' | 'PENDING_VERIFICATION';
    };
    CompositeTypes: Record<string, never>;
  };
};
