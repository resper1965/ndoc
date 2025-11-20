/**
 * Validação de documentos duplicados
 * Verifica se um documento já existe antes de processar
 */

import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingDocumentId?: string;
  matchType?: 'filename' | 'content_hash' | 'both';
  message?: string;
}

/**
 * Calcula hash SHA-256 do conteúdo do arquivo
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calcula hash SHA-256 do conteúdo convertido (Markdown)
 */
export function calculateContentHash(content: string): string {
  // Normalizar conteúdo antes de calcular hash (remover espaços extras, etc.)
  const normalized = content
    .replace(/\r\n/g, '\n') // Normalizar quebras de linha
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Remover múltiplas quebras de linha
    .trim();

  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Verifica se um documento é duplicado
 * 
 * @param options Opções de verificação
 * @returns Resultado da verificação de duplicata
 */
export async function checkDuplicateDocument(options: {
  organizationId: string;
  filename?: string;
  fileHash?: string;
  contentHash?: string;
  excludeDocumentId?: string; // Excluir documento específico (útil para atualizações)
}): Promise<DuplicateCheckResult> {
  const { organizationId, filename, fileHash, contentHash, excludeDocumentId } = options;

  if (!filename && !fileHash && !contentHash) {
    return {
      isDuplicate: false,
      message: 'Nenhum critério de verificação fornecido',
    };
  }

  try {
    const supabase = createAdminClient();

    // Construir query de verificação
    let query = supabase
      .from('documents')
      .select('id, title, filename, file_hash, content_hash')
      .eq('organization_id', organizationId);

    // Excluir documento específico se fornecido
    if (excludeDocumentId) {
      query = query.neq('id', excludeDocumentId);
    }

    // Buscar documentos da organização
    const { data: documents, error } = await query;

    if (error) {
      logger.error('Erro ao verificar duplicatas', error);
      // Em caso de erro, não bloquear o upload (fail-open)
      return {
        isDuplicate: false,
        message: 'Erro ao verificar duplicatas, continuando com upload',
      };
    }

    if (!documents || documents.length === 0) {
      return {
        isDuplicate: false,
      };
    }

    // Verificar duplicatas por nome de arquivo
    if (filename) {
      const duplicateByFilename = documents.find(
        (doc) => doc.filename && doc.filename.toLowerCase() === filename.toLowerCase()
      );

      if (duplicateByFilename) {
        return {
          isDuplicate: true,
          existingDocumentId: duplicateByFilename.id,
          matchType: 'filename',
          message: `Documento com o nome "${filename}" já existe`,
        };
      }
    }

    // Verificar duplicatas por hash do arquivo
    if (fileHash) {
      const duplicateByFileHash = documents.find(
        (doc) => doc.file_hash && doc.file_hash === fileHash
      );

      if (duplicateByFileHash) {
        return {
          isDuplicate: true,
          existingDocumentId: duplicateByFileHash.id,
          matchType: fileHash && filename ? 'both' : 'content_hash',
          message: `Documento com o mesmo conteúdo já existe (${duplicateByFileHash.title || duplicateByFileHash.filename})`,
        };
      }
    }

    // Verificar duplicatas por hash do conteúdo convertido
    if (contentHash) {
      const duplicateByContentHash = documents.find(
        (doc) => doc.content_hash && doc.content_hash === contentHash
      );

      if (duplicateByContentHash) {
        return {
          isDuplicate: true,
          existingDocumentId: duplicateByContentHash.id,
          matchType: 'content_hash',
          message: `Documento com o mesmo conteúdo convertido já existe (${duplicateByContentHash.title || duplicateByContentHash.filename})`,
        };
      }
    }

    return {
      isDuplicate: false,
    };
  } catch (error) {
    logger.error('Erro ao verificar duplicatas', error);
    // Em caso de erro, não bloquear o upload (fail-open)
    return {
      isDuplicate: false,
      message: 'Erro ao verificar duplicatas, continuando com upload',
    };
  }
}

