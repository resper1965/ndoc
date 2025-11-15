-- Migration: Usage Tracking Helper Functions
-- Created: 2025-01-15
-- Description: Funções helper para tracking de uso e limites

-- ============================================
-- FUNCTION: Increment AI usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_organization_id UUID,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (
    organization_id,
    period_start,
    period_end,
    ai_requests_count
  ) VALUES (
    p_organization_id,
    p_period_start,
    p_period_end,
    1
  )
  ON CONFLICT (organization_id, period_start)
  DO UPDATE SET
    ai_requests_count = usage_tracking.ai_requests_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Update users count
-- ============================================
CREATE OR REPLACE FUNCTION update_users_count()
RETURNS TRIGGER AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
  current_period_end TIMESTAMPTZ;
  org_id UUID;
  users_count INTEGER;
BEGIN
  -- Calcular período atual (mês corrente)
  current_period_start := DATE_TRUNC('month', NOW());
  current_period_end := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  -- Determinar org_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    org_id := OLD.organization_id;
  ELSE
    org_id := NEW.organization_id;
  END IF;

  -- Contar usuários ativos
  SELECT COUNT(*) INTO users_count
  FROM organization_members
  WHERE organization_id = org_id;

  -- Atualizar ou criar registro de usage tracking
  INSERT INTO usage_tracking (
    organization_id,
    period_start,
    period_end,
    users_count
  ) VALUES (
    org_id,
    current_period_start,
    current_period_end,
    users_count
  )
  ON CONFLICT (organization_id, period_start)
  DO UPDATE SET
    users_count = users_count,
    updated_at = NOW();

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update users count on member changes
-- ============================================
DROP TRIGGER IF EXISTS update_users_count_on_member_change ON organization_members;

CREATE TRIGGER update_users_count_on_member_change
  AFTER INSERT OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_users_count();

-- ============================================
-- FUNCTION: Get organization limits and usage
-- ============================================
CREATE OR REPLACE FUNCTION get_organization_limits_and_usage(p_organization_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_slug TEXT,
  limit_documents INTEGER,
  limit_users INTEGER,
  limit_storage_mb INTEGER,
  limit_ai_requests INTEGER,
  used_documents INTEGER,
  used_users INTEGER,
  used_storage_mb INTEGER,
  used_ai_requests INTEGER,
  feature_ai_generation BOOLEAN,
  feature_ai_improvement BOOLEAN,
  feature_custom_branding BOOLEAN,
  feature_api_access BOOLEAN,
  feature_priority_support BOOLEAN,
  feature_custom_domain BOOLEAN
) AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
BEGIN
  current_period_start := DATE_TRUNC('month', NOW());

  RETURN QUERY
  SELECT
    p.name,
    p.slug,
    (p.limits->>'documents')::INTEGER,
    (p.limits->>'users')::INTEGER,
    (p.limits->>'storage_mb')::INTEGER,
    (p.limits->>'ai_requests_per_month')::INTEGER,
    COALESCE(ut.documents_count, 0)::INTEGER,
    COALESCE(ut.users_count, 0)::INTEGER,
    COALESCE(ut.storage_used_mb, 0)::INTEGER,
    COALESCE(ut.ai_requests_count, 0)::INTEGER,
    (p.features->>'ai_generation')::BOOLEAN,
    (p.features->>'ai_improvement')::BOOLEAN,
    (p.features->>'custom_branding')::BOOLEAN,
    (p.features->>'api_access')::BOOLEAN,
    (p.features->>'priority_support')::BOOLEAN,
    (p.features->>'custom_domain')::BOOLEAN
  FROM subscriptions s
  INNER JOIN plans p ON s.plan_id = p.id
  LEFT JOIN usage_tracking ut ON ut.organization_id = s.organization_id
    AND ut.period_start = current_period_start
  WHERE s.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION increment_ai_usage(UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Incrementa contador de uso de IA para uma organização';
COMMENT ON FUNCTION update_users_count() IS 'Atualiza contador de usuários quando membros são adicionados/removidos';
COMMENT ON FUNCTION get_organization_limits_and_usage(UUID) IS 'Retorna limites do plano e uso atual da organização';
