import * as yaml from 'js-yaml';

export interface ValidationError {
  field?: string;
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Valida o formato MDX, incluindo frontmatter YAML e sintaxe básica
 */
export function validateMDX(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Verificar se tem frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  
  if (!frontmatterMatch) {
    errors.push({
      message: 'Frontmatter não encontrado. O arquivo deve começar com --- seguido de YAML e outro ---',
      line: 1,
    });
    return { valid: false, errors };
  }

  const frontmatterContent = frontmatterMatch[1];
  const contentAfterFrontmatter = content.slice(frontmatterMatch[0].length);

  // 2. Validar YAML do frontmatter
  try {
    const frontmatter = yaml.load(frontmatterContent) as Record<string, any>;

    // 2.1. Verificar campo obrigatório 'title'
    if (!frontmatter.title) {
      errors.push({
        field: 'title',
        message: 'Campo obrigatório "title" não encontrado no frontmatter',
      });
    } else if (typeof frontmatter.title !== 'string') {
      errors.push({
        field: 'title',
        message: 'Campo "title" deve ser uma string',
      });
    } else if (frontmatter.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Campo "title" não pode estar vazio',
      });
    }

    // 2.2. Validar campo 'description' se existir
    if (frontmatter.description !== undefined && typeof frontmatter.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Campo "description" deve ser uma string',
      });
    }

    // 2.3. Validar campo 'date' se existir
    if (frontmatter.date !== undefined) {
      if (typeof frontmatter.date !== 'string') {
        errors.push({
          field: 'date',
          message: 'Campo "date" deve ser uma string no formato YYYY-MM-DD',
        });
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(frontmatter.date)) {
          errors.push({
            field: 'date',
            message: 'Campo "date" deve estar no formato YYYY-MM-DD',
          });
        } else {
          const date = new Date(frontmatter.date);
          if (isNaN(date.getTime())) {
            errors.push({
              field: 'date',
              message: 'Campo "date" contém uma data inválida',
            });
          }
        }
      }
    }

    // 2.4. Validar campo 'order' se existir
    if (frontmatter.order !== undefined) {
      if (typeof frontmatter.order !== 'number') {
        errors.push({
          field: 'order',
          message: 'Campo "order" deve ser um número',
        });
      }
    }
  } catch (yamlError: any) {
    errors.push({
      message: `Erro ao processar YAML do frontmatter: ${yamlError.message}`,
      line: yamlError.mark?.line,
      column: yamlError.mark?.column,
    });
  }

  // 3. Validar sintaxe Markdown básica
  // Verificar se há conteúdo após o frontmatter
  if (contentAfterFrontmatter.trim().length === 0) {
    errors.push({
      message: 'O documento não possui conteúdo após o frontmatter',
    });
  }

  // 4. Verificar blocos de código não fechados
  const codeBlockMatches = contentAfterFrontmatter.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push({
      message: 'Bloco de código não fechado (número ímpar de ```)',
    });
  }

  // 5. Verificar links malformados
  const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(contentAfterFrontmatter)) !== null) {
    const linkText = linkMatch[1];
    const linkUrl = linkMatch[2];
    
    if (linkText.trim().length === 0) {
      errors.push({
        message: `Link com texto vazio encontrado: ${linkUrl}`,
      });
    }
    
    if (linkUrl.trim().length === 0) {
      errors.push({
        message: `Link com URL vazia encontrado: ${linkText}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida apenas o frontmatter YAML
 */
export function validateFrontmatter(frontmatterContent: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    const frontmatter = yaml.load(frontmatterContent) as Record<string, any>;

    if (!frontmatter.title) {
      errors.push({
        field: 'title',
        message: 'Campo obrigatório "title" não encontrado',
      });
    } else if (typeof frontmatter.title !== 'string' || frontmatter.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Campo "title" deve ser uma string não vazia',
      });
    }

    if (frontmatter.description !== undefined && typeof frontmatter.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Campo "description" deve ser uma string',
      });
    }

    if (frontmatter.date !== undefined) {
      if (typeof frontmatter.date !== 'string') {
        errors.push({
          field: 'date',
          message: 'Campo "date" deve ser uma string',
        });
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(frontmatter.date)) {
          errors.push({
            field: 'date',
            message: 'Campo "date" deve estar no formato YYYY-MM-DD',
          });
        }
      }
    }

    if (frontmatter.order !== undefined && typeof frontmatter.order !== 'number') {
      errors.push({
        field: 'order',
        message: 'Campo "order" deve ser um número',
      });
    }
  } catch (yamlError: any) {
    errors.push({
      message: `Erro ao processar YAML: ${yamlError.message}`,
      line: yamlError.mark?.line,
      column: yamlError.mark?.column,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

