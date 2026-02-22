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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          can_generate_content: boolean
          can_manage_affiliates: boolean
          can_manage_articles: boolean
          can_manage_email_templates: boolean
          can_manage_image_library: boolean
          can_manage_image_queue: boolean
          can_manage_messages: boolean
          can_manage_newsletter: boolean
          can_manage_settings: boolean
          can_manage_users: boolean
          can_manage_videos: boolean | null
          can_use_autopilot: boolean
          can_use_video_autopilot: boolean
          created_at: string
          id: string
          is_super_admin: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          can_generate_content?: boolean
          can_manage_affiliates?: boolean
          can_manage_articles?: boolean
          can_manage_email_templates?: boolean
          can_manage_image_library?: boolean
          can_manage_image_queue?: boolean
          can_manage_messages?: boolean
          can_manage_newsletter?: boolean
          can_manage_settings?: boolean
          can_manage_users?: boolean
          can_manage_videos?: boolean | null
          can_use_autopilot?: boolean
          can_use_video_autopilot?: boolean
          created_at?: string
          id?: string
          is_super_admin?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          can_generate_content?: boolean
          can_manage_affiliates?: boolean
          can_manage_articles?: boolean
          can_manage_email_templates?: boolean
          can_manage_image_library?: boolean
          can_manage_image_queue?: boolean
          can_manage_messages?: boolean
          can_manage_newsletter?: boolean
          can_manage_settings?: boolean
          can_manage_users?: boolean
          can_manage_videos?: boolean | null
          can_use_autopilot?: boolean
          can_use_video_autopilot?: boolean
          created_at?: string
          id?: string
          is_super_admin?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_banner_clicks: {
        Row: {
          article_id: string
          clicked_at: string
          id: string
          ip_hash: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          article_id: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          article_id?: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      article_images: {
        Row: {
          article_id: string | null
          created_at: string | null
          file_size: number | null
          format: string | null
          height: number | null
          id: string
          image_index: number | null
          image_type: string
          original_prompt: string | null
          public_url: string
          storage_path: string
          width: number | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          file_size?: number | null
          format?: string | null
          height?: number | null
          id?: string
          image_index?: number | null
          image_type: string
          original_prompt?: string | null
          public_url: string
          storage_path: string
          width?: number | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          file_size?: number | null
          format?: string | null
          height?: number | null
          id?: string
          image_index?: number | null
          image_type?: string
          original_prompt?: string | null
          public_url?: string
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "article_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          ip_hash: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          ip_hash: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          ip_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          id: string
          ip_hash: string | null
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          ip_hash?: string | null
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          ip_hash?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auto_generation_config: {
        Row: {
          daily_limit: number
          enabled: boolean
          id: string
          publish_immediately: boolean
          topics: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          daily_limit?: number
          enabled?: boolean
          id?: string
          publish_immediately?: boolean
          topics?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          daily_limit?: number
          enabled?: boolean
          id?: string
          publish_immediately?: boolean
          topics?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      auto_generation_logs: {
        Row: {
          article_id: string | null
          duration_ms: number | null
          error_message: string | null
          executed_at: string
          id: string
          status: string
          topic_used: string
        }
        Insert: {
          article_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          status?: string
          topic_used: string
        }
        Update: {
          article_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          status?: string
          topic_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_generation_logs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_generation_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          time_slot: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          time_slot: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          time_slot?: string
        }
        Relationships: []
      }
      commemorative_date_settings: {
        Row: {
          date_id: string
          id: string
          is_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          date_id: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          date_id?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_message_replies: {
        Row: {
          id: string
          is_ai_generated: boolean | null
          message_id: string
          replied_at: string
          replied_by: string
          reply_text: string
          sent_via_email: boolean | null
        }
        Insert: {
          id?: string
          is_ai_generated?: boolean | null
          message_id: string
          replied_at?: string
          replied_by: string
          reply_text: string
          sent_via_email?: boolean | null
        }
        Update: {
          id?: string
          is_ai_generated?: boolean | null
          message_id?: string
          replied_at?: string
          replied_by?: string
          reply_text?: string
          sent_via_email?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_message_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_reply_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_articles: {
        Row: {
          affiliate_banner_enabled: boolean | null
          affiliate_banner_image: string | null
          affiliate_banner_image_mobile: string | null
          affiliate_banner_url: string | null
          affiliate_clicks_count: number
          author_id: string
          body: string | null
          category: string | null
          category_slug: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          external_links: Json | null
          gallery_images: Json | null
          gallery_prompts: Json | null
          id: string
          keywords: string | null
          likes_count: number
          main_subject: string | null
          published_at: string | null
          read_time: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          visual_context: string | null
        }
        Insert: {
          affiliate_banner_enabled?: boolean | null
          affiliate_banner_image?: string | null
          affiliate_banner_image_mobile?: string | null
          affiliate_banner_url?: string | null
          affiliate_clicks_count?: number
          author_id: string
          body?: string | null
          category?: string | null
          category_slug?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_links?: Json | null
          gallery_images?: Json | null
          gallery_prompts?: Json | null
          id?: string
          keywords?: string | null
          likes_count?: number
          main_subject?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          visual_context?: string | null
        }
        Update: {
          affiliate_banner_enabled?: boolean | null
          affiliate_banner_image?: string | null
          affiliate_banner_image_mobile?: string | null
          affiliate_banner_url?: string | null
          affiliate_clicks_count?: number
          author_id?: string
          body?: string | null
          category?: string | null
          category_slug?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_links?: Json | null
          gallery_images?: Json | null
          gallery_prompts?: Json | null
          id?: string
          keywords?: string | null
          likes_count?: number
          main_subject?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          visual_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          html_template: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          article_id: string | null
          article_title: string | null
          created_at: string
          id: string
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          article_title?: string | null
          created_at?: string
          id?: string
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          article_title?: string | null
          created_at?: string
          id?: string
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_backup_logs: {
        Row: {
          backed_up: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          failed: number
          id: string
          status: string
          total_images: number
        }
        Insert: {
          backed_up?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          failed?: number
          id?: string
          status?: string
          total_images?: number
        }
        Update: {
          backed_up?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          failed?: number
          id?: string
          status?: string
          total_images?: number
        }
        Relationships: []
      }
      image_generation_queue: {
        Row: {
          article_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          image_index: number | null
          image_type: string
          max_retries: number | null
          metadata: Json | null
          next_retry_at: string | null
          priority: number | null
          prompt: string
          result_url: string | null
          retry_count: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_index?: number | null
          image_type: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: number | null
          prompt: string
          result_url?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_index?: number | null
          image_type?: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: number | null
          prompt?: string
          result_url?: string | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_generation_queue_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_email_tracking: {
        Row: {
          clicked_at: string | null
          id: string
          opened_at: string | null
          send_history_id: string
          sent_at: string | null
          status: string
          subscriber_email: string
          tracking_token: string
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          opened_at?: string | null
          send_history_id: string
          sent_at?: string | null
          status?: string
          subscriber_email: string
          tracking_token?: string
        }
        Update: {
          clicked_at?: string | null
          id?: string
          opened_at?: string | null
          send_history_id?: string
          sent_at?: string | null
          status?: string
          subscriber_email?: string
          tracking_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_email_tracking_send_history_id_fkey"
            columns: ["send_history_id"]
            isOneToOne: false
            referencedRelation: "newsletter_send_history"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_send_history: {
        Row: {
          article_id: string | null
          article_slug: string | null
          article_title: string
          clicked_count: number
          error_message: string | null
          failed_sends: number
          id: string
          opened_count: number
          sent_at: string
          sent_by: string | null
          status: string
          successful_sends: number
          total_recipients: number
        }
        Insert: {
          article_id?: string | null
          article_slug?: string | null
          article_title: string
          clicked_count?: number
          error_message?: string | null
          failed_sends?: number
          id?: string
          opened_count?: number
          sent_at?: string
          sent_by?: string | null
          status?: string
          successful_sends?: number
          total_recipients?: number
        }
        Update: {
          article_id?: string | null
          article_slug?: string | null
          article_title?: string
          clicked_count?: number
          error_message?: string | null
          failed_sends?: number
          id?: string
          opened_count?: number
          sent_at?: string
          sent_by?: string | null
          status?: string
          successful_sends?: number
          total_recipients?: number
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          ip_hash: string | null
          is_active: boolean
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_hash?: string | null
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_hash?: string | null
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      get_cron_job_history: {
        Args: never
        Returns: {
          duration_ms: number
          end_time: string
          job_pid: number
          return_message: string
          runid: number
          start_time: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_likes: {
        Args: { p_article_id: string; p_ip_hash: string }
        Returns: number
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      register_affiliate_click: {
        Args: {
          p_article_id: string
          p_ip_hash: string
          p_referrer?: string
          p_user_agent?: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
