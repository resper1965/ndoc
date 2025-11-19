import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { convertDocument } from '@/lib/processing/convert-document';
import { applyTemplate } from '@/lib/processing/apply-template';
import { logger } from '@/lib/logger';
import { getUserOrganization } from '@/lib/supabase/utils';
import { processDocument } from '@/lib/vectorization/process-document';

// Função assíncrona para processar documento em background
async function processDocumentAsync(documentId: string, organizationId: string) {
  try {
    await processDocument({
      documentId,
      organizationId,
      chunkingStrategy: 'paragraph',
      updateProgress: async (progress, stage) => {
        // Atualizar progresso no job
        const supabase = await createClient();
        await supabase
          .from('document_processing_jobs')
          .update({
            status: 'processing',
            stage,
            progress_percentage: progress,
            updated_at: new Date().toISOString(),
          })
          .eq('document_id', documentId);
      },
    });
  } catch (error) {
    logger.error('Erro ao processar documento', error);
    // Atualizar job com erro
    const supabase = await createClient();
    await supabase
      .from('document_processing_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
        updated_at: new Date().toISOString(),
      })
      .eq('document_id', documentId);
  }
}

export const runtime = 'nodejs'; // Necessário para processamento de arquivos
export const maxDuration = 60; // 60 segundos para conversão

/**
 * POST /api/ingest/upload
 * Upload e conversão de documentos
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter organização do usuário ou criar automaticamente
    let organizationId = await getUserOrganization();
    
    if (!organizationId) {
      // Tentar criar organização automaticamente usando RPC
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('handle_new_user', {
          user_id: user.id,
          user_email: user.email || '',
          user_metadata: user.user_metadata || {},
        });

        if (!rpcError && rpcData) {
          organizationId = rpcData.organization_id || rpcData.id;
        } else {
          // Se RPC falhar, criar organização manualmente
          const orgName = user.email?.split('@')[0] || 'Minha Organização';
          const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({
              name: orgName,
              slug: orgSlug,
            })
            .select()
            .single();

          if (!createError && newOrg) {
            // Adicionar usuário como owner
            const { error: memberError } = await supabase
              .from('organization_members')
              .insert({
                organization_id: newOrg.id,
                user_id: user.id,
                role: 'owner',
              });

            if (!memberError) {
              organizationId = newOrg.id;
            }
          }
        }
      } catch (error) {
        logger.warn('Erro ao criar organização automaticamente', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Se ainda não tiver organização, retornar erro
      if (!organizationId) {
        return NextResponse.json(
          { 
            error: 'Usuário não pertence a uma organização. Por favor, complete o onboarding primeiro.',
            redirectTo: '/onboarding'
          },
          { status: 403 }
        );
      }
    }

    // Obter arquivo do FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('templateId') as string | null;
    const documentType = formData.get('documentType') as
      | 'policy'
      | 'procedure'
      | 'manual'
      | 'other'
      | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tamanho (50MB máximo)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB` },
        { status: 400 }
      );
    }

    logger.info('Iniciando conversão de documento', {
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    // Converter documento para Markdown
    const conversionResult = await convertDocument(file, {
      extractMetadata: true,
      preserveFormatting: true,
      templateId: templateId || undefined,
    });

    // Aplicar template se especificado
    let finalContent = conversionResult.content;
    if (templateId) {
      finalContent = await applyTemplate(
        conversionResult.content,
        templateId,
        {
          document_type: documentType || 'other',
          ...conversionResult.metadata,
        }
      );
    }

    // Gerar path se não fornecido
    const documentPath =
      path ||
      file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Extrair título do conteúdo ou usar nome do arquivo
    const titleMatch = finalContent.match(/^#\s+(.+)$/m);
    const title =
      titleMatch?.[1]?.trim() ||
      file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Criar job de processamento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        organization_id: organizationId,
        path: documentPath,
        title,
        description: conversionResult.metadata.description || '',
        content: finalContent,
        frontmatter: conversionResult.metadata,
        document_type: documentType || 'other',
        template_id: templateId || null,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (docError) {
      logger.error('Erro ao criar documento', docError);
      return NextResponse.json(
        { error: 'Erro ao criar documento', details: docError.message },
        { status: 500 }
      );
    }

    // Criar job de processamento para vetorização
    const { error: jobError } = await supabase
      .from('document_processing_jobs')
      .insert({
        document_id: document.id,
        status: 'pending',
        stage: 'conversion',
        metadata: {
          originalFilename: file.name,
          originalType: conversionResult.originalType,
          fileSize: file.size,
        },
      });

    if (jobError) {
      logger.error('Erro ao criar job de processamento', jobError);
      // Não falhar se o job não for criado, apenas logar
    }

    logger.info('Documento convertido e salvo com sucesso', {
      documentId: document.id,
      path: documentPath,
    });

    // Iniciar processamento de vetorização em background (não bloquear resposta)
    // Usar processamento assíncrono para não bloquear a resposta
    processDocumentAsync(document.id, organizationId).catch((error) => {
      logger.warn('Erro ao iniciar processamento de vetorização (não crítico)', error);
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        path: document.path,
        title: document.title,
        documentType: document.document_type,
      },
      conversion: {
        originalType: conversionResult.originalType,
        metadata: conversionResult.metadata,
      },
    });
  } catch (error) {
    logger.error('Erro ao processar upload', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar arquivo',
        details:
          error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

