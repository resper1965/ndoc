/**
 * Conversão de documentos para Markdown
 * Suporta múltiplos formatos de documentos modernos
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  detectDocumentType,
  isSupportedDocumentType,
  type DocumentType,
} from './document-types';

export interface ConversionResult {
  content: string;
  metadata: Record<string, any>;
  originalType: DocumentType;
}

export interface ConversionOptions {
  extractMetadata?: boolean;
  preserveFormatting?: boolean;
  templateId?: string;
}

/**
 * Converte um arquivo para Markdown
 */
export async function convertDocument(
  file: File,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const documentType = detectDocumentType(file.name, file.type);

  if (!documentType) {
    throw new Error(
      `Tipo de arquivo não suportado: ${file.name} (${file.type || 'unknown'})`
    );
  }

  if (!isSupportedDocumentType(documentType)) {
    throw new Error(`Tipo de documento inválido: ${documentType}`);
  }

  // Ler arquivo como buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Converter baseado no tipo
  switch (documentType) {
    case 'pdf':
      return await convertPDFToMarkdown(buffer, options);
    case 'docx':
      return await convertDOCXToMarkdown(buffer, options);
    case 'doc':
      return await convertDOCToMarkdown(buffer, options);
    case 'rtf':
      return await convertRTFToMarkdown(buffer, options);
    case 'odt':
      return await convertODTToMarkdown(buffer, options);
    case 'txt':
      return await convertTXTToMarkdown(buffer, options);
    case 'md':
    case 'mdx':
      return await validateMarkdown(buffer, options);
    case 'html':
      return await convertHTMLToMarkdown(buffer, options);
    case 'json':
      return await convertJSONToMarkdown(buffer, options);
    case 'xml':
      return await convertXMLToMarkdown(buffer, options);
    case 'csv':
      return await convertCSVToMarkdown(buffer, options);
    case 'xlsx':
      return await convertXLSXToMarkdown(buffer, options);
    case 'pptx':
      return await convertPPTXToMarkdown(buffer, options);
    default:
      throw new Error(`Conversor não implementado para: ${documentType}`);
  }
}

// Conversores específicos (serão implementados)

async function convertPDFToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const pdfParse = await import('pdf-parse');
  const data = await (pdfParse as any).default(buffer);

  // Extrair texto e metadados
  const content = data.text;
  const metadata: Record<string, any> = {
    originalFormat: 'pdf',
    pages: data.numpages,
    info: data.info || {},
  };

  return {
    content,
    metadata,
    originalType: 'pdf',
  };
}

async function convertDOCXToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const mammoth = await import('mammoth');
  // Mammoth converte para HTML, depois converter para Markdown
  const htmlResult = await mammoth.convertToHtml({ buffer });

  // Converter HTML para Markdown usando turndown
  const turndownModule = await import('turndown');
  const TurndownService = (turndownModule as any).default || turndownModule;
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  const markdown = turndownService.turndown(htmlResult.value);

  const metadata: Record<string, any> = {
    originalFormat: 'docx',
    messages: htmlResult.messages || [],
  };

  return {
    content: markdown,
    metadata,
    originalType: 'docx',
  };
}

async function convertDOCToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  // DOC (Word antigo) requer biblioteca especializada
  // Por enquanto, tentar extrair texto básico
  // TODO: Implementar com textract ou similar quando disponível
  const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));

  // Extração básica de texto (limitado)
  return {
    content: `> **Nota**: Conversão de arquivos .DOC (Word antigo) tem suporte limitado.\n> Considere converter para .DOCX para melhor resultado.\n\n${text}`,
    metadata: { originalFormat: 'doc', warning: 'Conversão limitada' },
    originalType: 'doc',
  };
}

async function convertRTFToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  // RTF requer parser especializado
  // Por enquanto, extrair texto básico removendo tags RTF
  let text = buffer.toString('utf-8');

  // Remover tags RTF básicas
  text = text
    .replace(/\\[a-z]+\d*\s?/gi, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    content: text,
    metadata: { originalFormat: 'rtf', warning: 'Conversão básica' },
    originalType: 'rtf',
  };
}

async function convertODTToMarkdown(
  _buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  // ODT é um arquivo ZIP com XML dentro
  // Por enquanto, retornar mensagem informativa
  // TODO: Implementar parser ODT completo
  return {
    content: `> **Nota**: Conversão de arquivos .ODT (OpenDocument) será implementada em breve.\n> Considere converter para .DOCX ou .MD para melhor resultado.`,
    metadata: { originalFormat: 'odt', warning: 'Conversão não implementada' },
    originalType: 'odt',
  };
}

