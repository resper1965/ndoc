/**
 * Estimativa de tokens para chunking
 * Baseado na aproximação: ~4 caracteres por token (OpenAI)
 */

/**
 * Estima o número de tokens em um texto
 * Aproximação: 1 token ≈ 4 caracteres (OpenAI)
 * 
 * Para maior precisão, poderia usar tiktoken, mas para chunking
 * a aproximação é suficiente e mais performática.
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // Aproximação: 1 token ≈ 4 caracteres
  // OpenAI usa BPE (Byte Pair Encoding) que varia, mas 4 é uma boa média
  
  // Ajustar para espaços e pontuação (tendem a ser tokens separados)
  // Espaços e quebras de linha contam menos
  const normalizedText = text.replace(/\s+/g, ' ');
  const adjustedChars = normalizedText.length;
  
  // Estimativa base: ~4 chars por token
  let estimated = Math.ceil(adjustedChars / 4);
  
  // Ajuste para palavras (palavras longas podem ter múltiplos tokens)
  // Contar palavras com mais de 6 caracteres
  const words = normalizedText.split(/\s+/);
  const longWords = words.filter(w => w.length > 6).length;
  
  // Palavras longas tendem a ter mais tokens
  estimated += Math.ceil(longWords * 0.2);
  
  return Math.max(1, estimated); // Mínimo 1 token
}

/**
 * Estima tokens de forma mais conservadora (para limites)
 */
export function estimateTokensConservative(text: string): number {
  // Usar 3 caracteres por token para ser mais conservador
  return Math.ceil(text.length / 3);
}

/**
 * Estima tokens de forma mais otimista (para otimizações)
 */
export function estimateTokensOptimistic(text: string): number {
  // Usar 5 caracteres por token para ser mais otimista
  return Math.ceil(text.length / 5);
}

