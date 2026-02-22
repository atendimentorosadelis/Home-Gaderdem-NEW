-- ============================================
-- Home Garden Manual - Script de Importação de Dados
-- Execute este script APÓS importar o schema (database-schema-export.sql)
-- ============================================

-- IMPORTANTE: Execute cada seção separadamente no SQL Editor do Supabase
-- para evitar erros de timeout

-- ============================================
-- SEÇÃO 1: CONFIGURAÇÕES DO SITE
-- ============================================

INSERT INTO site_settings (id, key, value, updated_at) VALUES
('7e05b6ff-21ff-49a4-a97b-b8f993a85f28', 'auto_reply_config', '{"enabled": false, "prompt": "Você é um assistente do site Home Garden Manual, especializado em jardinagem e decoração. Responda de forma profissional e amigável em português brasileiro."}', now()),
('c2947fc3-90c4-4bbe-b5c1-d5f1a016da65', 'social_links', '{"facebook": "", "facebook_enabled": true, "instagram": "", "instagram_enabled": false, "linkedin": "", "linkedin_enabled": false, "pinterest": "", "pinterest_enabled": false, "tiktok": "", "tiktok_enabled": false, "twitter": "", "twitter_enabled": false, "youtube": "", "youtube_enabled": false}', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 2: TEMPLATES DE RESPOSTA DE CONTATO
-- ============================================

INSERT INTO contact_reply_templates (id, title, content, category, is_active, created_at, updated_at) VALUES
('9d9b0fab-3b06-4a0d-90b5-146c10fd02e8', 'Agradecimento Geral', 'Olá {nome},

Muito obrigado por entrar em contato conosco!

Recebemos sua mensagem e ficamos felizes em poder ajudar. Nossa equipe está analisando sua solicitação e em breve retornaremos com mais informações.

Enquanto isso, continue explorando nosso site para mais dicas de jardinagem e decoração.

Atenciosamente,
Equipe Home Garden Manual', 'general', true, now(), now()),
('707addd5-76b6-419d-a634-54329a2bd562', 'Dúvida sobre Plantas', 'Olá {nome},

Obrigado pela sua pergunta sobre plantas!

Ficamos muito felizes em ajudar com suas dúvidas de jardinagem. Com base na sua mensagem, aqui vão algumas orientações:

[Insira aqui as orientações específicas]

Se precisar de mais informações, não hesite em nos contatar novamente.

Bons cultivos!
Equipe Home Garden Manual', 'question', true, now(), now()),
('1571e377-93f7-47b6-b7b3-a23f0a47b76e', 'Sugestão Recebida', 'Olá {nome},

Agradecemos imensamente sua sugestão de conteúdo!

Adoramos receber ideias dos nossos leitores e sua contribuição é muito valiosa para nós. Vamos avaliar sua sugestão e, se possível, criar um artigo sobre o tema.

Fique de olho em nossas publicações!

Um abraço,
Equipe Home Garden Manual', 'suggestion', true, now(), now()),
('1a6e54fe-77db-45ff-b240-19ef7a507be3', 'Parceria/Colaboração', 'Olá {nome},

Obrigado pelo interesse em colaborar com o Home Garden Manual!

Ficamos muito felizes com sua proposta de parceria. Nossa equipe irá analisar os detalhes e entraremos em contato para discutir as possibilidades.

Aguarde nosso retorno em breve.

Cordialmente,
Equipe Home Garden Manual', 'partnership', true, now(), now()),
('334eeca8-d2a6-448a-aaf4-99cc54621c98', 'Problema Reportado', 'Olá {nome},

Agradecemos por nos informar sobre esse problema!

Lamentamos qualquer inconveniente causado. Nossa equipe técnica já foi notificada e está trabalhando para resolver a situação o mais rápido possível.

Agradecemos sua paciência e compreensão.

Atenciosamente,
Equipe Home Garden Manual', 'problem', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 3: CONFIGURAÇÃO DO AUTO PILOT
-- ============================================

INSERT INTO auto_generation_config (id, enabled, daily_limit, publish_immediately, topics, updated_at) VALUES
('9c0d33aa-2e6c-4fc6-9eec-c72be9e1e07b', false, 5, true, '["design-minimalista", "design-industrial", "design-tropical", "jardim-paisagismo", "jardim-ervas"]', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 4: AGENDAMENTOS DO AUTO PILOT
-- ============================================

INSERT INTO auto_generation_schedules (id, day_of_week, time_slot, is_active, created_at) VALUES
('f7e5c51d-6879-4b8c-bc2f-fd193aa7f6af', 1, '08:00:00', true, now()),
('154a6e18-a629-4b29-853e-43704faf18de', 3, '08:00:00', true, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 5: CONFIGURAÇÕES DE DATAS COMEMORATIVAS
-- ============================================

INSERT INTO commemorative_date_settings (id, date_id, is_enabled, updated_at) VALUES
('046a9295-4b1a-4f97-98e9-b25a0aede174', 'ano-novo', true, now()),
('e926bcfa-676d-4734-a6e2-af3ae2a129e8', 'carnaval', true, now()),
('e8355430-07f2-4fa2-a9b0-b32d03f62429', 'valentines-day', true, now()),
('780a3b70-9db5-439e-a3f8-4896bcedda90', 'dia-mulher', true, now()),
('898f9a06-75c2-4c09-99a1-c0ac09c06918', 'st-patricks', true, now()),
('72ab386c-af71-4b8b-b904-3d1deee66500', 'pascoa', true, now()),
('be1aa134-4c41-4f09-8590-e87db814c68d', 'dia-maes', true, now()),
('c69aa354-a81a-41fc-987b-89df5e1c2082', 'memorial-day', true, now()),
('db5d4381-0dce-4a1c-adde-96c397c9c2fd', 'dia-namorados-br', true, now()),
('8d7a7979-2ff2-4cca-9f22-bd36ea3d6db3', 'festa-junina', true, now()),
('ea9f4407-661b-4067-829b-6ae610d6fe57', 'independence-day-us', true, now()),
('fe514d2c-c712-4b08-9714-487799d2d105', 'dia-pais', true, now()),
('951a745f-b6de-4a56-881f-a0274dad7f9d', 'independencia-br', true, now()),
('74134be5-afa2-4c75-90d4-2f23a0c7dced', 'labor-day', true, now()),
('922885d5-94d2-472c-b250-03dda0ca33a6', 'dia-criancas', true, now()),
('5c314fe0-f9d4-4138-8076-c98fb1835eb4', 'halloween', true, now()),
('7649c150-2895-4dde-8d73-b43fcc3cf764', 'thanksgiving', true, now()),
('57a47f95-5808-406e-9ad8-c97a3a1e2b88', 'natal', true, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 6: INSCRITOS NA NEWSLETTER
-- ============================================

INSERT INTO newsletter_subscribers (id, email, is_active, source, subscribed_at) VALUES
('16d1cb88-6a40-4d26-9982-c6182d972863', 'wallistonluiz@gmail.com', true, 'footer', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 7: EMAIL TEMPLATES (SEPARAR EM EXECUÇÕES INDIVIDUAIS)
-- ============================================

-- Template 1: Dark Professional (DEFAULT)
INSERT INTO email_templates (id, name, description, category, html_template, is_active, is_default, created_at) VALUES
('c1bca57d-e20e-43bc-9014-6e628ad0c732', 'Dark Professional', 'Tema escuro elegante com acentos verdes vibrantes para uma aparência moderna e sofisticada', 'contact_reply', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #e0e0e0; margin: 0; padding: 0; background: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #0d0d0d; color: white; padding: 40px 30px; text-align: center; border-bottom: 3px solid #4a7c23; }
    .logo { max-width: 180px; height: auto; }
    .content { background: #252525; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #4a7c23; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #ccc; }
    .original { background: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #888; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #aaa; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe-btn { display: inline-block; background-color: #86efac; color: #166534; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p class="community-note">Visite nosso <a href="https://homegardenmanual.com">site</a>, um lugar para você explorar dicas de jardinagem, decoração e muito mais!</p>
      <p class="no-reply">Por favor, não responda a este e-mail, pois se trata de uma mensagem automática e não é possível dar continuidade ao seu atendimento por aqui.</p>
      <div class="social-icons">{{social_icons}}</div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;"><a href="https://homegardenmanual.com/unsubscribe?email={{email}}" class="unsubscribe-btn">Cancelar Inscrição</a></p>
    </div>
  </div>
</body>
</html>', true, true, now())
ON CONFLICT (id) DO NOTHING;

-- Template 2: Nature Garden
INSERT INTO email_templates (id, name, description, category, html_template, is_active, is_default, created_at) VALUES
('30823976-5acb-40cd-9771-560db597010d', 'Nature Garden', 'Tons terrosos com elementos naturais e ícones de plantas para uma experiência imersiva', 'contact_reply', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #e8e8e8; margin: 0; padding: 0; background: #1a2e1a; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: url(''https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=200&fit=crop'') center/cover; padding: 60px 30px; text-align: center; position: relative; }
    .header::before { content: ''''; position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
    .header-content { position: relative; z-index: 1; }
    .logo { max-width: 180px; height: auto; }
    .content { background: #2a3d2a; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #7cb87c; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #d0d0d0; }
    .original { background: #1a2e1a; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #5a9a5a; }
    .original-label { font-weight: 600; color: #888; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #aaa; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #7cb87c; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe-btn { display: inline-block; background-color: #86efac; color: #166534; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content"><img src="{{logo_url}}" alt="Home Garden Manual" class="logo"></div>
    </div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">{{content}}</div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p class="community-note">Visite nosso <a href="https://homegardenmanual.com">site</a>, um lugar para você explorar dicas de jardinagem, decoração e muito mais!</p>
      <p class="no-reply">Por favor, não responda a este e-mail, pois se trata de uma mensagem automática.</p>
      <div class="social-icons">{{social_icons}}</div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;"><a href="https://homegardenmanual.com/unsubscribe?email={{email}}" class="unsubscribe-btn">Cancelar Inscrição</a></p>
    </div>
  </div>
</body>
</html>', true, false, now())
ON CONFLICT (id) DO NOTHING;

-- Template 3: Elegante Verde
INSERT INTO email_templates (id, name, description, category, html_template, is_active, is_default, created_at) VALUES
('54e2a6c9-7c83-48a3-a48d-47d57b19c9f4', 'Elegante Verde', 'Template clássico corporativo com header gradiente verde e design profissional', 'contact_reply', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .logo { max-width: 180px; height: auto; }
    .content { background: white; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #2d5016; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #444; }
    .original { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #555; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; border-radius: 0 0 12px 12px; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .unsubscribe-btn { display: inline-block; background-color: #86efac; color: #166534; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="{{logo_url}}" alt="Home Garden Manual" class="logo"></div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">{{content}}</div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p>Visite nosso <a href="https://homegardenmanual.com">site</a></p>
      <div class="social-icons">{{social_icons}}</div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;"><a href="https://homegardenmanual.com/unsubscribe?email={{email}}" class="unsubscribe-btn">Cancelar Inscrição</a></p>
    </div>
  </div>
</body>
</html>', true, false, now())
ON CONFLICT (id) DO NOTHING;

-- Template 4: Moderno Flat
INSERT INTO email_templates (id, name, description, category, html_template, is_active, is_default, created_at) VALUES
('8c5c9be6-ddd4-483e-8618-11edb74216b4', 'Moderno Flat', 'Design contemporâneo com cores sólidas, cards arredondados e visual limpo', 'contact_reply', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f0f0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #4a7c23; padding: 30px; text-align: center; }
    .logo { max-width: 160px; height: auto; }
    .content { background: white; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #555; }
    .original { background: #f8f9fa; padding: 20px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #666; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .unsubscribe-btn { display: inline-block; background-color: #86efac; color: #166534; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="{{logo_url}}" alt="Home Garden Manual" class="logo"></div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">{{content}}</div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p>Visite nosso <a href="https://homegardenmanual.com">site</a></p>
      <div class="social-icons">{{social_icons}}</div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;"><a href="https://homegardenmanual.com/unsubscribe?email={{email}}" class="unsubscribe-btn">Cancelar Inscrição</a></p>
    </div>
  </div>
</body>
</html>', true, false, now())
ON CONFLICT (id) DO NOTHING;

-- Template 5: Minimalista Branco
INSERT INTO email_templates (id, name, description, category, html_template, is_active, is_default, created_at) VALUES
('41094301-d2fa-44f0-92f5-f817e22b262a', 'Minimalista Branco', 'Design clean e moderno com muito espaço branco e tipografia elegante', 'contact_reply', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; }
    .header { background: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #e0e0e0; }
    .logo { max-width: 180px; height: auto; }
    .content { background: #ffffff; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #555; }
    .original { background: #fafafa; padding: 20px; margin-top: 30px; border: 1px solid #e0e0e0; }
    .original-label { font-weight: 600; color: #888; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #666; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .unsubscribe-btn { display: inline-block; background-color: #86efac; color: #166534; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="{{logo_url}}" alt="Home Garden Manual" class="logo"></div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">{{content}}</div>
      <div class="original">
        <div class="original-label">Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      <p>Visite nosso <a href="https://homegardenmanual.com">site</a></p>
      <div class="social-icons">{{social_icons}}</div>
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      <p style="margin-top: 15px;"><a href="https://homegardenmanual.com/unsubscribe?email={{email}}" class="unsubscribe-btn">Cancelar Inscrição</a></p>
    </div>
  </div>
</body>
</html>', true, false, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 8: CRIAR BUCKETS DE STORAGE
-- (Execute no SQL Editor do Supabase)
-- ============================================

-- Bucket público para imagens dos artigos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-images', 'article-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket público para avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket privado para backup de imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-images-backup', 'article-images-backup', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEÇÃO 9: POLÍTICAS DE STORAGE
-- ============================================

-- Políticas para article-images (público para leitura)
CREATE POLICY "Anyone can view article images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Admins can upload article images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'article-images' AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update article images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'article-images' AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete article images" ON storage.objects
  FOR DELETE USING (bucket_id = 'article-images' AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Políticas para avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Políticas para article-images-backup (apenas admins)
CREATE POLICY "Admins can manage backup images" ON storage.objects
  FOR ALL USING (bucket_id = 'article-images-backup' AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- NOTA IMPORTANTE SOBRE ARTIGOS
-- ============================================
-- Os artigos existentes usam imagens hospedadas no storage antigo
-- (gcdwdjacrxmdsciwqtlc.supabase.co)
-- 
-- Opções:
-- 1. Manter as URLs antigas (funcionam se o projeto antigo não for deletado)
-- 2. Baixar as imagens e fazer upload para o novo storage
-- 3. Usar imagens do Unsplash como placeholder
--
-- Para importar artigos, você precisará:
-- 1. Primeiro criar um usuário admin
-- 2. Criar um profile para esse usuário
-- 3. Usar o ID do profile como author_id nos artigos
-- ============================================

-- ============================================
-- FIM DO SCRIPT DE IMPORTAÇÃO
-- ============================================
