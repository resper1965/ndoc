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
    logger.warn(
      'Redis não configurado, tentando conexão local para desenvolvimento'
    );
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
    // Upstash Redis via REST API não funciona diretamente com ioredis/BullMQ
    // BullMQ precisa de conexão TCP, não REST
    // Opções de configuração (em ordem de prioridade):
    // 1. REDIS_URL (URL completa com protocolo: rediss://default:password@host:port)
    // 2. UPSTASH_REDIS_TCP_URL (URL completa: redis://host:port)
    // 3. UPSTASH_REDIS_ENDPOINT + UPSTASH_REDIS_PASSWORD (separados)

    try {
      // Opção 1: REDIS_URL (formato completo do Upstash)
      const redisUrl = process.env.REDIS_URL;
      // Opção 2: URL TCP completa
      const tcpUrl = process.env.UPSTASH_REDIS_TCP_URL;
      // Opção 3: Endpoint e password separados
      const endpoint = process.env.UPSTASH_REDIS_ENDPOINT;
      const password = process.env.UPSTASH_REDIS_PASSWORD || redisToken;

      if (redisUrl) {
        // Usar REDIS_URL (formato completo: rediss://default:password@host:port)
        // ioredis suporta URLs completas e detecta TLS automaticamente se usar rediss://
        redisClient = new Redis(redisUrl, {
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error(
                'Falha ao conectar ao Redis Upstash após múltiplas tentativas'
              );
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
        logger.info('Redis configurado usando REDIS_URL');
      } else if (tcpUrl) {
        // Usar URL TCP completa
        redisClient = new Redis(tcpUrl, {
          password: password,
          tls: {}, // Upstash requer TLS
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error(
                'Falha ao conectar ao Redis Upstash após múltiplas tentativas'
              );
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
        logger.info('Redis configurado usando UPSTASH_REDIS_TCP_URL');
      } else if (endpoint) {
        // Usar endpoint e password separados
        // Formato do endpoint: comic-raven-37828.upstash.io:6379 ou apenas comic-raven-37828.upstash.io
        const [host, portStr] = endpoint.split(':');
        const port = portStr ? parseInt(portStr, 10) : 6379;

        redisClient = new Redis({
          host,
          port,
          password,
          tls: {}, // Upstash requer TLS
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error(
                'Falha ao conectar ao Redis Upstash após múltiplas tentativas'
              );
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
        logger.info(
          'Redis configurado usando UPSTASH_REDIS_ENDPOINT + UPSTASH_REDIS_PASSWORD'
        );
      } else {
        // Fallback: usar Redis local em desenvolvimento
        if (process.env.NODE_ENV === 'production') {
          throw new Error(
            'BullMQ requer conexão TCP ao Redis. Configure uma das opções:\n' +
              '1. REDIS_URL (URL completa: rediss://default:password@host:port)\n' +
              '2. UPSTASH_REDIS_TCP_URL (URL completa: redis://host:port)\n' +
              '3. UPSTASH_REDIS_ENDPOINT + UPSTASH_REDIS_PASSWORD\n' +
              'Obtenha essas informações no dashboard do Upstash: https://console.upstash.com'
          );
        }

        logger.warn(
          'REDIS_URL, UPSTASH_REDIS_TCP_URL ou UPSTASH_REDIS_ENDPOINT não configurado, usando Redis local para desenvolvimento'
        );
        redisClient = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error(
                'Falha ao conectar ao Redis local após múltiplas tentativas'
              );
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });
      }
    } catch (error) {
      logger.error('Erro ao configurar cliente Redis', error);
      throw new Error(
        'Falha ao configurar cliente Redis: ' +
          (error instanceof Error ? error.message : String(error))
      );
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
