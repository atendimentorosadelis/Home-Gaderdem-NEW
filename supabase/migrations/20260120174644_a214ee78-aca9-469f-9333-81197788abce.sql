-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can update tracking via token" ON public.newsletter_email_tracking;

-- No update policy needed for anonymous users - tracking will be done via edge function with service role