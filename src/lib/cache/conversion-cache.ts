/**
 * Cache de conversões de documentos
 * Armazena resultados de conversão por hash do arquivo para evitar reprocessamento
 */

import { getRedisClient } from '../queue/redis-client';
import { logger } from '@/lib/logger';
import { calculateFileHash } from '../validation/duplicate-validator';

const CACHE_PREFIX = 'conversion:';
const DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 dias em segundos

export interface CachedConversion {
  content: string;
  metadata: Record<string, any>;
  originalType: string;
  cachedAt: string;
}

/**
 * Obtém conversão do cache
 * 
 * @param fileHash Hash SHA-256 do arquivo
 * @returns Conversão em cache ou null
 */
export async function getCachedConversion(
  fileHash: string
): Promise<CachedConversion | null> {
  if (!fileHash) {
    return null;
  }

  try {
    const redis = getRedisClient();
    const cacheKey = `${CACHE_PREFIX}${fileHash}`;

    // Verificar se é cliente Redis (ioredis) ou Upstash
    if ('get' in redis && typeof redis.get === 'function') {
      // ioredis
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CachedConversion;
        logger.debug('Conversão encontrada no cache', { fileHash });
        return parsed;
      }
    } else if ('get' in redis && typeof (redis as any).get === 'function') {
      // Upstash Redis (pode ter API diferente)
      try {
        const cached = await (redis as any).get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as CachedConversion;
          logger.debug('Conversão encontrada no cache', { fileHash });
          return parsed;
        }
      } catch {
        // Fallback: tentar método alternativo
      }
    }

    return null;
  } catch (error) {
    logger.warn('Erro ao buscar conversão do cache', {
      error: error instanceof Error ? error.message : String(error),
      fileHash,
    });
    return null;
  }
}

/**
 * Armazena conversão no cache
 * 
 * @param fileHash Hash SHA-256 do arquivo
 * @param content Conteúdo convertido
 * @param metadata Metadados da conversão
 * @param originalType Tipo original do arquivo
 * @param ttl Tempo de vida em segundos (padrão: 30 dias)
 */
export async function setCachedConversion(
  fileHash: string,
  content: string,
  metadata: Record<string, any>,
  originalType: string,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  if (!fileHash) {
    return;
  }

  try {
    const redis = getRedisClient();
    const cacheKey = `${CACHE_PREFIX}${fileHash}`;

    const cached: CachedConversion = {
      content,
      metadata,
      originalType,
      cachedAt: new Date().toISOString(),
    };

    // Verificar se é cliente Redis (ioredis) ou Upstash
    if ('setex' in redis && typeof redis.setex === 'function') {
      // ioredis
      await redis.setex(cacheKey, ttl, JSON.stringify(cached));
    } else if ('set' in redis && typeof (redis as any).set === 'function') {
      // Upstash Redis
      try {
        await (redis as any).set(cacheKey, JSON.stringify(cached), {
          ex: ttl, // Expira em ttl segundos
        });
      } catch {
        // Fallback: tentar método alternativo
        logger.warn('Método de cache não suportado, pulando cache');
        return;
      }
    }

    logger.debug('Conversão armazenada no cache', { fileHash, ttl });
  } catch (error) {
    logger.warn('Erro ao armazenar conversão no cache', {
      error: error instanceof Error ? error.message : String(error),
      fileHash,
    });
    // Não falhar se cache não funcionar
  }
}

/**
 * Remove conversão do cache
 * 
 * @param fileHash Hash SHA-256 do arquivo
 */
export async function invalidateCachedConversion(fileHash: string): Promise<void> {
  if (!fileHash) {
    return;
  }

  try {
    const redis = getRedisClient();
    const cacheKey = `${CACHE_PREFIX}${fileHash}`;

    if ('del' in redis && typeof redis.del === 'function') {
      await redis.del(cacheKey);
      logger.debug('Conversão removida do cache', { fileHash });
    } else if ('del' in redis && typeof (redis as any).del === 'function') {
      await (redis as any).del(cacheKey);
      logger.debug('Conversão removida do cache', { fileHash });
    }
  } catch (error) {
    logger.warn('Erro ao remover conversão do cache', {
      error: error instanceof Error ? error.message : String(error),
      fileHash,
    });
  }
}

/**
 * Calcula hash do arquivo e busca conversão no cache
 * 
 * @param fileBuffer Buffer do arquivo
 * @returns Conversão em cache ou null
 */
export async function getCachedConversionByFile(
  fileBuffer: Buffer
): Promise<CachedConversion | null> {
  const fileHash = calculateFileHash(fileBuffer);
  return getCachedConversion(fileHash);
}

/**
 * Calcula hash do arquivo e armazena conversão no cache
 * 
 * @param fileBuffer Buffer do arquivo
 * @param content Conteúdo convertido
 * @param metadata Metadados da conversão
 * @param originalType Tipo original do arquivo
 * @param ttl Tempo de vida em segundos
 */
export async function setCachedConversionByFile(
  fileBuffer: Buffer,
  content: string,
  metadata: Record<string, any>,
  originalType: string,
  ttl?: number
): Promise<void> {
  const fileHash = calculateFileHash(fileBuffer);
  return setCachedConversion(fileHash, content, metadata, originalType, ttl);
}

