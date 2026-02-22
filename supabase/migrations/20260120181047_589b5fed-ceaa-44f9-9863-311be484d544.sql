-- Create email_templates table for storing professional email templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'contact_reply',
  html_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Service role can manage templates"
  ON public.email_templates FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 5 professional email templates

-- Template 1: Elegante Verde (Clássico) - Marked as default
INSERT INTO public.email_templates (name, description, category, html_template, is_default) VALUES (
  'Elegante Verde',
  'Template clássico corporativo com header gradiente verde e design profissional',
  'contact_reply',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; color: #2d5016; margin-bottom: 20px; }
    .message-body p { margin: 0 0 16px; color: #444; }
    .original { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; border-left: 4px solid #4a7c23; }
    .original-label { font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; margin-bottom: 10px; }
    .original-text { font-style: italic; color: #555; }
    .footer { text-align: center; padding: 25px; color: #888; font-size: 12px; }
    .social-links { margin: 15px 0; }
    .social-links a { color: #4a7c23; text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
      <h1>🌿 Home Garden Manual</h1>
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
      <div class="social-links">
        <a href="https://homegardenmanual.com">Visite nosso site</a>
      </div>
      <p>© {{year}} Home Garden Manual. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>',
  true
);

-- Template 2: Minimalista Branco
INSERT INTO public.email_templates (name, description, category, html_template, is_default) VALUES (
  'Minimalista Branco',
  'Design clean e moderno com muito espaço branco e tipografia elegante',
  'contact_reply',
  '<!DOCTYPE html>
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
    .footer p { font-size: 12px; color: #999; margin: 5px 0; }
    .brand { font-size: 14px; color: #4a7c23; font-weight: 600; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
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
      <p class="brand">HOME GARDEN MANUAL</p>
      <p>© {{year}} Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>',
  false
);

-- Template 3: Nature Garden (Temático)
INSERT INTO public.email_templates (name, description, category, html_template, is_default) VALUES (
  'Nature Garden',
  'Tons terrosos com elementos naturais e ícones de plantas para uma experiência imersiva',
  'contact_reply',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.7; color: #3d3d3d; margin: 0; padding: 0; background: linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 100%); }
    .container { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
    .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(45,80,22,0.12); }
    .header { background: linear-gradient(135deg, #33691e 0%, #558b2f 50%, #7cb342 100%); padding: 35px; text-align: center; position: relative; }
    .header::before { content: "🌱"; position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-size: 24px; }
    .header::after { content: "🌿"; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 24px; }
    .logo { max-width: 160px; height: auto; }
    .header h1 { margin: 15px 0 0; color: white; font-size: 22px; }
    .content { padding: 35px; }
    .greeting { display: flex; align-items: center; gap: 10px; font-size: 18px; color: #33691e; margin-bottom: 25px; }
    .greeting::before { content: "🌻"; font-size: 20px; }
    .message-body p { margin: 0 0 18px; color: #4a4a4a; }
    .leaf-divider { text-align: center; padding: 20px 0; font-size: 20px; letter-spacing: 8px; }
    .original { background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%); padding: 22px; border-radius: 12px; border: 2px dashed #a5d6a7; }
    .original-label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #558b2f; font-size: 13px; margin-bottom: 12px; }
    .original-label::before { content: "📩"; }
    .original-text { font-style: italic; color: #555; }
    .footer { background: #f5f5f5; padding: 25px; text-align: center; }
    .footer-icons { font-size: 18px; letter-spacing: 6px; margin-bottom: 10px; }
    .footer p { font-size: 12px; color: #888; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
        <h1>Home Garden Manual</h1>
      </div>
      <div class="content">
        <p class="greeting">Olá <strong>{{name}}</strong>,</p>
        <div class="message-body">
          {{content}}
        </div>
        <div class="leaf-divider">🍃 🌱 🍃</div>
        <div class="original">
          <div class="original-label">Sua mensagem original</div>
          <p class="original-text">"{{original_message}}"</p>
        </div>
      </div>
      <div class="footer">
        <div class="footer-icons">🌷 🌻 🌹 🌸</div>
        <p>© {{year}} Home Garden Manual</p>
        <p>Cultivando conhecimento, colhendo beleza</p>
      </div>
    </div>
  </div>
</body>
</html>',
  false
);

-- Template 4: Dark Professional
INSERT INTO public.email_templates (name, description, category, html_template, is_default) VALUES (
  'Dark Professional',
  'Tema escuro elegante com acentos verdes vibrantes para uma aparência moderna e sofisticada',
  'contact_reply',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; margin: 0; padding: 0; background: #121212; }
    .container { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
    .card { background: #1e1e1e; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
    .header { background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 35px; text-align: center; }
    .logo { max-width: 160px; height: auto; filter: brightness(1.1); }
    .header h1 { margin: 15px 0 0; color: #ffffff; font-size: 22px; font-weight: 600; }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #4caf50, #81c784, #4caf50); }
    .content { padding: 40px 35px; }
    .greeting { font-size: 18px; color: #81c784; margin-bottom: 25px; }
    .message-body { color: #b0b0b0; }
    .message-body p { margin: 0 0 18px; }
    .original { background: #252525; padding: 22px; border-radius: 8px; margin-top: 30px; border-left: 3px solid #4caf50; }
    .original-label { font-weight: 600; color: #81c784; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .original-text { font-style: italic; color: #888; }
    .footer { background: #151515; padding: 25px; text-align: center; border-top: 1px solid #333; }
    .footer p { font-size: 12px; color: #666; margin: 5px 0; }
    .footer a { color: #4caf50; text-decoration: none; }
    .glow-text { color: #4caf50; text-shadow: 0 0 10px rgba(76,175,80,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
        <h1>Home Garden Manual</h1>
      </div>
      <div class="accent-bar"></div>
      <div class="content">
        <p class="greeting">Olá <strong>{{name}}</strong>,</p>
        <div class="message-body">
          {{content}}
        </div>
        <div class="original">
          <div class="original-label">📨 Mensagem Original</div>
          <p class="original-text">"{{original_message}}"</p>
        </div>
      </div>
      <div class="footer">
        <p class="glow-text">🌿 Home Garden Manual</p>
        <p>© {{year}} Todos os direitos reservados</p>
        <p><a href="https://homegardenmanual.com">homegardenmanual.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>',
  false
);

-- Template 5: Moderno Flat
INSERT INTO public.email_templates (name, description, category, html_template, is_default) VALUES (
  'Moderno Flat',
  'Design contemporâneo com cores sólidas, cards arredondados e visual limpo',
  'contact_reply',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: ''Inter'', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #059669; padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
    .logo { max-width: 150px; height: auto; }
    .header-text { color: white; font-size: 20px; font-weight: 700; margin-top: 12px; }
    .content { background: white; padding: 40px; border-radius: 0 0 16px 16px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .greeting { font-size: 24px; color: #111827; margin-bottom: 20px; font-weight: 600; }
    .message-body { color: #4b5563; font-size: 15px; }
    .message-body p { margin: 0 0 16px; }
    .info-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 30px; }
    .info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .info-icon { width: 32px; height: 32px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; }
    .info-label { font-weight: 600; color: #374151; font-size: 14px; }
    .info-text { color: #6b7280; font-size: 14px; font-style: italic; }
    .footer { text-align: center; padding: 30px; }
    .footer-logo { font-weight: 700; color: #059669; font-size: 16px; margin-bottom: 8px; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 4px 0; }
    .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Home Garden Manual" class="logo">
      <div class="header-text">Home Garden Manual</div>
    </div>
    <div class="content">
      <span class="badge">✉️ Resposta ao seu contato</span>
      <h2 class="greeting">Olá, {{name}}!</h2>
      <div class="message-body">
        {{content}}
      </div>
      <div class="info-card">
        <div class="info-header">
          <div class="info-icon">📩</div>
          <span class="info-label">Sua mensagem original</span>
        </div>
        <p class="info-text">"{{original_message}}"</p>
      </div>
      <div style="text-align: center;">
        <a href="https://homegardenmanual.com" class="cta-button">Visitar o Site</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-logo">🌿 Home Garden Manual</div>
      <p>© {{year}} Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>',
  false
);