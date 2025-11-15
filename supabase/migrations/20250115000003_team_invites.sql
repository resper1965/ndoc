-- Migration: Team Invites System
-- Created: 2025-01-15
-- Description: Sistema de convites para adicionar membros à organização

-- ============================================
-- TABLE: organization_invites
-- ============================================
CREATE TABLE organization_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Dados do convite
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Quem convidou
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Estado do convite
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'canceled')),

  -- Datas
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um email só pode ter um convite pendente por organização
  UNIQUE(organization_id, email, status)
);

CREATE INDEX idx_invites_org ON organization_invites(organization_id);
CREATE INDEX idx_invites_email ON organization_invites(email);
CREATE INDEX idx_invites_token ON organization_invites(token);
CREATE INDEX idx_invites_status ON organization_invites(status);
CREATE INDEX idx_invites_expires ON organization_invites(expires_at);

-- ============================================
-- FUNCTION: Accept invite
-- ============================================
CREATE OR REPLACE FUNCTION accept_invite(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
  v_existing_member RECORD;
BEGIN
  -- Buscar convite
  SELECT * INTO v_invite
  FROM organization_invites
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  -- Validar convite existe
  IF v_invite IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite inválido, expirado ou já utilizado'
    );
  END IF;

  -- Buscar email do usuário
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Validar email corresponde ao convite
  IF LOWER(v_user_email) != LOWER(v_invite.email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este convite foi enviado para outro email'
    );
  END IF;

  -- Verificar se usuário já é membro
  SELECT * INTO v_existing_member
  FROM organization_members
  WHERE organization_id = v_invite.organization_id
    AND user_id = p_user_id;

  IF v_existing_member IS NOT NULL THEN
    -- Atualizar status do convite
    UPDATE organization_invites
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = v_invite.id;

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Você já é membro desta organização',
      'organization_id', v_invite.organization_id
    );
  END IF;

  -- Adicionar usuário à organização
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_invite.organization_id, p_user_id, v_invite.role);

  -- Atualizar status do convite
  UPDATE organization_invites
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invite.id;

  -- Registrar em audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    v_invite.organization_id,
    p_user_id,
    'invite_accepted',
    'organization_invite',
    v_invite.id,
    jsonb_build_object(
      'role', v_invite.role,
      'invited_by', v_invite.invited_by
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite aceito com sucesso',
    'organization_id', v_invite.organization_id,
    'role', v_invite.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Cancel invite
-- ============================================
CREATE OR REPLACE FUNCTION cancel_invite(
  p_invite_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_invite RECORD;
  v_is_admin BOOLEAN;
BEGIN
  -- Buscar convite
  SELECT * INTO v_invite
  FROM organization_invites
  WHERE id = p_invite_id;

  IF v_invite IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite não encontrado'
    );
  END IF;

  -- Verificar se usuário é admin da organização
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = v_invite.organization_id
      AND user_id = p_user_id
      AND role IN ('owner', 'admin')
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Apenas administradores podem cancelar convites'
    );
  END IF;

  -- Cancelar convite
  UPDATE organization_invites
  SET status = 'canceled',
      canceled_at = NOW(),
      updated_at = NOW()
  WHERE id = p_invite_id;

  -- Registrar em audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    v_invite.organization_id,
    p_user_id,
    'invite_canceled',
    'organization_invite',
    v_invite.id,
    jsonb_build_object('email', v_invite.email)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite cancelado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Expire old invites
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE organization_invites
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get invite by token (public)
-- ============================================
CREATE OR REPLACE FUNCTION get_invite_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  email TEXT,
  role TEXT,
  invited_by_email TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id,
    o.name,
    o.slug,
    oi.email,
    oi.role,
    au.email,
    oi.expires_at,
    oi.status
  FROM organization_invites oi
  INNER JOIN organizations o ON oi.organization_id = o.id
  LEFT JOIN auth.users au ON oi.invited_by = au.id
  WHERE oi.token = p_token
    AND oi.status = 'pending'
    AND oi.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update timestamps
-- ============================================
CREATE TRIGGER update_organization_invites_updated_at
  BEFORE UPDATE ON organization_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES: organization_invites
-- ============================================
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Admins podem ver convites da sua organização
CREATE POLICY "Admins can view organization invites"
  ON organization_invites FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Admins podem criar convites
CREATE POLICY "Admins can create invites"
  ON organization_invites FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Admins podem atualizar convites (cancelar)
CREATE POLICY "Admins can update invites"
  ON organization_invites FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Admins podem deletar convites
CREATE POLICY "Admins can delete invites"
  ON organization_invites FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- CRON JOB: Expire invites daily (se suportado)
-- ============================================
-- Nota: Requer extensão pg_cron instalada
-- SELECT cron.schedule('expire-invites', '0 0 * * *', 'SELECT expire_old_invites();');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE organization_invites IS 'Convites para adicionar membros às organizações';
COMMENT ON FUNCTION accept_invite(TEXT, UUID) IS 'Aceita um convite usando o token';
COMMENT ON FUNCTION cancel_invite(UUID, UUID) IS 'Cancela um convite (apenas admins)';
COMMENT ON FUNCTION expire_old_invites() IS 'Marca convites expirados como expired';
COMMENT ON FUNCTION get_invite_by_token(TEXT) IS 'Busca informações de um convite por token (público)';
