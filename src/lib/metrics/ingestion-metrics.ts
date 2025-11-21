/**
 * Métricas de ingestão e processamento de documentos
 * Coleta e armazena métricas para monitoramento
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface ConversionMetrics {
  format: string;
  success: number;
  failures: number;
  totalTime: number; // em milissegundos
  averageTime: number; // em milissegundos
}

export interface EmbeddingMetrics {
  totalChunks: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  totalTokens: number;
  averageTokensPerChunk: number;
}

export interface JobMetrics {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number; // em milissegundos
}

export interface IngestionMetrics {
  conversions: ConversionMetrics[];
  embeddings: EmbeddingMetrics;
  jobs: JobMetrics;
  timestamp: string;
}

/**
 * Registra métrica de conversão
 */
export async function recordConversionMetric(
  format: string,
  success: boolean,
  processingTime: number
): Promise<void> {
  try {
    // Por enquanto, apenas logar
    // Futuro: armazenar em tabela de métricas
    logger.info('Métrica de conversão registrada', {
      format,
      success,
      processingTime,
    });
  } catch (error) {
    logger.warn('Erro ao registrar métrica de conversão', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Registra métrica de embedding
 */
export async function recordEmbeddingMetric(
  chunksCount: number,
  successfulCount: number,
  failedCount: number,
  totalTokens: number
): Promise<void> {
  try {
    logger.info('Métrica de embedding registrada', {
      chunksCount,
      successfulCount,
      failedCount,
      totalTokens,
    });
  } catch (error) {
    logger.warn('Erro ao registrar métrica de embedding', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Obtém métricas de conversão por formato
 */
export async function getConversionMetrics(
  organizationId?: string,
  days: number = 7
): Promise<ConversionMetrics[]> {
  try {
    const supabase = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Buscar documentos processados no período
    let query = supabase
      .from('documents')
      .select('document_type, created_at')
      .gte('created_at', since.toISOString());

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: documents, error } = await query;

    if (error) {
      logger.error('Erro ao buscar métricas de conversão', error);
      return [];
    }

    // Agrupar por formato e contar
    const metricsMap = new Map<string, { success: number; failures: number; totalTime: number }>();

    (documents || []).forEach((doc) => {
      const format = doc.document_type || 'unknown';
      const current = metricsMap.get(format) || { success: 0, failures: 0, totalTime: 0 };
      current.success += 1;
      metricsMap.set(format, current);
    });

    // Converter para array
    const metrics: ConversionMetrics[] = Array.from(metricsMap.entries()).map(([format, data]) => ({
      format,
      success: data.success,
      failures: data.failures,
      totalTime: data.totalTime,
      averageTime: data.success > 0 ? data.totalTime / data.success : 0,
    }));

    return metrics;
  } catch (error) {
    logger.error('Erro ao obter métricas de conversão', error);
    return [];
  }
}

/**
 * Obtém métricas de embeddings
 */
export async function getEmbeddingMetrics(
  organizationId?: string,
  days: number = 7
): Promise<EmbeddingMetrics> {
  try {
    const supabase = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Buscar chunks e embeddings do período
    let chunksQuery = supabase
      .from('document_chunks')
      .select('id, token_count, document_id, documents!inner(organization_id, created_at)')
      .gte('documents.created_at', since.toISOString());

    if (organizationId) {
      chunksQuery = chunksQuery.eq('documents.organization_id', organizationId);
    }

    const { data: chunks, error: chunksError } = await chunksQuery;

    if (chunksError) {
      logger.error('Erro ao buscar métricas de embeddings', chunksError);
      return {
        totalChunks: 0,
        successfulEmbeddings: 0,
        failedEmbeddings: 0,
        totalTokens: 0,
        averageTokensPerChunk: 0,
      };
    }

    const chunkIds = (chunks || []).map((c) => c.id);
    const totalChunks = chunkIds.length;

    // Buscar embeddings correspondentes
    const embeddingsQuery = supabase
      .from('document_embeddings')
      .select('chunk_id')
      .in('chunk_id', chunkIds);

    const { data: embeddings, error: embeddingsError } = await embeddingsQuery;

    if (embeddingsError) {
      logger.error('Erro ao buscar embeddings para métricas', embeddingsError);
    }

    const successfulEmbeddings = (embeddings || []).length;
    const failedEmbeddings = totalChunks - successfulEmbeddings;

    // Calcular tokens totais
    const totalTokens = (chunks || []).reduce((sum, chunk) => {
      return sum + (chunk.token_count || 0);
    }, 0);

    return {
      totalChunks,
      successfulEmbeddings,
      failedEmbeddings,
      totalTokens,
      averageTokensPerChunk: totalChunks > 0 ? totalTokens / totalChunks : 0,
    };
  } catch (error) {
    logger.error('Erro ao obter métricas de embeddings', error);
    return {
      totalChunks: 0,
      successfulEmbeddings: 0,
      failedEmbeddings: 0,
      totalTokens: 0,
      averageTokensPerChunk: 0,
    };
  }
}

/**
 * Obtém métricas de jobs
 */
export async function getJobMetrics(
  organizationId?: string
): Promise<JobMetrics> {
  try {
    const supabase = createAdminClient();

    // Buscar jobs por status
    let query = supabase
      .from('document_processing_jobs')
      .select('status, started_at, completed_at, created_at, documents!inner(organization_id)');

    if (organizationId) {
      query = query.eq('documents.organization_id', organizationId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      logger.error('Erro ao buscar métricas de jobs', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        averageProcessingTime: 0,
      };
    }

    const metrics: JobMetrics = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageProcessingTime: 0,
    };

    const processingTimes: number[] = [];

    (jobs || []).forEach((job) => {
      // Contar por status
      switch (job.status) {
        case 'pending':
          metrics.pending += 1;
          break;
        case 'processing':
          metrics.processing += 1;
          break;
        case 'completed':
          metrics.completed += 1;
          // Calcular tempo de processamento
          if (job.started_at && job.completed_at) {
            const start = new Date(job.started_at).getTime();
            const end = new Date(job.completed_at).getTime();
            processingTimes.push(end - start);
          }
          break;
        case 'failed':
          metrics.failed += 1;
          break;
      }
    });

    // Calcular tempo médio
    if (processingTimes.length > 0) {
      metrics.averageProcessingTime =
        processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
    }

    return metrics;
  } catch (error) {
    logger.error('Erro ao obter métricas de jobs', error);
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageProcessingTime: 0,
    };
  }
}

/**
 * Obtém todas as métricas de ingestão
 */
export async function getAllIngestionMetrics(
  organizationId?: string,
  days: number = 7
): Promise<IngestionMetrics> {
  const [conversions, embeddings, jobs] = await Promise.all([
    getConversionMetrics(organizationId, days),
    getEmbeddingMetrics(organizationId, days),
    getJobMetrics(organizationId),
  ]);

  return {
    conversions,
    embeddings,
    jobs,
    timestamp: new Date().toISOString(),
  };
}

