-- Remover políticas RLS existentes de email_templates que possam estar bloqueando
DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can insert email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can update email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can delete email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public read access to email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can view email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.email_templates;

-- Criar política que permite leitura para usuários autenticados
-- Templates de email não são dados sensíveis
CREATE POLICY "Authenticated users can read email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (true);

-- Política para service_role poder inserir/atualizar (para edge functions)
CREATE POLICY "Service role can manage email templates"
ON public.email_templates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);