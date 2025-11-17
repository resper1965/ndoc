-- Migration: Criar tabela document_embeddings
-- Data: 2025-01-18
-- Descrição: Tabela para armazenar embeddings vetoriais dos chunks de documentos

-- Verificar se pgvector está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE EXCEPTION 'Extensão pgvector não está habilitada. Execute 20250118000001_enable_pgvector.sql primeiro.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small (1536 dimensões)
  model VARCHAR(100) DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chunk_id)
);

-- Índice HNSW para busca rápida por similaridade
-- HNSW (Hierarchical Navigable Small World) é otimizado para busca por similaridade
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding_hnsw
  ON document_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Índice adicional para lookup por chunk_id
CREATE INDEX IF NOT EXISTS idx_document_embeddings_chunk_id 
  ON document_embeddings(chunk_id);

-- RLS (herda da tabela document_chunks)
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver embeddings de chunks acessíveis
CREATE POLICY "Users can view embeddings of accessible chunks"
  ON document_embeddings FOR SELECT
  USING (
    chunk_id IN (
      SELECT id FROM document_chunks
      WHERE document_id IN (
        SELECT id FROM documents
        WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid()
        )
        OR status = 'published'
      )
    )
    OR is_superadmin()
  );

-- Política: Apenas sistema pode inserir/atualizar embeddings (via service_role)
CREATE POLICY "Service role can manage embeddings"
  ON document_embeddings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE document_embeddings IS 'Embeddings vetoriais dos chunks para busca semântica';
COMMENT ON COLUMN document_embeddings.embedding IS 'Vetor de 1536 dimensões gerado pelo modelo text-embedding-3-small da OpenAI';
COMMENT ON COLUMN document_embeddings.model IS 'Modelo usado para gerar o embedding';

