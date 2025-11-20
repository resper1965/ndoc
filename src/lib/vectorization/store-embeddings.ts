/**
 * Armazenamento de embeddings no Supabase
 * Usa pgvector para armazenamento eficiente
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { EmbeddingResult } from './generate-embeddings';

export interface StoreEmbeddingsOptions {
  documentId: string;
  organizationId?: string;
}

/**
 * Armazena embeddings no banco de dados
 */
export async function storeEmbeddings(
  embeddings: EmbeddingResult[],
  options: StoreEmbeddingsOptions
): Promise<void> {
  const { documentId } = options;

  if (embeddings.length === 0) {
    logger.warn('Nenhum embedding para armazenar', { documentId });
    return;
  }

  // Usar service role para bypass RLS durante processamento
  const supabase = createAdminClient();

  // Buscar chunks do documento para mapear chunkId -> chunk database ID
  const { data: chunks, error: chunksError } = await supabase
    .from('document_chunks')
    .select('id, chunk_index')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (chunksError) {
    logger.error('Erro ao buscar chunks do documento', chunksError);
    throw new Error('Erro ao buscar chunks do documento');
  }

  if (chunks.length !== embeddings.length) {
    logger.warn('Número de chunks não corresponde ao número de embeddings', {
      chunksCount: chunks.length,
      embeddingsCount: embeddings.length,
      documentId,
    });
  }

  // Mapear embeddings para chunks do banco
  const embeddingsToInsert = embeddings
    .map((embedding, index) => {
      const chunk = chunks[index];
      if (!chunk) {
        logger.warn('Chunk não encontrado para embedding', {
          chunkIndex: index,
          chunkId: embedding.chunkId,
        });
        return null;
      }

      // pgvector espera array de números diretamente
      // O Supabase JS client converte automaticamente
      return {
        chunk_id: chunk.id,
        embedding: embedding.embedding, // Array de números
        model: embedding.model,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (embeddingsToInsert.length === 0) {
    logger.warn('Nenhum embedding válido para inserir', { documentId });
    return;
  }

  // Inserir embeddings em batch
  // Usar service_role para bypass RLS (já estamos usando createAdminClient)
  const { error: insertError } = await supabase
    .from('document_embeddings')
    .upsert(embeddingsToInsert, {
      onConflict: 'chunk_id',
      ignoreDuplicates: false,
    });

  if (insertError) {
    logger.error('Erro ao armazenar embeddings', insertError);
    throw new Error(`Erro ao armazenar embeddings: ${insertError.message}`);
  }

  logger.info('Embeddings armazenados com sucesso', {
    documentId,
    count: embeddingsToInsert.length,
  });
}

/**
 * Remove embeddings de um documento
 */
export async function removeDocumentEmbeddings(
  documentId: string
): Promise<void> {
  // Usar service role para bypass RLS durante processamento
  const supabase = createAdminClient();

  // Buscar chunks do documento
  const { data: chunks, error: chunksError } = await supabase
    .from('document_chunks')
    .select('id')
    .eq('document_id', documentId);

  if (chunksError) {
    logger.error('Erro ao buscar chunks para remoção', chunksError);
    throw new Error('Erro ao buscar chunks do documento');
  }

  if (!chunks || chunks.length === 0) {
    return; // Nenhum chunk para remover
  }

  const chunkIds = chunks.map((chunk) => chunk.id);

  // Usar service_role para bypass RLS (já estamos usando createAdminClient)
  const { error: deleteError } = await supabase
    .from('document_embeddings')
    .delete()
    .in('chunk_id', chunkIds);

  if (deleteError) {
    logger.error('Erro ao remover embeddings', deleteError);
    throw new Error(`Erro ao remover embeddings: ${deleteError.message}`);
  }

  logger.info('Embeddings removidos com sucesso', {
    documentId,
    count: chunkIds.length,
  });
}

