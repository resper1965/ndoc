-- Migration: Criar tabela document_templates
-- Data: 2025-01-18
-- Descrição: Tabela para armazenar templates de documentos (Política, Procedimento, Manual)

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'procedure', 'manual')),
  description TEXT,
  template_content TEXT NOT NULL, -- Template MDX com placeholders
  metadata_schema JSONB DEFAULT '{}'::jsonb, -- Schema para frontmatter
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_document_templates_organization_id 
  ON document_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type 
  ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_default 
  ON document_templates(is_default) WHERE is_default = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_document_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_document_templates_updated_at();

-- RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver templates da sua organização
CREATE POLICY "Users can view templates in their organization"
  ON document_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR is_superadmin()
    OR is_default = true -- Templates padrão são públicos
  );

-- Política: Admins podem gerenciar templates
CREATE POLICY "Admins can manage templates"
  ON document_templates FOR ALL
  USING (
    is_superadmin()
    OR is_orgadmin(organization_id, auth.uid())
  )
  WITH CHECK (
    is_superadmin()
    OR is_orgadmin(organization_id, auth.uid())
  );

-- Comentários
COMMENT ON TABLE document_templates IS 'Templates de documentos para Políticas, Procedimentos e Manuais';
COMMENT ON COLUMN document_templates.template_content IS 'Template MDX com placeholders para variáveis';
COMMENT ON COLUMN document_templates.metadata_schema IS 'Schema JSON para validação do frontmatter';

