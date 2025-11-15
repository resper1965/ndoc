-- Migration: Plans and Subscriptions System
-- Created: 2025-01-15
-- Description: Cria tabelas para planos, assinaturas e sistema de billing

-- ============================================
-- TABLE: plans
-- ============================================
-- Planos disponíveis no SaaS
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Limites por plano (JSONB para flexibilidade)
  limits JSONB NOT NULL DEFAULT jsonb_build_object(
    'documents', 10,
    'users', 1,
    'storage_mb', 100,
    'ai_requests_per_month', 0
  ),

  -- Features habilitadas (JSONB para flexibilidade)
  features JSONB NOT NULL DEFAULT jsonb_build_object(
    'ai_generation', false,
    'ai_improvement', false,
    'custom_branding', false,
    'api_access', false,
    'priority_support', false,
    'custom_domain', false
  ),

  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);

-- ============================================
-- TABLE: subscriptions
-- ============================================
-- Assinaturas das organizações
CREATE TABLE subscriptions (
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

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================
-- TABLE: usage_tracking
-- ============================================
-- Rastreamento de uso por organização
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contadores
  documents_count INTEGER DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  ai_requests_count INTEGER DEFAULT 0,

  -- Período de rastreamento
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, period_start)
);

CREATE INDEX idx_usage_tracking_org ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- ============================================
-- TABLE: invoices
-- ============================================
-- Faturas geradas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Valores
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',

  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Datas
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Stripe
  stripe_invoice_id TEXT UNIQUE,
  stripe_hosted_invoice_url TEXT,
  stripe_invoice_pdf TEXT,

  -- Linha de items
  lines JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- ============================================
-- SEED: Default Plans
-- ============================================
-- Inserir planos padrão
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, limits, features, sort_order) VALUES
(
  'Free',
  'free',
  'Perfeito para começar e testar a plataforma',
  0,
  0,
  jsonb_build_object(
    'documents', 10,
    'users', 1,
    'storage_mb', 100,
    'ai_requests_per_month', 0
  ),
  jsonb_build_object(
    'ai_generation', false,
    'ai_improvement', false,
    'custom_branding', false,
    'api_access', false,
    'priority_support', false,
    'custom_domain', false
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
    'documents', 100,
    'users', 5,
    'storage_mb', 1024,
    'ai_requests_per_month', 100
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', false,
    'api_access', false,
    'priority_support', false,
    'custom_domain', false
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
    'documents', -1,
    'users', 20,
    'storage_mb', 10240,
    'ai_requests_per_month', 1000
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', true,
    'api_access', true,
    'priority_support', false,
    'custom_domain', false
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
    'documents', -1,
    'users', -1,
    'storage_mb', -1,
    'ai_requests_per_month', -1
  ),
  jsonb_build_object(
    'ai_generation', true,
    'ai_improvement', true,
    'custom_branding', true,
    'api_access', true,
    'priority_support', true,
    'custom_domain', true
  ),
  4
);

-- ============================================
-- FUNCTION: Create default subscription for organization
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-create subscription on organization creation
-- ============================================
DROP TRIGGER IF EXISTS on_organization_created ON organizations;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- ============================================
-- FUNCTION: Update usage tracking
-- ============================================
CREATE OR REPLACE FUNCTION update_usage_tracking()
RETURNS TRIGGER AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
  current_period_end TIMESTAMPTZ;
BEGIN
  -- Calcular período atual (mês corrente)
  current_period_start := DATE_TRUNC('month', NOW());
  current_period_end := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  -- Atualizar ou criar registro de usage tracking
  INSERT INTO usage_tracking (organization_id, period_start, period_end, documents_count)
  VALUES (
    NEW.organization_id,
    current_period_start,
    current_period_end,
    (SELECT COUNT(*) FROM documents WHERE organization_id = NEW.organization_id)
  )
  ON CONFLICT (organization_id, period_start)
  DO UPDATE SET
    documents_count = (SELECT COUNT(*) FROM documents WHERE organization_id = NEW.organization_id),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: Update usage on document changes
-- ============================================
DROP TRIGGER IF EXISTS on_document_created ON documents;
DROP TRIGGER IF EXISTS on_document_deleted ON documents;

CREATE TRIGGER on_document_created
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking();

CREATE TRIGGER on_document_deleted
  AFTER DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking();

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

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES: plans
-- ============================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Todos podem ver planos ativos
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- ============================================
-- RLS POLICIES: subscriptions
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver subscription da sua org
CREATE POLICY "Users can view their organization subscription"
  ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Apenas admins podem modificar subscription
CREATE POLICY "Admins can modify subscription"
  ON subscriptions FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES: usage_tracking
-- ============================================
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver usage tracking da sua org
CREATE POLICY "Users can view their organization usage"
  ON usage_tracking FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: invoices
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver invoices da sua org
CREATE POLICY "Users can view their organization invoices"
  ON invoices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE plans IS 'Planos disponíveis no SaaS';
COMMENT ON TABLE subscriptions IS 'Assinaturas das organizações';
COMMENT ON TABLE usage_tracking IS 'Rastreamento de uso por organização e período';
COMMENT ON TABLE invoices IS 'Faturas geradas para cobranças';
