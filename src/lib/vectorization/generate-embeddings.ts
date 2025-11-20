/**
 * Geração de embeddings usando OpenAI
 * Baseado nas melhores práticas do Context7
 */

import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { decryptApiKey } from '@/lib/encryption/api-keys';
import type { DocumentChunk } from './chunk-document';

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  model: string;
  tokenCount?: number;
}

export interface GenerateEmbeddingsOptions {
  organizationId?: string;
  model?: string;
  batchSize?: number;
  maxRetries?: number;
}

/**
 * Gera embeddings para uma lista de chunks usando OpenAI
 */
export async function generateEmbeddings(
  chunks: DocumentChunk[],
  options: GenerateEmbeddingsOptions = {}
): Promise<EmbeddingResult[]> {
  const {
    organizationId,
    model = 'text-embedding-3-small',
    batchSize = 100, // OpenAI permite até 2048 por request
    maxRetries = 3,
  } = options;

  if (chunks.length === 0) {
    return [];
  }

  // Obter API key da organização ou usar global
  const apiKey = await getOpenAIKey(organizationId);
  if (!apiKey) {
    throw new Error('OpenAI API key não configurada');
  }

  const results: EmbeddingResult[] = [];

  // Processar em batches para evitar rate limits
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    try {
      const batchResults = await generateBatchEmbeddings(
        batch,
        apiKey,
        model,
        maxRetries
      );
      results.push(...batchResults);
    } catch (error) {
      logger.error('Erro ao gerar embeddings em batch', {
        batchStart: i,
        batchSize: batch.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  return results;
}

/**
 * Gera embeddings para um batch de chunks
 */
async function generateBatchEmbeddings(
  chunks: DocumentChunk[],
  apiKey: string,
  model: string,
  maxRetries: number
): Promise<EmbeddingResult[]> {
  const texts = chunks.map((chunk) => chunk.content);

  // Usar OpenAI SDK
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model,
        input: texts,
        encoding_format: 'float',
      });

      // Mapear resultados para chunks
      return response.data.map((embedding: any, index) => ({
        chunkId: chunks[index].id,
        embedding: embedding.embedding,
        model: embedding.model || model,
        tokenCount: chunks[index].tokenCount,
      }));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Se for rate limit, esperar antes de tentar novamente
      if (error instanceof Error && error.message.includes('rate limit')) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Rate limit atingido, aguardando ${waitTime}ms antes de tentar novamente`, {
          attempt,
          maxRetries,
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Se não for rate limit e não for última tentativa, relançar
      if (attempt < maxRetries) {
        logger.warn(`Erro ao gerar embeddings, tentativa ${attempt}/${maxRetries}`, {
          error: lastError.message,
        });
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Falha ao gerar embeddings após múltiplas tentativas');
}

/**
 * Obtém a API key do OpenAI da organização ou usa a global
 */
async function getOpenAIKey(organizationId?: string): Promise<string | null> {
  // Se não houver organizationId, usar global
  if (!organizationId) {
    const globalKey = process.env.OPENAI_API_KEY;
    if (globalKey) {
      return globalKey;
    }
  }

  // Buscar da configuração da organização
  try {
    const supabase = await createClient();
    
    // Se não houver organizationId, tentar obter do usuário atual
    let orgId = organizationId;
    if (!orgId) {
      const userOrgId = await getUserOrganization();
      orgId = userOrgId || undefined;
    }

    if (!orgId) {
      // Fallback para global
      return process.env.OPENAI_API_KEY || null;
    }

    const { data, error } = await supabase
      .from('ai_provider_config')
      .select('api_key_encrypted, provider')
      .eq('organization_id', orgId)
      .eq('provider', 'openai')
      .single();

    if (error || !data) {
      // Fallback para global
      return process.env.OPENAI_API_KEY || null;
    }

    // Descriptografar API key antes de usar
    if (data.api_key_encrypted) {
      try {
        const decryptedKey = decryptApiKey(data.api_key_encrypted);
        return decryptedKey;
      } catch (error) {
        logger.error('Erro ao descriptografar API key da organização', error);
        // Fallback para global se descriptografia falhar
        return process.env.OPENAI_API_KEY || null;
      }
    }

    // Fallback para global se não houver chave configurada
    return process.env.OPENAI_API_KEY || null;
  } catch (error) {
    logger.error('Erro ao buscar API key da organização', error);
    return process.env.OPENAI_API_KEY || null;
  }
}

/**
 * Gera embedding para um único texto (útil para queries de busca)
 */
export async function generateQueryEmbedding(
  text: string,
  options: { organizationId?: string; model?: string } = {}
): Promise<number[]> {
  const { organizationId, model = 'text-embedding-3-small' } = options;

  const apiKey = await getOpenAIKey(organizationId);
  if (!apiKey) {
    throw new Error('OpenAI API key não configurada');
  }

  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const response = await openai.embeddings.create({
    model,
    input: text,
    encoding_format: 'float',
  });

  return response.data[0].embedding;
}

