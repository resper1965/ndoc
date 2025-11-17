/**
 * Aplicação de templates a documentos convertidos
 */

import { getDefaultTemplate } from '../templates/default-templates';

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Aplica um template a um conteúdo de documento
 */
export async function applyTemplate(
  content: string,
  templateId: string | null,
  metadata: Record<string, any> = {}
): Promise<string> {
  // Se não houver template, retornar conteúdo original
  if (!templateId) {
    return content;
  }

  // TODO: Buscar template do banco de dados
  // Por enquanto, usar templates padrão
  const template = getDefaultTemplate(
    metadata.document_type as 'policy' | 'procedure' | 'manual'
  );

  if (!template) {
    return content;
  }

  // Extrair metadados do conteúdo original
  const extractedMetadata = extractMetadata(content, template.metadataSchema);

  // Combinar metadados
  const allMetadata = { ...metadata, ...extractedMetadata };

  // Renderizar template
  const templatedContent = renderTemplate(template.templateContent, allMetadata);

  // Combinar frontmatter + conteúdo
  return combineFrontmatterAndContent(templatedContent, content);
}

/**
 * Extrai metadados do conteúdo do documento
 */
function extractMetadata(
  content: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _schema: Record<string, any>
): Record<string, any> {
  const metadata: Record<string, any> = {};

  // Tentar extrair frontmatter se existir
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatterText = frontmatterMatch[1];
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value: any = match[2].trim();
        
        // Remover aspas se houver
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        metadata[key] = value;
      }
    }
  }

  // Extrair título do conteúdo se não estiver no frontmatter
  if (!metadata.title) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
  }

  return metadata;
}

/**
 * Renderiza um template substituindo variáveis
 */
function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let rendered = template;

  // Substituir variáveis no formato {{variable}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  }

  // Remover seções vazias (linhas que contêm apenas {{variable}})
  rendered = rendered.replace(/^\s*\{\{[^}]+\}\}\s*$/gm, '');

  return rendered;
}

/**
 * Combina frontmatter e conteúdo
 */
function combineFrontmatterAndContent(
  templatedContent: string,
  originalContent: string
): string {
  // Se o conteúdo original já tem frontmatter, remover
  const contentWithoutFrontmatter = originalContent.replace(
    /^---\n[\s\S]*?\n---\n*/,
    ''
  );

  // Se o template já tem frontmatter, usar ele
  if (templatedContent.startsWith('---')) {
    // Combinar frontmatter do template com conteúdo original
    const frontmatterMatch = templatedContent.match(/^---\n([\s\S]*?)\n---/);
    const bodyMatch = templatedContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    
    if (frontmatterMatch && bodyMatch) {
      const frontmatter = frontmatterMatch[1];
      const templateBody = bodyMatch[1];
      
      // Combinar corpo do template com conteúdo original
      const combinedBody = templateBody + '\n\n' + contentWithoutFrontmatter;
      
      return `---\n${frontmatter}\n---\n\n${combinedBody}`;
    }
  }

  // Se não houver frontmatter no template, adicionar conteúdo original
  return templatedContent + '\n\n' + contentWithoutFrontmatter;
}

