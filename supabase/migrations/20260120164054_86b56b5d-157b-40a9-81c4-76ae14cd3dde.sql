-- Create table for reply templates
CREATE TABLE public.contact_reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_reply_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view templates"
ON public.contact_reply_templates
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can insert templates"
ON public.contact_reply_templates
FOR INSERT
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update templates"
ON public.contact_reply_templates
FOR UPDATE
USING (is_current_user_admin());

CREATE POLICY "Admins can delete templates"
ON public.contact_reply_templates
FOR DELETE
USING (is_current_user_admin());

-- Insert default templates
INSERT INTO public.contact_reply_templates (title, content, category) VALUES
('Agradecimento Geral', 'Olá {nome},

Muito obrigado por entrar em contato conosco!

Recebemos sua mensagem e ficamos felizes em poder ajudar. Nossa equipe está analisando sua solicitação e em breve retornaremos com mais informações.

Enquanto isso, continue explorando nosso site para mais dicas de jardinagem e decoração.

Atenciosamente,
Equipe Home Garden Manual', 'general'),

('Dúvida sobre Plantas', 'Olá {nome},

Obrigado pela sua pergunta sobre plantas!

Ficamos muito felizes em ajudar com suas dúvidas de jardinagem. Com base na sua mensagem, aqui vão algumas orientações:

[Insira aqui as orientações específicas]

Se precisar de mais informações, não hesite em nos contatar novamente.

Bons cultivos!
Equipe Home Garden Manual', 'question'),

('Sugestão Recebida', 'Olá {nome},

Agradecemos imensamente sua sugestão de conteúdo!

Adoramos receber ideias dos nossos leitores e sua contribuição é muito valiosa para nós. Vamos avaliar sua sugestão e, se possível, criar um artigo sobre o tema.

Fique de olho em nossas publicações!

Um abraço,
Equipe Home Garden Manual', 'suggestion'),

('Parceria/Colaboração', 'Olá {nome},

Obrigado pelo interesse em colaborar com o Home Garden Manual!

Ficamos muito felizes com sua proposta de parceria. Nossa equipe irá analisar os detalhes e entraremos em contato para discutir as possibilidades.

Aguarde nosso retorno em breve.

Cordialmente,
Equipe Home Garden Manual', 'partnership'),

('Problema Reportado', 'Olá {nome},

Agradecemos por nos informar sobre esse problema!

Lamentamos qualquer inconveniente causado. Nossa equipe técnica já foi notificada e está trabalhando para resolver a situação o mais rápido possível.

Agradecemos sua paciência e compreensão.

Atenciosamente,
Equipe Home Garden Manual', 'problem');

-- Create index
CREATE INDEX idx_contact_reply_templates_category ON public.contact_reply_templates(category);
CREATE INDEX idx_contact_reply_templates_active ON public.contact_reply_templates(is_active);