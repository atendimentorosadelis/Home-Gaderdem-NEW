-- Update Dark Professional template
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; margin: 0; padding: 0; background: #121212; }
    .container { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
    .card { background: #1e1e1e; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
    .header { background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 35px; text-align: center; }
    .logo { max-width: 160px; height: auto; }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #4caf50, #81c784, #4caf50); }
    .content { padding: 40px 35px; }
    .greeting { font-size: 18px; color: #81c784; margin-bottom: 25px; }
    .message-body { color: #b0b0b0; }
    .message-body p { margin: 0 0 18px; }
    .original { background: #252525; padding: 22px; border-radius: 8px; margin-top: 30px; border-left: 3px solid #4caf50; }
    .original-label { font-weight: 600; color: #81c784; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .original-text { font-style: italic; color: #888; }
    .footer { background: #151515; padding: 30px 25px; text-align: center; border-top: 1px solid #333; }
    .footer p { font-size: 13px; color: #888; margin: 8px 0; }
    .footer a { color: #4caf50; text-decoration: none; }
    .closing { color: #e0e0e0; margin-bottom: 20px; }
    .community-note { color: #999; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #666; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #666; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://homegardenmanual.lovable.app/images/logo-email-dark.png" alt="Home Garden Manual" class="logo">
      </div>
      <div class="accent-bar"></div>
      <div class="content">
        <p class="greeting">Olá <strong>{{name}}</strong>,</p>
        <div class="message-body">
          {{content}}
        </div>
        <div class="original">
          <div class="original-label">Mensagem Original</div>
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
          <a href="https://facebook.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24" height="24" /></a>
          <a href="https://tiktok.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" width="24" height="24" /></a>
          <a href="https://instagram.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" width="24" height="24" /></a>
          <a href="https://youtube.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" width="24" height="24" /></a>
        </div>
        
        <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
        
        <p style="margin-top: 15px;">
          <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>',
updated_at = now()
WHERE name = 'Dark Professional';

-- Update Elegante Verde template
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
    .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; color: #2d5016; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #444; }
    .original { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #555; }
    .footer { text-align: center; padding: 30px; background: #f5f5f5; border-radius: 0 0 12px 12px; }
    .footer p { font-size: 13px; color: #666; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .closing { color: #333; margin-bottom: 20px; }
    .community-note { color: #555; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #999; text-decoration: underline; font-size: 12px; }
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
        <a href="https://facebook.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24" height="24" /></a>
        <a href="https://tiktok.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" width="24" height="24" /></a>
        <a href="https://instagram.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" width="24" height="24" /></a>
        <a href="https://youtube.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" width="24" height="24" /></a>
      </div>
      
      <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
updated_at = now()
WHERE name = 'Elegante Verde';

-- Update Minimalista Branco template
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: ''Georgia'', serif; line-height: 1.8; color: #2c2c2c; margin: 0; padding: 0; background: #ffffff; }
    .container { max-width: 560px; margin: 0 auto; padding: 60px 20px; }
    .header { text-align: center; padding-bottom: 40px; border-bottom: 1px solid #eee; }
    .logo { max-width: 140px; height: auto; }
    .content { padding: 50px 0; }
    .greeting { font-size: 20px; color: #1a1a1a; margin-bottom: 30px; font-weight: 400; }
    .message-body { font-size: 16px; color: #444; }
    .message-body p { margin: 0 0 20px; }
    .divider { height: 1px; background: #eee; margin: 40px 0; }
    .original { padding: 25px; background: #fafafa; border-radius: 4px; }
    .original-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 12px; }
    .original-text { font-style: italic; color: #666; font-size: 14px; }
    .footer { text-align: center; padding-top: 40px; border-top: 1px solid #eee; }
    .footer p { font-size: 13px; color: #666; margin: 8px 0; }
    .footer a { color: #4a7c23; text-decoration: none; }
    .brand { font-size: 14px; color: #4a7c23; font-weight: 600; letter-spacing: 1px; margin-bottom: 15px; }
    .closing { color: #333; margin-bottom: 20px; }
    .community-note { color: #555; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #999; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #999; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <p class="greeting">Olá {{name}},</p>
      <div class="message-body">
        {{content}}
      </div>
      <div class="divider"></div>
      <div class="original">
        <div class="original-label">Mensagem Original</div>
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
        <a href="https://facebook.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24" height="24" /></a>
        <a href="https://tiktok.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" width="24" height="24" /></a>
        <a href="https://instagram.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" width="24" height="24" /></a>
        <a href="https://youtube.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" width="24" height="24" /></a>
      </div>
      
      <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
updated_at = now()
WHERE name = 'Minimalista Branco';

-- Update Moderno Flat template
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #059669; padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
    .logo { max-width: 150px; height: auto; }
    .content { background: white; padding: 40px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .greeting { font-size: 24px; color: #111827; margin-bottom: 20px; font-weight: 600; }
    .message-body { color: #4b5563; font-size: 15px; }
    .message-body p { margin: 0 0 16px; }
    .info-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 30px; }
    .info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .info-icon { width: 32px; height: 32px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; }
    .info-label { font-weight: 600; color: #374151; font-size: 14px; }
    .info-text { color: #6b7280; font-size: 14px; font-style: italic; }
    .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
    .footer { text-align: center; padding: 30px; background: #f9fafb; border-radius: 0 0 16px 16px; }
    .footer p { font-size: 13px; color: #666; margin: 8px 0; }
    .footer a { color: #059669; text-decoration: none; }
    .closing { color: #333; margin-bottom: 20px; }
    .community-note { color: #555; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #9ca3af; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #9ca3af; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
    </div>
    <div class="content">
      <span class="badge">Resposta ao seu contato</span>
      <h2 class="greeting">Olá, {{name}}!</h2>
      <div class="message-body">
        {{content}}
      </div>
      <div class="info-card">
        <div class="info-header">
          <span class="info-label">Sua mensagem original</span>
        </div>
        <p class="info-text">"{{original_message}}"</p>
      </div>
      <div style="text-align: center;">
        <a href="https://homegardenmanual.lovable.app" class="cta-button">Visitar o Site</a>
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
        <a href="https://facebook.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24" height="24" /></a>
        <a href="https://tiktok.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" width="24" height="24" /></a>
        <a href="https://instagram.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" width="24" height="24" /></a>
        <a href="https://youtube.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" width="24" height="24" /></a>
      </div>
      
      <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
      
      <p style="margin-top: 15px;">
        <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>',
updated_at = now()
WHERE name = 'Moderno Flat';

-- Update Nature Garden template
UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.7; color: #3d3d3d; margin: 0; padding: 0; background: linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 100%); }
    .container { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
    .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(45,80,22,0.12); }
    .header { background: linear-gradient(135deg, #33691e 0%, #558b2f 50%, #7cb342 100%); padding: 35px; text-align: center; }
    .logo { max-width: 160px; height: auto; }
    .content { padding: 35px; }
    .greeting { font-size: 18px; color: #33691e; margin-bottom: 25px; }
    .message-body p { margin: 0 0 18px; color: #4a4a4a; }
    .leaf-divider { text-align: center; padding: 20px 0; }
    .original { background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%); padding: 22px; border-radius: 12px; border: 2px dashed #a5d6a7; }
    .original-label { font-weight: 600; color: #558b2f; font-size: 13px; margin-bottom: 12px; }
    .original-text { font-style: italic; color: #555; }
    .footer { background: #f5f5f5; padding: 30px 25px; text-align: center; }
    .footer p { font-size: 13px; color: #666; margin: 8px 0; }
    .footer a { color: #558b2f; text-decoration: none; }
    .closing { color: #333; margin-bottom: 20px; }
    .community-note { color: #555; font-size: 13px; margin-bottom: 15px; }
    .no-reply { font-size: 11px; color: #888; margin-bottom: 20px; }
    .social-icons { margin: 20px 0; }
    .social-icons a { display: inline-block; margin: 0 8px; }
    .unsubscribe { color: #999; text-decoration: underline; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://homegardenmanual.lovable.app/images/logo-email-light.png" alt="Home Garden Manual" class="logo">
      </div>
      <div class="content">
        <p class="greeting">Olá <strong>{{name}}</strong>,</p>
        <div class="message-body">
          {{content}}
        </div>
        <div class="leaf-divider"></div>
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
          <a href="https://facebook.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24" height="24" /></a>
          <a href="https://tiktok.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046121.png" alt="TikTok" width="24" height="24" /></a>
          <a href="https://instagram.com/homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" width="24" height="24" /></a>
          <a href="https://youtube.com/@homegardenmanual"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" width="24" height="24" /></a>
        </div>
        
        <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
        
        <p style="margin-top: 15px;">
          <a href="https://homegardenmanual.lovable.app/unsubscribe?email={{email}}" class="unsubscribe">Cancelar inscrição</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>',
updated_at = now()
WHERE name = 'Nature Garden';