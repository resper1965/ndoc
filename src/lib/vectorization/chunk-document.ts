/**
 * Chunking de documentos para vetorização
 * Divide documentos em pedaços menores para melhor indexação
 */

import { estimateTokens } from './token-estimator';

export interface DocumentChunk {
  id: string;
  content: string;
  chunkIndex: number;
  tokenCount?: number;
  metadata?: Record<string, any>;
}

export interface ChunkingOptions {
  chunkSize?: number; // tokens (padrão: 500)
  chunkOverlap?: number; // tokens (padrão: 50)
  strategy?: 'sentence' | 'paragraph' | 'semantic';
  preserveHeaders?: boolean; // Preservar headers (# ## ###) nos chunks
}

/**
 * Divide um documento em chunks
 */
export function chunkDocument(
  content: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const {
    chunkSize = 500,
    chunkOverlap = 50,
    strategy = 'paragraph',
    preserveHeaders = true,
  } = options;

  // Dividir por parágrafos (melhor para políticas/procedimentos)
  if (strategy === 'paragraph') {
    return chunkByParagraphs(content, chunkSize, chunkOverlap, preserveHeaders);
  }

  // Dividir por sentenças (melhor para manuais)
  if (strategy === 'sentence') {
    return chunkBySentences(content, chunkSize, chunkOverlap, preserveHeaders);
  }

  // Dividir semanticamente (futuro - requer IA)
  // Por enquanto, usar parágrafos
  return chunkByParagraphs(content, chunkSize, chunkOverlap, preserveHeaders);
}

/**
 * Divide por parágrafos
 */
function chunkByParagraphs(
  content: string,
  chunkSize: number,
  chunkOverlap: number,
  preserveHeaders: boolean
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Dividir por linhas duplas (parágrafos)
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  
  let currentChunk = '';
  let currentChunkIndex = 0;
  let currentTokenCount = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paragraphTokens = estimateTokens(paragraph);
    
    // Se o parágrafo sozinho é maior que chunkSize, dividir por linhas
    if (paragraphTokens > chunkSize) {
      // Salvar chunk atual se houver
      if (currentChunk.trim().length > 0) {
        chunks.push({
          id: `chunk-${currentChunkIndex}`,
          content: currentChunk.trim(),
          chunkIndex: currentChunkIndex++,
          tokenCount: currentTokenCount,
          metadata: { strategy: 'paragraph' },
        });
        currentChunk = '';
        currentTokenCount = 0;
      }
      
      // Dividir parágrafo grande por linhas
      const lines = paragraph.split('\n');
      for (const line of lines) {
        const lineTokens = estimateTokens(line);
        if (currentTokenCount + lineTokens > chunkSize && currentChunk.trim().length > 0) {
          chunks.push({
            id: `chunk-${currentChunkIndex}`,
            content: currentChunk.trim(),
            chunkIndex: currentChunkIndex++,
            tokenCount: currentTokenCount,
            metadata: { strategy: 'paragraph' },
          });
          
          // Overlap: manter últimas linhas
          const overlapLines = getOverlapLines(currentChunk, chunkOverlap);
          currentChunk = overlapLines + '\n' + line;
          currentTokenCount = estimateTokens(currentChunk);
        } else {
          currentChunk += (currentChunk ? '\n' : '') + line;
          currentTokenCount += lineTokens;
        }
      }
      continue;
    }

    // Verificar se adicionar este parágrafo ultrapassa o limite
    if (currentTokenCount + paragraphTokens > chunkSize && currentChunk.trim().length > 0) {
      // Salvar chunk atual
      chunks.push({
        id: `chunk-${currentChunkIndex}`,
        content: currentChunk.trim(),
        chunkIndex: currentChunkIndex++,
        tokenCount: currentTokenCount,
        metadata: { strategy: 'paragraph' },
      });

      // Overlap: manter últimos parágrafos
      const overlapText = getOverlapText(currentChunk, chunkOverlap);
      currentChunk = overlapText + '\n\n' + paragraph;
      currentTokenCount = estimateTokens(currentChunk);
    } else {
      // Adicionar parágrafo ao chunk atual
      if (preserveHeaders && isHeader(paragraph)) {
        // Headers sempre começam um novo chunk se o chunk atual não estiver vazio
        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: `chunk-${currentChunkIndex}`,
            content: currentChunk.trim(),
            chunkIndex: currentChunkIndex++,
            tokenCount: currentTokenCount,
            metadata: { strategy: 'paragraph' },
          });
          currentChunk = paragraph;
          currentTokenCount = paragraphTokens;
        } else {
          currentChunk = paragraph;
          currentTokenCount = paragraphTokens;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokenCount += paragraphTokens;
      }
    }
  }

  // Adicionar último chunk se houver
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk-${currentChunkIndex}`,
      content: currentChunk.trim(),
      chunkIndex: currentChunkIndex++,
      tokenCount: currentTokenCount,
      metadata: { strategy: 'paragraph' },
    });
  }

  return chunks;
}

/**
 * Divide por sentenças
 */
function chunkBySentences(
  content: string,
  chunkSize: number,
  chunkOverlap: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _preserveHeaders: boolean
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Dividir por sentenças (pontos, exclamações, interrogações)
  const sentences = content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  
  let currentChunk = '';
  let currentChunkIndex = 0;
  let currentTokenCount = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);
    
    if (currentTokenCount + sentenceTokens > chunkSize && currentChunk.trim().length > 0) {
      chunks.push({
        id: `chunk-${currentChunkIndex}`,
        content: currentChunk.trim(),
        chunkIndex: currentChunkIndex++,
        tokenCount: currentTokenCount,
        metadata: { strategy: 'sentence' },
      });

      // Overlap: manter últimas sentenças
      const overlapText = getOverlapText(currentChunk, chunkOverlap);
      currentChunk = overlapText + ' ' + sentence;
      currentTokenCount = estimateTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
      currentTokenCount += sentenceTokens;
    }
  }

  // Adicionar último chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk-${currentChunkIndex}`,
      content: currentChunk.trim(),
      chunkIndex: currentChunkIndex++,
      tokenCount: currentTokenCount,
      metadata: { strategy: 'sentence' },
    });
  }

  return chunks;
}

// estimateTokens movido para token-estimator.ts

/**
 * Obtém texto de overlap do chunk anterior
 */
function getOverlapText(text: string, overlapTokens: number): string {
  // Usar estimateTokens para calcular caracteres necessários
  // Aproximação reversa: tokens * 4 caracteres
  const targetChars = overlapTokens * 4;
  if (text.length <= targetChars) return text;
  
  // Pegar do final
  const overlapText = text.slice(-targetChars);
  // Tentar começar em uma palavra completa
  const firstSpace = overlapText.indexOf(' ');
  return firstSpace > 0 ? overlapText.slice(firstSpace + 1) : overlapText;
}

/**
 * Obtém linhas de overlap
 */
function getOverlapLines(text: string, overlapTokens: number): string {
  const lines = text.split('\n');
  const targetChars = overlapTokens * 4; // Aproximação
  let overlap = '';
  
  // Pegar linhas do final até atingir targetChars
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (overlap.length + line.length > targetChars) break;
    overlap = line + (overlap ? '\n' : '') + overlap;
  }
  
  return overlap;
}

/**
 * Verifica se um parágrafo é um header Markdown
 */
function isHeader(text: string): boolean {
  return /^#{1,6}\s+/.test(text.trim());
}

