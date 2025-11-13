/**
 * Validação de conteúdo MDX
 * Verifica frontmatter, sintaxe básica e campos obrigatórios
 */

export interface ValidationError {
  field?: string;
  message: string;
  line?: number;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Valida conteúdo MDX
 * @param content - Conteúdo MDX completo
 * @returns Resultado da validação com erros encontrados
 */
export function validateMDX(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Verificar se o conteúdo está vazio
  if (!content || content.trim().length === 0) {
    errors.push({
      field: 'content',
      message: 'O conteúdo não pode estar vazio',
    });
    return { valid: false, errors };
  }

  // Verificar se tem frontmatter (deve começar com ---)
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  
  if (!frontmatterMatch) {
    errors.push({
      field: 'frontmatter',
      message: 'Frontmatter não encontrado. O arquivo deve começar com ---',
      line: 1,
    });
    return { valid: false, errors };
  }

  const frontmatterContent = frontmatterMatch[1];
  
  // Verificar se tem o campo title (obrigatório)
  const titleMatch = frontmatterContent.match(/^title:\s*(.+)$/m);
  if (!titleMatch) {
    errors.push({
      field: 'title',
      message: 'Campo "title" é obrigatório no frontmatter',
      line: 2,
    });
  } else {
    const title = titleMatch[1].trim();
    // Remover aspas se existirem
    const cleanTitle = title.replace(/^["']|["']$/g, '');
    if (!cleanTitle || cleanTitle.length === 0) {
      errors.push({
        field: 'title',
        message: 'O campo "title" não pode estar vazio',
        line: 2,
      });
    }
  }

  // Verificar sintaxe básica do frontmatter (YAML)
  // Verificar se há fechamento correto do frontmatter
  const frontmatterEnd = content.indexOf('\n---', 3);
  if (frontmatterEnd === -1) {
    errors.push({
      field: 'frontmatter',
      message: 'Frontmatter não fechado corretamente. Deve terminar com ---',
      line: 1,
    });
  }

  // Verificar se há conteúdo após o frontmatter
  const contentAfterFrontmatter = content.substring(frontmatterEnd + 4).trim();
  if (contentAfterFrontmatter.length === 0) {
    errors.push({
      field: 'content',
      message: 'O conteúdo após o frontmatter não pode estar vazio',
    });
  }

  // Verificar sintaxe básica de Markdown
  // Verificar se há pelo menos um cabeçalho (#)
  if (!contentAfterFrontmatter.match(/^#+\s+/m)) {
    // Não é um erro crítico, apenas um aviso
    // Mas vamos permitir para não ser muito restritivo
  }

  // Verificar se há blocos de código não fechados
  const codeBlockMatches = contentAfterFrontmatter.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push({
      field: 'syntax',
      message: 'Bloco de código não fechado. Verifique se todos os blocos ``` estão fechados',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

