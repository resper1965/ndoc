import { NextRequest, NextResponse } from 'next/server';
import { getAllIngestionMetrics } from '@/lib/metrics/ingestion-metrics';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/metrics/ingestion
 * Obtém métricas de ingestão e processamento
 * 
 * Query params:
 * - days: número de dias para buscar métricas (padrão: 7)
 * - organizationId: ID da organização (opcional, usa organização do usuário se não fornecido)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Obter organização do usuário
    let organizationId: string | undefined;
    try {
      organizationId = await getUserOrganization() || undefined;
    } catch (error) {
      logger.warn('Erro ao buscar organização do usuário para métricas', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Verificar se organizationId foi fornecido na query
    const searchParams = request.nextUrl.searchParams;
    const queryOrgId = searchParams.get('organizationId');
    if (queryOrgId) {
      organizationId = queryOrgId;
    }

    const days = parseInt(searchParams.get('days') || '7', 10);

    // Obter métricas
    const metrics = await getAllIngestionMetrics(organizationId, days);

    return NextResponse.json({
      metrics,
      organizationId,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Erro ao obter métricas de ingestão', error);
    return NextResponse.json(
      {
        error: 'Erro ao obter métricas',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

