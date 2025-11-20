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
import { getCachedConversionByFile, setCachedConversionByFile } from '../cache/conversion-cache';
import { logger } from '@/lib/logger';

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

  // Tentar buscar do cache primeiro
  try {
    const cached = await getCachedConversionByFile(buffer);
    if (cached) {
      logger.info('Conversão encontrada no cache', {
        filename: file.name,
        originalType: cached.originalType,
      });
      return {
        content: cached.content,
        metadata: cached.metadata,
        originalType: cached.originalType as DocumentType,
      };
    }
  } catch (error) {
    logger.warn('Erro ao buscar conversão do cache, continuando com conversão', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Converter baseado no tipo
  let result: ConversionResult;
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
      result = await convertPPTXToMarkdown(buffer, options);
      break;
    default:
      throw new Error(`Conversor não implementado para: ${documentType}`);
  }

  // Armazenar no cache após conversão bem-sucedida
  try {
    await setCachedConversionByFile(
      buffer,
      result.content,
      result.metadata,
      result.originalType
    );
    logger.debug('Conversão armazenada no cache', {
      filename: file.name,
      originalType: result.originalType,
    });
  } catch (error) {
    logger.warn('Erro ao armazenar conversão no cache (não crítico)', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Não falhar se cache não funcionar
  }

  return result;
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
  // DOC (Word antigo) é um formato binário complexo
  // Tentar múltiplas estratégias de conversão
  
  // Estratégia 1: Tentar usar biblioteca especializada se disponível
  // Nota: docx-parser não está instalado, mas deixamos o código preparado
  // para futura instalação se necessário
  try {
    // Tentar importar biblioteca dinamicamente (se disponível)
    const docxParserModule = await (async () => {
      try {
        // Usar import dinâmico - pode não estar disponível
        // @ts-expect-error - docx-parser pode não estar instalado
        return await import('docx-parser').catch(() => null);
      } catch {
        return null;
      }
    })();
    
    if (docxParserModule) {
      try {
        const parser = (docxParserModule as any).default || docxParserModule;
        const result = await parser(buffer);
        if (result && result.text) {
          return {
            content: result.text,
            metadata: { originalFormat: 'doc', method: 'docx-parser' },
            originalType: 'doc',
          };
        }
      } catch {
        // Continuar com outras estratégias
      }
    }
  } catch {
    // Continuar com outras estratégias
  }

  // Estratégia 2: Extração melhorada de texto do formato binário .doc
  // O formato .doc (OLE2) contém texto em blocos específicos
  let extractedText = '';
  
  try {
    // Procurar por sequências de texto legível no buffer
    // O formato .doc armazena texto em blocos de caracteres ASCII/UTF-8
    const textPatterns: string[] = [];
    
    // Procurar por strings de texto legível (mínimo 3 caracteres alfanuméricos)
    let currentText = '';
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      // Caracteres ASCII imprimíveis (32-126) e alguns caracteres especiais
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        currentText += String.fromCharCode(byte);
      } else {
        if (currentText.length >= 3) {
          // Filtrar strings que parecem ser texto real (não apenas símbolos)
          const hasLetters = /[a-zA-Z\u00C0-\u017F]/.test(currentText);
          if (hasLetters) {
            textPatterns.push(currentText.trim());
          }
        }
        currentText = '';
      }
    }
    
    // Adicionar último texto se houver
    if (currentText.length >= 3) {
      const hasLetters = /[a-zA-Z\u00C0-\u017F]/.test(currentText);
      if (hasLetters) {
        textPatterns.push(currentText.trim());
      }
    }
    
    // Juntar padrões de texto encontrados
    extractedText = textPatterns
      .filter((text, index, arr) => {
        // Remover duplicatas próximas
        if (index > 0 && text === arr[index - 1]) return false;
        // Remover strings muito curtas ou muito longas (provavelmente não são texto real)
        if (text.length < 3 || text.length > 1000) return false;
        return true;
      })
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n') // Normalizar quebras de linha
      .trim();
    
    // Se encontrou texto significativo, retornar
    if (extractedText.length > 50) {
      return {
        content: extractedText,
        metadata: {
          originalFormat: 'doc',
          method: 'binary-extraction',
          warning: 'Conversão básica - formatação pode estar perdida',
        },
        originalType: 'doc',
      };
    }
  } catch (error) {
    logger.warn('Erro na extração binária de .doc', { error });
  }

  // Estratégia 3: Tentar converter para RTF primeiro (alguns .doc são RTF)
  try {
    // Verificar se o arquivo começa com header RTF
    const header = buffer.slice(0, 10).toString('utf-8');
    if (header.includes('{\\rtf') || header.includes('{\rtf')) {
      // Tentar converter como RTF
      const rtfResult = await convertRTFToMarkdown(buffer, _options);
      if (rtfResult.content && rtfResult.content.length > 50) {
        return {
          ...rtfResult,
          originalType: 'doc',
          metadata: {
            ...rtfResult.metadata,
            method: 'rtf-conversion',
            warning: 'Arquivo .doc convertido via RTF',
          },
        };
      }
    }
  } catch {
    // Continuar com fallback
  }

  // Fallback: Mensagem informativa
  return {
    content: `> **Nota**: Conversão de arquivos .DOC (Word antigo) tem suporte limitado.\n> \n> **Recomendações:**\n> - Converta o arquivo para .DOCX usando Microsoft Word ou LibreOffice\n> - Ou salve como .RTF e tente novamente\n> - Ou copie o conteúdo para um arquivo .TXT ou .MD\n> \n> O formato .DOC é um formato binário proprietário antigo que requer bibliotecas especializadas para conversão completa.`,
    metadata: {
      originalFormat: 'doc',
      warning: 'Conversão não suportada - arquivo muito complexo ou corrompido',
      fileSize: buffer.length,
    },
    originalType: 'doc',
  };
}

