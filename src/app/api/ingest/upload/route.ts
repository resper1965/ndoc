import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { convertDocument } from '@/lib/processing/convert-document';
import { applyTemplate } from '@/lib/processing/apply-template';
import { logger } from '@/lib/logger';
import { getUserOrganization } from '@/lib/supabase/utils';
import { addDocumentProcessingJob } from '@/lib/queue/document-queue';
import { initializeDocumentWorker } from '@/lib/queue/job-processor';
import { validateFileType } from '@/lib/validation/file-type-validator';
import { validateConvertedContent } from '@/lib/validation/content-validator';
import { checkDuplicateDocument, calculateFileHash, calculateContentHash } from '@/lib/validation/duplicate-validator';

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
      logger.error('Erro de autenticação no upload', authError);
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter organização do usuário ou criar automaticamente
    let organizationId: string | null = null;
    try {
      organizationId = await getUserOrganization();
    } catch (orgError) {
      logger.error('Erro ao buscar organização do usuário', orgError);
      // Continuar para tentar criar organização
    }
    
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
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      logger.error('Erro ao processar FormData', formError);
      return NextResponse.json(
        { error: 'Erro ao processar dados do formulário' },
        { status: 400 }
      );
    }
    
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

    // Validar tipo real do arquivo (prevenir arquivos maliciosos com extensão falsa)
    const fileValidation = await validateFileType(file, { strict: true });
    if (!fileValidation.valid) {
      logger.warn('Tentativa de upload de arquivo inválido', {
        filename: file.name,
        detectedMimeType: fileValidation.detectedMimeType,
        expectedMimeType: fileValidation.expectedMimeType,
        error: fileValidation.error,
      });
      return NextResponse.json(
        { error: fileValidation.error || 'Tipo de arquivo inválido' },
        { status: 400 }
      );
    }

    logger.info('Iniciando conversão de documento', {
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    // Converter documento para Markdown
    let conversionResult;
    try {
      conversionResult = await convertDocument(file, {
        extractMetadata: true,
        preserveFormatting: true,
        templateId: templateId || undefined,
      });
    } catch (conversionError) {
      logger.error('Erro ao converter documento', conversionError);
      return NextResponse.json(
        { error: 'Erro ao converter documento', details: conversionError instanceof Error ? conversionError.message : 'Erro desconhecido' },
        { status: 500 }
      );
    }

    // Validar conteúdo convertido
    const contentValidation = validateConvertedContent(conversionResult.content, {
      minLength: 10,
      requireText: true,
    });

    if (!contentValidation.valid) {
      logger.warn('Conteúdo convertido inválido', {
        filename: file.name,
        contentLength: conversionResult.content.length,
        error: contentValidation.error,
      });
      return NextResponse.json(
        { error: contentValidation.error || 'Conteúdo convertido inválido' },
        { status: 400 }
      );
    }

    // Logar avisos se houver
    if (contentValidation.warnings && contentValidation.warnings.length > 0) {
      logger.warn('Avisos na validação de conteúdo', {
        filename: file.name,
        warnings: contentValidation.warnings,
      });
    }

    // Calcular hashes para verificação de duplicatas
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = calculateFileHash(fileBuffer);
    const contentHash = calculateContentHash(conversionResult.content);

    // Verificar duplicatas antes de criar documento
    const duplicateCheck = await checkDuplicateDocument({
      organizationId,
      filename: file.name,
      fileHash,
      contentHash,
    });

    if (duplicateCheck.isDuplicate) {
      logger.warn('Tentativa de upload de documento duplicado', {
        filename: file.name,
        existingDocumentId: duplicateCheck.existingDocumentId,
        matchType: duplicateCheck.matchType,
      });
      return NextResponse.json(
        {
          error: duplicateCheck.message || 'Documento duplicado',
          duplicate: true,
          existingDocumentId: duplicateCheck.existingDocumentId,
          matchType: duplicateCheck.matchType,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Aplicar template se especificado
    let finalContent = conversionResult.content;
    if (templateId) {
      try {
        finalContent = await applyTemplate(
          conversionResult.content,
          templateId,
          {
            document_type: documentType || 'other',
            ...conversionResult.metadata,
          }
        );
      } catch (templateError) {
        logger.warn('Erro ao aplicar template, usando conteúdo original', {
          error: templateError instanceof Error ? templateError.message : String(templateError),
        });
        // Continuar com conteúdo original se template falhar
      }
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
        filename: file.name, // Armazenar nome do arquivo original
        description: conversionResult.metadata.description || '',
        content: finalContent,
        frontmatter: conversionResult.metadata,
        document_type: documentType || 'other',
        template_id: templateId || null,
        status: 'draft',
        created_by: user.id,
        file_hash: fileHash, // Armazenar hash do arquivo
        content_hash: contentHash, // Armazenar hash do conteúdo convertido
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

    // Inicializar worker se ainda não estiver rodando
    // Em produção, o worker deve rodar em processo separado ou via Vercel Cron
    try {
      initializeDocumentWorker();
    } catch (error) {
      logger.warn('Worker já inicializado ou erro ao inicializar', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Adicionar job de processamento à fila (persistente)
    try {
      const jobId = await addDocumentProcessingJob({
        documentId: document.id,
        organizationId,
        chunkingStrategy: 'paragraph',
        chunkSize: 500,
        chunkOverlap: 50,
      });

      logger.info('Job de processamento adicionado à fila', {
        jobId,
        documentId: document.id,
        organizationId,
      });
    } catch (error) {
      logger.error('Erro ao adicionar job à fila', error);
      // Não falhar o upload se a fila não estiver disponível
      // O processamento pode ser iniciado manualmente depois
    }

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

