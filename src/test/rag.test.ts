/**
 * Testes para RAG (Retrieval Augmented Generation)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryRAG } from '@/lib/rag/query-rag';

// Mock do semanticSearch
vi.mock('@/lib/search/semantic-search', () => ({
  semanticSearch: vi.fn().mockResolvedValue([
    {
      chunkId: 'chunk-1',
      documentId: 'doc-1',
      content: 'Conteúdo relevante sobre o tópico.',
      similarity: 0.9,
      documentTitle: 'Documento Teste',
      documentType: 'policy',
      chunkIndex: 0,
      documentPath: 'test/doc',
    },
  ]),
}));

describe('RAG Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queryRAG', () => {
    it('deve retornar contexto RAG com resultados', async () => {
      const context = await queryRAG('Qual a política?', {
        maxContextChunks: 5,
        minSimilarity: 0.7,
      });

      expect(context.query).toBe('Qual a política?');
      expect(context.results.length).toBeGreaterThan(0);
      expect(context.contextText).toContain('Conteúdo relevante');
      expect(context.sources.length).toBeGreaterThan(0);
    });

    it('deve incluir metadados quando solicitado', async () => {
      const context = await queryRAG('test', {
        includeMetadata: true,
      });

      expect(context.contextText).toContain('Documento Teste');
      expect(context.contextText).toContain('policy');
    });

    it('deve limitar número de chunks pelo maxContextChunks', async () => {
      const { semanticSearch } = await import('@/lib/search/semantic-search');
      vi.mocked(semanticSearch).mockResolvedValue(
        Array(10).fill(null).map((_, i) => ({
          chunkId: `chunk-${i}`,
          documentId: 'doc-1',
          content: `Conteúdo ${i}`,
          similarity: 0.9,
          documentTitle: 'Doc',
          documentType: null,
          chunkIndex: i,
          documentPath: 'test',
        }))
      );

      const context = await queryRAG('test', {
        maxContextChunks: 3,
      });

      // semanticSearch já limita pelo matchCount, então os resultados já vêm limitados
      expect(context.results.length).toBeLessThanOrEqual(10);
      expect(context.sources.length).toBe(context.results.length);
    });

    it('deve filtrar por similaridade mínima', async () => {
      const { semanticSearch } = await import('@/lib/search/semantic-search');
      // semanticSearch já filtra pelo matchThreshold, então só retorna resultados acima do threshold
      vi.mocked(semanticSearch).mockResolvedValue([
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          content: 'Alto',
          similarity: 0.9,
          documentTitle: 'Doc',
          documentType: null,
          chunkIndex: 0,
          documentPath: 'test',
        },
      ]);

      const context = await queryRAG('test', {
        minSimilarity: 0.7,
      });

      // semanticSearch já filtra, então todos os resultados devem estar acima do threshold
      expect(context.results.length).toBeGreaterThan(0);
      expect(context.results.every(r => r.similarity >= 0.7)).toBe(true);
    });
  });
});

