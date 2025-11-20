/**
 * Validação de conteúdo após conversão
 * Garante que a conversão gerou conteúdo válido antes de armazenar
 */

export interface ContentValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Valida conteúdo convertido antes de armazenar
 */
export function validateConvertedContent(
  content: string,
  options: {
    minLength?: number; // Tamanho mínimo em caracteres (padrão: 10)
    maxLength?: number; // Tamanho máximo em caracteres (opcional)
    requireText?: boolean; // Se true, deve conter texto real, não apenas espaços/caracteres especiais
  } = {}
): ContentValidationResult {
  const {
    minLength = 10,
    maxLength,
    requireText = true,
  } = options;

  const warnings: string[] = [];

  // 1. Verificar se conteúdo não está vazio
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      error: 'Conteúdo convertido está vazio. O arquivo pode estar corrompido ou não conter texto.',
    };
  }

  // 2. Verificar tamanho mínimo
  if (content.trim().length < minLength) {
    return {
      valid: false,
      error: `Conteúdo muito pequeno (${content.trim().length} caracteres). Mínimo esperado: ${minLength} caracteres.`,
    };
  }

  // 3. Verificar tamanho máximo (se especificado)
  if (maxLength && content.length > maxLength) {
    warnings.push(`Conteúdo muito grande (${content.length} caracteres). Máximo recomendado: ${maxLength} caracteres.`);
  }

  // 4. Verificar se contém texto real (não apenas espaços, caracteres especiais, etc.)
  if (requireText) {
    // Remover espaços, quebras de linha, caracteres especiais comuns
    const textOnly = content
      .replace(/\s+/g, '')
      .replace(/[^\w\u00C0-\u017F]/g, ''); // Remover caracteres especiais, manter letras e acentos

    if (textOnly.length < minLength * 0.5) {
      // Se menos de 50% do conteúdo mínimo for texto real, considerar inválido
      return {
        valid: false,
        error: 'Conteúdo não contém texto suficiente. O arquivo pode conter apenas formatação ou caracteres especiais.',
      };
    }
  }

  // 5. Verificar se não é apenas uma mensagem de erro
  const errorPatterns = [
    /erro ao converter/i,
    /não foi possível extrair/i,
    /conversão limitada/i,
    /não suportado/i,
    /failed to/i,
    /error:/i,
  ];

  const isErrorMessage = errorPatterns.some(pattern => pattern.test(content));
  if (isErrorMessage && content.length < 200) {
    // Se o conteúdo é pequeno e contém mensagens de erro, provavelmente a conversão falhou
    warnings.push('Conteúdo pode conter mensagens de erro da conversão. Verifique se a conversão foi bem-sucedida.');
  }

  // 6. Verificar se não é apenas código/estrutura sem conteúdo
  const codeOnlyPatterns = [
    /^[\s\S]*?<[^>]+>[\s\S]*?$/m, // Apenas tags HTML
    /^[\s\S]*?\{[\s\S]*?\}[\s\S]*?$/m, // Apenas JSON/estrutura
  ];

  const isCodeOnly = codeOnlyPatterns.some(pattern => {
    const match = content.match(pattern);
    if (!match) return false;
    // Se mais de 80% do conteúdo for estrutura, considerar suspeito
    const structureChars = (match[0].match(/[<>{}\[\]]/g) || []).length;
    return structureChars > content.length * 0.8;
  });

  if (isCodeOnly) {
    warnings.push('Conteúdo parece conter apenas estrutura/código sem texto significativo.');
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida se o conteúdo tem estrutura básica de Markdown válida
 */
export function validateMarkdownStructure(content: string): ContentValidationResult {
  // Verificar se tem pelo menos algum conteúdo de texto
  const hasText = /[a-zA-Z\u00C0-\u017F]{3,}/.test(content);
  
  if (!hasText) {
    return {
      valid: false,
      error: 'Conteúdo não contém texto válido em Markdown.',
    };
  }

  return {
    valid: true,
  };
}

