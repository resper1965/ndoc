import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { isSuperadmin } from '@/lib/supabase/permissions';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['policy', 'procedure', 'manual']),
  description: z.string().optional(),
  template_content: z.string().min(1),
  metadata_schema: z.record(z.string(), z.any()).optional(),
  is_default: z.boolean().optional(),
});

/**
 * GET /api/templates
 * Lista templates disponíveis
 */
export async function GET() {
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

    const organizationId = await getUserOrganization();
    const isSuper = await isSuperadmin();

    let query = supabase
      .from('document_templates')
      .select('*')
      .order('created_at', { ascending: false });

    // Templates padrão são públicos, templates de organização apenas para membros
    if (!isSuper && organizationId) {
      query = query.or(`organization_id.eq.${organizationId},is_default.eq.true`);
    }

    const { data: templates, error } = await query;

    if (error) {
      logger.error('Erro ao buscar templates', error);
      return NextResponse.json(
        { error: 'Erro ao buscar templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: templates || [] });
  } catch (error) {
    logger.error('Erro ao listar templates', error);
    return NextResponse.json(
      { error: 'Erro ao listar templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Cria um novo template
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

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não pertence a uma organização' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = templateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from('document_templates')
      .insert({
        organization_id: organizationId,
        ...validation.data,
        is_default: false, // Apenas superadmins podem criar templates padrão
      })
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar template', error);
      return NextResponse.json(
        { error: 'Erro ao criar template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    logger.error('Erro ao criar template', error);
    return NextResponse.json(
      { error: 'Erro ao criar template' },
      { status: 500 }
    );
  }
}

