/**
 * RAG (Retrieval Augmented Generation)
 * Sistema de busca e geração de respostas usando contexto dos documentos
 */

import { semanticSearch, type SemanticSearchResult } from '../search/semantic-search';

export interface RAGContext {
  query: string;
  results: SemanticSearchResult[];
  contextText: string;
  sources: Array<{
    documentId: string;
    documentTitle: string;
    documentPath: string;
    chunkIndex: number;
    similarity: number;
  }>;
}

export interface RAGQueryOptions {
  organizationId?: string;
  documentType?: 'policy' | 'procedure' | 'manual' | 'other';
  maxContextChunks?: number; // Máximo de chunks para contexto
  minSimilarity?: number; // Similaridade mínima
  includeMetadata?: boolean; // Incluir metadados no contexto
}

/**
 * Realiza uma query RAG: busca semântica + preparação de contexto
 */
export async function queryRAG(
  query: string,
  options: RAGQueryOptions = {}
): Promise<RAGContext> {
  const {
    maxContextChunks = 5,
    minSimilarity = 0.7,
    includeMetadata = true,
  } = options;

  // 1. Busca semântica
  const searchResults = await semanticSearch(query, {
    organizationId: options.organizationId,
    documentType: options.documentType,
    matchThreshold: minSimilarity,
    matchCount: maxContextChunks,
  });

  // 2. Preparar contexto
  const contextParts: string[] = [];
  const sources: RAGContext['sources'] = [];

  for (const result of searchResults) {
    // Adicionar metadados se solicitado
    if (includeMetadata) {
      contextParts.push(
        `[Documento: ${result.documentTitle}${result.documentType ? ` (${result.documentType})` : ''}]`
      );
    }

    // Adicionar conteúdo do chunk
    contextParts.push(result.content);

    // Registrar fonte
    sources.push({
      documentId: result.documentId,
      documentTitle: result.documentTitle,
      documentPath: result.documentPath,
      chunkIndex: result.chunkIndex,
      similarity: result.similarity,
    });
  }

  const contextText = contextParts.join('\n\n---\n\n');

  return {
    query,
    results: searchResults,
    contextText,
    sources,
  };
}

/**
 * Formata contexto RAG para uso em prompts de LLM
 */
export function formatRAGContextForPrompt(
  context: RAGContext,
  options: {
    includeQuery?: boolean;
    includeSources?: boolean;
    maxLength?: number;
  } = {}
): string {
  const {
    includeQuery = true,
    includeSources = true,
    maxLength = 4000, // Limite de tokens aproximado
  } = options;

  const parts: string[] = [];

  if (includeQuery) {
    parts.push(`Pergunta: ${context.query}\n`);
  }

  parts.push('Contexto dos documentos:\n');
  parts.push(context.contextText);

  if (includeSources && context.sources.length > 0) {
    parts.push('\n\nFontes:');
    context.sources.forEach((source, index) => {
      parts.push(
        `${index + 1}. ${source.documentTitle} (similaridade: ${(source.similarity * 100).toFixed(1)}%)`
      );
    });
  }

  let formatted = parts.join('\n');

  // Truncar se exceder limite
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength) + '...';
  }

  return formatted;
}

/**
 * Gera resposta usando RAG + LLM
 * (Requere integração com OpenAI/Anthropic)
 */
export async function generateRAGResponse(
  query: string,
  options: RAGQueryOptions & {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{
  answer: string;
  context: RAGContext;
  sources: RAGContext['sources'];
}> {
  // 1. Obter contexto RAG
  const context = await queryRAG(query, options);

  if (context.results.length === 0) {
    return {
      answer: 'Não encontrei informações relevantes nos documentos para responder sua pergunta.',
      context,
      sources: [],
    };
  }

  // 2. Formatar contexto para prompt
  formatRAGContextForPrompt(context, {
    includeQuery: true,
    includeSources: true,
  });

  // 3. Gerar resposta usando LLM
  // TODO: Integrar com OpenAI/Anthropic
  // Por enquanto, retornar contexto formatado
  const answer = `Com base nos documentos encontrados:\n\n${context.contextText.substring(0, 500)}...`;

  return {
    answer,
    context,
    sources: context.sources,
  };
}

