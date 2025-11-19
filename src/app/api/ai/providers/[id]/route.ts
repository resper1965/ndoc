import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const providerSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  api_key: z.string().min(1, 'API Key é obrigatória').optional(),
  model: z.string().min(1, 'Modelo é obrigatório'),
});

// PUT: Atualizar provedor
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
    const validation = providerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Se API key não foi fornecida, não atualizar
    const updateData: {
      provider: string;
      model: string;
      api_key?: string;
    } = {
      provider: validation.data.provider,
      model: validation.data.model,
    };

    if (validation.data.api_key) {
      updateData.api_key = validation.data.api_key;
    }

    const { data, error } = await supabase
      .from('ai_provider_config')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select('id, provider, model, organization_id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Provedor não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ provider: { ...data, api_key: '••••••••' } });
  } catch (error) {
    logger.error('Error updating AI provider', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar provedor' },
      { status: 500 }
    );
  }
}

// DELETE: Deletar provedor
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
      .from('ai_provider_config')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting AI provider', error);
    return NextResponse.json(
      { error: 'Erro ao deletar provedor' },
      { status: 500 }
    );
  }
}

