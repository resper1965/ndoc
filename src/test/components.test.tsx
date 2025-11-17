/**
 * Testes para Componentes React
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProcessingStatus } from '@/components/processing-status';

// Mock do fetch
global.fetch = vi.fn();

describe('Componentes React', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProcessingStatus', () => {
    it('deve mostrar loading inicial', () => {
      render(<ProcessingStatus documentId="doc-123" autoRefresh={false} />);
      
      expect(screen.getByText(/verificando status/i)).toBeInTheDocument();
    });

    it('deve mostrar status de processamento', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'processing',
          stage: 'embedding',
          progress: 60,
        }),
      });

      render(<ProcessingStatus documentId="doc-123" autoRefresh={false} />);

      await waitFor(() => {
        expect(screen.getByText(/gerando embeddings/i)).toBeInTheDocument();
      });
    });

    it('deve mostrar status concluído', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          stage: 'complete',
          progress: 100,
        }),
      });

      const onComplete = vi.fn();
      render(
        <ProcessingStatus
          documentId="doc-123"
          autoRefresh={false}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/processamento concluído/i)).toBeInTheDocument();
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('deve mostrar erro quando falhar', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'failed',
          error: 'Erro ao processar',
        }),
      });

      const onError = vi.fn();
      render(
        <ProcessingStatus
          documentId="doc-123"
          autoRefresh={false}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/processamento falhou/i)).toBeInTheDocument();
      });

      expect(onError).toHaveBeenCalled();
    });

    it('deve mostrar barra de progresso durante processamento', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'processing',
          stage: 'chunking',
          progress: 45,
        }),
      });

      render(<ProcessingStatus documentId="doc-123" autoRefresh={false} />);

      await waitFor(() => {
        const progressBar = document.querySelector('[style*="width: 45%"]');
        expect(progressBar).toBeInTheDocument();
      });
    });
  });
});

