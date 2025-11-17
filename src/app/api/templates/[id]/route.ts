import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { isSuperadmin } from '@/lib/supabase/permissions';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  template_content: z.string().min(1).optional(),
  metadata_schema: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/templates/[id]
 * Busca um template específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: template, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const organizationId = await getUserOrganization();
    const isSuper = await isSuperadmin();

    if (
      !template.is_default &&
      !isSuper &&
      template.organization_id !== organizationId
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este template' },
        { status: 403 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    logger.error('Erro ao buscar template', error);
    return NextResponse.json(
      { error: 'Erro ao buscar template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Atualiza um template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Buscar template
    const { data: template, error: fetchError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const organizationId = await getUserOrganization();
    const isSuper = await isSuperadmin();

    if (template.is_default && !isSuper) {
      return NextResponse.json(
        { error: 'Apenas superadmins podem editar templates padrão' },
        { status: 403 }
      );
    }

    if (
      !template.is_default &&
      !isSuper &&
      template.organization_id !== organizationId
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este template' },
        { status: 403 }
      );
    }

    if (!isSuper && !organizationId) {
      return NextResponse.json(
        { error: 'Apenas admins podem editar templates' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data: updatedTemplate, error: updateError } = await supabase
      .from('document_templates')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Erro ao atualizar template', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar template', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    logger.error('Erro ao atualizar template', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Deleta um template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Buscar template
    const { data: template, error: fetchError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const organizationId = await getUserOrganization();
    const isSuper = await isSuperadmin();

    if (template.is_default) {
      return NextResponse.json(
        { error: 'Templates padrão não podem ser deletados' },
        { status: 403 }
      );
    }

    if (
      !isSuper &&
      template.organization_id !== organizationId
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este template' },
        { status: 403 }
      );
    }

    if (!isSuper && !organizationId) {
      return NextResponse.json(
        { error: 'Apenas admins podem deletar templates' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Erro ao deletar template', deleteError);
      return NextResponse.json(
        { error: 'Erro ao deletar template', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro ao deletar template', error);
    return NextResponse.json(
      { error: 'Erro ao deletar template' },
      { status: 500 }
    );
  }
}

