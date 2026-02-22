-- Adicionar colunas para armazenar contexto visual das imagens
ALTER TABLE content_articles
ADD COLUMN IF NOT EXISTS main_subject TEXT,
ADD COLUMN IF NOT EXISTS visual_context TEXT,
ADD COLUMN IF NOT EXISTS gallery_prompts JSONB;

-- Comentários para documentação
COMMENT ON COLUMN content_articles.main_subject IS 'Elemento visual principal em inglês para geração de imagens (ex: modern gourmet kitchen with built-in BBQ)';
COMMENT ON COLUMN content_articles.visual_context IS 'Contexto visual/ambiente em inglês para geração de imagens (ex: elegant backyard setting, natural lighting)';
COMMENT ON COLUMN content_articles.gallery_prompts IS 'Array de prompts em inglês para cada imagem da galeria';