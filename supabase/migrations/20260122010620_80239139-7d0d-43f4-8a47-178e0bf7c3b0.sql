-- Adicionar coluna is_super_admin à tabela admin_permissions
ALTER TABLE public.admin_permissions 
ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Garantir que o usuário walliston seja marcado como super admin
UPDATE public.admin_permissions ap
SET is_super_admin = true
FROM public.profiles p
WHERE ap.user_id = p.user_id 
AND p.username ILIKE '%walliston%';