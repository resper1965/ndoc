/**
 * Tipos de documentos suportados para conversão
 */

export type DocumentType =
  // Documentos de texto
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'rtf'
  | 'odt'
  | 'txt'
  | 'md'
  | 'mdx'
  // Documentos estruturados
  | 'html'
  | 'json'
  | 'xml'
  | 'csv'
  // Planilhas e apresentações
  | 'xlsx'
  | 'pptx';

export interface DocumentTypeInfo {
  type: DocumentType;
  mimeTypes: string[];
  extensions: string[];
  description: string;
  category: 'text' | 'structured' | 'spreadsheet' | 'presentation';
  requiresConversion: boolean;
}

export const SUPPORTED_DOCUMENT_TYPES: Record<DocumentType, DocumentTypeInfo> = {
  // Documentos de texto
  pdf: {
    type: 'pdf',
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    description: 'PDF Document',
    category: 'text',
    requiresConversion: true,
  },
  docx: {
    type: 'docx',
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['.docx'],
    description: 'Microsoft Word Document',
    category: 'text',
    requiresConversion: true,
  },
  doc: {
    type: 'doc',
    mimeTypes: ['application/msword'],
    extensions: ['.doc'],
    description: 'Microsoft Word Document (Legacy)',
    category: 'text',
    requiresConversion: true,
  },
  rtf: {
    type: 'rtf',
    mimeTypes: ['application/rtf', 'text/rtf'],
    extensions: ['.rtf'],
    description: 'Rich Text Format',
    category: 'text',
    requiresConversion: true,
  },
  odt: {
    type: 'odt',
    mimeTypes: ['application/vnd.oasis.opendocument.text'],
    extensions: ['.odt'],
    description: 'OpenDocument Text',
    category: 'text',
    requiresConversion: true,
  },
  txt: {
    type: 'txt',
    mimeTypes: ['text/plain'],
    extensions: ['.txt'],
    description: 'Plain Text',
    category: 'text',
    requiresConversion: true,
  },
  md: {
    type: 'md',
    mimeTypes: ['text/markdown', 'text/x-markdown'],
    extensions: ['.md', '.markdown'],
    description: 'Markdown',
    category: 'text',
    requiresConversion: false, // Apenas validação
  },
  mdx: {
    type: 'mdx',
    mimeTypes: ['text/mdx'],
    extensions: ['.mdx'],
    description: 'MDX (Markdown with JSX)',
    category: 'text',
    requiresConversion: false, // Apenas validação
  },
  // Documentos estruturados
  html: {
    type: 'html',
    mimeTypes: ['text/html'],
    extensions: ['.html', '.htm'],
    description: 'HTML Document',
    category: 'structured',
    requiresConversion: true,
  },
  json: {
    type: 'json',
    mimeTypes: ['application/json'],
    extensions: ['.json'],
    description: 'JSON Document',
    category: 'structured',
    requiresConversion: true,
  },
  xml: {
    type: 'xml',
    mimeTypes: ['application/xml', 'text/xml'],
    extensions: ['.xml'],
    description: 'XML Document',
    category: 'structured',
    requiresConversion: true,
  },
  csv: {
    type: 'csv',
    mimeTypes: ['text/csv', 'application/csv'],
    extensions: ['.csv'],
    description: 'CSV Spreadsheet',
    category: 'structured',
    requiresConversion: true,
  },
  // Planilhas e apresentações
  xlsx: {
    type: 'xlsx',
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.xlsx'],
    description: 'Microsoft Excel Spreadsheet',
    category: 'spreadsheet',
    requiresConversion: true,
  },
  pptx: {
    type: 'pptx',
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    extensions: ['.pptx'],
    description: 'Microsoft PowerPoint Presentation',
    category: 'presentation',
    requiresConversion: true,
  },
};

/**
 * Detecta o tipo de documento baseado no nome do arquivo ou MIME type
 */
export function detectDocumentType(
  filename: string,
  mimeType?: string
): DocumentType | null {
  // Tentar detectar por extensão
  const extension = filename
    .toLowerCase()
    .substring(filename.lastIndexOf('.'));

  for (const [type, info] of Object.entries(SUPPORTED_DOCUMENT_TYPES)) {
    if (info.extensions.includes(extension)) {
      return type as DocumentType;
    }
  }

  // Tentar detectar por MIME type
  if (mimeType) {
    for (const [type, info] of Object.entries(SUPPORTED_DOCUMENT_TYPES)) {
      if (info.mimeTypes.includes(mimeType.toLowerCase())) {
        return type as DocumentType;
      }
    }
  }

  return null;
}

/**
 * Verifica se um tipo de documento é suportado
 */
export function isSupportedDocumentType(type: string): type is DocumentType {
  return type in SUPPORTED_DOCUMENT_TYPES;
}

/**
 * Obtém informações sobre um tipo de documento
 */
export function getDocumentTypeInfo(
  type: DocumentType
): DocumentTypeInfo | null {
  return SUPPORTED_DOCUMENT_TYPES[type] || null;
}

/**
 * Lista todos os tipos suportados por categoria
 */
export function getSupportedTypesByCategory(category: DocumentTypeInfo['category']): DocumentTypeInfo[] {
  return Object.values(SUPPORTED_DOCUMENT_TYPES).filter(
    (info) => info.category === category
  );
}

/**
 * Lista todos os tipos que requerem conversão
 */
export function getTypesRequiringConversion(): DocumentTypeInfo[] {
  return Object.values(SUPPORTED_DOCUMENT_TYPES).filter(
    (info) => info.requiresConversion
  );
}

