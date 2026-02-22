-- Create a function to fetch cron job history for the queue processor
-- This is needed because direct access to cron schema requires special permissions
CREATE OR REPLACE FUNCTION public.get_cron_job_history()
RETURNS TABLE (
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
SET search_path = public
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

-- Grant execute permission to authenticated users (admins will filter in app)
GRANT EXECUTE ON FUNCTION public.get_cron_job_history() TO authenticated;