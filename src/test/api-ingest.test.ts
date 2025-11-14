/**
 * Testes para API de Ingestão
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/ingest/route';
import { NextRequest } from 'next/server';

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}));

// Mock de rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
  getRateLimitIdentifier: vi.fn().mockReturnValue('test-ip'),
}));

// Mock de permissões
vi.mock('@/lib/supabase/permissions', () => ({
  isSuperadmin: vi.fn().mockResolvedValue(false),
  canEditDocuments: vi.fn().mockResolvedValue(true),
  canDeleteDocuments: vi.fn().mockResolvedValue(true),
}));

// Mock de utils
vi.mock('@/lib/supabase/utils', () => ({
  getUserOrganization: vi.fn().mockResolvedValue('org-123'),
}));

describe('API /api/ingest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('deve rejeitar requisição sem path', async () => {
      const request = new NextRequest('http://localhost/api/ingest', {
        method: 'POST',
        body: JSON.stringify({ content: '---\ntitle: Test\n---\n# Content' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('deve rejeitar requisição sem content', async () => {
      const request = new NextRequest('http://localhost/api/ingest', {
        method: 'POST',
        body: JSON.stringify({ path: 'test.mdx' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('deve rejeitar MDX inválido', async () => {
      const request = new NextRequest('http://localhost/api/ingest', {
        method: 'POST',
        body: JSON.stringify({
          path: 'test.mdx',
          content: 'Conteúdo sem frontmatter',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('validação');
    });
  });

  describe('GET', () => {
    it('deve retornar info da API quando sem parâmetros', async () => {
      const request = new NextRequest('http://localhost/api/ingest');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.info).toBeDefined();
      expect(data.endpoints).toBeDefined();
    });
  });
});

