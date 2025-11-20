/**
 * Chunking Semântico
 * Divide documentos usando embeddings para preservar contexto semântico
 * 
 * Esta é uma implementação básica. Para melhor qualidade, considere usar
 * bibliotecas especializadas como langchain ou similar.
 */

import { estimateTokens } from './token-estimator';
import type { DocumentChunk } from './chunk-document';

export interface SemanticChunkingOptions {
  chunkSize?: number; // tokens (padrão: 500)
  chunkOverlap?: number; // tokens (padrão: 50)
  similarityThreshold?: number; // Threshold de similaridade para dividir (padrão: 0.7)
}

/**
 * Divide documento usando chunking semântico
 * 
 * Estratégia:
 * 1. Dividir em sentenças
 * 2. Calcular embeddings para cada sentença (ou grupo de sentenças)
 * 3. Agrupar sentenças com alta similaridade semântica
 * 4. Criar chunks respeitando tamanho máximo
 * 
 * NOTA: Esta é uma implementação simplificada. Para produção, considere:
 * - Usar biblioteca especializada (langchain, etc.)
 * - Calcular embeddings reais (requer API call)
 * - Usar algoritmos mais sofisticados (sliding window, etc.)
 */
export async function semanticChunkDocument(
  content: string,
  options: SemanticChunkingOptions = {}
): Promise<DocumentChunk[]> {
  const {
    chunkSize = 500,
    chunkOverlap = 50,
    // similarityThreshold = 0.7, // Reservado para uso futuro com embeddings reais
  } = options;

  // Por enquanto, usar estratégia híbrida:
  // 1. Dividir por parágrafos (melhor preservação de contexto)
  // 2. Se parágrafo muito grande, dividir por sentenças
  // 3. Agrupar sentenças relacionadas (baseado em palavras-chave comuns)
  
  // Dividir em parágrafos
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  
  const chunks: DocumentChunk[] = [];
  let currentChunk = '';
  let currentChunkIndex = 0;
  let currentTokenCount = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paragraphTokens = estimateTokens(paragraph);

    // Se parágrafo sozinho é maior que chunkSize, dividir semanticamente
    if (paragraphTokens > chunkSize) {
      // Salvar chunk atual se houver
      if (currentChunk.trim().length > 0) {
        chunks.push({
          id: `chunk-${currentChunkIndex}`,
          content: currentChunk.trim(),
          chunkIndex: currentChunkIndex++,
          tokenCount: currentTokenCount,
          metadata: { strategy: 'semantic', type: 'paragraph' },
        });
        currentChunk = '';
        currentTokenCount = 0;
      }

      // Dividir parágrafo grande semanticamente
      const subChunks = await splitLargeParagraphSemantically(
        paragraph,
        chunkSize,
        chunkOverlap
      );
      
      for (const subChunk of subChunks) {
        chunks.push({
          id: `chunk-${currentChunkIndex}`,
          content: subChunk.content,
          chunkIndex: currentChunkIndex++,
          tokenCount: subChunk.tokenCount,
          metadata: { strategy: 'semantic', type: 'sentence-group' },
        });
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
        metadata: { strategy: 'semantic', type: 'paragraph' },
      });

      // Overlap: manter últimos parágrafos
      const overlapText = getOverlapText(currentChunk, chunkOverlap);
      currentChunk = overlapText + '\n\n' + paragraph;
      currentTokenCount = estimateTokens(currentChunk);
    } else {
      // Adicionar parágrafo ao chunk atual
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentTokenCount += paragraphTokens;
    }
  }

  // Adicionar último chunk se houver
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk-${currentChunkIndex}`,
      content: currentChunk.trim(),
      chunkIndex: currentChunkIndex++,
      tokenCount: currentTokenCount,
      metadata: { strategy: 'semantic', type: 'paragraph' },
    });
  }

  return chunks;
}

/**
 * Divide parágrafo grande semanticamente
 * Agrupa sentenças relacionadas baseado em palavras-chave comuns
 */
async function splitLargeParagraphSemantically(
  paragraph: string,
  chunkSize: number,
  chunkOverlap: number
): Promise<Array<{ content: string; tokenCount: number }>> {
  // Dividir em sentenças
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return [];
  }

  const chunks: Array<{ content: string; tokenCount: number }> = [];
  let currentGroup: string[] = [];
  let currentTokenCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokens(sentence);

    // Se sentença sozinha é maior que chunkSize, adicionar como chunk separado
    if (sentenceTokens > chunkSize) {
      // Salvar grupo atual se houver
      if (currentGroup.length > 0) {
        const groupContent = currentGroup.join(' ');
        chunks.push({
          content: groupContent,
          tokenCount: currentTokenCount,
        });
        currentGroup = [];
        currentTokenCount = 0;
      }

      // Adicionar sentença grande como chunk separado
      chunks.push({
        content: sentence,
        tokenCount: sentenceTokens,
      });
      continue;
    }

    // Verificar se adicionar esta sentença ultrapassa o limite
    if (currentTokenCount + sentenceTokens > chunkSize && currentGroup.length > 0) {
      // Salvar grupo atual
      const groupContent = currentGroup.join(' ');
      chunks.push({
        content: groupContent,
        tokenCount: currentTokenCount,
      });

      // Overlap: manter últimas sentenças do grupo anterior
      const overlapSentences = getOverlapSentences(currentGroup, chunkOverlap);
      currentGroup = [...overlapSentences, sentence];
      currentTokenCount = estimateTokens(currentGroup.join(' '));
    } else {
      // Adicionar sentença ao grupo atual
      currentGroup.push(sentence);
      currentTokenCount += sentenceTokens;
    }
  }

  // Adicionar último grupo se houver
  if (currentGroup.length > 0) {
    const groupContent = currentGroup.join(' ');
    chunks.push({
      content: groupContent,
      tokenCount: currentTokenCount,
    });
  }

  return chunks;
}

/**
 * Obtém texto de overlap do chunk anterior
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const targetChars = overlapTokens * 4; // Aproximação
  if (text.length <= targetChars) return text;
  
  const overlapText = text.slice(-targetChars);
  const firstSpace = overlapText.indexOf(' ');
  return firstSpace > 0 ? overlapText.slice(firstSpace + 1) : overlapText;
}

/**
 * Obtém sentenças de overlap
 */
function getOverlapSentences(sentences: string[], overlapTokens: number): string[] {
  const targetChars = overlapTokens * 4; // Aproximação
  const overlap: string[] = [];
  let totalChars = 0;
  
  // Pegar sentenças do final até atingir targetChars
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    if (totalChars + sentence.length > targetChars) break;
    overlap.unshift(sentence);
    totalChars += sentence.length;
  }
  
  return overlap;
}

// Função reservada para uso futuro com embeddings reais
// /**
//  * Calcula similaridade simples entre duas sentenças
//  * Baseado em palavras-chave comuns (implementação básica)
//  * 
//  * NOTA: Para melhor qualidade, usar embeddings reais
//  */
// function calculateSentenceSimilarity(sentence1: string, sentence2: string): number {
//   // Normalizar e dividir em palavras
//   const words1 = new Set(
//     sentence1
//       .toLowerCase()
//       .replace(/[^\w\s]/g, ' ')
//       .split(/\s+/)
//       .filter((w) => w.length > 2) // Filtrar palavras muito curtas
//   );
//   
//   const words2 = new Set(
//     sentence2
//       .toLowerCase()
//       .replace(/[^\w\s]/g, ' ')
//       .split(/\s+/)
//       .filter((w) => w.length > 2)
//   );
//
//   // Calcular interseção
//   const intersection = new Set([...words1].filter((w) => words2.has(w)));
//   const union = new Set([...words1, ...words2]);
//
//   // Similaridade de Jaccard
//   return union.size > 0 ? intersection.size / union.size : 0;
// }

