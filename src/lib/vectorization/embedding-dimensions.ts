/**
 * Dimensões esperadas de embeddings por modelo
 * Valida dimensões antes de armazenar
 */

export interface ModelDimensions {
  [model: string]: number;
}

/**
 * Dimensões conhecidas dos modelos OpenAI
 */
export const OPENAI_EMBEDDING_DIMENSIONS: ModelDimensions = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
  // Modelos legados
  'text-embedding-002': 1536,
  'text-embedding-001': 12288,
};

/**
 * Valida dimensão de embedding
 * 
 * @param embedding Array de números (embedding)
 * @param model Nome do modelo usado
 * @returns true se dimensão é válida, false caso contrário
 */
export function validateEmbeddingDimension(
  embedding: number[],
  model: string
): { valid: boolean; expected?: number; actual?: number; error?: string } {
  if (!embedding || embedding.length === 0) {
    return {
      valid: false,
      error: 'Embedding vazio',
    };
  }

  const expectedDimension = OPENAI_EMBEDDING_DIMENSIONS[model];
  const actualDimension = embedding.length;

  if (!expectedDimension) {
    // Se modelo não conhecido, aceitar qualquer dimensão válida (entre 128 e 12288)
    if (actualDimension < 128 || actualDimension > 12288) {
      return {
        valid: false,
        actual: actualDimension,
        error: `Dimensão de embedding inválida para modelo desconhecido: ${actualDimension}. Esperado entre 128 e 12288.`,
      };
    }
    return {
      valid: true,
      actual: actualDimension,
    };
  }

  if (actualDimension !== expectedDimension) {
    return {
      valid: false,
      expected: expectedDimension,
      actual: actualDimension,
      error: `Dimensão de embedding incorreta para modelo ${model}. Esperado: ${expectedDimension}, Recebido: ${actualDimension}`,
    };
  }

  return {
    valid: true,
    expected: expectedDimension,
    actual: actualDimension,
  };
}

/**
 * Valida múltiplos embeddings
 * 
 * @param embeddings Array de embeddings
 * @param model Nome do modelo usado
 * @returns Array de resultados de validação
 */
export function validateEmbeddingsDimensions(
  embeddings: number[][],
  model: string
): Array<{ index: number; valid: boolean; error?: string }> {
  return embeddings.map((embedding, index) => {
    const validation = validateEmbeddingDimension(embedding, model);
    return {
      index,
      valid: validation.valid,
      error: validation.error,
    };
  });
}

