import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { canUseAI, incrementAIUsage, formatLimitError } from '@/lib/supabase/limits';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const improveSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  theme_id: z.string().uuid('ID do tema inválido').optional(),
  instructions: z.string().optional(),
});

// POST: Melhorar documento usando IA
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
    const validation = improveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, theme_id, instructions } = validation.data;

    // Verificar limites de IA
    const limitCheck = await canUseAI(organizationId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: formatLimitError(limitCheck),
          limit: limitCheck.limit,
          current: limitCheck.current,
          upgradeRequired: limitCheck.upgradeRequired,
        },
        { status: 403 }
      );
    }

    let systemPrompt = 'Melhore o seguinte documento mantendo o formato MDX e a estrutura.';

    // Buscar tema se fornecido
    if (theme_id) {
      const { data: theme, error: themeError } = await supabase
        .from('ai_themes')
        .select('*')
        .eq('id', theme_id)
        .eq('organization_id', organizationId)
        .single();

      if (!themeError && theme) {
        systemPrompt = theme.system_prompt;
      }
    }

    // Adicionar instruções customizadas se fornecidas
    if (instructions) {
      systemPrompt += `\n\nInstruções adicionais: ${instructions}`;
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

    // Chamar Edge Function para melhorar conteúdo
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'improve-document',
      {
        body: {
          content,
          system_prompt: systemPrompt,
          provider: provider.provider,
          api_key: provider.api_key,
          model: provider.model,
        },
      }
    );

    if (functionError || !functionData) {
      logger.error('Error calling improve function', functionError);
      return NextResponse.json(
        { error: 'Erro ao melhorar documento. Verifique se a Edge Function está configurada.' },
        { status: 500 }
      );
    }

    if (functionData.error) {
      return NextResponse.json(
        { error: functionData.error },
        { status: 500 }
      );
    }

    // Incrementar contador de uso de IA
    await incrementAIUsage(organizationId);

    return NextResponse.json({
      improved_content: functionData.improved_content,
      changes: functionData.changes || [],
    });
  } catch (error) {
    logger.error('Error improving document', error);
    return NextResponse.json(
      { error: 'Erro ao melhorar documento' },
      { status: 500 }
    );
  }
}

