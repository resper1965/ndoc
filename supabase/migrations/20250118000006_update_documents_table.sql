-- Migration: Atualizar tabela documents
-- Data: 2025-01-18
-- Descrição: Adicionar campos para templates e vetorização na tabela documents

-- Adicionar campos para templates
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES document_templates(id),
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) CHECK (document_type IN ('policy', 'procedure', 'manual', 'other')),
ADD COLUMN IF NOT EXISTS is_vectorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMPTZ;

-- Índices
CREATE INDEX IF NOT EXISTS idx_documents_template_id 
  ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type 
  ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_vectorized 
  ON documents(is_vectorized) WHERE is_vectorized = false;

-- Comentários
COMMENT ON COLUMN documents.template_id IS 'Template usado para criar/formatar o documento';
COMMENT ON COLUMN documents.document_type IS 'Tipo do documento (policy, procedure, manual, other)';
COMMENT ON COLUMN documents.is_vectorized IS 'Indica se o documento foi vetorizado';
COMMENT ON COLUMN documents.vectorized_at IS 'Data/hora da vetorização';

