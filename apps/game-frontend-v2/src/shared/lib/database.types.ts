/**
 * Database types for Supabase
 * These types should be regenerated using the Supabase CLI when the schema changes:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          tier: "free" | "creator" | "pro";
          is_verified: boolean;
          is_featured: boolean;
          ai_credits: number;
          total_tips_received: number;
          openrouter_api_key: string | null;
          default_model_smart: string;
          default_model_cheap: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          tier?: "free" | "creator" | "pro";
          is_verified?: boolean;
          is_featured?: boolean;
          ai_credits?: number;
          total_tips_received?: number;
          openrouter_api_key?: string | null;
          default_model_smart?: string;
          default_model_cheap?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          tier?: "free" | "creator" | "pro";
          is_verified?: boolean;
          is_featured?: boolean;
          ai_credits?: number;
          total_tips_received?: number;
          openrouter_api_key?: string | null;
          default_model_smart?: string;
          default_model_cheap?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          email_notifications: boolean;
          push_notifications: boolean;
          notification_new_follower: boolean;
          notification_new_content: boolean;
          notification_comments: boolean;
          notification_likes: boolean;
          theme: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          notification_new_follower?: boolean;
          notification_new_content?: boolean;
          notification_comments?: boolean;
          notification_likes?: boolean;
          theme?: string;
          updated_at?: string;
        };
        Update: {
          email_notifications?: boolean;
          push_notifications?: boolean;
          notification_new_follower?: boolean;
          notification_new_content?: boolean;
          notification_comments?: boolean;
          notification_likes?: boolean;
          theme?: string;
          updated_at?: string;
        };
      };
      universes: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          theme: string;
          visibility: "private" | "unlisted" | "public";
          is_published: boolean;
          published_at: string | null;
          data: Json;
          version: number;
          is_premium: boolean;
          price_credits: number;
          tags: string[];
          genre: string | null;
          difficulty: "easy" | "medium" | "hard" | "expert" | null;
          estimated_playtime_minutes: number | null;
          like_count: number;
          comment_count: number;
          play_count: number;
          bookmark_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description: string;
          theme: string;
          visibility?: "private" | "unlisted" | "public";
          is_published?: boolean;
          published_at?: string | null;
          data: Json;
          version?: number;
          is_premium?: boolean;
          price_credits?: number;
          tags?: string[];
          genre?: string | null;
          difficulty?: "easy" | "medium" | "hard" | "expert" | null;
          estimated_playtime_minutes?: number | null;
          like_count?: number;
          comment_count?: number;
          play_count?: number;
          bookmark_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string;
          name?: string;
          description?: string;
          theme?: string;
          visibility?: "private" | "unlisted" | "public";
          is_published?: boolean;
          published_at?: string | null;
          data?: Json;
          version?: number;
          is_premium?: boolean;
          price_credits?: number;
          tags?: string[];
          genre?: string | null;
          difficulty?: "easy" | "medium" | "hard" | "expert" | null;
          estimated_playtime_minutes?: number | null;
          like_count?: number;
          comment_count?: number;
          play_count?: number;
          bookmark_count?: number;
          updated_at?: string;
        };
      };
      game_saves: {
        Row: {
          id: string;
          user_id: string;
          universe_id: string;
          universe_version: number;
          name: string;
          slot: number;
          state: Json;
          play_time_seconds: number;
          moments_lived: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          universe_id: string;
          universe_version: number;
          name?: string;
          slot?: number;
          state: Json;
          play_time_seconds?: number;
          moments_lived?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          universe_id?: string;
          universe_version?: number;
          name?: string;
          slot?: number;
          state?: Json;
          play_time_seconds?: number;
          moments_lived?: number;
          updated_at?: string;
        };
      };
      play_history: {
        Row: {
          id: string;
          user_id: string;
          universe_id: string;
          last_save_id: string | null;
          play_time_seconds: number;
          completed: boolean;
          last_played_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          universe_id: string;
          last_save_id?: string | null;
          play_time_seconds?: number;
          completed?: boolean;
          last_played_at?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          universe_id?: string;
          last_save_id?: string | null;
          play_time_seconds?: number;
          completed?: boolean;
          last_played_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          target_type: "universe" | "shared_content" | "comment";
          target_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "universe" | "shared_content" | "comment";
          target_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          target_type?: "universe" | "shared_content" | "comment";
          target_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          target_type: "universe" | "shared_content";
          target_id: string;
          parent_id: string | null;
          content: string;
          is_edited: boolean;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "universe" | "shared_content";
          target_id: string;
          parent_id?: string | null;
          content: string;
          is_edited?: boolean;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          target_type?: "universe" | "shared_content";
          target_id?: string;
          parent_id?: string | null;
          content?: string;
          is_edited?: boolean;
          like_count?: number;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          universe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          universe_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          universe_id?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "new_follower"
            | "new_like"
            | "new_comment"
            | "new_reply"
            | "new_content"
            | "tip_received"
            | "universe_update";
          actor_id: string | null;
          target_type: string | null;
          target_id: string | null;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "new_follower"
            | "new_like"
            | "new_comment"
            | "new_reply"
            | "new_content"
            | "tip_received"
            | "universe_update";
          actor_id?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          type?:
            | "new_follower"
            | "new_like"
            | "new_comment"
            | "new_reply"
            | "new_content"
            | "tip_received"
            | "universe_update";
          actor_id?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          data?: Json | null;
          is_read?: boolean;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type:
            | "purchase"
            | "subscription"
            | "tip_sent"
            | "tip_received"
            | "ai_usage"
            | "content_purchase"
            | "content_sale"
            | "bonus";
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type:
            | "purchase"
            | "subscription"
            | "tip_sent"
            | "tip_received"
            | "ai_usage"
            | "content_purchase"
            | "content_sale"
            | "bonus";
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          amount?: number;
          type?:
            | "purchase"
            | "subscription"
            | "tip_sent"
            | "tip_received"
            | "ai_usage"
            | "content_purchase"
            | "content_sale"
            | "bonus";
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
        };
      };
      tips: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          amount: number;
          universe_id: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          amount: number;
          universe_id?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          sender_id?: string;
          receiver_id?: string;
          amount?: number;
          universe_id?: string | null;
          message?: string | null;
        };
      };
      content_purchases: {
        Row: {
          id: string;
          user_id: string;
          universe_id: string;
          price_paid: number;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          universe_id: string;
          price_paid: number;
          purchased_at?: string;
        };
        Update: {
          user_id?: string;
          universe_id?: string;
          price_paid?: number;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: "creator" | "pro";
          status: "active" | "cancelled" | "expired";
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: "creator" | "pro";
          status: "active" | "cancelled" | "expired";
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tier?: "creator" | "pro";
          status?: "active" | "cancelled" | "expired";
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
      shared_content: {
        Row: {
          id: string;
          owner_id: string;
          content_type:
            | "character"
            | "location"
            | "item"
            | "challenge"
            | "moment";
          name: string;
          description: string | null;
          data: Json;
          visibility: "private" | "unlisted" | "public";
          is_published: boolean;
          published_at: string | null;
          tags: string[];
          like_count: number;
          use_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          content_type:
            | "character"
            | "location"
            | "item"
            | "challenge"
            | "moment";
          name: string;
          description?: string | null;
          data: Json;
          visibility?: "private" | "unlisted" | "public";
          is_published?: boolean;
          published_at?: string | null;
          tags?: string[];
          like_count?: number;
          use_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string;
          content_type?:
            | "character"
            | "location"
            | "item"
            | "challenge"
            | "moment";
          name?: string;
          description?: string | null;
          data?: Json;
          visibility?: "private" | "unlisted" | "public";
          is_published?: boolean;
          published_at?: string | null;
          tags?: string[];
          like_count?: number;
          use_count?: number;
          updated_at?: string;
        };
      };
      universe_versions: {
        Row: {
          id: string;
          universe_id: string;
          version: number;
          data: Json;
          changelog: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          universe_id: string;
          version: number;
          data: Json;
          changelog?: string | null;
          created_at?: string;
        };
        Update: {
          universe_id?: string;
          version?: number;
          data?: Json;
          changelog?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
