/**
 * Pipeline completo de processamento de documentos
 * Chunking → Embeddings → Armazenamento
 */

import { chunkDocument, type DocumentChunk } from './chunk-document';
import { generateEmbeddings } from './generate-embeddings';
import { storeEmbeddings } from './store-embeddings';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface ProcessDocumentOptions {
  documentId: string;
  organizationId?: string;
  chunkingStrategy?: 'sentence' | 'paragraph' | 'semantic';
  chunkSize?: number;
  chunkOverlap?: number;
  updateProgress?: (progress: number, stage: string) => Promise<void>;
}

export interface ProcessDocumentResult {
  success: boolean;
  chunksCount: number;
  embeddingsCount: number;
  error?: string;
}

/**
 * Processa um documento completo: chunking → embeddings → armazenamento
 */
export async function processDocument(
  options: ProcessDocumentOptions
): Promise<ProcessDocumentResult> {
  const {
    documentId,
    organizationId,
    chunkingStrategy = 'paragraph',
    chunkSize = 500,
    chunkOverlap = 50,
    updateProgress,
  } = options;

  try {
    // 1. Buscar documento
    await updateProgress?.(10, 'Buscando documento');
    const supabase = await createClient();
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, content, document_type, organization_id')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Documento não encontrado: ${docError?.message || 'Unknown error'}`);
    }

    const docOrgId = organizationId || document.organization_id;

    // 2. Chunking
    await updateProgress?.(20, 'Dividindo documento em chunks');
    const chunks = chunkDocument(document.content, {
      strategy: chunkingStrategy,
      chunkSize,
      chunkOverlap,
      preserveHeaders: true,
    });

    if (chunks.length === 0) {
      throw new Error('Documento não gerou chunks válidos');
    }

    logger.info('Documento dividido em chunks', {
      documentId,
      chunksCount: chunks.length,
    });

    // 3. Armazenar chunks no banco
    await updateProgress?.(30, 'Armazenando chunks');
    await storeChunks(documentId, chunks);

    // 4. Gerar embeddings
    await updateProgress?.(40, 'Gerando embeddings');
    const embeddings = await generateEmbeddings(chunks, {
      organizationId: docOrgId,
      model: 'text-embedding-3-small',
      batchSize: 100,
    });

    if (embeddings.length === 0) {
      throw new Error('Falha ao gerar embeddings');
    }

    logger.info('Embeddings gerados', {
      documentId,
      embeddingsCount: embeddings.length,
    });

    // 5. Armazenar embeddings
    await updateProgress?.(80, 'Armazenando embeddings');
    await storeEmbeddings(embeddings, {
      documentId,
      organizationId: docOrgId,
    });

    // 6. Atualizar documento como vetorizado
    await updateProgress?.(90, 'Finalizando');
    await markDocumentAsVectorized(documentId);

    await updateProgress?.(100, 'Concluído');

    return {
      success: true,
      chunksCount: chunks.length,
      embeddingsCount: embeddings.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao processar documento', {
      documentId,
      error: errorMessage,
    });

    // Atualizar job como falhado
    await updateProcessingJob(documentId, 'failed', errorMessage);

    return {
      success: false,
      chunksCount: 0,
      embeddingsCount: 0,
      error: errorMessage,
    };
  }
}

/**
 * Armazena chunks no banco de dados
 */
async function storeChunks(
  documentId: string,
  chunks: DocumentChunk[]
): Promise<void> {
  const supabase = await createClient();

  // Remover chunks antigos se existirem
  const { error: deleteError } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId);

  if (deleteError) {
    logger.warn('Erro ao remover chunks antigos (pode ser normal se não existirem)', { error: deleteError });
  }

  // Inserir novos chunks
  const chunksToInsert = chunks.map((chunk) => ({
    document_id: documentId,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    token_count: chunk.tokenCount,
    metadata: chunk.metadata || {},
  }));

  // Usar service_role para bypass RLS
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }

  const serviceSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: insertError } = await serviceSupabase
    .from('document_chunks')
    .insert(chunksToInsert);

  if (insertError) {
    logger.error('Erro ao armazenar chunks', insertError);
    throw new Error(`Erro ao armazenar chunks: ${insertError.message}`);
  }

  logger.info('Chunks armazenados com sucesso', {
    documentId,
    count: chunksToInsert.length,
  });
}

/**
 * Marca documento como vetorizado
 */
async function markDocumentAsVectorized(documentId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .update({
      is_vectorized: true,
      vectorized_at: new Date().toISOString(),
    })
    .eq('id', documentId);

  if (error) {
    logger.error('Erro ao marcar documento como vetorizado', error);
    throw new Error(`Erro ao atualizar documento: ${error.message}`);
  }
}

/**
 * Atualiza status do job de processamento
 */
async function updateProcessingJob(
  documentId: string,
  status: 'processing' | 'completed' | 'failed',
  errorMessage?: string,
  stage?: string,
  progress?: number
): Promise<void> {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return; // Não crítico, apenas log
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

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  if (stage) {
    updateData.stage = stage;
  }

  if (progress !== undefined) {
    updateData.progress_percentage = progress;
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await serviceSupabase
    .from('document_processing_jobs')
    .update(updateData)
    .eq('document_id', documentId);

  if (error) {
    logger.warn('Erro ao atualizar job de processamento (não crítico)', { error });
  }
}

