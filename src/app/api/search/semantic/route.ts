import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { semanticSearch, type SemanticSearchOptions } from '@/lib/search/semantic-search';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Query não pode estar vazia'),
  organizationId: z.string().uuid().optional(),
  documentType: z.enum(['policy', 'procedure', 'manual', 'other']).optional(),
  matchThreshold: z.number().min(0).max(1).optional(),
  matchCount: z.number().int().min(1).max(100).optional(),
  grouped: z.boolean().optional(),
});

/**
 * POST /api/search/semantic
 * Busca semântica usando embeddings
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
    const validation = searchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { query, grouped, ...options } = validation.data;

    // Realizar busca
    if (grouped) {
      const { semanticSearchGrouped } = await import('@/lib/search/semantic-search');
      const results = await semanticSearchGrouped(query, options);
      return NextResponse.json({
        success: true,
        query,
        results: results,
        grouped: true,
      });
    } else {
      const results = await semanticSearch(query, options);
      return NextResponse.json({
        success: true,
        query,
        results,
        count: results.length,
      });
    }
  } catch (error) {
    logger.error('Erro na busca semântica', error);
    return NextResponse.json(
      {
        error: 'Erro ao realizar busca semântica',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search/semantic
 * Busca semântica via query params (para facilitar testes)
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro "q" (query) é obrigatório' },
        { status: 400 }
      );
    }

    const options: SemanticSearchOptions = {};

    const orgId = searchParams.get('organizationId');
    if (orgId) {
      options.organizationId = orgId;
    }

    const docType = searchParams.get('documentType');
    if (docType && ['policy', 'procedure', 'manual', 'other'].includes(docType)) {
      options.documentType = docType as any;
    }

    const threshold = searchParams.get('threshold');
    if (threshold) {
      options.matchThreshold = parseFloat(threshold);
    }

    const limit = searchParams.get('limit');
    if (limit) {
      options.matchCount = parseInt(limit, 10);
    }

    const grouped = searchParams.get('grouped') === 'true';

    // Realizar busca
    if (grouped) {
      const { semanticSearchGrouped } = await import('@/lib/search/semantic-search');
      const results = await semanticSearchGrouped(query, options);
      return NextResponse.json({
        success: true,
        query,
        results: results,
        grouped: true,
      });
    } else {
      const results = await semanticSearch(query, options);
      return NextResponse.json({
        success: true,
        query,
        results,
        count: results.length,
      });
    }
  } catch (error) {
    logger.error('Erro na busca semântica', error);
    return NextResponse.json(
      {
        error: 'Erro ao realizar busca semântica',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

