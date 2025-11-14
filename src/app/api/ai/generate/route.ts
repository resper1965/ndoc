import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const generateSchema = z.object({
  topic: z.string().min(1, 'Tópico é obrigatório'),
  theme_id: z.string().uuid('ID do tema inválido'),
  path: z.string().min(1, 'Caminho é obrigatório'),
});

// POST: Gerar documento usando IA
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
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { topic, theme_id } = validation.data;

    // Buscar tema
    const { data: theme, error: themeError } = await supabase
      .from('ai_themes')
      .select('*')
      .eq('id', theme_id)
      .eq('organization_id', organizationId)
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: 'Tema não encontrado' },
        { status: 404 }
      );
    }

    // Buscar provedor
    const { data: provider, error: providerError } = await supabase
      .from('ai_provider_config')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(1)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Nenhum provedor de IA configurado' },
        { status: 400 }
      );
    }

    // Chamar Edge Function para gerar conteúdo
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'generate-document',
      {
        body: {
          topic,
          system_prompt: theme.system_prompt,
          provider: provider.provider,
          api_key: provider.api_key,
          model: provider.model,
        },
      }
    );

    if (functionError || !functionData) {
      logger.error('Error calling generate function', functionError);
      return NextResponse.json(
        { error: 'Erro ao gerar documento. Verifique se a Edge Function está configurada.' },
        { status: 500 }
      );
    }

    if (functionData.error) {
      return NextResponse.json(
        { error: functionData.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: functionData.content,
      title: functionData.title || topic,
      description: functionData.description || '',
    });
  } catch (error) {
    logger.error('Error generating document', error);
    return NextResponse.json(
      { error: 'Erro ao gerar documento' },
      { status: 500 }
    );
  }
}

