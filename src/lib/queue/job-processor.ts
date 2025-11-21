/**
 * Worker para processar jobs de documentos
 * Deve ser executado em um processo separado ou como background job
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from './redis-client';
import { processDocument } from '@/lib/vectorization/process-document';
import { logger } from '@/lib/logger';
import type { DocumentJobData } from './document-queue';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Atualiza status do job no banco de dados
 */
async function updateJobStatus(
  documentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  stage?: string,
  progress?: number,
  errorMessage?: string
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.warn('Variáveis de ambiente do Supabase não configuradas para atualizar job');
      return;
    }

    const serviceSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (stage) {
      updateData.stage = stage;
    }

    if (progress !== undefined) {
      updateData.progress_percentage = progress;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'processing' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    const { error } = await serviceSupabase
      .from('document_processing_jobs')
      .update(updateData)
      .eq('document_id', documentId);

    if (error) {
      logger.warn('Erro ao atualizar job no banco de dados (não crítico)', { error: error.message });
    }
  } catch (error) {
    logger.warn('Erro ao atualizar job no banco de dados (não crítico)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

let documentWorker: Worker<DocumentJobData> | null = null;

/**
 * Inicializa o worker de processamento de documentos
 * IMPORTANTE: Em produção, este worker deve rodar em um processo separado
 * ou como um job agendado (ex: Vercel Cron Jobs, Supabase Edge Functions)
 */
export function initializeDocumentWorker(): Worker<DocumentJobData> {
  if (documentWorker) {
    return documentWorker;
  }

  const connection = getRedisClient();

  documentWorker = new Worker<DocumentJobData>(
    'document-processing',
    async (job: Job<DocumentJobData>) => {
      const { documentId, organizationId, chunkingStrategy, chunkSize, chunkOverlap } = job.data;

      logger.info('Iniciando processamento de documento', {
        jobId: job.id,
        documentId,
        organizationId,
      });

      try {
        // Atualizar job no banco de dados
        await updateJobStatus(documentId, 'processing', 'Buscando documento', 10);

        // Atualizar progresso no BullMQ
        await job.updateProgress(10);

        // Processar documento
        const result = await processDocument({
          documentId,
          organizationId,
          chunkingStrategy: chunkingStrategy || 'paragraph',
          chunkSize: chunkSize || 500,
          chunkOverlap: chunkOverlap || 50,
          updateProgress: async (progress, stage) => {
            // Atualizar progresso no job BullMQ
            await job.updateProgress(progress);
            // Atualizar job no banco de dados
            await updateJobStatus(documentId, 'processing', stage, progress);
            logger.info('Progresso do processamento', {
              jobId: job.id,
              documentId,
              progress,
              stage,
            });
          },
        });

        if (!result.success) {
          throw new Error(result.error || 'Falha no processamento do documento');
        }

        // Atualizar job como completo no banco
        await updateJobStatus(documentId, 'completed', 'Concluído', 100);

        logger.info('Documento processado com sucesso', {
          jobId: job.id,
          documentId,
          chunksCount: result.chunksCount,
          embeddingsCount: result.embeddingsCount,
        });

        return {
          success: true,
          chunksCount: result.chunksCount,
          embeddingsCount: result.embeddingsCount,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Erro ao processar documento', error, {
          jobId: job.id,
          documentId,
        });

        // Atualizar job como falhado no banco
        await updateJobStatus(documentId, 'failed', 'Erro no processamento', undefined, errorMessage);

        // Relançar erro para que BullMQ possa fazer retry
        throw new Error(`Falha no processamento: ${errorMessage}`);
      }
    },
    {
      connection,
      concurrency: 3, // Processar até 3 documentos simultaneamente
      limiter: {
        max: 10, // Máximo 10 jobs
        duration: 60000, // por minuto
      },
    }
  );

  // Event handlers
  documentWorker.on('completed', (job) => {
    logger.info('Job completado', {
      jobId: job.id,
      documentId: job.data.documentId,
    });
  });

  documentWorker.on('failed', (job, error) => {
    logger.error('Job falhou', error, {
      jobId: job?.id,
      documentId: job?.data.documentId,
      attemptsMade: job?.attemptsMade,
    });
  });

  documentWorker.on('error', (error) => {
    logger.error('Erro no worker', error);
  });

  logger.info('Worker de processamento de documentos inicializado');

  return documentWorker;
}

/**
 * Fecha o worker (útil para cleanup)
 */
export async function closeDocumentWorker(): Promise<void> {
  if (documentWorker) {
    await documentWorker.close();
    documentWorker = null;
    logger.info('Worker de processamento de documentos fechado');
  }
}

/**
 * Para uso em Next.js API routes ou Edge Functions
 * Processa um job diretamente sem worker (para casos onde não há worker rodando)
 */
export async function processDocumentJobDirectly(data: DocumentJobData) {
  logger.info('Processando documento diretamente (sem worker)', {
    documentId: data.documentId,
  });

  return await processDocument({
    documentId: data.documentId,
    organizationId: data.organizationId,
    chunkingStrategy: data.chunkingStrategy || 'paragraph',
    chunkSize: data.chunkSize || 500,
    chunkOverlap: data.chunkOverlap || 50,
  });
}

