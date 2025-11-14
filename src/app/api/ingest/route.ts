/**
 * API Route: Document Ingestion
 * 
 * Endpoints:
 * - POST /api/ingest - Criar ou atualizar documento
 * - PUT /api/ingest - Atualizar documento
 * - DELETE /api/ingest - Deletar documento
 * - GET /api/ingest?list=true - Listar documentos
 * - GET /api/ingest?path=xxx - Obter documento específico
 * 
 * Autenticação: Requerida para operações de escrita
 * Persistência: Supabase (PostgreSQL)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateMDX } from '@/lib/validate-mdx';
import { isSuperadmin, canEditDocuments, canDeleteDocuments } from '@/lib/supabase/permissions';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { documentSchema, listDocumentsQuerySchema } from '@/lib/validations';
import matter from 'gray-matter';

// POST: Criar ou atualizar documento
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit('api/ingest', 'POST', identifier);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validação com Zod
    const validationResult = documentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { path, content } = validationResult.data;

    // Validar formato MDX
    const validation = validateMDX(content);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Erros de validação MDX',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Obter organização do usuário ou do body (para superadmin)
    let organizationId = body.organization_id || await getUserOrganization();
    
    // Se superadmin não especificou organização, usar a primeira disponível ou retornar erro
    const isSuper = await isSuperadmin();
    if (!organizationId && !isSuper) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma organização' },
        { status: 403 }
      );
    }

    // Se superadmin não especificou organização, buscar a primeira
    if (!organizationId && isSuper) {
      const { data: firstOrg } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
      
      if (!firstOrg) {
        return NextResponse.json(
          { error: 'Nenhuma organização encontrada. Crie uma organização primeiro.' },
          { status: 400 }
        );
      }
      
      organizationId = firstOrg.id;
    }

    // Verificar permissão
    const canWrite = await canEditDocuments(organizationId);
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissão para criar/editar documentos' }, { status: 403 });
    }

    // Parsear frontmatter
    const parsed = matter(content);
    const frontmatter = parsed.data;

    // Preparar dados do documento
    const documentData = {
      organization_id: organizationId,
      path: path.replace(/\.mdx$/, ''), // Remover .mdx se presente
      title: frontmatter.title || path,
      description: frontmatter.description || null,
      content: parsed.content,
      frontmatter: frontmatter,
      order_index: frontmatter.order || 0,
      status: frontmatter.status || 'published',
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Verificar se documento já existe
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('path', documentData.path)
      .single();

    if (existing) {
      // Atualizar documento existente
      // Criar versão no histórico antes de atualizar
      const { data: currentDoc } = await supabase
        .from('documents')
        .select('content, frontmatter')
        .eq('id', existing.id)
        .single();

      if (currentDoc) {
        await supabase.from('document_versions').insert({
          document_id: existing.id,
          content: currentDoc.content,
          frontmatter: currentDoc.frontmatter,
          created_by: user.id,
        });
      }

      // Atualizar documento
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: documentData.title,
          description: documentData.description,
          content: documentData.content,
          frontmatter: documentData.frontmatter,
          order_index: documentData.order_index,
          status: documentData.status,
          updated_at: documentData.updated_at,
        })
        .eq('id', existing.id);

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao atualizar documento', details: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Documento atualizado com sucesso', id: existing.id });
    } else {
      // Criar novo documento
      const { data: newDoc, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json({ error: 'Erro ao criar documento', details: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Documento criado com sucesso', id: newDoc.id }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST /api/ingest:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Atualizar documento (mesma lógica do POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// DELETE: Deletar documento
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: 'Caminho do documento é obrigatório' }, { status: 400 });
    }

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Obter organização do body ou do usuário
    const organizationId = body.organization_id || await getUserOrganization();
    
    const isSuper = await isSuperadmin();
    if (!organizationId && !isSuper) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma organização' },
        { status: 403 }
      );
    }

    // Verificar permissão (apenas admins/orgadmins/superadmin podem deletar)
    const canDelete = await canDeleteDocuments(organizationId);
    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar documentos' }, { status: 403 });
    }

    // Proteger index.mdx
    const cleanPath = path.replace(/\.mdx$/, '');
    if (cleanPath === 'index') {
      return NextResponse.json({ error: 'Não é possível deletar index.mdx' }, { status: 400 });
    }

    // Buscar documento
    const { data: document } = await supabase
      .from('documents')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('path', cleanPath)
      .single();

    if (!document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // Deletar documento (CASCADE deleta versões automaticamente)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', document.id);

    if (deleteError) {
      return NextResponse.json({ error: 'Erro ao deletar documento', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Documento deletado com sucesso' });
  } catch (error) {
    logger.error('Error in DELETE /api/ingest', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET: Listar documentos ou obter documento específico
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const list = searchParams.get('list') === 'true';
    const path = searchParams.get('path');

    // Validação de query params para listagem
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const queryValidation = listDocumentsQuerySchema.safeParse({
      page: pageParam || undefined,
      limit: limitParam || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Parâmetros de query inválidos', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { page = 1, limit = 10 } = queryValidation.data;

    // Se list=true, retornar lista de documentos
    if (list) {
      // Verificar autenticação (opcional para listagem)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from('documents')
        .select('id, path, title, description, status, created_at, updated_at')
        .eq('status', 'published'); // Apenas documentos publicados

      // Se autenticado, mostrar também documentos da organização do usuário
      if (user) {
        const organizationId = await getUserOrganization();
        if (organizationId) {
          query = query.or(`organization_id.eq.${organizationId},status.eq.published`);
        }
      }

      const { data: documents, error } = await query.order('order_index', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Erro ao listar documentos', details: error.message }, { status: 500 });
      }

      // Paginação
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      const paginatedDocs = documents?.slice(start, end + 1) || [];
      const total = documents?.length || 0;

      return NextResponse.json({
        documents: paginatedDocs.map((doc) => ({
          path: `${doc.path}.mdx`,
          url: `/docs/${doc.path}`,
          title: doc.title,
          description: doc.description,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: end < total - 1,
          hasPrev: page > 1,
        },
      });
    }

    // Se path especificado, retornar documento específico
    if (path) {
      const cleanPath = path.replace(/\.mdx$/, '');

      // Buscar documento (público se published, ou da organização do usuário)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isSuper = await isSuperadmin();
      const organizationId = searchParams.get('organization_id') || (user ? await getUserOrganization() : null);

      let query = supabase
        .from('documents')
        .select('*')
        .eq('path', cleanPath);

      // Se não autenticado, apenas documentos publicados
      if (!user) {
        query = query.eq('status', 'published');
      } else if (isSuper) {
        // Superadmin vê todos os documentos
        if (organizationId) {
          query = query.eq('organization_id', organizationId);
        }
        // Se não especificou organização, busca em todas
      } else if (organizationId) {
        // Usuário autenticado vê documentos da sua organização + publicados
        query = query.or(`organization_id.eq.${organizationId},status.eq.published`);
      } else {
        query = query.eq('status', 'published');
      }

      const { data: document, error } = await query.single();

      if (error || !document) {
        return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
      }

      // Reconstruir conteúdo MDX com frontmatter
      const frontmatter = document.frontmatter || {};
      const frontmatterString = Object.entries(frontmatter)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}: "${value}"`;
          }
          return `${key}: ${value}`;
        })
        .join('\n');

      const mdxContent = `---\n${frontmatterString}\n---\n\n${document.content}`;

      return NextResponse.json({
        path: `${document.path}.mdx`,
        content: mdxContent,
        title: document.title,
        description: document.description,
      });
    }

    // Se nenhum parâmetro, retornar info da API
    return NextResponse.json({
      info: 'API de Ingestão de Documentos',
      endpoints: {
        POST: 'Criar ou atualizar documento',
        PUT: 'Atualizar documento',
        DELETE: 'Deletar documento',
        'GET ?list=true': 'Listar documentos',
        'GET ?path=xxx': 'Obter documento específico',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ingest:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

