/**
 * Environment Variables Validation
 *
 * Valida variáveis de ambiente obrigatórias no startup
 */

interface EnvConfig {
  // Supabase (OBRIGATÓRIO)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

  // Upstash Redis (OBRIGATÓRIO em produção)
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Node Environment
  NODE_ENV: 'development' | 'production' | 'test';
}

function validateEnv(): EnvConfig {
  const env = process.env;
  const isProduction = env.NODE_ENV === 'production';

  // Validar variáveis obrigatórias
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key);
    }
  }

  // Em produção, Redis é obrigatório
  if (isProduction) {
    if (!env.UPSTASH_REDIS_REST_URL) missing.push('UPSTASH_REDIS_REST_URL');
    if (!env.UPSTASH_REDIS_REST_TOKEN) missing.push('UPSTASH_REDIS_REST_TOKEN');
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Variáveis de ambiente obrigatórias não configuradas:\n${missing
        .map((key) => `  - ${key}`)
        .join('\n')}\n\nConfigure essas variáveis em .env.local`
    );
  }

  // Validar formato de URLs
  try {
    if (required.NEXT_PUBLIC_SUPABASE_URL) {
      new URL(required.NEXT_PUBLIC_SUPABASE_URL);
    }
  } catch {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL não é uma URL válida');
  }

  if (isProduction && env.UPSTASH_REDIS_REST_URL) {
    try {
      new URL(env.UPSTASH_REDIS_REST_URL);
    } catch {
      throw new Error('❌ UPSTASH_REDIS_REST_URL não é uma URL válida');
    }
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: required.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: required.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: (env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };
}

// Exportar configuração validada (lazy evaluation para evitar erros no build)
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
    
    // Log de configuração (sem expor valores sensíveis)
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Variáveis de ambiente validadas com sucesso');
      console.log(`   - Ambiente: ${cachedEnv.NODE_ENV}`);
      console.log(`   - Supabase URL: ${cachedEnv.NEXT_PUBLIC_SUPABASE_URL}`);
      console.log(
        `   - Redis configurado: ${cachedEnv.UPSTASH_REDIS_REST_URL ? 'Sim' : 'Não (fallback em memória)'}`
      );
    }
  }
  return cachedEnv;
}

// Exportar como getter para compatibilidade
export const env = new Proxy({} as EnvConfig, {
  get(_target, prop) {
    return getEnv()[prop as keyof EnvConfig];
  }
});
