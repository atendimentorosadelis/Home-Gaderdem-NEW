-- ============================================================================
-- HOME GARDEN MANUAL - MIGRATION SCRIPT 03/05
-- INDEXES, RLS POLICIES, TRIGGERS & STORAGE
-- ============================================================================
-- Execute AFTER 02-schema-functions.sql
-- Functions must exist before RLS policies can reference them
-- ============================================================================

-- ============================================================================
-- SECTION 1: INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Content articles indexes
CREATE INDEX IF NOT EXISTS idx_content_articles_author_id ON public.content_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_content_articles_slug ON public.content_articles(slug);
CREATE INDEX IF NOT EXISTS idx_content_articles_status ON public.content_articles(status);
CREATE INDEX IF NOT EXISTS idx_content_articles_category ON public.content_articles(category);
CREATE INDEX IF NOT EXISTS idx_content_articles_published_at ON public.content_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_content_articles_created_at ON public.content_articles(created_at);

-- Article images indexes
CREATE INDEX IF NOT EXISTS idx_article_images_article_id ON public.article_images(article_id);
CREATE INDEX IF NOT EXISTS idx_article_images_image_type ON public.article_images(image_type);

-- Article views indexes
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON public.article_views(viewed_at);

-- Article likes indexes
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON public.article_likes(article_id);

-- Affiliate clicks indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_article_id ON public.affiliate_banner_clicks(article_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_banner_clicks(clicked_at);

-- Generation history indexes
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON public.generation_history(created_at);

-- Image queue indexes
CREATE INDEX IF NOT EXISTS idx_image_queue_article_id ON public.image_generation_queue(article_id);
CREATE INDEX IF NOT EXISTS idx_image_queue_status ON public.image_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_image_queue_priority ON public.image_generation_queue(priority);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);

-- Contact replies indexes
CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id ON public.contact_message_replies(message_id);

-- Newsletter subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON public.newsletter_subscribers(is_active);

-- Newsletter send history indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_send_history_article_id ON public.newsletter_send_history(article_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_history_sent_at ON public.newsletter_send_history(sent_at);

-- Newsletter tracking indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_tracking_send_history_id ON public.newsletter_email_tracking(send_history_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_tracking_token ON public.newsletter_email_tracking(tracking_token);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Site settings indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Auto generation indexes
CREATE INDEX IF NOT EXISTS idx_auto_generation_config_enabled ON public.auto_generation_config(enabled);
CREATE INDEX IF NOT EXISTS idx_auto_generation_logs_status ON public.auto_generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_auto_generation_logs_executed_at ON public.auto_generation_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_auto_generation_logs_article_id ON public.auto_generation_logs(article_id);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedules_day ON public.auto_generation_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedules_active ON public.auto_generation_schedules(is_active);

-- Commemorative date settings indexes
CREATE INDEX IF NOT EXISTS idx_commemorative_date_settings_date_id ON public.commemorative_date_settings(date_id);
CREATE INDEX IF NOT EXISTS idx_commemorative_date_settings_enabled ON public.commemorative_date_settings(is_enabled);

-- ============================================================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_banner_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_send_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commemorative_date_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 3: RLS POLICIES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 Profiles Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.2 User Roles Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.3 Audit Logs Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.4 Content Articles Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can view published articles" ON public.content_articles
  FOR SELECT USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Authors can view own articles" ON public.content_articles
  FOR SELECT USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can insert own articles" ON public.content_articles
  FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can update own articles" ON public.content_articles
  FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can delete own articles" ON public.content_articles
  FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all articles" ON public.content_articles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.5 Article Images Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can view images of published articles" ON public.article_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_articles
      WHERE content_articles.id = article_images.article_id
      AND content_articles.status = 'published'
      AND content_articles.published_at IS NOT NULL
    )
  );

CREATE POLICY "Admins can manage all images" ON public.article_images
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role can manage images" ON public.article_images
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.6 Article Views Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can read view counts" ON public.article_views
  FOR SELECT USING (true);

CREATE POLICY "Anyone can register views" ON public.article_views
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3.7 Article Likes Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view likes" ON public.article_likes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert likes" ON public.article_likes
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3.8 Affiliate Banner Clicks Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view clicks" ON public.affiliate_banner_clicks
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Anyone can register clicks" ON public.affiliate_banner_clicks
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3.9 Generation History Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own history" ON public.generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.generation_history
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all history" ON public.generation_history
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.10 Image Generation Queue Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can manage all queue items" ON public.image_generation_queue
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role bypass for edge functions" ON public.image_generation_queue
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.11 Image Backup Logs Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view backup logs" ON public.image_backup_logs
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Service role can manage backup logs" ON public.image_backup_logs
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.12 Contact Messages Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE USING (is_current_user_admin());