async function convertTXTToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const content = buffer.toString('utf-8');
  return {
    content,
    metadata: {},
    originalType: 'txt',
  };
}

async function validateMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const content = buffer.toString('utf-8');
  // TODO: Validar e sanitizar Markdown
  return {
    content,
    metadata: {},
    originalType: 'md',
  };
}

async function convertHTMLToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const TurndownService = (await import('turndown')).default;
  const DOMPurify = (await import('isomorphic-dompurify')).default;

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  const html = buffer.toString('utf-8');

  // SECURITY: Sanitize HTML to prevent XSS attacks before conversion
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'em',
      'u',
      's',
      'mark',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'code',
      'pre',
      'blockquote',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  const markdown = turndownService.turndown(cleanHtml);

  const metadata: Record<string, any> = {
    originalFormat: 'html',
    sanitized: true,
  };

  return {
    content: markdown,
    metadata,
    originalType: 'html',
  };
}

async function convertJSONToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const json = JSON.parse(buffer.toString('utf-8'));
  const formatted = JSON.stringify(json, null, 2);
  const content = `\`\`\`json\n${formatted}\n\`\`\``;
  return {
    content,
    metadata: { originalFormat: 'json' },
    originalType: 'json',
  };
}

async function convertXMLToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const xml = buffer.toString('utf-8');

  // Converter XML para formato legível em Markdown
  // Formatação básica - pode ser melhorada
  const formatted = xml
    .replace(/</g, '\n<')
    .replace(/>/g, '>\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  const content = `\`\`\`xml\n${formatted}\n\`\`\``;

  return {
    content,
    metadata: { originalFormat: 'xml' },
    originalType: 'xml',
  };
}

async function convertCSVToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const csvParser = await import('csv-parser');
  const { Readable } = await import('stream');

  return new Promise((resolve, reject) => {
    const rows: string[][] = [];
    const stream = Readable.from(buffer.toString('utf-8'));

    stream
      .pipe(csvParser.default())
      .on('data', (row: Record<string, string>) => {
        rows.push(Object.values(row));
      })
      .on('end', () => {
        if (rows.length === 0) {
          return resolve({
            content: '',
            metadata: { originalFormat: 'csv' },
            originalType: 'csv',
          });
        }

        // Converter para tabela Markdown
        const headers = rows[0];
        const markdownRows = rows.slice(1);

        let markdown = '| ' + headers.join(' | ') + ' |\n';
        markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

        for (const row of markdownRows) {
          markdown += '| ' + row.join(' | ') + ' |\n';
        }

        resolve({
          content: markdown,
          metadata: { originalFormat: 'csv', rows: rows.length },
          originalType: 'csv',
        });
      })
      .on('error', reject);
  });
}

async function convertXLSXToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  let markdown = '';
  const metadata: Record<string, any> = {
    originalFormat: 'xlsx',
    sheetNames: workbook.SheetNames,
  };

  // Converter cada planilha
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as any[][];

    if (jsonData.length === 0) continue;

    markdown += `## ${sheetName}\n\n`;

    // Converter para tabela Markdown
    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1);

    markdown +=
      '| ' + headers.map((h: any) => String(h || '')).join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    for (const row of rows) {
      markdown +=
        '| ' + row.map((cell: any) => String(cell || '')).join(' | ') + ' |\n';
    }

    markdown += '\n';
  }

  return {
    content: markdown.trim(),
    metadata,
    originalType: 'xlsx',
  };
}

async function convertPPTXToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  try {
    const pptxParser = await import('pptx-parser');
    // pptx-parser pode ter API diferente, ajustar conforme necessário
    const PptxParser = (pptxParser as any).default || pptxParser;
    const parser = new PptxParser();
    const presentation = await parser.parse(buffer);

    let markdown = '';
    const metadata: Record<string, any> = {
      originalFormat: 'pptx',
      slides: presentation.slides?.length || 0,
    };

    // Converter cada slide
    if (presentation.slides) {
      for (let i = 0; i < presentation.slides.length; i++) {
        const slide = presentation.slides[i];
        markdown += `## Slide ${i + 1}\n\n`;

        if (slide.text) {
          markdown += slide.text + '\n\n';
        }
      }
    }

    return {
      content: markdown.trim(),
      metadata,
      originalType: 'pptx',
    };
  } catch {
    // Fallback se pptx-parser não funcionar como esperado
    return {
      content: `> **Nota**: Conversão de arquivos .PPTX (PowerPoint) está em desenvolvimento.\n> O conteúdo pode não ser extraído completamente.`,
      metadata: { originalFormat: 'pptx', warning: 'Conversão limitada' },
      originalType: 'pptx',
    };
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
