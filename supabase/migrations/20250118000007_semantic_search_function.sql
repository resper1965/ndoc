-- Migration: Criar função semantic_search
-- Data: 2025-01-18
-- Descrição: Função SQL para busca semântica usando embeddings

-- Verificar se pgvector está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE EXCEPTION 'Extensão pgvector não está habilitada. Execute 20250118000001_enable_pgvector.sql primeiro.';
  END IF;
END $$;

-- Função para busca semântica
CREATE OR REPLACE FUNCTION semantic_search(
  query_embedding vector(1536),
  organization_id_filter UUID DEFAULT NULL,
  document_type_filter VARCHAR(50) DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  document_title TEXT,
  document_type VARCHAR(50),
  chunk_index INTEGER,
  document_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.chunk_id,
    dc.document_id,
    dc.content,
    1 - (de.embedding <=> query_embedding) AS similarity,
    d.title AS document_title,
    d.document_type,
    dc.chunk_index,
    d.path AS document_path
  FROM document_embeddings de
  JOIN document_chunks dc ON de.chunk_id = dc.id
  JOIN documents d ON dc.document_id = d.id
  WHERE
    (organization_id_filter IS NULL OR d.organization_id = organization_id_filter)
    AND (document_type_filter IS NULL OR d.document_type = document_type_filter)
    AND (1 - (de.embedding <=> query_embedding)) >= match_threshold
    -- Verificar permissões RLS
    AND (
      d.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
      OR d.status = 'published'
      OR is_superadmin()
    )
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION semantic_search(vector, UUID, VARCHAR, FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION semantic_search(vector, UUID, VARCHAR, FLOAT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION semantic_search(vector, UUID, VARCHAR, FLOAT, INT) TO anon;

-- Comentários
COMMENT ON FUNCTION semantic_search IS 'Busca semântica usando embeddings. Retorna chunks similares à query.';
COMMENT ON PARAMETER semantic_search.query_embedding IS 'Embedding vetorial da query de busca (1536 dimensões)';
COMMENT ON PARAMETER semantic_search.organization_id_filter IS 'Filtrar por organização (NULL = todas)';
COMMENT ON PARAMETER semantic_search.document_type_filter IS 'Filtrar por tipo de documento (NULL = todos)';
COMMENT ON PARAMETER semantic_search.match_threshold IS 'Threshold mínimo de similaridade (0-1)';
COMMENT ON PARAMETER semantic_search.match_count IS 'Número máximo de resultados';

