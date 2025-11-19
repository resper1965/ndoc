/**
 * Enforcement de Limites por Plano
 *
 * Sistema para verificar e enforçar limites baseados no plano da organização
 */

import { createClient as createServerClient } from './server';

export interface PlanLimits {
  documents: number; // -1 = ilimitado
  users: number; // -1 = ilimitado
  storage_mb: number; // -1 = ilimitado
  ai_requests_per_month: number; // -1 = ilimitado
}

export interface PlanFeatures {
  ai_generation: boolean;
  ai_improvement: boolean;
  custom_branding: boolean;
  api_access: boolean;
  priority_support: boolean;
  custom_domain: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  limits: PlanLimits;
  features: PlanFeatures;
  is_active: boolean;
  sort_order: number;
}

export interface UsageStats {
  documents_count: number;
  users_count: number;
  storage_used_mb: number;
  ai_requests_count: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
  upgradeRequired?: boolean;
}

/**
 * Busca informações do plano da organização
 * Retorna plano padrão (free) já que não há mais sistema de planos
 * @param _organizationId - ID da organização (mantido para compatibilidade com interface)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getOrganizationPlan(_organizationId: string): Promise<Plan | null> {
  // Retornar plano padrão (free) com limites ilimitados
  return {
    id: 'free',
    name: 'Free',
    slug: 'free',
    description: 'Plano gratuito com recursos básicos',
    price_monthly: 0,
    price_yearly: 0,
    limits: {
      documents: -1, // Ilimitado
      users: -1, // Ilimitado
      storage_mb: -1, // Ilimitado
      ai_requests_per_month: -1, // Ilimitado
    },
    features: {
      ai_generation: true,
      ai_improvement: true,
      custom_branding: false,
      api_access: true,
      priority_support: false,
      custom_domain: false,
    },
    is_active: true,
    sort_order: 0,
  };
}

/**
 * Busca estatísticas de uso da organização
 */
export async function getOrganizationUsage(organizationId: string): Promise<UsageStats | null> {
  const supabase = await createServerClient();

  // Buscar período atual
  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(1); // Primeiro dia do mês
  currentPeriodStart.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('period_start', currentPeriodStart.toISOString())
    .single();

  if (!usage) {
    // Retornar contadores zerados se não houver registro
    return {
      documents_count: 0,
      users_count: 0,
      storage_used_mb: 0,
      ai_requests_count: 0,
    };
  }

  return {
    documents_count: usage.documents_count || 0,
    users_count: usage.users_count || 0,
    storage_used_mb: usage.storage_used_mb || 0,
    ai_requests_count: usage.ai_requests_count || 0,
  };
}

/**
 * Verifica se a organização pode criar mais documentos
 */
export async function canCreateDocument(organizationId: string): Promise<LimitCheckResult> {
  const [plan, usage] = await Promise.all([
    getOrganizationPlan(organizationId),
    getOrganizationUsage(organizationId),
  ]);

  if (!plan || !usage) {
    return { allowed: false, reason: 'Plano não encontrado' };
  }

  const limit = plan.limits.documents;
  const current = usage.documents_count;

  // -1 significa ilimitado
  if (limit === -1) {
    return { allowed: true };
  }

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Limite de documentos atingido (${current}/${limit})`,
      limit,
      current,
      upgradeRequired: true,
    };
  }

  return { allowed: true, limit, current };
}

/**
 * Verifica se a organização pode adicionar mais usuários
 */
export async function canAddUser(organizationId: string): Promise<LimitCheckResult> {
  const [plan, usage] = await Promise.all([
    getOrganizationPlan(organizationId),
    getOrganizationUsage(organizationId),
  ]);

  if (!plan || !usage) {
    return { allowed: false, reason: 'Plano não encontrado' };
  }

  const limit = plan.limits.users;
  const current = usage.users_count;

  // -1 significa ilimitado
  if (limit === -1) {
    return { allowed: true };
  }

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Limite de usuários atingido (${current}/${limit})`,
      limit,
      current,
      upgradeRequired: true,
    };
  }

  return { allowed: true, limit, current };
}

/**
 * Verifica se a organização pode usar recursos de IA
 */
