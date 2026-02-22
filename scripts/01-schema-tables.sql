-- ============================================================================
-- HOME GARDEN MANUAL - MIGRATION SCRIPT 01/05
-- TABLES (Extensions, Enums, and All 25 Tables)
-- ============================================================================
-- Execute this FIRST in the new Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

-- Enable required extensions (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Note: pg_cron must be enabled via Supabase Dashboard

-- ============================================================================
-- SECTION 2: CUSTOM TYPES (ENUMS)
-- ============================================================================

-- App role enum for user permissions
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- SECTION 3: TABLES (25 Tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 User Management Tables
-- -----------------------------------------------------------------------------

-- Profiles table - stores additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text,
  username text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User roles table - manages user permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Audit logs table - tracks admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3.2 Content Tables
-- -----------------------------------------------------------------------------

-- Main articles table
CREATE TABLE IF NOT EXISTS public.content_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL,
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  body text,
  keywords text,
  category text DEFAULT 'decoracao'::text,
  category_slug text,
  tags text[] DEFAULT '{}'::text[],
  cover_image text,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  external_links jsonb DEFAULT '[]'::jsonb,
  read_time text DEFAULT '5 min'::text,
  status text DEFAULT 'draft'::text,
  published_at timestamp with time zone,
  likes_count integer NOT NULL DEFAULT 0,
  affiliate_banner_enabled boolean DEFAULT false,
  affiliate_banner_url text,
  affiliate_banner_image text,
  affiliate_banner_image_mobile text,
  affiliate_clicks_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Article images metadata table
CREATE TABLE IF NOT EXISTS public.article_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid,
  image_type text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  original_prompt text,
  format text DEFAULT 'webp'::text,
  width integer,
  height integer,
  file_size integer,
  image_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Article views tracking
CREATE TABLE IF NOT EXISTS public.article_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  ip_hash text,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Article likes tracking
CREATE TABLE IF NOT EXISTS public.article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(article_id, ip_hash)
);

-- Affiliate banner clicks tracking
CREATE TABLE IF NOT EXISTS public.affiliate_banner_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  ip_hash text,
  user_agent text,
  referrer text,
  clicked_at timestamp with time zone NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3.3 AI Generation Tables
-- -----------------------------------------------------------------------------

-- Generation history - tracks AI article generations
CREATE TABLE IF NOT EXISTS public.generation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  topic text NOT NULL,
  article_id uuid,
  article_title text,
  status text NOT NULL DEFAULT 'success'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Image generation queue
CREATE TABLE IF NOT EXISTS public.image_generation_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid,
  image_type text NOT NULL,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  result_url text,
  error_message text,
  image_index integer DEFAULT 0,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  priority integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  next_retry_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Image backup logs
CREATE TABLE IF NOT EXISTS public.image_backup_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending'::text,
  total_images integer NOT NULL DEFAULT 0,
  backed_up integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  duration_ms integer,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3.4 Contact & Communication Tables
-- -----------------------------------------------------------------------------

-- Contact messages from visitors
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  ip_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Replies to contact messages
CREATE TABLE IF NOT EXISTS public.contact_message_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL,
  replied_by uuid NOT NULL,
  reply_text text NOT NULL,
  is_ai_generated boolean DEFAULT false,
  sent_via_email boolean DEFAULT false,
  replied_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Reply templates for contact messages
CREATE TABLE IF NOT EXISTS public.contact_reply_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3.5 Newsletter Tables
-- -----------------------------------------------------------------------------

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  source text DEFAULT 'footer'::text,
  ip_hash text,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone
);

-- Newsletter send history
CREATE TABLE IF NOT EXISTS public.newsletter_send_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid,
  article_slug text,
  article_title text NOT NULL,
  sent_by uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  total_recipients integer NOT NULL DEFAULT 0,
  successful_sends integer NOT NULL DEFAULT 0,
  failed_sends integer NOT NULL DEFAULT 0,
  opened_count integer NOT NULL DEFAULT 0,
  clicked_count integer NOT NULL DEFAULT 0,
  error_message text,
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Newsletter email tracking (opens, clicks)
CREATE TABLE IF NOT EXISTS public.newsletter_email_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_history_id uuid NOT NULL,
  subscriber_email text NOT NULL,
  tracking_token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'sent'::text,
  sent_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone
);

-- -----------------------------------------------------------------------------
-- 3.6 Email & Notification Tables
-- -----------------------------------------------------------------------------

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  description text,
  category varchar NOT NULL DEFAULT 'contact_reply'::varchar,
  html_template text NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- System notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- -----------------------------------------------------------------------------
-- 3.7 Settings Table
-- -----------------------------------------------------------------------------

-- Site-wide settings (key-value store)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3.8 Auto Generation & Commemorative Dates Tables
-- -----------------------------------------------------------------------------

-- Configuration for automatic article generation (AutoPilot)
CREATE TABLE IF NOT EXISTS public.auto_generation_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  publish_immediately boolean NOT NULL DEFAULT false,
  daily_limit integer NOT NULL DEFAULT 5,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Logs for automatic article generation
CREATE TABLE IF NOT EXISTS public.auto_generation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid,
  topic_used text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  executed_at timestamp with time zone NOT NULL DEFAULT now(),
  duration_ms integer
);

-- Schedules for automatic article generation
CREATE TABLE IF NOT EXISTS public.auto_generation_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot time without time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Settings for commemorative dates (enable/disable specific dates)
CREATE TABLE IF NOT EXISTS public.commemorative_date_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_id text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Video generation logs for tracking automated video processing
CREATE TABLE IF NOT EXISTS public.video_generation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid,
  article_title text,
  status text NOT NULL DEFAULT 'pending',
  video_id text,
  error_message text,
  duration_ms integer,
  executed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================================================
-- END OF SCRIPT 01/05
-- ============================================================================
-- Next: Execute 02-schema-functions.sql
-- ============================================================================
