/**
 * Testes para API de Processamento de Documentos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/process/document/[id]/route';
import { NextRequest } from 'next/server';

// Mock do Supabase
const createMockFrom = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
});

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(createMockFrom),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock de processDocument
vi.mock('@/lib/vectorization/process-document', () => ({
  processDocument: vi.fn().mockResolvedValue({
    success: true,
    chunksCount: 5,
    embeddingsCount: 5,
  }),
}));

// Mock de permissões
vi.mock('@/lib/supabase/permissions', () => ({
  isSuperadmin: vi.fn().mockResolvedValue(false),
}));

// Mock de utils
vi.mock('@/lib/supabase/utils', () => ({
  getUserOrganization: vi.fn().mockResolvedValue('org-123'),
}));

// Mock de service role client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'job-123' }, error: null }),
    })),
  })),
}));

describe('API /api/process/document/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  describe('POST', () => {
    it('deve rejeitar requisição não autenticada', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Não autenticado');
    });

    it('deve retornar erro se documento não encontrado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const fromMock = createMockFrom();
      fromMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });
      mockSupabase.from.mockReturnValueOnce(fromMock);

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Documento não encontrado');
    });

    it('deve retornar sucesso se documento já está vetorizado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const fromMock = createMockFrom();
      fromMock.single.mockResolvedValue({
        data: {
          id: 'doc-123',
          organization_id: 'org-123',
          is_vectorized: true,
        },
        error: null,
      });
      mockSupabase.from.mockReturnValueOnce(fromMock);

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.is_vectorized).toBe(true);
      expect(data.message).toContain('já está vetorizado');
    });

    it('deve iniciar processamento para documento não vetorizado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const fromMock = createMockFrom();
      fromMock.single.mockResolvedValue({
        data: {
          id: 'doc-123',
          organization_id: 'org-123',
          is_vectorized: false,
        },
        error: null,
      });
      mockSupabase.from.mockReturnValueOnce(fromMock);

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Processamento iniciado');
      expect(data.jobId).toBeDefined();
    });
  });

  describe('GET', () => {
    it('deve retornar status do processamento', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const fromMock = createMockFrom();
      fromMock.single.mockResolvedValue({
        data: {
          id: 'job-123',
          document_id: 'doc-123',
          status: 'processing',
          stage: 'embedding',
          progress_percentage: 60,
          error_message: null,
          started_at: '2025-01-18T10:00:00Z',
          completed_at: null,
          created_at: '2025-01-18T10:00:00Z',
        },
        error: null,
      });
      mockSupabase.from.mockReturnValueOnce(fromMock);

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('processing');
      expect(data.stage).toBe('embedding');
      expect(data.progress).toBe(60);
    });

    it('deve retornar 404 se job não encontrado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const fromMock = createMockFrom();
      fromMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });
      mockSupabase.from.mockReturnValueOnce(fromMock);

      const request = new NextRequest('http://localhost/api/process/document/doc-123');
      const params = Promise.resolve({ id: 'doc-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.status).toBe('not_found');
    });
  });
});

