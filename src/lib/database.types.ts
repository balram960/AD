export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_styles: string[];
          favorite_colors: string[];
          preferred_seasons: string[];
          preferred_occasions: string[];
          clothing_sizes: Json;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_styles?: string[];
          favorite_colors?: string[];
          preferred_seasons?: string[];
          preferred_occasions?: string[];
          clothing_sizes?: Json;
          bio?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_styles?: string[];
          favorite_colors?: string[];
          preferred_seasons?: string[];
          preferred_occasions?: string[];
          clothing_sizes?: Json;
          bio?: string | null;
          updated_at?: string;
        };
      };
      wardrobe_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          category: string;
          subcategory: string | null;
          primary_color: string | null;
          secondary_colors: string[];
          style: string | null;
          season: string[];
          occasions: string[];
          image_path: string | null;
          image_url: string | null;
          tags: string[];
          brand: string | null;
          size: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wardrobe_items']['Row'], 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
          id?: string;
          user_id?: string;
        };
        Update: Partial<Database['public']['Tables']['wardrobe_items']['Insert']>;
      };
      outfits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          occasion: string | null;
          season: string | null;
          style: string | null;
          notes: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['outfits']['Row'], 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
          id?: string;
          user_id?: string;
        };
        Update: Partial<Database['public']['Tables']['outfits']['Insert']>;
      };
      outfit_items: {
        Row: {
          id: string;
          outfit_id: string;
          wardrobe_item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          outfit_id: string;
          wardrobe_item_id: string;
        };
        Update: never;
      };
      outfit_recommendations: {
        Row: {
          id: string;
          user_id: string;
          outfit_data: Json;
          occasion: string | null;
          season: string | null;
          recommendation_score: number | null;
          explanation: string | null;
          is_saved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          outfit_data: Json;
          occasion?: string | null;
          season?: string | null;
          recommendation_score?: number | null;
          explanation?: string | null;
          is_saved?: boolean;
        };
        Update: Partial<Database['public']['Tables']['outfit_recommendations']['Insert']>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_colors: string[];
          preferred_styles: string[];
          preferred_occasions: string[];
          preferred_seasons: string[];
          budget_range: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          preferred_colors?: string[];
          preferred_styles?: string[];
          preferred_occasions?: string[];
          preferred_seasons?: string[];
          budget_range?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type WardrobeItem = Database['public']['Tables']['wardrobe_items']['Row'];
export type Outfit = Database['public']['Tables']['outfits']['Row'];
export type OutfitItem = Database['public']['Tables']['outfit_items']['Row'];
export type OutfitRecommendation = Database['public']['Tables']['outfit_recommendations']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
