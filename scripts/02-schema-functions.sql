-- ============================================================================
-- HOME GARDEN MANUAL - MIGRATION SCRIPT 02/05
-- FUNCTIONS (All Database Functions)
-- ============================================================================
-- Execute AFTER 01-schema-tables.sql
-- Now that all tables exist, functions can reference them safely
-- ============================================================================

-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
$$;

-- Function to handle new user registration (creates profile and assigns role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 2: ARTICLE FUNCTIONS
-- ============================================================================

-- Function to increment article likes with duplicate prevention
CREATE OR REPLACE FUNCTION public.increment_article_likes(p_article_id uuid, p_ip_hash text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Try to insert the like (will fail if already exists due to UNIQUE constraint)
  INSERT INTO article_likes (article_id, ip_hash)
  VALUES (p_article_id, p_ip_hash);
  
  -- Increment the counter
  UPDATE content_articles 
  SET likes_count = likes_count + 1
  WHERE id = p_article_id
  RETURNING likes_count INTO new_count;
  
  RETURN new_count;
EXCEPTION
  WHEN unique_violation THEN
    -- Already liked, return current count
    SELECT likes_count INTO new_count FROM content_articles WHERE id = p_article_id;
    RETURN new_count;
END;
$$;

-- Function to register affiliate banner clicks
CREATE OR REPLACE FUNCTION public.register_affiliate_click(
  p_article_id uuid, 
  p_ip_hash text, 
  p_user_agent text DEFAULT NULL, 
  p_referrer text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert the click record
  INSERT INTO affiliate_banner_clicks (article_id, ip_hash, user_agent, referrer)
  VALUES (p_article_id, p_ip_hash, p_user_agent, p_referrer);
  
  -- Increment the counter on the article
  UPDATE content_articles 
  SET affiliate_clicks_count = affiliate_clicks_count + 1
  WHERE id = p_article_id
  RETURNING affiliate_clicks_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- ============================================================================
-- SECTION 3: CRON JOB FUNCTIONS
-- ============================================================================

-- Function to get cron job history (for image queue processing)
CREATE OR REPLACE FUNCTION public.get_cron_job_history()
RETURNS TABLE(
  runid bigint, 
  job_pid integer, 
  status text, 
  return_message text, 
  start_time timestamp with time zone, 
  end_time timestamp with time zone, 
  duration_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jrd.runid,
    jrd.job_pid,
    jrd.status,
    jrd.return_message,
    jrd.start_time,
    jrd.end_time,
    CASE 
      WHEN jrd.end_time IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) * 1000
      ELSE NULL
    END as duration_ms
  FROM cron.job_run_details jrd
  INNER JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE j.jobname = 'process-image-queue-every-5-min'
  ORDER BY jrd.start_time DESC
  LIMIT 50;
END;
$$;

-- ============================================================================
-- END OF SCRIPT 02/05
-- ============================================================================
-- Next: Execute 03-schema-rls-indexes.sql
-- ============================================================================