export async function canUseAI(organizationId: string): Promise<LimitCheckResult> {
  const [plan, usage] = await Promise.all([
    getOrganizationPlan(organizationId),
    getOrganizationUsage(organizationId),
  ]);

  if (!plan || !usage) {
    return { allowed: false, reason: 'Plano não encontrado' };
  }

  // Verificar se plano tem feature de IA
  if (!plan.features.ai_generation && !plan.features.ai_improvement) {
    return {
      allowed: false,
      reason: 'Seu plano não inclui recursos de IA',
      upgradeRequired: true,
    };
  }

  const limit = plan.limits.ai_requests_per_month;
  const current = usage.ai_requests_count;

  // -1 significa ilimitado
  if (limit === -1) {
    return { allowed: true };
  }

  if (current >= limit) {
    return {
      allowed: false,
      reason: `Limite de requisições de IA atingido este mês (${current}/${limit})`,
      limit,
      current,
      upgradeRequired: true,
    };
  }

  return { allowed: true, limit, current };
}

/**
 * Verifica se a organização tem uma feature específica
 */
export async function hasFeature(
  organizationId: string,
  feature: keyof PlanFeatures
): Promise<boolean> {
  const plan = await getOrganizationPlan(organizationId);

  if (!plan) {
    return false;
  }

  return plan.features[feature] || false;
}

/**
 * Incrementa contador de uso de IA
 */
export async function incrementAIUsage(organizationId: string): Promise<void> {
  const supabase = await createServerClient();

  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(1);
  currentPeriodStart.setHours(0, 0, 0, 0);

  const currentPeriodEnd = new Date(currentPeriodStart);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  // Upsert no tracking
  const { error } = await supabase.rpc('increment_ai_usage', {
    p_organization_id: organizationId,
    p_period_start: currentPeriodStart.toISOString(),
    p_period_end: currentPeriodEnd.toISOString(),
  });

  if (error) {
    console.error('Error incrementing AI usage:', error);
  }
}

/**
 * Busca todos os planos disponíveis (para pricing page)
 * Retorna planos padrão já que não há mais sistema de planos
 */
export async function getAllPlans(): Promise<Plan[]> {
  // Retornar planos padrão
  return [
    {
      id: 'free',
      name: 'Grátis',
      slug: 'free',
      description: 'Plano gratuito com recursos básicos',
      price_monthly: 0,
      price_yearly: 0,
      limits: {
        documents: 10,
        users: 1,
        storage_mb: 100,
        ai_requests_per_month: 10,
      },
      features: {
        ai_generation: false,
        ai_improvement: false,
        custom_branding: false,
        api_access: false,
        priority_support: false,
        custom_domain: false,
      },
      is_active: true,
      sort_order: 0,
    },
    {
      id: 'pro',
      name: 'Pro',
      slug: 'pro',
      description: 'Plano profissional com recursos avançados',
      price_monthly: 49,
      price_yearly: 490,
      limits: {
        documents: -1, // Ilimitado
        users: 10,
        storage_mb: 10240, // 10GB
        ai_requests_per_month: -1, // Ilimitado
      },
      features: {
        ai_generation: true,
        ai_improvement: true,
        custom_branding: false,
        api_access: true,
        priority_support: false,
        custom_domain: false,
      },
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Plano empresarial com todos os recursos',
      price_monthly: 0, // Custom
      price_yearly: 0, // Custom
      limits: {
        documents: -1, // Ilimitado
        users: -1, // Ilimitado
        storage_mb: -1, // Ilimitado
        ai_requests_per_month: -1, // Ilimitado
      },
      features: {
        ai_generation: true,
        ai_improvement: true,
        custom_branding: true,
        api_access: true,
        priority_support: true,
        custom_domain: true,
      },
      is_active: true,
      sort_order: 2,
    },
  ];
}

/**
 * Formata mensagem de erro de limite para o usuário
 */
export function formatLimitError(result: LimitCheckResult): string {
  if (result.allowed) {
    return '';
  }

  if (result.upgradeRequired) {
    return `${result.reason}. Faça upgrade do seu plano para continuar.`;
  }

  return result.reason || 'Limite atingido';
}
