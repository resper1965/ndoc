-- Migration: Initial Schema for n.doc
-- Created: 2025-01-13
-- Description: Cria schema inicial com tabelas para organizações, documentos, versões, temas IA e membros

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: organizations
-- ============================================
-- Tabela de organizações (tenants) para multi-tenancy
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ============================================
-- TABLE: organization_members
-- ============================================
-- Relacionamento many-to-many entre usuários e organizações
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- ============================================
-- TABLE: documents
-- ============================================
-- Tabela principal de documentos MDX
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  frontmatter JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, path)
);

CREATE INDEX idx_documents_org_path ON documents(organization_id, path);
CREATE INDEX idx_documents_org_status ON documents(organization_id, status);
CREATE INDEX idx_documents_org_order ON documents(organization_id, order_index);
CREATE INDEX idx_documents_path ON documents(path);

-- ============================================
-- TABLE: document_versions
-- ============================================
-- Histórico de versões dos documentos
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  frontmatter JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_versions_doc ON document_versions(document_id);
CREATE INDEX idx_document_versions_created ON document_versions(created_at DESC);

-- ============================================
-- TABLE: ai_themes
-- ============================================
-- Configuração de temas para geração de documentos com IA
CREATE TABLE ai_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  context TEXT,
  style TEXT,
  audience TEXT,
  prompt_base TEXT,
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_themes_org ON ai_themes(organization_id);

-- ============================================
-- TABLE: ai_provider_config
-- ============================================
-- Configuração de provedores de IA por organização
CREATE TABLE ai_provider_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'local')),
  api_key_encrypted TEXT,
  model TEXT,
  base_url TEXT,
  rate_limit_per_hour INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_provider_config_org ON ai_provider_config(organization_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: organizations
-- ============================================

-- Users can view their organizations
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Only authenticated users can create organizations (via API with service role)
-- This will be handled by application logic

-- ============================================
-- RLS POLICIES: organization_members
-- ============================================

-- Users can view members of their organizations
CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Only admins/owners can manage members
CREATE POLICY "Admins can manage organization members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: documents
-- ============================================

-- Documents are publicly readable if published
CREATE POLICY "Documents are publicly readable"
  ON documents FOR SELECT
  USING (status = 'published');

-- Authenticated users can view all documents from their organizations
CREATE POLICY "Users can view their organization documents"
  ON documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Editors, admins and owners can create documents
CREATE POLICY "Editors can create documents"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
    )
  );

-- Editors, admins and owners can update documents
CREATE POLICY "Editors can update documents"
  ON documents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
    )
  );

-- Only admins and owners can delete documents
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: document_versions
-- ============================================

-- Users can view versions of documents from their organizations
CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Editors, admins and owners can create versions
CREATE POLICY "Editors can create document versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
      )
    )
  );

-- ============================================
-- RLS POLICIES: ai_themes
-- ============================================

-- Users can view themes from their organizations
CREATE POLICY "Users can view AI themes"
  ON ai_themes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Editors, admins and owners can manage themes
CREATE POLICY "Editors can manage AI themes"
  ON ai_themes FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'owner')
    )
  );

-- ============================================
-- RLS POLICIES: ai_provider_config
-- ============================================

-- Only admins and owners can view provider config
CREATE POLICY "Admins can view AI provider config"
  ON ai_provider_config FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Only admins and owners can manage provider config
CREATE POLICY "Admins can manage AI provider config"
  ON ai_provider_config FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- FUNCTIONS: Update timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_themes_updated_at
  BEFORE UPDATE ON ai_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_provider_config_updated_at
  BEFORE UPDATE ON ai_provider_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

