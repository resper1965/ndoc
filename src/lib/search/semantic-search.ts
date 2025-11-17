/**
 * Busca Semântica usando embeddings
 * Baseado nas melhores práticas do Context7
 */

import { generateQueryEmbedding } from '../vectorization/generate-embeddings';
import { createClient } from '../supabase/server';
import { getUserOrganization } from '../supabase/utils';
import { logger } from '../logger';

export interface SemanticSearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  documentTitle: string;
  documentType: string | null;
  chunkIndex: number;
  documentPath: string;
}

export interface SemanticSearchOptions {
  organizationId?: string;
  documentType?: 'policy' | 'procedure' | 'manual' | 'other';
  matchThreshold?: number; // 0-1, padrão 0.7
  matchCount?: number; // padrão 10
  limit?: number; // alias para matchCount
}

/**
 * Busca semântica usando embeddings
 */
export async function semanticSearch(
  query: string,
  options: SemanticSearchOptions = {}
): Promise<SemanticSearchResult[]> {
  const {
    organizationId,
    documentType,
    matchThreshold = 0.7,
    matchCount = options.limit || 10,
  } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // 1. Gerar embedding da query
    const queryEmbedding = await generateQueryEmbedding(query.trim(), {
      organizationId,
    });

    // 2. Buscar no banco usando função SQL semantic_search
    const supabase = await createClient();
    
    // Obter organizationId se não fornecido
    let orgId = organizationId;
    if (!orgId) {
      orgId = await getUserOrganization() || undefined;
    }

    // Chamar função RPC
    // pgvector aceita array diretamente no Supabase JS client
    const { data, error } = await supabase.rpc('semantic_search', {
      query_embedding: queryEmbedding, // Array de números
      organization_id_filter: orgId || null,
      document_type_filter: documentType || null,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      logger.error('Erro na busca semântica', error);
      throw new Error(`Erro na busca semântica: ${error.message}`);
    }

    // Mapear resultados
    return (data || []).map((result: any) => ({
      chunkId: result.chunk_id,
      documentId: result.document_id,
      content: result.content,
      similarity: result.similarity,
      documentTitle: result.document_title || result.title,
      documentType: result.document_type,
      chunkIndex: result.chunk_index,
      documentPath: result.document_path || result.path,
    }));
  } catch (error) {
    logger.error('Erro ao realizar busca semântica', error);
    throw error;
  }
}

/**
 * Busca semântica com agrupamento por documento
 */
export async function semanticSearchGrouped(
  query: string,
  options: SemanticSearchOptions = {}
): Promise<Record<string, SemanticSearchResult[]>> {
  const results = await semanticSearch(query, options);

  // Agrupar por documento
  const grouped: Record<string, SemanticSearchResult[]> = {};

  for (const result of results) {
    if (!grouped[result.documentId]) {
      grouped[result.documentId] = [];
    }
    grouped[result.documentId].push(result);
  }

  // Ordenar chunks dentro de cada documento por similaridade
  for (const docId in grouped) {
    grouped[docId].sort((a, b) => b.similarity - a.similarity);
  }

  return grouped;
}

