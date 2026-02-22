-- Atualizar função is_current_user_admin para funcionar com arquitetura híbrida
-- Verifica tanto por user_id quanto por email do JWT
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.role = 'admin'
    AND (
      -- Verificar por user_id direto
      ur.user_id = auth.uid()
      OR
      -- Verificar por email (para arquitetura híbrida)
      ur.user_id IN (
        SELECT p.user_id FROM public.profiles p 
        WHERE p.email = auth.jwt() ->> 'email'
      )
    )
  )
$$;