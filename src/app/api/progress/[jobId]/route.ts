import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getJobStatus } from '@/lib/queue/document-queue';

/**
 * GET /api/progress/[jobId]
 * Obtém progresso de um job de processamento
 * 
 * @param request Request object
 * @param params Parâmetros da rota (jobId)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId é obrigatório' }, { status: 400 });
    }

    // Buscar status do job na fila BullMQ
    const queueStatus = await getJobStatus(jobId);

    // Buscar status do job no banco de dados
    const supabase = createAdminClient();
    const { data: job, error } = await supabase
      .from('document_processing_jobs')
      .select('status, stage, progress_percentage, error_message, started_at, completed_at, created_at')
      .eq('document_id', jobId.replace('doc-', '')) // jobId é 'doc-{documentId}'
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar progresso do job', error);
    }

    // Combinar informações da fila e do banco
    const progress = {
      jobId,
      status: job?.status || queueStatus?.state || 'unknown',
      stage: job?.stage || 'Aguardando processamento',
      progress: job?.progress_percentage || queueStatus?.progress || 0,
      error: job?.error_message || queueStatus?.failedReason || null,
      startedAt: job?.started_at || null,
      completedAt: job?.completed_at || queueStatus?.finishedOn || null,
      createdAt: job?.created_at || queueStatus?.timestamp || null,
      queueState: queueStatus?.state || null,
    };

    return NextResponse.json(progress);
  } catch (error) {
    logger.error('Erro ao obter progresso do job', error);
    return NextResponse.json(
      {
        error: 'Erro ao obter progresso',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

