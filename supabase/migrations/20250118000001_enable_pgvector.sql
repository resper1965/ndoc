-- Migration: Habilitar extensão pgvector
-- Data: 2025-01-18
-- Descrição: Habilita a extensão pgvector para suporte a vetores e busca semântica

-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verificar se a extensão foi habilitada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE EXCEPTION 'Falha ao habilitar extensão pgvector';
  END IF;
END $$;

