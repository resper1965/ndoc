/**
 * Cliente Redis para BullMQ
 * Compatível com Upstash Redis
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logger';

let redisClient: Redis | null = null;

/**
 * Obtém ou cria cliente Redis para BullMQ
 * Usa ioredis que é compatível com Upstash Redis
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Em desenvolvimento, pode usar Redis local ou fallback
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Redis é obrigatório em produção. Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN'
      );
    }

    // Para desenvolvimento, tentar Redis local na porta padrão
    logger.warn('Redis não configurado, tentando conexão local para desenvolvimento');
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Falha ao conectar ao Redis após múltiplas tentativas');
          return null; // Parar tentativas
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
    });
  } else {
    // Upstash Redis via REST API não funciona diretamente com ioredis
    // Precisamos usar a URL completa com token
    // Upstash fornece uma URL REST, mas BullMQ precisa de conexão TCP
    // Solução: usar Redis local ou Upstash Redis via TCP (se disponível)
    
    // Tentar parsear URL do Upstash para extrair host/porta
    try {
      // Upstash REST URL é diferente de TCP URL
      // Para BullMQ, precisamos da URL TCP do Upstash
      // Se não tiver UPSTASH_REDIS_TCP_URL, usar Redis local em desenvolvimento
      
      const tcpUrl = process.env.UPSTASH_REDIS_TCP_URL;
      if (tcpUrl) {
        // Upstash fornece URL TCP separada
        redisClient = new Redis(tcpUrl, {
          password: redisToken,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error('Falha ao conectar ao Redis Upstash após múltiplas tentativas');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
      } else {
        // Fallback: usar Redis local em desenvolvimento
        if (process.env.NODE_ENV === 'production') {
          throw new Error(
            'UPSTASH_REDIS_TCP_URL é necessário para BullMQ em produção. Configure a URL TCP do Upstash Redis.'
          );
        }
        
        logger.warn('UPSTASH_REDIS_TCP_URL não configurado, usando Redis local para desenvolvimento');
        redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error('Falha ao conectar ao Redis local após múltiplas tentativas');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
      }
    } catch (error) {
      logger.error('Erro ao configurar cliente Redis', error);
      throw new Error('Falha ao configurar cliente Redis: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Event handlers para monitoramento
  redisClient.on('connect', () => {
    logger.info('Redis conectado com sucesso');
  });

  redisClient.on('error', (error) => {
    logger.error('Erro no Redis', error);
  });

  redisClient.on('close', () => {
    logger.warn('Conexão Redis fechada');
  });

  return redisClient;
}

/**
 * Fecha conexão Redis (útil para cleanup em testes)
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    const client = redisClient;
    redisClient = null;
    await client.quit();
  }
}

