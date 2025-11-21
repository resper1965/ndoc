-- ============================================
-- Migration: Recriar Sistema SaaS Multi-Tenant
-- Data: 2025-01-21
-- Descrição: Sistema completo de planos, subscriptions e onboarding
-- ============================================

-- ============================================
-- TABLE: plans
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Preços
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Limites configuráveis (-1 = ilimitado)
  limits JSONB NOT NULL DEFAULT jsonb_build_object(
    'users', 1,
    'documents', 10,
    'knowledge_bases', 1,
    'ai_requests_per_month', 0,
    'storage_mb', 100,
    'api_calls_per_month', 0
  ),

  -- Features habilitadas
  features JSONB NOT NULL DEFAULT jsonb_build_object(
    'ai_generation', false,
    'ai_improvement', false,
    'custom_branding', false,
    'api_access', false,
    'priority_support', false,
    'custom_domain', false,
    'advanced_permissions', false,
    'audit_logs', false
  ),

  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);

-- ============================================
-- TABLE: subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),

  -- Períodos
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Stripe integration (opcional)
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Metadata adicional
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================
-- TABLE: usage_tracking
-- ============================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contadores de uso
  users_count INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  knowledge_bases_count INTEGER DEFAULT 0,
  ai_requests_count INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,

  -- Período de rastreamento (mês atual)
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_org ON usage_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- ============================================
-- TABLE: support_access
-- ============================================
-- Controla quando Superadmin pode acessar dados de uma org
CREATE TABLE IF NOT EXISTS support_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  superadmin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by_user_id UUID REFERENCES auth.users(id),

  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_access_org ON support_access(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_access_superadmin ON support_access(superadmin_id);
CREATE INDEX IF NOT EXISTS idx_support_access_expires ON support_access(expires_at);

-- ============================================
-- TABLE: onboarding_status
-- ============================================
-- Rastreia progresso de onboarding do Org-Admin
CREATE TABLE IF NOT EXISTS onboarding_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Steps do wizard (checklist)
  steps_completed JSONB DEFAULT jsonb_build_object(
    'review_organization', false,
    'configure_ai', false,
    'create_knowledge_base', false,
    'upload_first_document', false,
    'test_chat', false
  ),

  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_org ON onboarding_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON onboarding_status(is_completed);

-- ============================================
-- SEED: Planos Padrão
-- ============================================
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, limits, features, sort_order)
VALUES
(
  'Free',
  'free',
  'Perfeito para começar e testar a plataforma',
  0,
  0,
  jsonb_build_object(
    'users', 1,
    'documents', 10,
    'knowledge_bases', 1,
    'ai_requests_per_month', 0,
    'storage_mb', 100,
    'api_calls_per_month', 0
  ),
  jsonb_build_object(
    'ai_generation', false,
    'ai_improvement', false,
    'custom_branding', false,
    'api_access', false,
    'priority_support', false,
    'custom_domain', false,
    'advanced_permissions', false,
    'audit_logs', false
  ),
  1
),
(
  'Starter',
  'starter',
  'Ideal para pequenas equipes começando com documentação',
  49,
  490,
  jsonb_build_object(
    'users', 5,
    'documents', 100,
    'knowledge_bases', 3,
    'ai_requests_per_month', 100,
    'storage_mb', 1024,
    'api_calls_per_month', 1000
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', false,
    'api_access', true,
    'priority_support', false,
    'custom_domain', false,
    'advanced_permissions', false,
    'audit_logs', true
  ),
  2
),
(
  'Professional',
  'professional',
  'Para equipes que levam documentação a sério',
  149,
  1490,
  jsonb_build_object(
    'users', 20,
    'documents', -1,
    'knowledge_bases', 10,
    'ai_requests_per_month', 1000,
    'storage_mb', 10240,
    'api_calls_per_month', 10000
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', true,
    'api_access', true,
    'priority_support', false,
    'custom_domain', true,
    'advanced_permissions', true,
    'audit_logs', true
  ),
  3
),
(
  'Enterprise',
  'enterprise',
  'Solução completa para grandes organizações',
  0,
  0,
  jsonb_build_object(
    'users', -1,
    'documents', -1,
    'knowledge_bases', -1,
    'ai_requests_per_month', -1,
    'storage_mb', -1,
    'api_calls_per_month', -1
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', true,
    'api_access', true,
    'priority_support', true,
    'custom_domain', true,
    'advanced_permissions', true,
    'audit_logs', true
  ),
  4
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FUNCTION: Criar subscription padrão
-- ============================================
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar ID do plano free
  SELECT id INTO free_plan_id FROM plans WHERE slug = 'free' LIMIT 1;

  -- Criar subscription com trial de 14 dias
  INSERT INTO subscriptions (organization_id, plan_id, status, trial_end)
  VALUES (
    NEW.id,
    free_plan_id,
    'trialing',
    NOW() + INTERVAL '14 days'
  );

  -- Criar registro de onboarding vazio (será preenchido pelo org-admin)
  -- Não criamos aqui pois ainda não sabemos quem é o org-admin

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-criar subscription
-- ============================================
DROP TRIGGER IF EXISTS on_organization_created_subscription ON organizations;

CREATE TRIGGER on_organization_created_subscription
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- ============================================
-- FUNCTION: Atualizar usage tracking
-- ============================================
CREATE OR REPLACE FUNCTION update_usage_tracking()
RETURNS TRIGGER AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
  current_period_end TIMESTAMPTZ;
  org_id UUID;
BEGIN
  -- Determinar org_id baseado no tipo de operação
  IF TG_OP = 'DELETE' THEN
    org_id := OLD.organization_id;
  ELSE
    org_id := NEW.organization_id;
  END IF;

  -- Calcular período atual (mês corrente)
  current_period_start := DATE_TRUNC('month', NOW());
  current_period_end := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  -- Atualizar ou criar registro de usage tracking
  INSERT INTO usage_tracking (
    organization_id,
    period_start,
    period_end,
    documents_count,
    users_count,
    knowledge_bases_count
  )
  VALUES (
    org_id,
    current_period_start,
    current_period_end,
    (SELECT COUNT(*) FROM documents WHERE organization_id = org_id),
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id),
    (SELECT COUNT(DISTINCT knowledge_base_id) FROM documents WHERE organization_id = org_id AND knowledge_base_id IS NOT NULL)
  )
  ON CONFLICT (organization_id, period_start)
  DO UPDATE SET
    documents_count = (SELECT COUNT(*) FROM documents WHERE organization_id = org_id),
    users_count = (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id),
    knowledge_bases_count = (SELECT COUNT(DISTINCT knowledge_base_id) FROM documents WHERE organization_id = org_id AND knowledge_base_id IS NOT NULL),
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: Atualizar usage em mudanças
-- ============================================
DROP TRIGGER IF EXISTS on_document_usage_change ON documents;
DROP TRIGGER IF EXISTS on_member_usage_change ON organization_members;

