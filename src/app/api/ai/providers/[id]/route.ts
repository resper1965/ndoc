import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { encryptApiKey, validateApiKeyFormat } from '@/lib/encryption/api-keys';

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
      api_key_encrypted?: string;
    } = {
      provider: validation.data.provider,
      model: validation.data.model,
    };

    if (validation.data.api_key) {
      // Validar formato da API key
      if (!validateApiKeyFormat(validation.data.api_key, validation.data.provider)) {
        return NextResponse.json(
          { error: 'Formato de API key inválido para o provedor selecionado' },
          { status: 400 }
        );
      }

      // Criptografar API key antes de salvar
      try {
        updateData.api_key_encrypted = encryptApiKey(validation.data.api_key);
      } catch (error) {
        logger.error('Erro ao criptografar API key', error);
        return NextResponse.json(
          { error: 'Erro ao processar API key' },
          { status: 500 }
        );
      }
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

