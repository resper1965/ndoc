/**
 * Testes para Pipeline de Vetorização
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chunkDocument } from '@/lib/vectorization/chunk-document';
import { estimateTokens } from '@/lib/vectorization/token-estimator';

describe('Vectorization Pipeline', () => {
  describe('chunkDocument', () => {
    it('deve dividir documento em chunks por parágrafo', () => {
      const content = `# Título

Parágrafo 1 com conteúdo.

Parágrafo 2 com mais conteúdo.

Parágrafo 3 final.`;

      const chunks = chunkDocument(content, {
        strategy: 'paragraph',
        chunkSize: 100,
        chunkOverlap: 20,
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].content).toContain('Parágrafo');
    });

    it('deve preservar headers quando solicitado', () => {
      const content = `# Título Principal

## Subtítulo

Conteúdo do subtítulo.`;

      const chunks = chunkDocument(content, {
        strategy: 'paragraph',
        chunkSize: 200,
        preserveHeaders: true,
      });

      expect(chunks.some(chunk => chunk.content.includes('Título Principal'))).toBe(true);
    });

    it('deve aplicar overlap entre chunks', () => {
      const content = 'A'.repeat(500);
      const chunks = chunkDocument(content, {
        strategy: 'sentence',
        chunkSize: 100,
        chunkOverlap: 20,
      });

      if (chunks.length > 1) {
        // Verificar se há sobreposição
        const firstChunkEnd = chunks[0].content.slice(-20);
        const secondChunkStart = chunks[1].content.slice(0, 20);
        expect(firstChunkEnd).toBe(secondChunkStart);
      }
    });

    it('deve retornar array vazio para conteúdo vazio', () => {
      const chunks = chunkDocument('', {
        strategy: 'paragraph',
        chunkSize: 100,
      });

      expect(chunks).toEqual([]);
    });
  });

  describe('estimateTokens', () => {
    it('deve estimar tokens corretamente', () => {
      const text = 'Este é um texto de teste com várias palavras.';
      const tokens = estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length);
    });

    it('deve retornar 0 para string vazia', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('deve estimar aproximadamente 4 caracteres por token', () => {
      const text = 'A'.repeat(100);
      const tokens = estimateTokens(text);

      // Aproximadamente 25 tokens para 100 caracteres (4 chars/token)
      expect(tokens).toBeGreaterThan(20);
      expect(tokens).toBeLessThan(30);
    });
  });
});

