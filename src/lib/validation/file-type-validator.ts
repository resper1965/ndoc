/**
 * Validação de tipo de arquivo real usando detecção de MIME type
 * Previne upload de arquivos maliciosos com extensão falsa
 */

import { logger } from '@/lib/logger';

// Whitelist de tipos MIME permitidos
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  // Documentos
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/rtf': ['.rtf'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
  
  // Planilhas
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  
  // Apresentações
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Texto e Markdown
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.mdx'],
  'text/html': ['.html', '.htm'],
  
  // Dados
  'application/json': ['.json'],
  'application/xml': ['.xml'],
  'text/xml': ['.xml'],
};

// Mapeamento de extensões para tipos MIME esperados
const EXTENSION_TO_MIME: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.rtf': ['application/rtf'],
  '.odt': ['application/vnd.oasis.opendocument.text'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.csv': ['text/csv'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.txt': ['text/plain'],
  '.md': ['text/markdown'],
  '.mdx': ['text/markdown'],
  '.html': ['text/html'],
  '.htm': ['text/html'],
  '.json': ['application/json'],
  '.xml': ['application/xml'],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
  expectedMimeType?: string;
}

/**
 * Valida o tipo real de um arquivo usando detecção de MIME type
 */
export async function validateFileType(
  file: File,
  options: {
    strict?: boolean; // Se true, rejeita se MIME type não corresponder à extensão
  } = {}
): Promise<FileValidationResult> {
  const { strict = true } = options;

  try {
    // 1. Detectar MIME type real do arquivo
    const detectedMimeType = await detectMimeType(file);
    
    // 2. Obter extensão do arquivo
    const extension = getFileExtension(file.name);
    
    // 3. Verificar se o MIME type detectado está na whitelist
    if (!ALLOWED_MIME_TYPES[detectedMimeType]) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido: ${detectedMimeType}. Tipos permitidos: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
        detectedMimeType,
      };
    }

    // 4. Se strict, verificar se MIME type corresponde à extensão
    if (strict && extension) {
      const expectedMimeTypes = EXTENSION_TO_MIME[extension.toLowerCase()];
      
      if (expectedMimeTypes && !expectedMimeTypes.includes(detectedMimeType)) {
        return {
          valid: false,
          error: `Extensão do arquivo (${extension}) não corresponde ao tipo real (${detectedMimeType}). Possível arquivo malicioso.`,
          detectedMimeType,
          expectedMimeType: expectedMimeTypes[0],
        };
      }
    }

    return {
      valid: true,
      detectedMimeType,
    };
  } catch (error) {
    logger.error('Erro ao validar tipo de arquivo', error);
    return {
      valid: false,
      error: `Erro ao validar tipo de arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Detecta o MIME type real de um arquivo
 * Usa file-type se disponível, senão usa file.type como fallback
 */
async function detectMimeType(file: File): Promise<string> {
  // Tentar usar file-type para detecção precisa
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (fileType) {
      return fileType.mime;
    }
  } catch (error) {
    // Se file-type não estiver disponível ou falhar, usar fallback
    logger.warn('file-type não disponível, usando file.type como fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Fallback: usar file.type (menos confiável, mas melhor que nada)
  if (file.type) {
    return file.type;
  }

  // Último fallback: tentar inferir da extensão
  const extension = getFileExtension(file.name);
  if (extension) {
    const expectedMimeTypes = EXTENSION_TO_MIME[extension.toLowerCase()];
    if (expectedMimeTypes && expectedMimeTypes.length > 0) {
      return expectedMimeTypes[0];
    }
  }

  // Se não conseguir detectar, retornar 'application/octet-stream'
  return 'application/octet-stream';
}

/**
 * Extrai extensão do arquivo
 */
function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : null;
}

/**
 * Verifica se um tipo MIME é permitido
 */
export function isMimeTypeAllowed(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

/**
 * Obtém extensões permitidas para um tipo MIME
 */
export function getAllowedExtensions(mimeType: string): string[] {
  return ALLOWED_MIME_TYPES[mimeType] || [];
}

