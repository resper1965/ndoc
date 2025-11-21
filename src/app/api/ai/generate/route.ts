import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import { canUseAI, incrementAIUsage, formatLimitError } from '@/lib/supabase/limits';
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

    // Buscar tema (pode ser tema padrão ou da organização)
    let theme: any = null;
    
    // Se for tema padrão (não UUID), usar prompt padrão
    if (theme_id.startsWith('default-')) {
      const defaultPrompts: Record<string, string> = {
        'default-technical': 'Você é um especialista em documentação técnica. Crie documentação clara, precisa e bem estruturada com exemplos de código quando apropriado.',
        'default-guide': 'Você é um especialista em criar guias de usuário. Crie conteúdo didático, passo a passo, fácil de seguir e bem organizado.',
        'default-policy': 'Você é um especialista em documentação organizacional. Crie políticas e procedimentos claros, profissionais e bem estruturados.',
      };
      
      theme = {
        system_prompt: defaultPrompts[theme_id] || defaultPrompts['default-technical'],
      };
    } else {
      // Buscar tema do banco
      const { data: themeData, error: themeError } = await supabase
        .from('ai_themes')
        .select('*')
        .eq('id', theme_id)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (themeError || !themeData) {
        return NextResponse.json(
          { error: 'Tema não encontrado' },
          { status: 404 }
        );
      }
      
      theme = themeData;
    }

    // Buscar provedor ou usar OpenAI direto
    let apiKey: string | null = null;
    let model = 'gpt-4o-mini';
    
    const { data: provider } = await supabase
      .from('ai_provider_config')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .maybeSingle();

    if (provider?.api_key_encrypted) {
      // Descriptografar API key antes de usar
      try {
        const { decryptApiKey } = await import('@/lib/encryption/api-keys');
        apiKey = decryptApiKey(provider.api_key_encrypted);
      } catch (error) {
        logger.error('Erro ao descriptografar API key', error);
        // Fallback para variável de ambiente se descriptografia falhar
        apiKey = process.env.OPENAI_API_KEY || null;
      }
      if (provider.model) model = provider.model;
    } else {
      // Fallback para variável de ambiente
      apiKey = process.env.OPENAI_API_KEY || null;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Nenhuma chave de API de IA configurada. Configure em Configurações > IA.' },
        { status: 400 }
      );
    }

    // Gerar documento usando OpenAI diretamente
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey });

      const systemPrompt = theme.system_prompt || theme.prompt_base || 'Você é um assistente especializado em criar documentação clara e bem estruturada.';
      
      const userPrompt = `Crie um documento completo sobre: ${topic}

O documento deve incluir:
- Frontmatter YAML com título e descrição
- Conteúdo em Markdown bem formatado
- Seções apropriadas
- Exemplos quando relevante

Formato esperado:
---
title: [Título do Documento]
description: [Descrição breve]
---

# [Título]

[Conteúdo do documento em Markdown]`;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      
      // Extrair título e descrição do frontmatter se existir
      let title = topic;
      let description = '';
      const frontmatterMatch = generatedContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*(.+)/);
        const descMatch = frontmatter.match(/description:\s*(.+)/);
        
        if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '');
      }

      // Incrementar contador de uso de IA
      await incrementAIUsage(organizationId);

      return NextResponse.json({
        content: generatedContent,
        title,
        description,
      });
    } catch (error: any) {
      logger.error('Error generating document with OpenAI', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao gerar documento com IA' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error generating document', error);
    return NextResponse.json(
      { error: 'Erro ao gerar documento' },
      { status: 500 }
    );
  }
}

