import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const providerSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  api_key: z.string().min(1, 'API Key é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
});

// GET: Listar provedores
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

    const { data: providers, error } = await supabase
      .from('ai_provider_config')
      .select('id, provider, model, organization_id, api_key')
      .eq('organization_id', organizationId)
      .order('provider');

    if (error) throw error;

    // Não retornar API keys completas por segurança
    const safeProviders = (providers || []).map((p: any) => ({
      id: p.id,
      provider: p.provider,
      model: p.model,
      organization_id: p.organization_id,
      api_key: p.api_key ? '••••••••' : '',
    }));

    return NextResponse.json({ providers: safeProviders });
  } catch (error) {
    logger.error('Error fetching AI providers', error);
    return NextResponse.json(
      { error: 'Erro ao buscar provedores' },
      { status: 500 }
    );
  }
}

// POST: Criar provedor
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
    const validation = providerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_provider_config')
      .insert({
        ...validation.data,
        organization_id: organizationId,
      })
      .select('id, provider, model, organization_id')
      .single();

    if (error) throw error;

    return NextResponse.json({ provider: { ...data, api_key: '••••••••' } });
  } catch (error) {
    logger.error('Error creating AI provider', error);
    return NextResponse.json(
      { error: 'Erro ao criar provedor' },
      { status: 500 }
    );
  }
}

