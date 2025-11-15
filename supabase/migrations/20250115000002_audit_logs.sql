-- Migration: Audit Logs System
-- Created: 2025-01-15
-- Description: Sistema de auditoria para rastrear mudanças e ações importantes

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ação realizada
  action TEXT NOT NULL, -- create, update, delete, login, invite, etc.
  resource_type TEXT NOT NULL, -- document, user, organization, ai_theme, etc.
  resource_id UUID,

  -- Metadados da ação
  old_data JSONB,
  new_data JSONB,
  changes JSONB, -- Campos que mudaram

  -- Informações contextuais
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTION: Log document changes
-- ============================================
CREATE OR REPLACE FUNCTION log_document_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_data_json JSONB;
  new_data_json JSONB;
  changes_json JSONB := '{}'::JSONB;
BEGIN
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'document_created';
    new_data_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'document_updated';
    old_data_json := to_jsonb(OLD);
    new_data_json := to_jsonb(NEW);

    -- Detectar mudanças
    IF OLD.title != NEW.title THEN
      changes_json := changes_json || jsonb_build_object('title', jsonb_build_object('from', OLD.title, 'to', NEW.title));
    END IF;
    IF OLD.content != NEW.content THEN
      changes_json := changes_json || jsonb_build_object('content_changed', true);
    END IF;
    IF OLD.status != NEW.status THEN
      changes_json := changes_json || jsonb_build_object('status', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'document_deleted';
    old_data_json := to_jsonb(OLD);
  END IF;

  -- Inserir log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_data,
    new_data,
    changes
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    action_type,
    'document',
    COALESCE(NEW.id, OLD.id),
    old_data_json,
    new_data_json,
    changes_json
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Log user management changes
-- ============================================
CREATE OR REPLACE FUNCTION log_user_management_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_data_json JSONB;
  new_data_json JSONB;
  changes_json JSONB := '{}'::JSONB;
BEGIN
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'user_added_to_organization';
    new_data_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'user_role_updated';
    old_data_json := to_jsonb(OLD);
    new_data_json := to_jsonb(NEW);

    -- Detectar mudanças de role
    IF OLD.role != NEW.role THEN
      changes_json := jsonb_build_object('role', jsonb_build_object('from', OLD.role, 'to', NEW.role));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'user_removed_from_organization';
    old_data_json := to_jsonb(OLD);
  END IF;

  -- Inserir log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_data,
    new_data,
    changes
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    action_type,
    'organization_member',
    COALESCE(NEW.id, OLD.id),
    old_data_json,
    new_data_json,
    changes_json
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Log AI configuration changes
-- ============================================
CREATE OR REPLACE FUNCTION log_ai_config_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  resource_type_name TEXT;
  old_data_json JSONB;
  new_data_json JSONB;
BEGIN
  -- Determinar tipo de ação e resource
  IF TG_TABLE_NAME = 'ai_themes' THEN
    resource_type_name := 'ai_theme';
    IF TG_OP = 'INSERT' THEN
      action_type := 'ai_theme_created';
    ELSIF TG_OP = 'UPDATE' THEN
      action_type := 'ai_theme_updated';
    ELSIF TG_OP = 'DELETE' THEN
      action_type := 'ai_theme_deleted';
    END IF;
  ELSIF TG_TABLE_NAME = 'ai_provider_config' THEN
    resource_type_name := 'ai_provider';
    IF TG_OP = 'INSERT' THEN
      action_type := 'ai_provider_created';
    ELSIF TG_OP = 'UPDATE' THEN
      action_type := 'ai_provider_updated';
    ELSIF TG_OP = 'DELETE' THEN
      action_type := 'ai_provider_deleted';
    END IF;
  END IF;

  -- Preparar dados (sem API keys)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    new_data_json := to_jsonb(NEW);
    -- Remover API key dos logs por segurança
    IF new_data_json ? 'api_key_encrypted' THEN
      new_data_json := new_data_json - 'api_key_encrypted';
    END IF;
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    old_data_json := to_jsonb(OLD);
    -- Remover API key dos logs por segurança
    IF old_data_json ? 'api_key_encrypted' THEN
      old_data_json := old_data_json - 'api_key_encrypted';
    END IF;
  END IF;

  -- Inserir log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    action_type,
    resource_type_name,
    COALESCE(NEW.id, OLD.id),
    old_data_json,
    new_data_json
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: Audit logs for documents
-- ============================================
DROP TRIGGER IF EXISTS audit_document_changes ON documents;

CREATE TRIGGER audit_document_changes
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_changes();

-- ============================================
-- TRIGGERS: Audit logs for user management
-- ============================================
DROP TRIGGER IF EXISTS audit_user_management ON organization_members;

CREATE TRIGGER audit_user_management
  AFTER INSERT OR UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION log_user_management_changes();

-- ============================================
-- TRIGGERS: Audit logs for AI configuration
-- ============================================
DROP TRIGGER IF EXISTS audit_ai_themes ON ai_themes;
DROP TRIGGER IF EXISTS audit_ai_providers ON ai_provider_config;

CREATE TRIGGER audit_ai_themes
  AFTER INSERT OR UPDATE OR DELETE ON ai_themes
  FOR EACH ROW
  EXECUTE FUNCTION log_ai_config_changes();

CREATE TRIGGER audit_ai_providers
  AFTER INSERT OR UPDATE OR DELETE ON ai_provider_config
  FOR EACH ROW
  EXECUTE FUNCTION log_ai_config_changes();

-- ============================================
-- RLS POLICIES: audit_logs
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins e owners podem ver audit logs
CREATE POLICY "Admins can view organization audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Ninguém pode modificar audit logs (apenas sistema)
CREATE POLICY "No one can modify audit logs"
  ON audit_logs FOR ALL
  USING (false);

-- ============================================
-- FUNCTION: Get recent activity
-- ============================================
CREATE OR REPLACE FUNCTION get_recent_activity(
  p_organization_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  resource_type TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ,
  changes JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.resource_type,
    au.email,
    al.created_at,
    al.changes
  FROM audit_logs al
  LEFT JOIN auth.users au ON al.user_id = au.id
  WHERE al.organization_id = p_organization_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE audit_logs IS 'Registro de auditoria de todas as ações importantes no sistema';
COMMENT ON FUNCTION log_document_changes() IS 'Registra mudanças em documentos para auditoria';
COMMENT ON FUNCTION log_user_management_changes() IS 'Registra mudanças em membros da organização para auditoria';
COMMENT ON FUNCTION log_ai_config_changes() IS 'Registra mudanças em configurações de IA para auditoria';
COMMENT ON FUNCTION get_recent_activity(UUID, INTEGER) IS 'Retorna atividades recentes de uma organização';
