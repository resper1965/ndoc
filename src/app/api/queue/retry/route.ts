import { NextRequest, NextResponse } from 'next/server';
import { retryJob, getFailedJobs, retryFailedJobs } from '@/lib/queue/document-queue';
import { logger } from '@/lib/logger';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/queue/retry
 * Lista jobs falhados
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const failedJobs = await getFailedJobs(limit);

    return NextResponse.json({
      failedJobs,
      count: failedJobs.length,
    });
  } catch (error) {
    logger.error('Erro ao listar jobs falhados', error);
    return NextResponse.json(
      { error: 'Erro ao listar jobs falhados', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/queue/retry
 * Retenta jobs falhados
 * 
 * Body opcional:
 * - jobId: string - ID do job específico para retentar
 * - auto: boolean - Se true, retenta múltiplos jobs automaticamente
 * - maxRetries: number - Máximo de tentativas totais (padrão: 5)
 * - maxJobs: number - Máximo de jobs para retentar (padrão: 10)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (apenas admin)
    const supabase = createAdminClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é superadmin (opcional - pode ser implementado)
    // Por enquanto, qualquer usuário autenticado pode retentar

    const body = await request.json().catch(() => ({}));
    const { jobId, auto = false, maxRetries = 5, maxJobs = 10 } = body;

    if (jobId) {
      // Retentar job específico
      await retryJob(jobId);
      return NextResponse.json({
        success: true,
        message: `Job ${jobId} retentado com sucesso`,
      });
    }

    if (auto) {
      // Retentar múltiplos jobs automaticamente
      const result = await retryFailedJobs({
        maxRetries,
        maxJobs,
      });

      return NextResponse.json({
        success: true,
        message: `Retentados ${result.retried} jobs, ${result.skipped} pulados, ${result.errors} erros`,
        ...result,
      });
    }

    return NextResponse.json(
      { error: 'Especifique jobId ou auto=true' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Erro ao retentar jobs', error);
    return NextResponse.json(
      { error: 'Erro ao retentar jobs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

