/**
 * Sanitização de conteúdo Markdown/HTML
 * Previne XSS e remove conteúdo malicioso
 * 
 * Usa sanitização baseada em regex para funcionar no servidor
 * sem dependências de DOM
 */

// Tags e atributos perigosos que devem ser removidos
const FORBIDDEN_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
const FORBIDDEN_ATTRS = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];

/**
 * Sanitiza conteúdo Markdown/HTML
 * Remove scripts, iframes e outros elementos perigosos
 * 
 * @param content Conteúdo a ser sanitizado
 * @param options Opções de sanitização
 * @returns Conteúdo sanitizado
 */
export function sanitizeContent(
  content: string,
  options: {
    allowHTML?: boolean; // Se true, permite HTML no Markdown
    strict?: boolean; // Se true, remove todo HTML (apenas Markdown puro)
  } = {}
): string {
  const { allowHTML = true, strict = false } = options;

  if (!content || content.trim().length === 0) {
    return content;
  }

  // Se modo estrito, remover todo HTML
  if (strict) {
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remover event handlers
      .replace(/javascript:/gi, '') // Remover javascript: URLs
      .replace(/data:text\/html/gi, ''); // Remover data URIs HTML
  }

  // Sanitização baseada em regex (funciona no servidor)
  let sanitized = content;
  
  // Remover tags perigosas e seus conteúdos
  FORBIDDEN_TAGS.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>[\s\S]*?<\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Também remover tags auto-fechadas
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\s*/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Se não permitir HTML, remover todas as tags
  if (!allowHTML) {
    sanitized = sanitized.replace(/<[^>]+>/g, '');
  } else {
    // Remover atributos perigosos de tags permitidas
    FORBIDDEN_ATTRS.forEach(attr => {
      const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remover javascript: e data: URLs perigosas
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '');
  }

  // Remover event handlers que possam ter escapado
  const cleaned = sanitized
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  return cleaned;
}

/**
 * Sanitiza apenas HTML, preservando Markdown
 * Útil para conteúdo que já está em Markdown mas pode conter HTML inline
 */
export function sanitizeHTMLOnly(content: string): string {
  if (!content || content.trim().length === 0) {
    return content;
  }

  // Extrair blocos de código (não sanitizar)
  const codeBlocks: string[] = [];
  let codeBlockIndex = 0;
  const contentWithPlaceholders = content.replace(
    /```[\s\S]*?```/g,
    () => `__CODE_BLOCK_${codeBlockIndex++}__`
  );

  // Sanitização básica (remover elementos perigosos)
  const sanitized = contentWithPlaceholders
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Restaurar blocos de código
  let restored = sanitized;
  codeBlocks.forEach((block, index) => {
    restored = restored.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return restored;
}

/**
 * Valida se conteúdo contém HTML/scripts perigosos
 * Retorna true se conteúdo é seguro
 */
export function isContentSafe(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return true;
  }

  // Verificar padrões perigosos
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=\s*["']/i,
    /data:text\/html/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
}

