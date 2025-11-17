import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { processDocument } from '@/lib/vectorization/process-document';
import { logger } from '@/lib/logger';
import { isSuperadmin } from '@/lib/supabase/permissions';

export const runtime = 'nodejs'; // Necessário para processamento pesado
export const maxDuration = 300; // 5 minutos para processamento completo

/**
 * POST /api/process/document/[id]
 * Processa um documento: chunking → embeddings → armazenamento
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
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

    // Verificar se documento existe e usuário tem acesso
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, organization_id, is_vectorized')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const userOrgId = await getUserOrganization();
    const isSuper = await isSuperadmin();

    if (!isSuper && userOrgId !== document.organization_id) {
      return NextResponse.json(
        { error: 'Sem permissão para processar este documento' },
        { status: 403 }
      );
    }

    // Verificar se já está vetorizado
    if (document.is_vectorized) {
      return NextResponse.json(
        {
          message: 'Documento já está vetorizado',
          documentId,
          is_vectorized: true,
        },
        { status: 200 }
      );
    }

    // Criar ou atualizar job de processamento
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase incompleta' },
        { status: 500 }
      );
    }

    const serviceSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Buscar job existente ou criar novo
    const { data: existingJob } = await serviceSupabase
      .from('document_processing_jobs')
      .select('id')
      .eq('document_id', documentId)
      .single();

    let jobId: string;

    if (existingJob) {
      jobId = existingJob.id;
      await serviceSupabase
        .from('document_processing_jobs')
        .update({
          status: 'processing',
          stage: 'conversion',
          progress_percentage: 0,
          error_message: null,
          started_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } else {
      const { data: newJob, error: jobError } = await serviceSupabase
        .from('document_processing_jobs')
        .insert({
          document_id: documentId,
          status: 'processing',
          stage: 'conversion',
          progress_percentage: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError || !newJob) {
        logger.error('Erro ao criar job de processamento', jobError);
        return NextResponse.json(
          { error: 'Erro ao criar job de processamento' },
          { status: 500 }
        );
      }

      jobId = newJob.id;
    }

    // Processar documento (assíncrono)
    const updateProgress = async (progress: number, stage: string) => {
      await serviceSupabase
        .from('document_processing_jobs')
        .update({
          progress_percentage: progress,
          stage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    };

    // Processar em background (não bloquear resposta)
    processDocument({
      documentId,
      organizationId: document.organization_id,
      updateProgress,
    }).then((result) => {
      if (result.success) {
        logger.info('Documento processado com sucesso', {
          documentId,
          chunksCount: result.chunksCount,
          embeddingsCount: result.embeddingsCount,
        });
      } else {
        logger.error('Falha ao processar documento', {
          documentId,
          error: result.error,
        });
      }
    }).catch((error) => {
      logger.error('Erro inesperado ao processar documento', {
        documentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

    // Retornar imediatamente
    return NextResponse.json({
      success: true,
      message: 'Processamento iniciado',
      documentId,
      jobId,
      status: 'processing',
    });
  } catch (error) {
    logger.error('Erro ao iniciar processamento de documento', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/process/document/[id]
 * Verifica status do processamento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
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

    // Buscar job de processamento
    const { data: job, error: jobError } = await supabase
      .from('document_processing_jobs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'Job de processamento não encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: job.status,
      stage: job.stage,
      progress: job.progress_percentage,
      error: job.error_message,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at,
    });
  } catch (error) {
    logger.error('Erro ao verificar status de processamento', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

