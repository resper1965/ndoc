-- Migration: Criar tabela document_processing_jobs
-- Data: 2025-01-18
-- Descrição: Tabela para rastrear jobs de processamento de documentos (conversão, chunking, vetorização)

CREATE TABLE IF NOT EXISTS document_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stage VARCHAR(50), -- 'conversion', 'chunking', 'embedding', 'complete'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Informações adicionais do processamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_document_id 
  ON document_processing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_status 
  ON document_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_document_processing_jobs_created_at 
  ON document_processing_jobs(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_document_processing_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_processing_jobs_updated_at
  BEFORE UPDATE ON document_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_document_processing_jobs_updated_at();

-- RLS
ALTER TABLE document_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver jobs dos seus documentos
CREATE POLICY "Users can view jobs for their documents"
  ON document_processing_jobs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
    OR is_superadmin()
  );

-- Política: Apenas sistema pode gerenciar jobs (via service_role)
CREATE POLICY "Service role can manage jobs"
  ON document_processing_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE document_processing_jobs IS 'Jobs de processamento de documentos (conversão, chunking, vetorização)';
COMMENT ON COLUMN document_processing_jobs.stage IS 'Estágio atual do processamento';
COMMENT ON COLUMN document_processing_jobs.metadata IS 'Metadados do processamento (progresso, estatísticas, etc.)';

