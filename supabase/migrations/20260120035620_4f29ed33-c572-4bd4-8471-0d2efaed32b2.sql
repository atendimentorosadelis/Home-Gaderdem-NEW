-- Drop the existing restrictive policy for viewing
DROP POLICY IF EXISTS "Admins can read views" ON article_views;

-- Create a permissive policy so anyone can read view counts
CREATE POLICY "Anyone can read view counts"
ON article_views FOR SELECT
USING (true);