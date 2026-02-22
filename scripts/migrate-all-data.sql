-- ============================================================
-- SCRIPT DE MIGRAÇÃO COMPLETA - LOVABLE CLOUD → NOVO SUPABASE
-- ============================================================
-- Este script contém TODOS os dados do projeto Home Garden Manual
-- Execute em seções no SQL Editor do novo Supabase
-- IMPORTANTE: Execute o database-schema-export.sql PRIMEIRO!
-- ============================================================

-- ============================================================
-- SEÇÃO 1: CONFIGURAÇÕES DO SITE
-- ============================================================

INSERT INTO site_settings (id, key, value, updated_at) VALUES 
('7e05b6ff-21ff-49a4-a97b-b8f993a85f28'::uuid, 'auto_reply_config', '{"prompt": "Você é um assistente do site Home Garden Manual, especializado em jardinagem e decoração. Responda de forma profissional e amigável em português brasileiro.", "enabled": false}'::jsonb, '2026-01-20 16:32:46.866397+00'::timestamptz),
('c2947fc3-90c4-4bbe-b5c1-d5f1a016da65'::uuid, 'social_links', '{"tiktok": "", "twitter": "", "youtube": "", "facebook": "", "linkedin": "", "instagram": "", "pinterest": "", "tiktok_enabled": false, "twitter_enabled": false, "youtube_enabled": false, "facebook_enabled": true, "linkedin_enabled": false, "instagram_enabled": false, "pinterest_enabled": false}'::jsonb, '2026-01-20 19:11:44.325+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 2: CONFIGURAÇÃO DO PILOTO AUTOMÁTICO
-- ============================================================

INSERT INTO auto_generation_config (id, enabled, topics, daily_limit, publish_immediately, updated_by, updated_at) VALUES 
('9c0d33aa-2e6c-4fc6-9eec-c72be9e1e07b'::uuid, false, '["design-minimalista", "design-industrial", "design-tropical", "jardim-paisagismo", "jardim-ervas"]'::jsonb, 5, true, '98213c01-0dae-4c0b-8ebe-f6351c5f54f1'::uuid, '2026-01-21 02:58:30.840127+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auto_generation_schedules (id, day_of_week, time_slot, is_active, created_at) VALUES 
('f7e5c51d-6879-4b8c-bc2f-fd193aa7f6af'::uuid, 1, '08:00:00'::time, true, '2026-01-21 02:39:00.885956+00'::timestamptz),
('154a6e18-a629-4b29-853e-43704faf18de'::uuid, 3, '08:00:00'::time, true, '2026-01-21 03:10:20.381199+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 3: DATAS COMEMORATIVAS
-- ============================================================

INSERT INTO commemorative_date_settings (id, date_id, is_enabled, updated_by, updated_at) VALUES 
('046a9295-4b1a-4f97-98e9-b25a0aede174'::uuid, 'ano-novo', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('e926bcfa-676d-4734-a6e2-af3ae2a129e8'::uuid, 'carnaval', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('e8355430-07f2-4fa2-a9b0-b32d03f62429'::uuid, 'valentines-day', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('780a3b70-9db5-439e-a3f8-4896bcedda90'::uuid, 'dia-mulher', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('898f9a06-75c2-4c09-99a1-c0ac09c06918'::uuid, 'st-patricks', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('72ab386c-af71-4b8b-b904-3d1deee66500'::uuid, 'pascoa', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('be1aa134-4c41-4f09-8590-e87db814c68d'::uuid, 'dia-maes', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('c69aa354-a81a-41fc-987b-89df5e1c2082'::uuid, 'memorial-day', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('db5d4381-0dce-4a1c-adde-96c397c9c2fd'::uuid, 'dia-namorados-br', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('8d7a7979-2ff2-4cca-9f22-bd36ea3d6db3'::uuid, 'festa-junina', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('ea9f4407-661b-4067-829b-6ae610d6fe57'::uuid, 'independence-day-us', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('fe514d2c-c712-4b08-9714-487799d2d105'::uuid, 'dia-pais', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('951a745f-b6de-4a56-881f-a0274dad7f9d'::uuid, 'independencia-br', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('74134be5-afa2-4c75-90d4-2f23a0c7dced'::uuid, 'labor-day', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('922885d5-94d2-472c-b250-03dda0ca33a6'::uuid, 'dia-criancas', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('5c314fe0-f9d4-4138-8076-c98fb1835eb4'::uuid, 'halloween', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('7649c150-2895-4dde-8d73-b43fcc3cf764'::uuid, 'thanksgiving', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz),
('57a47f95-5808-406e-9ad8-c97a3a1e2b88'::uuid, 'natal', true, NULL, '2026-01-21 03:02:58.434487+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 4: TEMPLATES DE RESPOSTA
-- ============================================================

INSERT INTO contact_reply_templates (id, title, content, category, is_active, created_at, updated_at) VALUES 
('9d9b0fab-3b06-4a0d-90b5-146c10fd02e8'::uuid, 'Agradecimento Geral', 'Olá {nome},

Muito obrigado por entrar em contato conosco!

Recebemos sua mensagem e ficamos felizes em poder ajudar. Nossa equipe está analisando sua solicitação e em breve retornaremos com mais informações.

Enquanto isso, continue explorando nosso site para mais dicas de jardinagem e decoração.

Atenciosamente,
Equipe Home Garden Manual', 'general', true, '2026-01-20 16:40:54.31446+00'::timestamptz, '2026-01-20 16:40:54.31446+00'::timestamptz),
('707addd5-76b6-419d-a634-54329a2bd562'::uuid, 'Dúvida sobre Plantas', 'Olá {nome},

Obrigado pela sua pergunta sobre plantas!

Ficamos muito felizes em ajudar com suas dúvidas de jardinagem. Com base na sua mensagem, aqui vão algumas orientações:

[Insira aqui as orientações específicas]

Se precisar de mais informações, não hesite em nos contatar novamente.

Bons cultivos!
Equipe Home Garden Manual', 'question', true, '2026-01-20 16:40:54.31446+00'::timestamptz, '2026-01-20 16:40:54.31446+00'::timestamptz),
('1571e377-93f7-47b6-b7b3-a23f0a47b76e'::uuid, 'Sugestão Recebida', 'Olá {nome},

Agradecemos imensamente sua sugestão de conteúdo!

Adoramos receber ideias dos nossos leitores e sua contribuição é muito valiosa para nós. Vamos avaliar sua sugestão e, se possível, criar um artigo sobre o tema.

Fique de olho em nossas publicações!

Um abraço,
Equipe Home Garden Manual', 'suggestion', true, '2026-01-20 16:40:54.31446+00'::timestamptz, '2026-01-20 16:40:54.31446+00'::timestamptz),
('1a6e54fe-77db-45ff-b240-19ef7a507be3'::uuid, 'Parceria/Colaboração', 'Olá {nome},

Obrigado pelo interesse em colaborar com o Home Garden Manual!

Ficamos muito felizes com sua proposta de parceria. Nossa equipe irá analisar os detalhes e entraremos em contato para discutir as possibilidades.

Aguarde nosso retorno em breve.

Cordialmente,
Equipe Home Garden Manual', 'partnership', true, '2026-01-20 16:40:54.31446+00'::timestamptz, '2026-01-20 16:40:54.31446+00'::timestamptz),
('334eeca8-d2a6-448a-aaf4-99cc54621c98'::uuid, 'Problema Reportado', 'Olá {nome},

Agradecemos por nos informar sobre esse problema!

Lamentamos qualquer inconveniente causado. Nossa equipe técnica já foi notificada e está trabalhando para resolver a situação o mais rápido possível.

Agradecemos sua paciência e compreensão.

Atenciosamente,
Equipe Home Garden Manual', 'problem', true, '2026-01-20 16:40:54.31446+00'::timestamptz, '2026-01-20 16:40:54.31446+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 5: NEWSLETTER SUBSCRIBERS
-- ============================================================

INSERT INTO newsletter_subscribers (id, email, source, ip_hash, is_active, subscribed_at, unsubscribed_at) VALUES 
('16d1cb88-6a40-4d26-9982-c6182d972863'::uuid, 'wallistonluiz@gmail.com', 'footer', '', true, '2026-01-20 15:36:50.203444+00'::timestamptz, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 6: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES 
('article-images', 'article-images', true, 52428800),
('avatars', 'avatars', true, 5242880),
('article-images-backup', 'article-images-backup', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEÇÃO 7: STORAGE POLICIES
-- ============================================================

-- Policies para article-images
CREATE POLICY IF NOT EXISTS "Public read access for article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY IF NOT EXISTS "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND (SELECT is_current_user_admin()));

CREATE POLICY IF NOT EXISTS "Admins can update article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND (SELECT is_current_user_admin()));

CREATE POLICY IF NOT EXISTS "Admins can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND (SELECT is_current_user_admin()));

-- Policies para avatars
CREATE POLICY IF NOT EXISTS "Users can view all avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies para backup
CREATE POLICY IF NOT EXISTS "Admins can manage backup images"
ON storage.objects FOR ALL
USING (bucket_id = 'article-images-backup' AND (SELECT is_current_user_admin()));

-- ============================================================
-- SEÇÃO 8: PROFILES (EXECUTAR APÓS CRIAR USUÁRIOS NO AUTH)
-- ============================================================
-- IMPORTANTE: Primeiro crie os 4 usuários no Auth do Supabase:
-- 1. wallistonluiz@gmail.com (Walliston) - Super Admin
-- 2. zetsubo.bh@gmail.com (Keven)
-- 3. rafaeldepereiradantas2026@outlook.com (Alan Garcia)
-- 4. antonioalan1985@hotmail.com (Alan)
-- Depois atualize os user_ids abaixo com os novos IDs gerados

-- PLACEHOLDER: Atualize estes IDs após criar os usuários
-- INSERT INTO profiles (id, user_id, username, email, avatar_url, created_at, updated_at) VALUES 
-- ('NEW_UUID'::uuid, 'NEW_USER_ID'::uuid, 'Walliston', 'wallistonluiz@gmail.com', '', NOW(), NOW()),
-- ('NEW_UUID'::uuid, 'NEW_USER_ID'::uuid, 'Keven', 'zetsubo.bh@gmail.com', '', NOW(), NOW()),
-- ('NEW_UUID'::uuid, 'NEW_USER_ID'::uuid, 'Alan Garcia', 'rafaeldepereiradantas2026@outlook.com', '', NOW(), NOW()),
-- ('NEW_UUID'::uuid, 'NEW_USER_ID'::uuid, 'Alan', 'antonioalan1985@hotmail.com', '', NOW(), NOW());

-- ============================================================
-- SEÇÃO 9: USER_ROLES (EXECUTAR APÓS CRIAR USUÁRIOS NO AUTH)
-- ============================================================

-- PLACEHOLDER: Atualize estes IDs após criar os usuários
-- INSERT INTO user_roles (id, user_id, role, created_at) VALUES 
-- (gen_random_uuid(), 'NEW_USER_ID_WALLISTON'::uuid, 'admin'::app_role, NOW()),
-- (gen_random_uuid(), 'NEW_USER_ID_KEVEN'::uuid, 'admin'::app_role, NOW()),
-- (gen_random_uuid(), 'NEW_USER_ID_ALAN_GARCIA'::uuid, 'admin'::app_role, NOW()),
-- (gen_random_uuid(), 'NEW_USER_ID_ALAN'::uuid, 'admin'::app_role, NOW());

-- ============================================================
-- SEÇÃO 10: ARTIGOS (146 views, 19 likes, 10 artigos)
-- Executar após migração de imagens para atualizar URLs
-- ============================================================

-- Os artigos serão inseridos com as URLs antigas, e depois 
-- atualizados automaticamente pela Edge Function migrate-to-new-supabase

-- ============================================================
-- SEÇÃO 11: MENSAGENS DE CONTATO
-- ============================================================

INSERT INTO contact_messages (id, name, email, subject, message, status, ip_hash, created_at, updated_at) VALUES 
('c6f79619-e58e-45dc-bc84-1baf98d07eb7'::uuid, 'Teste', 'test@example.com', 'Dúvida sobre conteúdo', 'Teste de logo no email', 'read', '66ff82ceb6cbbc8fdf2582e96b833dea9ae9a19b611cf477311549e6f5281b98', '2026-01-20 19:35:23.234923+00'::timestamptz, '2026-01-20 21:36:52.019125+00'::timestamptz),
('7580788a-6ea1-417e-bb1b-9d6239484bc4'::uuid, 'Walliston Luiz', 'wallistonluiz@gmail.com', 'Sugestão de artigo', 'Quero ver um tema de sitio', 'replied', 'f786a25ae139d6fda0af4e45fc5dd8fdca616ca97f4037c8b14229a0b2f59b14', '2026-01-20 16:40:32.677224+00'::timestamptz, '2026-01-20 23:18:12.737788+00'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- ============================================================
-- Após executar este script:
-- 1. Crie os usuários no Auth do Supabase
-- 2. Execute a Edge Function migrate-to-new-supabase para migrar arquivos
-- 3. Execute o script migrate-articles.sql com os artigos
-- ============================================================
