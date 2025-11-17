/**
 * Testes para API de RAG
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/rag/query/route';
import { NextRequest } from 'next/server';

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock de queryRAG e generateRAGResponse
vi.mock('@/lib/rag/query-rag', () => ({
  queryRAG: vi.fn().mockResolvedValue({
    query: 'test',
    results: [],
    contextText: 'Contexto de teste',
    sources: [
      {
        documentId: 'doc-1',
        documentTitle: 'Documento Teste',
        documentPath: 'test/doc',
        chunkIndex: 0,
        similarity: 0.9,
      },
    ],
  }),
  generateRAGResponse: vi.fn().mockResolvedValue({
    answer: 'Resposta gerada pela IA',
    context: {
      query: 'test',
      results: [],
      contextText: 'Contexto',
      sources: [],
    },
    sources: [],
  }),
}));

describe('API /api/rag/query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve rejeitar requisição não autenticada', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autenticado');
    });

    it('deve rejeitar query vazia', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });

    it('deve retornar apenas contexto quando generateAnswer é false', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({
          query: 'Qual a política?',
          generateAnswer: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.context).toBeDefined();
      expect(data.results).toBeDefined();
      expect(data.sources).toBeDefined();
      expect(data.answer).toBeUndefined();
    });

    it('deve gerar resposta quando generateAnswer é true', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({
          query: 'Qual a política?',
          generateAnswer: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.answer).toBeDefined();
      expect(data.context).toBeDefined();
      expect(data.sources).toBeDefined();
    });

    it('deve validar parâmetros de modelo', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test',
          temperature: 3, // Inválido (> 2)
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });
});

