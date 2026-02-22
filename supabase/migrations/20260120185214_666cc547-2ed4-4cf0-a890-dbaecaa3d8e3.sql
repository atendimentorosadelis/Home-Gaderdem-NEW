-- Add social_links setting to site_settings table (if not exists)
INSERT INTO site_settings (key, value)
VALUES ('social_links', '{
  "facebook": "",
  "facebook_enabled": true,
  "instagram": "",
  "instagram_enabled": true,
  "twitter": "",
  "twitter_enabled": true,
  "youtube": "",
  "youtube_enabled": true,
  "linkedin": "",
  "linkedin_enabled": true,
  "pinterest": "",
  "pinterest_enabled": true,
  "tiktok": "",
  "tiktok_enabled": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update all email templates with black footer and {{social_icons}} placeholder
-- Also fix logos to use correct URLs

-- Template 1: Dark Professional
UPDATE email_templates
SET html_template = '<!DOCTYPE html>
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
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-dark.png" alt="Home Garden Manual" class="logo">
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
      
      <p class="community-note">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      
      <p class="no-reply">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
        e não é possível dar continuidade ao seu atendimento por aqui.
      </p>
      
      <div class="social-icons">
        {{social_icons}}
      </div>
      
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = NOW()
WHERE name = 'Dark Professional';

-- Template 2: Elegante Verde
UPDATE email_templates
SET html_template = '<!DOCTYPE html>
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
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
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
      
      <p class="community-note">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      
      <p class="no-reply">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
        e não é possível dar continuidade ao seu atendimento por aqui.
      </p>
      
      <div class="social-icons">
        {{social_icons}}
      </div>
      
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = NOW()
WHERE name = 'Elegante Verde';

-- Template 3: Minimalista Branco
UPDATE email_templates
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 1px solid #eee; }
    .logo { max-width: 160px; height: auto; }
    .content { padding: 40px 20px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 24px; }
    .message-body p { margin: 0 0 18px; color: #555; font-size: 15px; }
    .original { background: #fafafa; padding: 20px; margin-top: 30px; border-left: 2px solid #ddd; }
    .original-label { font-weight: 500; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .original-text { font-style: italic; color: #666; font-size: 14px; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; margin-top: 30px; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="original">
        <div class="original-label">Sua mensagem original</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      
      <p class="community-note">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      
      <p class="no-reply">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
        e não é possível dar continuidade ao seu atendimento por aqui.
      </p>
      
      <div class="social-icons">
        {{social_icons}}
      </div>
      
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = NOW()
WHERE name = 'Minimalista Branco';

-- Template 4: Moderno Flat
UPDATE email_templates
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f4f8; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4a7c23; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .logo { max-width: 180px; height: auto; }
    .content { background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .greeting { font-size: 20px; color: #2d5016; margin-bottom: 20px; font-weight: 600; }
    .message-body p { margin: 0 0 16px; color: #555; }
    .original { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 24px; border-radius: 12px; margin-top: 30px; }
    .original-label { font-weight: 600; color: #4a7c23; font-size: 13px; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .original-text { color: #666; background: white; padding: 16px; border-radius: 8px; font-style: italic; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; border-radius: 16px; margin-top: 20px; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá {{name}}! 👋</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="original">
        <div class="original-label">💬 Sua mensagem original</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      
      <p class="community-note">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      
      <p class="no-reply">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
        e não é possível dar continuidade ao seu atendimento por aqui.
      </p>
      
      <div class="social-icons">
        {{social_icons}}
      </div>
      
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = NOW()
WHERE name = 'Moderno Flat';

-- Template 5: Nature Garden
UPDATE email_templates
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: ''Georgia'', serif; line-height: 1.8; color: #3d3d3d; margin: 0; padding: 0; background: #f5f7f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(180deg, #2d5016 0%, #3a6b1c 100%); padding: 40px 30px; text-align: center; border-radius: 20px 20px 0 0; position: relative; overflow: hidden; }
    .logo { max-width: 180px; height: auto; position: relative; z-index: 1; }
    .content { background: #fffef9; padding: 40px 30px; border-left: 1px solid #e8e4d9; border-right: 1px solid #e8e4d9; }
    .greeting { font-size: 20px; color: #2d5016; margin-bottom: 24px; }
    .message-body p { margin: 0 0 18px; color: #4a4a4a; }
    .original { background: #f0ede4; padding: 24px; border-radius: 12px; margin-top: 30px; border: 1px solid #e0dcd0; }
    .original-label { font-weight: 600; color: #6b8e23; font-size: 13px; text-transform: uppercase; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; }
    .original-text { font-style: italic; color: #666; }
    .footer { text-align: center; padding: 40px 30px; background: #000000; border-radius: 0 0 20px 20px; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #ffffff; margin-bottom: 20px; }
    .community-note { color: #cccccc; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #666666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá <strong>{{name}}</strong>,</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="original">
        <div class="original-label">🌿 Sua mensagem original:</div>
        <p class="original-text">"{{original_message}}"</p>
      </div>
    </div>
    <div class="footer">
      <p class="closing"><strong>Abraços,<br>Equipe Home Garden Manual</strong></p>
      
      <p class="community-note">
        Visite nosso <a href="https://homegardenmanual.lovable.app">site</a>, 
        um lugar para você explorar dicas de jardinagem, decoração e muito mais!
      </p>
      
      <p class="no-reply">
        Por favor, não responda a este e-mail, pois se trata de uma mensagem automática 
        e não é possível dar continuidade ao seu atendimento por aqui.
      </p>
      
      <div class="social-icons">
        {{social_icons}}
      </div>
      
      <p style="color: #888888;">© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = NOW()
WHERE name = 'Nature Garden';