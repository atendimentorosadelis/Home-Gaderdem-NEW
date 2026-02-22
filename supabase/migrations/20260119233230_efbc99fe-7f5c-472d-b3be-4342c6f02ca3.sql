-- Populate generation_history with existing articles
INSERT INTO generation_history (user_id, topic, article_title, article_id, status, created_at)
SELECT 
  p.user_id,
  COALESCE(ca.category, 'Artigo gerado') as topic,
  ca.title as article_title,
  ca.id as article_id,
  'success' as status,
  ca.created_at
FROM content_articles ca
JOIN profiles p ON p.id = ca.author_id
WHERE NOT EXISTS (
  SELECT 1 FROM generation_history gh 
  WHERE gh.article_id = ca.id
);