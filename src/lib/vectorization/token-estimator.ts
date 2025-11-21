/**
 * Estimativa de tokens para chunking
 * Usa tiktoken para contagem precisa de tokens (cl100k_base - usado por GPT-3.5/4)
 */

import { encoding_for_model } from 'tiktoken';
import { logger } from '@/lib/logger';

// Cache do encoder para melhor performance
let cachedEncoder: ReturnType<typeof encoding_for_model> | null = null;

/**
 * Obtém encoder tiktoken (com cache)
 * Usa cl100k_base que é compatível com GPT-3.5, GPT-4 e text-embedding-3-small
 */
function getEncoder() {
  if (!cachedEncoder) {
    try {
      // cl100k_base é o encoding usado por GPT-3.5, GPT-4 e text-embedding-3-small
      cachedEncoder = encoding_for_model('gpt-3.5-turbo');
    } catch (error) {
      logger.warn('Erro ao inicializar tiktoken, usando fallback', { error });
      return null;
    }
  }
  return cachedEncoder;
}

/**
 * Estima o número de tokens em um texto usando tiktoken
 * Fallback para aproximação se tiktoken não estiver disponível
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  const encoder = getEncoder();
  if (encoder) {
    try {
      return encoder.encode(text).length;
    } catch (error) {
      logger.warn('Erro ao contar tokens com tiktoken, usando fallback', { error });
      // Fallback para aproximação
      return Math.ceil(text.length / 4.5);
    }
  }

  // Fallback: aproximação simples (1 token ≈ 4.5 caracteres)
  const normalizedText = text.replace(/\s+/g, ' ');
  const adjustedChars = normalizedText.length;
  let estimated = Math.ceil(adjustedChars / 4.5);
  
  // Ajuste para palavras longas
  const words = normalizedText.split(/\s+/);
  const longWords = words.filter(w => w.length > 6).length;
  estimated += Math.ceil(longWords * 0.2);
  
  return Math.max(1, estimated);
}

/**
 * Estima tokens de forma mais conservadora (para limites)
 * Usa tiktoken se disponível, senão aproximação conservadora
 */
export function estimateTokensConservative(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  const encoder = getEncoder();
  if (encoder) {
    try {
      // Adicionar 10% de margem de segurança
      return Math.ceil(encoder.encode(text).length * 1.1);
    } catch (error) {
      logger.warn('Erro ao contar tokens com tiktoken, usando fallback', { error });
      return Math.ceil(text.length / 3); // 1 token = 3 caracteres (conservador)
    }
  }

  // Fallback: aproximação conservadora
  return Math.ceil(text.length / 3);
}

/**
 * Estima tokens de forma mais otimista (para otimizações)
 * Usa tiktoken se disponível, senão aproximação otimista
 */
export function estimateTokensOptimistic(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  const encoder = getEncoder();
  if (encoder) {
    try {
      return encoder.encode(text).length;
    } catch (error) {
      logger.warn('Erro ao contar tokens com tiktoken, usando fallback', { error });
      return Math.ceil(text.length / 5); // 1 token = 5 caracteres (otimista)
    }
  }

  // Fallback: aproximação otimista
  return Math.ceil(text.length / 5);
}

