-- ============================================
-- Migration: Sistema de Permissões Granulares por Documento
-- Data: 2025-01-21
-- Descrição: Controle fino de acesso a documentos e knowledge bases
-- ============================================

-- ============================================
-- TABLE: knowledge_bases
-- ============================================
-- Bases de conhecimento para vetorização
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Configurações de vetorização
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  chunk_size INTEGER DEFAULT 1000,
  chunk_overlap INTEGER DEFAULT 200,

  -- Agente padrão para esta base
  default_agent_id UUID,

  -- Template padrão para novos documentos
  default_template_id UUID,

  -- Metadados
  metadata JSONB DEFAULT '{}',

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_kb_org ON knowledge_bases(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_slug ON knowledge_bases(slug);

-- ============================================
-- TABLE: document_permissions
-- ============================================
-- Permissões granulares por documento
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de permissão
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'admin')),

  -- Concedido por quem
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Opcional: expiração
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_perms_document ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_perms_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_perms_expires ON document_permissions(expires_at);

-- ============================================
-- TABLE: knowledge_base_permissions
-- ============================================
-- Permissões por base de conhecimento (herda para todos os docs)
CREATE TABLE IF NOT EXISTS knowledge_base_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de permissão
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'admin')),

  -- Concedido por quem
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(knowledge_base_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_kb_perms_kb ON knowledge_base_permissions(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_kb_perms_user ON knowledge_base_permissions(user_id);

-- ============================================
-- TABLE: document_tags
-- ============================================
-- Tags/Labels para agrupar documentos
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_doc_tags_org ON document_tags(organization_id);

-- ============================================
-- TABLE: document_tag_assignments
-- ============================================
-- Relacionamento N:N entre documentos e tags
CREATE TABLE IF NOT EXISTS document_tag_assignments (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES document_tags(id) ON DELETE CASCADE,

  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_tag_assign_doc ON document_tag_assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_tag_assign_tag ON document_tag_assignments(tag_id);

-- ============================================
-- Adicionar coluna knowledge_base_id em documents
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'knowledge_base_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE SET NULL;
    CREATE INDEX idx_documents_kb ON documents(knowledge_base_id);
  END IF;
END $$;

-- ============================================
-- FUNCTION: Obter documentos permitidos para usuário
-- ============================================
CREATE OR REPLACE FUNCTION get_permitted_documents(
  p_user_id UUID,
  p_organization_id UUID
)
RETURNS TABLE(document_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT d.id
  FROM documents d
  WHERE d.organization_id = p_organization_id
  AND (
    -- Org-Admin vê tudo
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = p_user_id
      AND om.organization_id = p_organization_id
      AND om.role IN ('orgadmin', 'owner')
    )
    -- Ou tem permissão explícita no documento
    OR EXISTS (
      SELECT 1 FROM document_permissions dp
      WHERE dp.document_id = d.id
      AND dp.user_id = p_user_id
      AND (dp.expires_at IS NULL OR dp.expires_at > NOW())
    )
    -- Ou tem permissão na base de conhecimento
    OR EXISTS (
      SELECT 1 FROM knowledge_base_permissions kbp
      WHERE kbp.knowledge_base_id = d.knowledge_base_id
      AND kbp.user_id = p_user_id
    )
    -- Ou documento é público (sem permissões específicas)
    OR NOT EXISTS (
      SELECT 1 FROM document_permissions dp2
      WHERE dp2.document_id = d.id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Verificar permissão específica
-- ============================================
CREATE OR REPLACE FUNCTION has_document_permission(
  p_user_id UUID,
  p_document_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  doc_org_id UUID;
  user_role TEXT;
  has_perm BOOLEAN;
BEGIN
  -- Buscar org do documento
  SELECT organization_id INTO doc_org_id
  FROM documents
  WHERE id = p_document_id;

  -- Buscar role do usuário na org
  SELECT role INTO user_role
  FROM organization_members
  WHERE user_id = p_user_id
  AND organization_id = doc_org_id;

  -- Org-Admin e Owner têm todas as permissões
  IF user_role IN ('orgadmin', 'owner') THEN
    RETURN true;
  END IF;

  -- Verificar permissão explícita
  SELECT EXISTS (
    SELECT 1 FROM document_permissions
    WHERE document_id = p_document_id
    AND user_id = p_user_id
    AND permission >= p_permission  -- read < write < admin
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_perm;

  IF has_perm THEN
    RETURN true;
  END IF;

  -- Verificar permissão via KB
  SELECT EXISTS (
    SELECT 1
    FROM documents d
    JOIN knowledge_base_permissions kbp ON kbp.knowledge_base_id = d.knowledge_base_id
    WHERE d.id = p_document_id
    AND kbp.user_id = p_user_id
    AND kbp.permission >= p_permission
  ) INTO has_perm;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Auto-criar KB padrão para org
-- ============================================
CREATE OR REPLACE FUNCTION create_default_knowledge_base()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar base de conhecimento padrão
  INSERT INTO knowledge_bases (
    organization_id,
    name,
    slug,
    description,
    created_by
  )
  VALUES (
    NEW.id,
    'Base Principal',
    'base-principal',
    'Base de conhecimento padrão da organização',
    NEW.created_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-criar KB na criação da org
-- ============================================
DROP TRIGGER IF EXISTS on_organization_create_kb ON organizations;

CREATE TRIGGER on_organization_create_kb
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_knowledge_base();

-- ============================================
-- RLS POLICIES: knowledge_bases
-- ============================================
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org knowledge bases" ON knowledge_bases;
CREATE POLICY "Users can view their org knowledge bases"
  ON knowledge_bases FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Org admins can manage knowledge bases" ON knowledge_bases;
CREATE POLICY "Org admins can manage knowledge bases"
  ON knowledge_bases FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('orgadmin', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: document_permissions
-- ============================================
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view permissions of their docs" ON document_permissions;
CREATE POLICY "Users can view permissions of their docs"
  ON document_permissions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Org admins can manage permissions" ON document_permissions;
CREATE POLICY "Org admins can manage permissions"
  ON document_permissions FOR ALL
  USING (
    document_id IN (
      SELECT d.id FROM documents d
      JOIN organization_members om ON om.organization_id = d.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('orgadmin', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: knowledge_base_permissions
-- ============================================
ALTER TABLE knowledge_base_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view KB permissions" ON knowledge_base_permissions;
CREATE POLICY "Users can view KB permissions"
  ON knowledge_base_permissions FOR SELECT
  USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Org admins can manage KB permissions" ON knowledge_base_permissions;
CREATE POLICY "Org admins can manage KB permissions"
  ON knowledge_base_permissions FOR ALL
  USING (
    knowledge_base_id IN (
      SELECT kb.id FROM knowledge_bases kb
      JOIN organization_members om ON om.organization_id = kb.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('orgadmin', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: document_tags
-- ============================================
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org tags" ON document_tags;
CREATE POLICY "Users can view their org tags"
  ON document_tags FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Org admins can manage tags" ON document_tags;
CREATE POLICY "Org admins can manage tags"
  ON document_tags FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('orgadmin', 'owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES: document_tag_assignments
-- ============================================
ALTER TABLE document_tag_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tag assignments" ON document_tag_assignments;
CREATE POLICY "Users can view tag assignments"
  ON document_tag_assignments FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users with write permission can assign tags" ON document_tag_assignments;
CREATE POLICY "Users with write permission can assign tags"
  ON document_tag_assignments FOR ALL
  USING (
    has_document_permission(auth.uid(), document_id, 'write')
  );

-- ============================================
-- ATUALIZAR RLS em documents para usar permissões
-- ============================================
-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users can view permitted documents" ON documents;

-- Nova política com permissões granulares
CREATE POLICY "Users can view permitted documents"
  ON documents FOR SELECT
  USING (
    -- Documento da organização do usuário
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    AND (
      -- E usuário tem permissão específica
      id IN (
        SELECT document_id
        FROM get_permitted_documents(auth.uid(), organization_id)
      )
    )
  );

-- ============================================
-- TRIGGERS: Update timestamps
-- ============================================
CREATE TRIGGER update_knowledge_bases_updated_at
  BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_permissions_updated_at
  BEFORE UPDATE ON document_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_permissions_updated_at
  BEFORE UPDATE ON knowledge_base_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_tags_updated_at
  BEFORE UPDATE ON document_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE knowledge_bases IS 'Bases de conhecimento para vetorização de documentos';
COMMENT ON TABLE document_permissions IS 'Permissões granulares por documento e usuário';
COMMENT ON TABLE knowledge_base_permissions IS 'Permissões herdadas por base de conhecimento';
COMMENT ON TABLE document_tags IS 'Tags/Labels para organizar documentos';
COMMENT ON TABLE document_tag_assignments IS 'Atribuição de tags a documentos';

COMMENT ON FUNCTION get_permitted_documents IS 'Retorna IDs de documentos que o usuário pode acessar';
COMMENT ON FUNCTION has_document_permission IS 'Verifica se usuário tem permissão específica em documento';