-- -----------------------------------------------------------------------------
-- 3.13 Contact Message Replies Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view all replies" ON public.contact_message_replies
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can insert replies" ON public.contact_message_replies
  FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "Service role can manage replies" ON public.contact_message_replies
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.14 Contact Reply Templates Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view templates" ON public.contact_reply_templates
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can insert templates" ON public.contact_reply_templates
  FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update templates" ON public.contact_reply_templates
  FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins can delete templates" ON public.contact_reply_templates
  FOR DELETE USING (is_current_user_admin());

-- -----------------------------------------------------------------------------
-- 3.15 Newsletter Subscribers Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers
  FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE USING (is_current_user_admin());

CREATE POLICY "Service role can manage subscribers" ON public.newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.16 Newsletter Send History Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view send history" ON public.newsletter_send_history
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Service role can manage send history" ON public.newsletter_send_history
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.17 Newsletter Email Tracking Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view email tracking" ON public.newsletter_email_tracking
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Service role can manage email tracking" ON public.newsletter_email_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.18 Email Templates Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role can manage templates" ON public.email_templates
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.19 Notifications Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- -----------------------------------------------------------------------------
-- 3.20 Push Subscriptions Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view own subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3.21 Site Settings Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view settings" ON public.site_settings
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can insert settings" ON public.site_settings
  FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Service role can manage settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.22 Auto Generation Config Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can manage auto generation config" ON public.auto_generation_config
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role can manage config" ON public.auto_generation_config
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.23 Auto Generation Logs Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can view logs" ON public.auto_generation_logs
  FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Service role can manage logs" ON public.auto_generation_logs
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.24 Auto Generation Schedules Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Admins can manage schedules" ON public.auto_generation_schedules
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role can manage schedules" ON public.auto_generation_schedules
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3.25 Commemorative Date Settings Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Anyone can read commemorative date settings" ON public.commemorative_date_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage commemorative date settings" ON public.commemorative_date_settings
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Service role can manage commemorative date settings" ON public.commemorative_date_settings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- SECTION 4: TRIGGERS
-- ============================================================================

-- Trigger to create profile and assign role when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_articles_updated_at ON public.content_articles;
CREATE TRIGGER update_content_articles_updated_at
  BEFORE UPDATE ON public.content_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_reply_templates_updated_at ON public.contact_reply_templates;
CREATE TRIGGER update_contact_reply_templates_updated_at
  BEFORE UPDATE ON public.contact_reply_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_image_generation_queue_updated_at ON public.image_generation_queue;
CREATE TRIGGER update_image_generation_queue_updated_at
  BEFORE UPDATE ON public.image_generation_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_commemorative_date_settings_updated_at ON public.commemorative_date_settings;
CREATE TRIGGER update_commemorative_date_settings_updated_at
  BEFORE UPDATE ON public.commemorative_date_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 5: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.image_generation_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

-- ============================================================================
-- SECTION 6: STORAGE BUCKETS (Manual Setup Required)
-- ============================================================================

-- Note: Storage buckets must be created via Supabase Dashboard
-- Go to Storage > Create new bucket and create these 3 buckets:

-- 1. article-images (PUBLIC)
--    - Public: Yes
--    - File size limit: 50MB (52428800 bytes)

-- 2. avatars (PUBLIC)
--    - Public: Yes
--    - File size limit: 5MB (5242880 bytes)

-- 3. article-images-backup (PRIVATE)
--    - Public: No
--    - File size limit: 50MB (52428800 bytes)

-- After creating buckets, add these policies in the SQL Editor:

-- For article-images bucket:
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND is_current_user_admin());

CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND is_current_user_admin());

CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND is_current_user_admin());

-- For avatars bucket:
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- For backup bucket:
CREATE POLICY "Admins can manage backup images"
ON storage.objects FOR ALL
USING (bucket_id = 'article-images-backup' AND is_current_user_admin());

-- ============================================================================
-- END OF SCRIPT 03/05
-- ============================================================================
-- Next: Execute 04-migrate-data.sql
-- ============================================================================
