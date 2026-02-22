-- =====================================================
-- TRIGGERS PARA O FUNCIONAMENTO CORRETO DO SISTEMA
-- =====================================================

-- 1. Trigger para criar perfil automaticamente quando novo usuário se registra
-- Este trigger chama a função handle_new_user() quando um usuário é criado no auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Triggers para atualização automática do campo updated_at em todas as tabelas relevantes

-- Profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Content Articles
DROP TRIGGER IF EXISTS update_content_articles_updated_at ON public.content_articles;
CREATE TRIGGER update_content_articles_updated_at
  BEFORE UPDATE ON public.content_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Contact Messages
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Contact Reply Templates
DROP TRIGGER IF EXISTS update_contact_reply_templates_updated_at ON public.contact_reply_templates;
CREATE TRIGGER update_contact_reply_templates_updated_at
  BEFORE UPDATE ON public.contact_reply_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Email Templates
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Site Settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto Generation Config
DROP TRIGGER IF EXISTS update_auto_generation_config_updated_at ON public.auto_generation_config;
CREATE TRIGGER update_auto_generation_config_updated_at
  BEFORE UPDATE ON public.auto_generation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Image Generation Queue
DROP TRIGGER IF EXISTS update_image_generation_queue_updated_at ON public.image_generation_queue;
CREATE TRIGGER update_image_generation_queue_updated_at
  BEFORE UPDATE ON public.image_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Commemorative Date Settings
DROP TRIGGER IF EXISTS update_commemorative_date_settings_updated_at ON public.commemorative_date_settings;
CREATE TRIGGER update_commemorative_date_settings_updated_at
  BEFORE UPDATE ON public.commemorative_date_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();