import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queryRAG, generateRAGResponse } from '@/lib/rag/query-rag';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query não pode estar vazia'),
  organizationId: z.string().uuid().optional(),
  documentType: z.enum(['policy', 'procedure', 'manual', 'other']).optional(),
  maxContextChunks: z.number().int().min(1).max(20).optional(),
  minSimilarity: z.number().min(0).max(1).optional(),
  generateAnswer: z.boolean().optional(), // Se true, gera resposta usando LLM
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(4000).optional(),
});

/**
 * POST /api/rag/query
 * Query RAG: busca semântica + contexto + opcionalmente gera resposta
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ragQuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { query, generateAnswer, ...options } = validation.data;

    // Realizar query RAG
    if (generateAnswer) {
      // Gerar resposta completa usando LLM
      const result = await generateRAGResponse(query, options);
      
      return NextResponse.json({
        success: true,
        query,
        answer: result.answer,
        context: result.context,
        sources: result.sources,
      });
    } else {
      // Apenas retornar contexto
      const context = await queryRAG(query, options);
      
      return NextResponse.json({
        success: true,
        query,
        context: context.contextText,
        results: context.results,
        sources: context.sources,
      });
    }
  } catch (error) {
    logger.error('Erro na query RAG', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar query RAG',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

