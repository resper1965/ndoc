/**
 * Fila de processamento de documentos usando BullMQ
 */

import { Queue } from 'bullmq';
import { getRedisClient } from './redis-client';
import { logger } from '@/lib/logger';

export interface DocumentJobData {
  documentId: string;
  organizationId: string;
  chunkingStrategy?: 'sentence' | 'paragraph' | 'semantic';
  chunkSize?: number;
  chunkOverlap?: number;
}

// Criar fila de processamento de documentos
let documentQueue: Queue<DocumentJobData> | null = null;

/**
 * Obtém ou cria a fila de processamento de documentos
 */
export function getDocumentQueue(): Queue<DocumentJobData> {
  if (documentQueue) {
    return documentQueue;
  }

  const connection = getRedisClient();

  documentQueue = new Queue<DocumentJobData>('document-processing', {
    connection,
    defaultJobOptions: {
      attempts: 3, // Tentar 3 vezes antes de falhar
      backoff: {
        type: 'exponential',
        delay: 2000, // Começar com 2 segundos
      },
      removeOnComplete: {
        age: 24 * 3600, // Manter jobs completos por 24 horas
        count: 1000, // Manter últimos 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Manter jobs falhados por 7 dias
      },
    },
  });

  // Event handlers para monitoramento
  documentQueue.on('error', (error) => {
    logger.error('Erro na fila de documentos', error);
  });

  logger.info('Fila de processamento de documentos inicializada');

  return documentQueue;
}

/**
 * Adiciona job de processamento de documento à fila
 */
export async function addDocumentProcessingJob(
  data: DocumentJobData,
  options?: {
    priority?: number;
    delay?: number;
  }
): Promise<string> {
  const queue = getDocumentQueue();

  const job = await queue.add(
    'process-document',
    data,
    {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      jobId: `doc-${data.documentId}`, // ID único baseado no documento
    }
  );

  logger.info('Job de processamento adicionado à fila', {
    jobId: job.id,
    documentId: data.documentId,
    organizationId: data.organizationId,
  });

  return job.id!;
}

/**
 * Obtém status de um job
 */
export async function getJobStatus(jobId: string) {
  const queue = getDocumentQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnvalue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    returnvalue,
    failedReason,
    data: job.data,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

/**
 * Reprocessa um job falhado
 */
export async function retryJob(jobId: string): Promise<void> {
  const queue = getDocumentQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} não encontrado`);
  }

  await job.retry();
  logger.info('Job reprocessado', { jobId });
}

/**
 * Remove um job da fila
 */
export async function removeJob(jobId: string): Promise<void> {
  const queue = getDocumentQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} não encontrado`);
  }

  await job.remove();
  logger.info('Job removido', { jobId });
}

/**
 * Obtém estatísticas da fila
 */
export async function getQueueStats() {
  const queue = getDocumentQueue();

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

