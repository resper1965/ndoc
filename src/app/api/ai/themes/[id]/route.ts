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

// PUT: Atualizar tema
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
      .update(validation.data)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ theme: data });
  } catch (error) {
    logger.error('Error updating AI theme', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tema' },
      { status: 500 }
    );
  }
}

// DELETE: Deletar tema
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from('ai_themes')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting AI theme', error);
    return NextResponse.json(
      { error: 'Erro ao deletar tema' },
      { status: 500 }
    );
  }
}

