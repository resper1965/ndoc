-- Migration: Criar tabela document_chunks
-- Data: 2025-01-18
-- Descrição: Tabela para armazenar chunks (pedaços) de documentos para vetorização

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb, -- Informações adicionais (seção, página, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id 
  ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index 
  ON document_chunks(document_id, chunk_index);

-- RLS (herda da tabela documents)
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver chunks de documentos acessíveis
CREATE POLICY "Users can view chunks of accessible documents"
  ON document_chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
      OR status = 'published'
    )
    OR is_superadmin()
  );

-- Política: Apenas sistema pode inserir/atualizar chunks (via service_role)
CREATE POLICY "Service role can manage chunks"
  ON document_chunks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE document_chunks IS 'Chunks (pedaços) de documentos para vetorização e busca semântica';
COMMENT ON COLUMN document_chunks.chunk_index IS 'Índice sequencial do chunk no documento';
COMMENT ON COLUMN document_chunks.token_count IS 'Número aproximado de tokens no chunk';
COMMENT ON COLUMN document_chunks.metadata IS 'Metadados adicionais (seção, página, tipo de conteúdo, etc.)';

