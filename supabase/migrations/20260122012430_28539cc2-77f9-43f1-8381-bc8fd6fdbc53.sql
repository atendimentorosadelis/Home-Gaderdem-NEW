-- Inserir registro do Walliston em admin_permissions com is_super_admin = true
-- Usa INSERT ... ON CONFLICT para criar ou atualizar
INSERT INTO public.admin_permissions (user_id, is_super_admin)
SELECT p.user_id, true
FROM public.profiles p
WHERE p.username ILIKE '%walliston%'
ON CONFLICT (user_id) DO UPDATE SET is_super_admin = true;