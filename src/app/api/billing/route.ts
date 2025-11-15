/**
 * API Route: Billing
 *
 * Endpoints para consultar planos, assinaturas e uso
 * (Sem integração Stripe - apenas consulta de dados)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { getAllPlans, getOrganizationPlan, getOrganizationUsage } from '@/lib/supabase/limits';
import { logger } from '@/lib/logger';

// GET: Obter informações de billing (plano, uso, limites)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'current';

    // Listar todos os planos disponíveis
    if (action === 'plans') {
      const plans = await getAllPlans();
      return NextResponse.json({ plans });
    }

    // Obter informações da assinatura atual
    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma organização' },
        { status: 403 }
      );
    }

    if (action === 'current') {
      const [plan, usage] = await Promise.all([
        getOrganizationPlan(organizationId),
        getOrganizationUsage(organizationId),
      ]);

      if (!plan || !usage) {
        return NextResponse.json(
          { error: 'Informações de billing não encontradas' },
          { status: 404 }
        );
      }

      // Calcular porcentagens de uso
      const calculatePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0; // Ilimitado
        return Math.min(Math.round((current / limit) * 100), 100);
      };

      return NextResponse.json({
        plan: {
          name: plan.name,
          slug: plan.slug,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
        },
        limits: plan.limits,
        features: plan.features,
        usage: {
          documents: {
            current: usage.documents_count,
            limit: plan.limits.documents,
            percentage: calculatePercentage(usage.documents_count, plan.limits.documents),
          },
          users: {
            current: usage.users_count,
            limit: plan.limits.users,
            percentage: calculatePercentage(usage.users_count, plan.limits.users),
          },
          storage_mb: {
            current: usage.storage_used_mb,
            limit: plan.limits.storage_mb,
            percentage: calculatePercentage(usage.storage_used_mb, plan.limits.storage_mb),
          },
          ai_requests: {
            current: usage.ai_requests_count,
            limit: plan.limits.ai_requests_per_month,
            percentage: calculatePercentage(usage.ai_requests_count, plan.limits.ai_requests_per_month),
          },
        },
      });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    logger.error('Error in billing API', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de billing' },
      { status: 500 }
    );
  }
}
