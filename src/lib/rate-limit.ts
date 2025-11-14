/**
 * Rate Limiting
 * 
 * Sistema de rate limiting para APIs usando Upstash Redis
 * Fallback para memória local em desenvolvimento
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuração de rate limits por endpoint
export const rateLimitConfig = {
  // APIs públicas
  'api/ingest:GET': { limit: 100, window: '1 m' }, // 100 req/min
  'api/ingest:POST': { limit: 20, window: '1 m' }, // 20 req/min
  'api/ingest:DELETE': { limit: 10, window: '1 m' }, // 10 req/min
  'api/users:GET': { limit: 30, window: '1 m' }, // 30 req/min
  'api/users:POST': { limit: 5, window: '1 m' }, // 5 req/min
  'api/users:PUT': { limit: 10, window: '1 m' }, // 10 req/min
  'api/users:DELETE': { limit: 5, window: '1 m' }, // 5 req/min
  // Auth endpoints
  'api/auth:login': { limit: 5, window: '15 m' }, // 5 tentativas a cada 15 min
  'api/auth:signup': { limit: 3, window: '1 h' }, // 3 tentativas por hora
} as const;

// Inicializar Redis (Upstash) se disponível
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // Default: 10 req/min
      analytics: true,
    });
  }
} catch {
  console.warn('Rate limiting: Redis não disponível, usando fallback em memória');
}

// Fallback em memória para desenvolvimento
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 60000; // Default 1 minuto

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * (multipliers[unit] || 60000);
}

async function checkRateLimitMemory(
  identifier: string,
  limit: number,
  window: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = parseWindow(window);
  const key = identifier;

  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    // Nova janela
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    // Limpar entradas expiradas periodicamente
    if (memoryStore.size > 1000) {
      for (const [k, v] of memoryStore.entries()) {
        if (now > v.resetAt) {
          memoryStore.delete(k);
        }
      }
    }

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count++;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}

/**
 * Verifica rate limit para um endpoint
 */
export async function checkRateLimit(
  endpoint: string,
  method: string,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `${endpoint}:${method}`;
  const config = rateLimitConfig[key as keyof typeof rateLimitConfig];

  if (!config) {
    // Sem rate limit configurado, permitir
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: Date.now() + 60000,
    };
  }

  // Usar Redis se disponível
  if (ratelimit && redis) {
    try {
      const result = await ratelimit.limit(`${identifier}:${key}`);
      return {
        success: result.success,
        limit: config.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      // Fallback para memória se Redis falhar
      console.warn('Rate limit Redis error, falling back to memory:', error);
    }
  }

  // Fallback para memória
  return checkRateLimitMemory(`${identifier}:${key}`, config.limit, config.window);
}

/**
 * Middleware helper para Next.js API routes
 */
export function getRateLimitIdentifier(request: Request): string {
  // Usar IP do cliente ou user ID se autenticado
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  // Em produção, preferir user ID se disponível
  // Por enquanto, usar IP
  return ip || 'unknown';
}

