-- Adicionar campos para validação de duplicatas
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS filename TEXT,
  ADD COLUMN IF NOT EXISTS file_hash TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Criar índices para busca eficiente de duplicatas
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(organization_id, file_hash) WHERE file_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(organization_id, content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(organization_id, filename) WHERE filename IS NOT NULL;

-- Comentários
COMMENT ON COLUMN documents.filename IS 'Nome original do arquivo enviado';
COMMENT ON COLUMN documents.file_hash IS 'Hash SHA-256 do arquivo original (para detecção de duplicatas)';
COMMENT ON COLUMN documents.content_hash IS 'Hash SHA-256 do conteúdo convertido em Markdown (para detecção de duplicatas)';