async function convertRTFToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  try {
    // Tentar usar rtf-parser se disponível
    const rtfParser = await import('rtf-parser').catch(() => null) as any;
    
    if (rtfParser) {
      const Parser = rtfParser.default || rtfParser;
      const parser = new Parser();
      const doc = await parser.parse(buffer.toString('utf-8'));
      
      // Extrair texto do documento RTF
      let text = '';
      const extractText = (node: any) => {
        if (typeof node === 'string') {
          text += node;
        } else if (node && typeof node === 'object') {
          if (node.content) {
            node.content.forEach(extractText);
          } else if (node.text) {
            text += node.text;
          }
        }
      };
      
      if (doc.content) {
        doc.content.forEach(extractText);
      }
      
      return {
        content: text.trim() || '> **Nota**: Não foi possível extrair texto do arquivo RTF.',
        metadata: { originalFormat: 'rtf' },
        originalType: 'rtf',
      };
    }
  } catch {
    // Fallback: extração básica de texto
  }
  
  // Fallback: extrair texto básico removendo tags RTF
  let text = buffer.toString('utf-8');
  
  // Remover tags RTF mais complexas
  text = text
    // Remover comandos RTF
    .replace(/\\[a-z]+\d*\s?/gi, ' ')
    // Remover grupos vazios
    .replace(/\{[^}]*\}/g, ' ')
    // Remover caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Normalizar espaços
    .replace(/\s+/g, ' ')
    .trim();
  
  // Tentar extrair texto entre chaves (conteúdo real do RTF)
  const textMatches = text.match(/\{([^}]+)\}/g);
  if (textMatches && textMatches.length > 0) {
    text = textMatches
      .map(match => match.replace(/[{}]/g, '').trim())
      .filter(t => t.length > 0)
      .join('\n\n');
  }
  
  return {
    content: text || '> **Nota**: Conversão de RTF tem suporte limitado. Considere converter para DOCX ou MD para melhor resultado.',
    metadata: { originalFormat: 'rtf', warning: 'Conversão básica' },
    originalType: 'rtf',
  };
}

