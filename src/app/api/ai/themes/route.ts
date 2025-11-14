import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const themeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  system_prompt: z.string().min(1, 'System prompt é obrigatório'),
});

// GET: Listar temas
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma organização' },
        { status: 403 }
      );
    }

    const { data: themes, error } = await supabase
      .from('ai_themes')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ themes: themes || [] });
  } catch (error) {
    logger.error('Error fetching AI themes', error);
    return NextResponse.json(
      { error: 'Erro ao buscar temas' },
      { status: 500 }
    );
  }
}

// POST: Criar tema
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não pertence a nenhuma organização' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = themeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_themes')
      .insert({
        ...validation.data,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ theme: data });
  } catch (error) {
    logger.error('Error creating AI theme', error);
    return NextResponse.json(
      { error: 'Erro ao criar tema' },
      { status: 500 }
    );
  }
}

