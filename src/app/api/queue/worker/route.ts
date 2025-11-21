/**
 * API Route: Inicializar Worker de Processamento
 * 
 * Este endpoint inicializa o worker de processamento de documentos.
 * Em produção, o worker deve rodar em processo separado ou via Vercel Cron Jobs.
 * 
 * GET /api/queue/worker - Inicializa o worker
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDocumentWorker } from '@/lib/queue/job-processor';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * GET /api/queue/worker
 * Inicializa o worker de processamento de documentos
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é chamada interna (opcional - pode adicionar autenticação)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Inicializar worker
    const worker = initializeDocumentWorker();
    
    logger.info('Worker de processamento inicializado via API');

    return NextResponse.json({
      success: true,
      message: 'Worker inicializado com sucesso',
      workerId: worker.name,
    });
  } catch (error) {
    logger.error('Erro ao inicializar worker', error);
    return NextResponse.json(
      {
        error: 'Erro ao inicializar worker',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