CREATE TRIGGER on_document_usage_change
  AFTER INSERT OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking();

CREATE TRIGGER on_member_usage_change
  AFTER INSERT OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking();

-- ============================================
-- FUNCTION: Verificar limites do plano
-- ============================================
CREATE OR REPLACE FUNCTION check_plan_limits(
  p_organization_id UUID,
  p_resource_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_usage INTEGER;
  plan_limit INTEGER;
  plan_limits JSONB;
  result JSONB;
BEGIN
  -- Buscar limites do plano
  SELECT p.limits INTO plan_limits
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.id
  WHERE s.organization_id = p_organization_id
  LIMIT 1;

  -- Se não encontrar plano, retornar erro
  IF plan_limits IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'No active subscription found'
    );
  END IF;

  -- Buscar limite para o recurso específico
  plan_limit := (plan_limits->>p_resource_type)::INTEGER;

  -- -1 significa ilimitado
  IF plan_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'limit', -1,
      'current', 0
    );
  END IF;

  -- Buscar uso atual baseado no tipo de recurso
  CASE p_resource_type
    WHEN 'users' THEN
      SELECT COUNT(*) INTO current_usage
      FROM organization_members
      WHERE organization_id = p_organization_id;

    WHEN 'documents' THEN
      SELECT COUNT(*) INTO current_usage
      FROM documents
      WHERE organization_id = p_organization_id;

    WHEN 'knowledge_bases' THEN
      SELECT COUNT(DISTINCT knowledge_base_id) INTO current_usage
      FROM documents
      WHERE organization_id = p_organization_id
      AND knowledge_base_id IS NOT NULL;

    ELSE
      current_usage := 0;
  END CASE;

  -- Verificar se está dentro do limite
  IF current_usage >= plan_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'limit', plan_limit,
      'current', current_usage,
      'reason', 'Plan limit reached for ' || p_resource_type
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', true,
      'limit', plan_limit,
      'current', current_usage
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Verificar acesso de suporte
-- ============================================
CREATE OR REPLACE FUNCTION has_support_access(
  p_superadmin_id UUID,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM support_access
    WHERE superadmin_id = p_superadmin_id
    AND organization_id = p_organization_id
    AND expires_at > NOW()
    AND revoked_at IS NULL
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES: plans
-- ============================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Superadmins can manage plans" ON plans;
CREATE POLICY "Superadmins can manage plans"
  ON plans FOR ALL
  USING (is_superadmin());

-- ============================================
-- RLS POLICIES: subscriptions
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org subscription" ON subscriptions;
CREATE POLICY "Users can view their org subscription"
  ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Org admins can update subscription" ON subscriptions;
CREATE POLICY "Org admins can update subscription"
  ON subscriptions FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('orgadmin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Superadmins can manage all subscriptions" ON subscriptions;
CREATE POLICY "Superadmins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (is_superadmin());

-- ============================================
-- RLS POLICIES: usage_tracking
-- ============================================
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org usage" ON usage_tracking;
CREATE POLICY "Users can view their org usage"
  ON usage_tracking FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Superadmins can view all usage" ON usage_tracking;
CREATE POLICY "Superadmins can view all usage"
  ON usage_tracking FOR SELECT
  USING (is_superadmin());

-- ============================================
-- RLS POLICIES: support_access
-- ============================================
ALTER TABLE support_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can grant support access" ON support_access;
CREATE POLICY "Org admins can grant support access"
  ON support_access FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('orgadmin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Anyone can view their granted access" ON support_access;
CREATE POLICY "Anyone can view their granted access"
  ON support_access FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR superadmin_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES: onboarding_status
-- ============================================
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org onboarding" ON onboarding_status;
CREATE POLICY "Users can view their org onboarding"
  ON onboarding_status FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their onboarding" ON onboarding_status;
CREATE POLICY "Users can update their onboarding"
  ON onboarding_status FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert onboarding" ON onboarding_status;
CREATE POLICY "System can insert onboarding"
  ON onboarding_status FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS: Update timestamps
-- ============================================
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_access_updated_at
  BEFORE UPDATE ON support_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at
  BEFORE UPDATE ON onboarding_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE plans IS 'Planos SaaS disponíveis com limites configuráveis';
COMMENT ON TABLE subscriptions IS 'Assinaturas ativas das organizações';
COMMENT ON TABLE usage_tracking IS 'Rastreamento de uso mensal por organização';
COMMENT ON TABLE support_access IS 'Controle de acesso de suporte do Superadmin';
COMMENT ON TABLE onboarding_status IS 'Progresso do wizard de onboarding do Org-Admin';

COMMENT ON FUNCTION check_plan_limits IS 'Verifica se organização está dentro dos limites do plano';
COMMENT ON FUNCTION has_support_access IS 'Verifica se Superadmin tem acesso de suporte ativo';
