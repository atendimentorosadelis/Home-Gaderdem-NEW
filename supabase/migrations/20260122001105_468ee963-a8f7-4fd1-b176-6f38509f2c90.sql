-- Atualizar a função is_current_user_admin para funcionar com arquitetura híbrida
-- Verifica admin por email do JWT já que os user_ids são diferentes entre Cloud e External

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.role = 'admin'
    AND p.email = (auth.jwt() ->> 'email')
  )
$$;