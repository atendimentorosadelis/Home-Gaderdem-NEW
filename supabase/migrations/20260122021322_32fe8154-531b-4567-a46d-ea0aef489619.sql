-- Drop existing policies on audit_logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Create new policies using is_current_user_admin() which validates by email in JWT
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_current_user_admin());

-- Also allow service role to manage all audit logs
CREATE POLICY "Service role can manage audit logs"
ON public.audit_logs
FOR ALL
USING (auth.role() = 'service_role');