async function convertODTToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  try {
    // ODT é um arquivo ZIP com XML dentro
    // Extrair conteúdo do content.xml
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);
    
    // Buscar content.xml que contém o texto do documento
    const contentEntry = zip.getEntry('content.xml');
    if (!contentEntry) {
      throw new Error('content.xml não encontrado no arquivo ODT');
    }
    
    const contentXml = contentEntry.getData().toString('utf-8');
    
    // Extrair texto do XML de forma mais robusta
    // Primeiro, decodificar entidades XML
    let text = contentXml
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Extrair texto de parágrafos
    const paragraphs: string[] = [];
    const paraMatches = text.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/gi);
    if (paraMatches) {
      paraMatches.forEach(match => {
        const paraText = match
          .replace(/<text:p[^>]*>/gi, '')
          .replace(/<\/text:p>/gi, '')
          .replace(/<text:span[^>]*>/gi, '')
          .replace(/<\/text:span>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        if (paraText) paragraphs.push(paraText);
      });
    }
    
    // Extrair títulos
    const headings: Array<{ level: number; text: string }> = [];
    const headingMatches = text.match(/<text:h[^>]*outline-level="(\d+)"[^>]*>([\s\S]*?)<\/text:h>/gi);
    if (headingMatches) {
      headingMatches.forEach(match => {
        const levelMatch = match.match(/outline-level="(\d+)"/);
        const level = levelMatch ? parseInt(levelMatch[1]) : 1;
        const headingText = match
          .replace(/<text:h[^>]*>/gi, '')
          .replace(/<\/text:h>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        if (headingText) headings.push({ level, text: headingText });
      });
    }
    
    // Construir markdown
    let markdown = '';
    
    // Adicionar títulos
    headings.forEach(heading => {
      markdown += '#'.repeat(heading.level + 1) + ' ' + heading.text + '\n\n';
    });
    
    // Adicionar parágrafos
    paragraphs.forEach(para => {
      markdown += para + '\n\n';
    });
    
    // Se não encontrou parágrafos ou títulos, fazer extração básica
    if (!markdown.trim()) {
      text = text
        .replace(/<text:p[^>]*>/gi, '\n\n')
        .replace(/<text:h[^>]*>/gi, '\n\n## ')
        .replace(/<text:span[^>]*>/gi, '')
        .replace(/<\/text:[^>]+>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
      markdown = text;
    }
    
    // Extrair metadados do meta.xml se disponível
    const metaEntry = zip.getEntry('meta.xml');
    const metadata: Record<string, any> = { originalFormat: 'odt' };
    
    if (metaEntry) {
      const metaXml = metaEntry.getData().toString('utf-8');
      const titleMatch = metaXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
      const creatorMatch = metaXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
      const dateMatch = metaXml.match(/<dc:date[^>]*>([^<]+)<\/dc:date>/i);
      
      if (titleMatch) metadata.title = titleMatch[1];
      if (creatorMatch) metadata.creator = creatorMatch[1];
      if (dateMatch) metadata.date = dateMatch[1];
    }
    
    return {
      content: markdown.trim() || '> **Nota**: Não foi possível extrair conteúdo do arquivo ODT.',
      metadata,
      originalType: 'odt',
    };
  } catch (error) {
    // Se falhar, tentar usar odt2md se disponível
    try {
      const odt2md = await import('odt2md').catch(() => null) as any;
      if (odt2md) {
        const converter = odt2md.default || odt2md;
        const markdown = await converter(buffer);
        return {
          content: markdown,
          metadata: { originalFormat: 'odt' },
          originalType: 'odt',
        };
      }
    } catch {
      // Continuar com fallback
    }
    
    return {
      content: `> **Nota**: Conversão de arquivos .ODT (OpenDocument) teve problemas.\n> Considere converter para .DOCX ou .MD para melhor resultado.\n\nErro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      metadata: { originalFormat: 'odt', warning: 'Conversão com limitações' },
      originalType: 'odt',
    };
  }
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
  
  // Validação básica de Markdown
  // Verificar se tem frontmatter válido (opcional)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  const metadata: Record<string, any> = {};
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    // Extrair campos básicos do frontmatter
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    
    if (titleMatch) metadata.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
    if (descMatch) metadata.description = descMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  
  // Sanitizar: remover scripts e tags HTML perigosas (se houver)
  const sanitized = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remover event handlers
  
  return {
    content: sanitized,
    metadata,
    originalType: 'md',
  };
}

async function convertHTMLToMarkdown(
  buffer: Buffer,
  _options: ConversionOptions
): Promise<ConversionResult> {
  const TurndownService = (await import('turndown')).default;
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  
  const html = buffer.toString('utf-8');
  const markdown = turndownService.turndown(html);
  
  const metadata: Record<string, any> = {
    originalFormat: 'html',
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
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length === 0) continue;
    
    markdown += `## ${sheetName}\n\n`;
    
    // Converter para tabela Markdown
    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1);
    
    markdown += '| ' + headers.map((h: any) => String(h || '')).join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    for (const row of rows) {
      markdown += '| ' + row.map((cell: any) => String(cell || '')).join(' | ') + ' |\n';
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
    
    // Extrair título da apresentação se disponível
    if (presentation.title) {
      markdown += `# ${presentation.title}\n\n`;
      metadata.title = presentation.title;
    }
    
    // Converter cada slide
    if (presentation.slides && presentation.slides.length > 0) {
      for (let i = 0; i < presentation.slides.length; i++) {
        const slide = presentation.slides[i];
        markdown += `## Slide ${i + 1}`;
        
        // Adicionar título do slide se disponível
        if (slide.title) {
          markdown += `: ${slide.title}`;
        }
        markdown += '\n\n';
        
        // Extrair texto do slide
        if (slide.text) {
          // Se for array, juntar
          const slideText = Array.isArray(slide.text) 
            ? slide.text.join('\n\n') 
            : slide.text;
          markdown += slideText + '\n\n';
        }
        
        // Extrair notas do slide se disponíveis
        if (slide.notes) {
          markdown += `> **Notas**: ${slide.notes}\n\n`;
        }
        
        // Adicionar separador entre slides (exceto no último)
        if (i < presentation.slides.length - 1) {
          markdown += '---\n\n';
        }
      }
    } else {
      // Tentar método alternativo de extração
      if (presentation.text) {
        markdown += presentation.text;
      }
    }
    
    return {
      content: markdown.trim() || '> **Nota**: Não foi possível extrair conteúdo do arquivo PPTX.',
      metadata,
      originalType: 'pptx',
    };
  } catch (error) {
    // Fallback: tentar extrair texto básico do ZIP
    try {
      const AdmZip = (await import('adm-zip')).default;
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      
      let text = '';
      // Buscar arquivos XML que podem conter texto
      for (const entry of entries) {
        if (entry.entryName.includes('slide') && entry.entryName.endsWith('.xml')) {
          const xml = entry.getData().toString('utf-8');
          // Extrair texto básico do XML
          const textMatches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
          if (textMatches) {
            textMatches.forEach(match => {
              const content = match.replace(/<[^>]+>/g, '').trim();
              if (content) text += content + '\n';
            });
          }
        }
      }
      
      if (text.trim()) {
        return {
          content: text.trim(),
          metadata: { originalFormat: 'pptx', warning: 'Conversão básica via ZIP' },
          originalType: 'pptx',
        };
      }
    } catch {
      // Continuar com fallback final
    }
    
    return {
      content: `> **Nota**: Conversão de arquivos .PPTX (PowerPoint) teve problemas.\n> O conteúdo pode não ser extraído completamente.\n\nErro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      metadata: { originalFormat: 'pptx', warning: 'Conversão limitada' },
      originalType: 'pptx',
    };
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

