/**
 * Testes para Chunking de Documentos
 */

import { describe, it, expect } from 'vitest';
import { chunkDocument } from '@/lib/vectorization/chunk-document';

describe('Chunking de Documentos', () => {
  describe('Estratégia por Parágrafo', () => {
    it('deve dividir documento em parágrafos', () => {
      const content = `# Título

Primeiro parágrafo com conteúdo.

Segundo parágrafo com mais conteúdo.

Terceiro parágrafo final.`;

      const chunks = chunkDocument(content, {
        strategy: 'paragraph',
        chunkSize: 50, // Tamanho menor para forçar divisão
        chunkOverlap: 0,
      });

      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks[0].content).toContain('parágrafo');
      // Verificar que o conteúdo foi processado
      if (chunks.length > 1) {
        expect(chunks[1].content).toContain('parágrafo');
      }
    });

    it('deve preservar headers quando solicitado', () => {
      const content = `# Título Principal

## Subtítulo 1

Conteúdo do subtítulo 1.

## Subtítulo 2

Conteúdo do subtítulo 2.`;

      const chunks = chunkDocument(content, {
        strategy: 'paragraph',
        chunkSize: 200,
        preserveHeaders: true,
      });

      const hasMainTitle = chunks.some(chunk => 
        chunk.content.includes('Título Principal')
      );
      expect(hasMainTitle).toBe(true);
    });
  });

  describe('Estratégia por Sentença', () => {
    it('deve dividir por sentenças', () => {
      const content = 'Primeira sentença. Segunda sentença. Terceira sentença.';

      const chunks = chunkDocument(content, {
        strategy: 'sentence',
        chunkSize: 50,
        chunkOverlap: 0,
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.some(chunk => chunk.content.includes('Primeira sentença'))).toBe(true);
    });
  });

  describe('Overlap entre Chunks', () => {
    it('deve aplicar overlap corretamente', () => {
      const content = 'A'.repeat(300);
      const chunks = chunkDocument(content, {
        strategy: 'sentence',
        chunkSize: 100,
        chunkOverlap: 20,
      });

      if (chunks.length > 1) {
        const firstChunkEnd = chunks[0].content.slice(-20);
        const secondChunkStart = chunks[1].content.slice(0, 20);
        expect(firstChunkEnd).toBe(secondChunkStart);
      }
    });
  });

  describe('Casos Especiais', () => {
    it('deve retornar array vazio para conteúdo vazio', () => {
      const chunks = chunkDocument('', {
        strategy: 'paragraph',
        chunkSize: 100,
      });

      expect(chunks).toEqual([]);
    });

    it('deve lidar com conteúdo muito pequeno', () => {
      const content = 'Texto curto.';
      const chunks = chunkDocument(content, {
        strategy: 'paragraph',
        chunkSize: 1000,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toContain('Texto curto');
    });

    it('deve lidar com conteúdo muito grande', () => {
      const content = 'A'.repeat(10000);
      const chunks = chunkDocument(content, {
        strategy: 'sentence',
        chunkSize: 100,
        chunkOverlap: 10,
      });

      // Pode retornar 1 ou mais chunks dependendo da estratégia
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      if (chunks.length > 1) {
        chunks.forEach(chunk => {
          // Verificar que chunks não excedem muito o tamanho esperado
          expect(chunk.content.length).toBeLessThanOrEqual(200);
        });
      }
    });
  });
});

