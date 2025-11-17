/**
 * Testes para Busca Semântica
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { semanticSearch } from '@/lib/search/semantic-search';
import { formatRAGContextForPrompt } from '@/lib/rag/query-rag';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

// Mock de generateQueryEmbedding
vi.mock('@/lib/vectorization/generate-embeddings', () => ({
  generateQueryEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
}));

// Mock de utils
vi.mock('@/lib/supabase/utils', () => ({
  getUserOrganization: vi.fn().mockResolvedValue('org-123'),
}));

describe('Semantic Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('semanticSearch', () => {
    it('deve retornar array vazio para query vazia', async () => {
      const results = await semanticSearch('', {});
      expect(results).toEqual([]);
    });

    it('deve retornar array vazio para query apenas com espaços', async () => {
      const results = await semanticSearch('   ', {});
      expect(results).toEqual([]);
    });

    it('deve chamar RPC semantic_search com parâmetros corretos', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
        auth: { getUser: vi.fn() },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      await semanticSearch('test query', {
        organizationId: 'org-123',
        matchThreshold: 0.7,
        matchCount: 10,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('semantic_search', {
        query_embedding: expect.any(Array),
        organization_id_filter: 'org-123',
        document_type_filter: null,
        match_threshold: 0.7,
        match_count: 10,
      });
    });

    it('deve filtrar por tipo de documento quando fornecido', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
        auth: { getUser: vi.fn() },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      await semanticSearch('test', {
        documentType: 'policy',
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'semantic_search',
        expect.objectContaining({
          document_type_filter: 'policy',
        })
      );
    });
  });

  describe('formatRAGContextForPrompt', () => {
    it('deve formatar contexto corretamente', () => {
      const context = {
        query: 'Qual a política de férias?',
        results: [],
        contextText: 'Conteúdo do documento sobre férias.',
        sources: [
          {
            documentId: 'doc-1',
            documentTitle: 'Política de Férias',
            documentPath: 'politicas/ferias',
            chunkIndex: 0,
            similarity: 0.95,
          },
        ],
      };

      const formatted = formatRAGContextForPrompt(context, {
        includeQuery: true,
        includeSources: true,
      });

      expect(formatted).toContain('Qual a política de férias?');
      expect(formatted).toContain('Conteúdo do documento sobre férias.');
      expect(formatted).toContain('Política de Férias');
      expect(formatted).toContain('95.0%');
    });

    it('deve truncar se exceder maxLength', () => {
      const longText = 'A'.repeat(5000);
      const context = {
        query: 'test',
        results: [],
        contextText: longText,
        sources: [],
      };

      const formatted = formatRAGContextForPrompt(context, {
        maxLength: 1000,
      });

      expect(formatted.length).toBeLessThanOrEqual(1003); // 1000 + '...'
    });

    it('deve omitir query quando includeQuery é false', () => {
      const context = {
        query: 'test query',
        results: [],
        contextText: 'context',
        sources: [],
      };

      const formatted = formatRAGContextForPrompt(context, {
        includeQuery: false,
      });

      expect(formatted).not.toContain('test query');
    });
  });
});

