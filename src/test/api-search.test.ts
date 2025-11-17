/**
 * Testes para API de Busca Semântica
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/search/semantic/route';
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

// Mock de semanticSearch
vi.mock('@/lib/search/semantic-search', () => ({
  semanticSearch: vi.fn().mockResolvedValue([
    {
      chunkId: 'chunk-1',
      documentId: 'doc-1',
      content: 'Conteúdo relevante',
      similarity: 0.9,
      documentTitle: 'Documento Teste',
      documentType: 'policy',
      chunkIndex: 0,
      documentPath: 'test/doc',
    },
  ]),
  semanticSearchGrouped: vi.fn().mockResolvedValue({
    'doc-1': [
      {
        chunkId: 'chunk-1',
        documentId: 'doc-1',
        content: 'Conteúdo',
        similarity: 0.9,
        documentTitle: 'Doc',
        documentType: null,
        chunkIndex: 0,
        documentPath: 'test',
      },
    ],
  }),
}));

describe('API /api/search/semantic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve rejeitar requisição não autenticada', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost/api/search/semantic', {
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

      const request = new NextRequest('http://localhost/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });

    it('deve realizar busca semântica com sucesso', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({
          query: 'política de férias',
          matchCount: 10,
          matchThreshold: 0.7,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.query).toBe('política de férias');
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
    });

    it('deve suportar busca agrupada', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test',
          grouped: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.grouped).toBe(true);
      expect(data.results).toBeDefined();
    });

    it('deve validar parâmetros', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/search/semantic', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test',
          matchThreshold: 1.5, // Inválido (> 1)
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Dados inválidos');
    });
  });

  describe('GET', () => {
    it('deve realizar busca via query params', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/search/semantic?q=test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.query).toBe('test');
    });

    it('deve rejeitar sem parâmetro q', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new NextRequest('http://localhost/api/search/semantic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('q');
    });
  });
});

