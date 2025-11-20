import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { encryptApiKey, validateApiKeyFormat } from '@/lib/encryption/api-keys';

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
        { 
          error: 'Usuário não pertence a nenhuma organização',
          redirectTo: '/onboarding'
        },
        { status: 403 }
      );
    }

    const { data: providers, error } = await supabase
      .from('ai_provider_config')
      .select('id, provider, model, organization_id, api_key_encrypted')
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

    let organizationId: string | null = null;
    try {
      organizationId = await getUserOrganization();
    } catch (orgError) {
      logger.error('Erro ao buscar organização do usuário', orgError);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar organização do usuário',
          redirectTo: '/onboarding'
        },
        { status: 500 }
      );
    }
    
    if (!organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuário não pertence a nenhuma organização',
          redirectTo: '/onboarding'
        },
        { status: 403 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (jsonError) {
      logger.error('Erro ao processar JSON do request', jsonError);
      return NextResponse.json(
        { error: 'Erro ao processar dados da requisição' },
        { status: 400 }
      );
    }
    const validation = providerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { provider, api_key, model } = validation.data;

    // Validar formato da API key
    if (api_key && !validateApiKeyFormat(api_key, provider)) {
      return NextResponse.json(
        { error: 'Formato de API key inválido para o provedor selecionado' },
        { status: 400 }
      );
    }

    // Criptografar API key antes de salvar
    let encryptedKey: string | undefined;
    if (api_key) {
      try {
        encryptedKey = encryptApiKey(api_key);
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
      .insert({
        provider,
        model,
        api_key_encrypted: encryptedKey,
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

